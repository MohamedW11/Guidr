import { db } from "@workspace/db";
import { lessonChunksTable, chatMessagesTable, lessonsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

export async function indexLessonContent(lessonId: string, content: string) {
  // Delete existing chunks for this lesson
  await db.delete(lessonChunksTable).where(eq(lessonChunksTable.lessonId, lessonId));

  if (!content || content.trim().length === 0) {
    return;
  }

  // Chunk content by paragraphs or headers
  const paragraphs = content
    .split(/(?:\r?\n){2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const chunks: string[] = [];
  let currentChunk = "";

  for (const para of paragraphs) {
    if ((currentChunk + "\n\n" + para).length > 600) {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = para;
    } else {
      currentChunk = currentChunk ? `${currentChunk}\n\n${para}` : para;
    }
  }
  if (currentChunk) chunks.push(currentChunk);

  // Save chunks into database
  for (let i = 0; i < chunks.length; i++) {
    await db.insert(lessonChunksTable).values({
      lessonId,
      content: chunks[i],
      chunkIndex: i,
    });
  }
}

function buildDynamicFallbackResponse(
  userMessage: string,
  lessonTitle: string,
  relevantChunks: string[],
  fullContent: string
): string {
  const queryLower = userMessage.toLowerCase().trim();
  const topChunk = relevantChunks[0] || fullContent || "";

  // Extract lines matching words in student's query
  const words = queryLower.split(/\W+/).filter((w) => w.length > 2);
  const lines = topChunk.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  
  const matchedLines = lines.filter((line) => {
    const lLower = line.toLowerCase();
    return words.some((w) => lLower.includes(w));
  });

  const excerpt = matchedLines.length > 0
    ? matchedLines.slice(0, 4).join("\n\n")
    : topChunk.slice(0, 500);

  if (queryLower.includes("what") || queryLower.includes("define") || queryLower.includes("meaning")) {
    return `Here is the key explanation for your question on **${lessonTitle}**:\n\n${excerpt}\n\n💡 **Key Takeaway**: Pay close attention to how this concept is defined in your study material.`;
  }

  if (queryLower.includes("how") || queryLower.includes("step") || queryLower.includes("process")) {
    return `Here is the step-by-step guidance regarding **${userMessage}** in *${lessonTitle}*:\n\n${excerpt}\n\n📌 **Study Tip**: Follow these exact guidelines when working through your practical exercises.`;
  }

  if (queryLower.includes("example") || queryLower.includes("sample")) {
    return `Here is a relevant section & example from **${lessonTitle}**:\n\n${excerpt}\n\nNeed further clarification on this section? Ask away!`;
  }

  return `Regarding your question (*"${userMessage}"*) in **${lessonTitle}**:\n\n${excerpt}\n\nKeep up the great momentum! Let me know if you would like to explore any specific detail further.`;
}

export async function generateTutorResponse(
  studentId: string,
  lessonId: string,
  userMessage: string,
): Promise<{ response: string; sources: string[] }> {
  // 1. Get lesson details
  const [lesson] = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.id, lessonId))
    .limit(1);

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  // 2. Fetch lesson chunks
  const chunks = await db
    .select()
    .from(lessonChunksTable)
    .where(eq(lessonChunksTable.lessonId, lessonId));

  // If no chunks exist, trigger chunking
  let chunkTexts = chunks.map((c) => c.content);
  if (chunkTexts.length === 0 && lesson.content) {
    await indexLessonContent(lessonId, lesson.content);
    const newChunks = await db
      .select()
      .from(lessonChunksTable)
      .where(eq(lessonChunksTable.lessonId, lessonId));
    chunkTexts = newChunks.map((c) => c.content);
  }

  // Simple keyword relevance ranking over lesson chunks
  const queryWords = userMessage.toLowerCase().split(/\W+/).filter(Boolean);
  const scoredChunks = chunkTexts.map((chunk) => {
    const chunkLower = chunk.toLowerCase();
    const matchCount = queryWords.reduce((acc, word) => acc + (chunkLower.includes(word) ? 1 : 0), 0);
    return { chunk, score: matchCount };
  });

  scoredChunks.sort((a, b) => b.score - a.score);
  const relevantChunks = scoredChunks
    .filter((c) => c.score > 0)
    .map((c) => c.chunk);

  const bestChunks = relevantChunks.length > 0 ? relevantChunks.slice(0, 3) : chunkTexts.slice(0, 3);
  const contextText = bestChunks.length > 0 ? bestChunks.join("\n\n---\n\n") : lesson.content;

  // 3. Fetch past chat history for multi-turn conversational context
  const pastMessages = await db
    .select()
    .from(chatMessagesTable)
    .where(and(eq(chatMessagesTable.studentId, studentId), eq(chatMessagesTable.lessonId, lessonId)))
    .orderBy(asc(chatMessagesTable.createdAt));

  // Store student message in chat_messages
  await db.insert(chatMessagesTable).values({
    studentId,
    lessonId,
    role: "student",
    content: userMessage,
  });

  const groqApiKey = process.env.GROQ_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;
  let aiResponseText = "";

  const systemMessage = {
    role: "system",
    content: `You are Guidr, a friendly, encouraging AI tutor friend for Egyptian high school students.

Your Guidelines:
1. FRIENDLY TUTOR TONE: Speak warmly and casually, like a supportive senior student or study buddy.
2. KEEP IT SHORT: Give brief, punchy responses (2-4 sentences max). Never send long essays or walls of text.
3. MISCONCEPTION DETECTION: Intuit what the student is confused about. Identify the exact mix-up (e.g., "Sounds like you might be confusing X and Y!") and clarify it simply.
4. QUICK CHECK-IN: End with a quick 1-line follow-up question or encouragement to verify they understood.

Lesson Title: "${lesson.title}"
Lesson Module: "${lesson.module}"

[RELEVANT LESSON CONTEXT]
${contextText}`,
  };

  const historyMessages = pastMessages.map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
  }));

  const fullConversationPayload = [
    systemMessage,
    ...historyMessages,
    { role: "user", content: userMessage },
  ];

  if (groqApiKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: fullConversationPayload,
          temperature: 0.6,
          max_tokens: 280,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        aiResponseText = data.choices?.[0]?.message?.content || "";
      }
    } catch (err) {
      console.error("Groq API error:", err);
    }
  } else if (openaiApiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: fullConversationPayload,
          temperature: 0.6,
          max_tokens: 600,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        aiResponseText = data.choices?.[0]?.message?.content || "";
      }
    } catch (err) {
      console.error("OpenAI API error:", err);
    }
  }

  // Dynamic context-aware synthesis fallback if LLM API key is not configured or fetch fails
  if (!aiResponseText) {
    aiResponseText = buildDynamicFallbackResponse(userMessage, lesson.title, bestChunks, lesson.content);
  }

  // Store assistant message in chat_messages
  await db.insert(chatMessagesTable).values({
    studentId,
    lessonId,
    role: "assistant",
    content: aiResponseText,
  });

  return {
    response: aiResponseText,
    sources: bestChunks.slice(0, 2),
  };
}
