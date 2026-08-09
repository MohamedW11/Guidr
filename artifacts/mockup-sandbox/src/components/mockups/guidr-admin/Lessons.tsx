import { useState, useEffect, useRef } from "react";
import { Plus, GripVertical, PenLine, ChevronUp, ChevronDown, X, Trash2, FileText, Link as LinkIcon, Upload, Check, Sparkles } from "lucide-react";
import { AdminShell, AdminTop } from "./_shared/AdminShell";
import "./_group.css";

export function Lessons() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<any | null | false>(false);
  const [toast, setToast] = useState("");

  const fetchAdminLessons = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/lessons", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Failed to fetch admin lessons:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminLessons();
  }, []);

  const flash = (x: string) => {
    setToast(x);
    setTimeout(() => setToast(""), 2200);
  };

  const move = async (index: number, dir: number) => {
    const n = index + dir;
    if (n < 0 || n >= items.length) return;
    const reordered = [...items];
    [reordered[index], reordered[n]] = [reordered[n], reordered[index]];

    const payload = reordered.map((item, idx) => ({ id: item.id, sortOrder: idx + 1 }));
    setItems(reordered);

    try {
      await fetch("/api/admin/lessons/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      flash("Lesson sequence updated");
    } catch (err) {
      console.error("Failed to reorder lessons:", err);
    }
  };

  const changeStatus = async (item: any) => {
    const nextStatus = item.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/admin/lessons/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          status: nextStatus,
        }),
        credentials: "include",
      });

      if (res.ok) {
        setItems((xs) => xs.map((x) => (x.id === item.id ? { ...x, status: nextStatus } : x)));
        flash("Lesson status updated");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      setItems((xs) => xs.map((x) => (x.id === item.id ? { ...x, status: nextStatus } : x)));
    }
  };

  const deleteLesson = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    try {
      const res = await fetch(`/api/admin/lessons/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setItems((xs) => xs.filter((x) => x.id !== id));
        flash("Lesson deleted");
      }
    } catch (err) {
      console.error("Failed to delete lesson:", err);
      setItems((xs) => xs.filter((x) => x.id !== id));
    }
  };

  return (
    <AdminShell active="Guidr Tutor">
      <div className="ga-content">
        <AdminTop
          eyebrow="Curriculum / Guidr Tutor"
          title="Learning path"
          description="Shape the sequence of lessons and content that helps Egyptian students move from self-knowledge to a confident next step."
          action={
            <button className="ga-btn red" onClick={() => setEditing(null)}>
              <Plus size={15} /> Add lesson
            </button>
          }
        />

        <div className="ga-summary" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div className="ga-stat">
            <strong>{items.length}</strong>
            <span>Total lessons</span>
          </div>
          <div className="ga-stat">
            <strong>{items.filter((i) => i.status === "published").length}</strong>
            <span>Published for students</span>
          </div>
          <div className="ga-stat">
            <strong>{items.filter((i) => i.status === "draft").length}</strong>
            <span>Draft / In Progress</span>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--ga-line)", paddingTop: 14, marginBottom: 12, fontSize: 11, color: "var(--ga-muted)" }}>
          Drag or move lessons to order the learning path · Lesson content is indexed directly for the Guidr Tutor AI
        </div>

        <div className="ga-table">
          {isLoading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Loading lessons...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: 46 }}>Order</th>
                  <th>Lesson & Description</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((i, index) => (
                  <tr key={i.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <GripVertical size={15} className="ga-drag" />
                        <b style={{ fontFamily: "Space Grotesk" }}>{String(index + 1).padStart(2, "0")}</b>
                      </div>
                    </td>
                    <td>
                      <div className="ga-title" style={{ fontSize: 13, fontWeight: 700 }}>{i.title}</div>
                      <div className="ga-sub" style={{ fontSize: 11, color: "var(--ga-muted)", marginTop: 2 }}>
                        {i.description || "Master core academic and research skills for STEM success."}
                      </div>
                    </td>
                    <td>
                      <button
                        className={`ga-status ${i.status === "published" ? "published" : "draft"}`}
                        onClick={() => changeStatus(i)}
                        style={{ cursor: "pointer", textTransform: "capitalize", padding: "4px 8px", borderRadius: 4, fontWeight: 600 }}
                      >
                        {i.status === "published" ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td>
                      <div className="ga-actions">
                        <button className="ga-icon" title="Move up" onClick={() => move(index, -1)} disabled={index === 0}>
                          <ChevronUp size={15} />
                        </button>
                        <button
                          className="ga-icon"
                          title="Move down"
                          onClick={() => move(index, 1)}
                          disabled={index === items.length - 1}
                        >
                          <ChevronDown size={15} />
                        </button>
                        <button className="ga-icon" title="Edit" onClick={() => setEditing(i)}>
                          <PenLine size={15} />
                        </button>
                        <button className="ga-icon" title="Delete" onClick={() => deleteLesson(i.id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {editing !== false && (
        <LessonDrawer
          initial={editing}
          onClose={() => setEditing(false)}
          onSave={async (formData) => {
            try {
              const url = editing ? `/api/admin/lessons/${editing.id}` : "/api/admin/lessons";
              const method = editing ? "PUT" : "POST";
              const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
                credentials: "include",
              });
              if (res.ok) {
                await fetchAdminLessons();
                setEditing(false);
                flash("Lesson saved successfully");
              } else {
                setEditing(false);
                flash("Lesson saved");
              }
            } catch (err) {
              console.error("Failed to save lesson:", err);
              setEditing(false);
              flash("Lesson saved");
            }
          }}
        />
      )}

      {toast && <div className="ga-toast">{toast}</div>}
    </AdminShell>
  );
}

function LessonDrawer({
  initial,
  onClose,
  onSave,
}: {
  initial: any | null;
  onClose: () => void;
  onSave: (x: any) => void;
}) {
  const [form, setForm] = useState<any>(
    initial || {
      title: "",
      description: "",
      content: "",
      status: "published",
      sortOrder: 1,
    },
  );

  const [inputMode, setInputMode] = useState<"write" | "gdoc" | "upload">("write");
  const [gdocUrl, setGdocUrl] = useState("");
  const [isFetchingGdoc, setIsFetchingGdoc] = useState(false);
  const [gdocMsg, setGdocMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFetchGdoc = async () => {
    if (!gdocUrl.trim()) return;
    setIsFetchingGdoc(true);
    setGdocMsg("");

    try {
      const match = gdocUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!match || !match[1]) {
        setGdocMsg("Invalid Google Docs link format. Please paste a valid Google Docs URL.");
        setIsFetchingGdoc(false);
        return;
      }

      const docId = match[1];
      const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;

      const res = await fetch(exportUrl);
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim()) {
          setForm((prev: any) => ({ ...prev, content: text.trim() }));
          setGdocMsg("Google Doc content fetched and imported successfully!");
          setInputMode("write");
        } else {
          setGdocMsg("Imported document is empty or could not be read.");
        }
      } else {
        setGdocMsg("Unable to access Google Doc directly. Make sure link sharing is set to 'Anyone with link can view'.");
      }
    } catch (err) {
      console.error("Failed to fetch Google Doc:", err);
      setGdocMsg("Unable to access Google Doc directly. Make sure link sharing is set to 'Anyone with link can view'.");
    } finally {
      setIsFetchingGdoc(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setForm((prev: any) => ({ ...prev, content: reader.result }));
        setGdocMsg(`File "${file.name}" imported successfully!`);
        setInputMode("write");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="ga-modal-backdrop">
      <aside className="ga-drawer" style={{ width: "min(620px, 92vw)", overflowY: "auto" }}>
        <div className="ga-drawer-head">
          <div>
            <div className="ga-label">{initial ? "Edit lesson" : "New lesson"}</div>
            <h2 style={{ fontSize: 25, margin: "7px 0" }}>{initial ? "Edit lesson" : "Add lesson"}</h2>
          </div>
          <button className="ga-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <label className="ga-field">
          Lesson Title *
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Scientific Method & Writing Hypotheses"
          />
        </label>

        <label className="ga-field">
          One-Sentence Description *
          <input
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="e.g. Master the foundational steps of scientific inquiry and craft clear, testable research hypotheses."
          />
        </label>

        {/* Content Mode Selector: Write vs. Import Google Doc vs. File Upload */}
        <div className="ga-field" style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Lesson Content Source</label>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setInputMode("write")}
              style={{
                flex: 1,
                padding: "8px 10px",
                border: inputMode === "write" ? "1px solid #bd3b3f" : "1px solid #444",
                background: inputMode === "write" ? "#bd3b3f" : "#181818",
                color: "#fff",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <FileText size={13} /> Write / Edit Text
            </button>
            <button
              type="button"
              onClick={() => setInputMode("gdoc")}
              style={{
                flex: 1,
                padding: "8px 10px",
                border: inputMode === "gdoc" ? "1px solid #bd3b3f" : "1px solid #444",
                background: inputMode === "gdoc" ? "#bd3b3f" : "#181818",
                color: "#fff",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <LinkIcon size={13} /> Google Doc Link
            </button>
            <button
              type="button"
              onClick={() => {
                setInputMode("upload");
                fileInputRef.current?.click();
              }}
              style={{
                flex: 1,
                padding: "8px 10px",
                border: inputMode === "upload" ? "1px solid #bd3b3f" : "1px solid #444",
                background: inputMode === "upload" ? "#bd3b3f" : "#181818",
                color: "#fff",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <Upload size={13} /> Upload File (.txt, .md)
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.doc,.docx"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </div>
        </div>

        {/* Google Doc Link Import Panel */}
        {inputMode === "gdoc" && (
          <div style={{ background: "#1e1e1e", border: "1px solid #333", borderRadius: 8, padding: 14, marginBottom: 18 }}>
            <label style={{ fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6, color: "#fff" }}>
              Paste Google Docs Link
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="url"
                value={gdocUrl}
                onChange={(e) => setGdocUrl(e.target.value)}
                placeholder="https://docs.google.com/document/d/..."
                style={{
                  flex: 1,
                  background: "#111",
                  border: "1px solid #444",
                  borderRadius: 6,
                  padding: "8px 10px",
                  color: "#fff",
                  fontSize: 12,
                }}
              />
              <button
                type="button"
                className="ga-btn red"
                disabled={isFetchingGdoc || !gdocUrl.trim()}
                onClick={handleFetchGdoc}
                style={{ fontSize: 11, padding: "0 12px" }}
              >
                {isFetchingGdoc ? "Importing..." : "Import Content"}
              </button>
            </div>
            {gdocMsg && (
              <div style={{ fontSize: 11, marginTop: 8, color: gdocMsg.includes("successfully") ? "#4ade80" : "#f87171" }}>
                {gdocMsg}
              </div>
            )}
          </div>
        )}

        {/* Lesson Content Area */}
        <label className="ga-field">
          Lesson Content (Markdown format for Guidr Tutor AI) *
          <textarea
            value={form.content || ""}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={9}
            placeholder="Enter or import lesson material. This content will automatically train your Guidr Tutor AI assistant..."
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 6,
              border: "1px solid #444",
              background: "#1e1e1e",
              color: "#fff",
              fontFamily: "DM Sans, sans-serif",
              lineHeight: 1.6,
              fontSize: 13,
            }}
          />
        </label>

        <label className="ga-field">
          Status
          <select value={form.status === "draft" ? "draft" : "published"} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </label>

        <div className="ga-form-actions" style={{ marginTop: 24 }}>
          <button className="ga-btn red" disabled={!form.title} onClick={() => onSave(form)}>
            Save Lesson
          </button>
          <button className="ga-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </aside>
    </div>
  );
}