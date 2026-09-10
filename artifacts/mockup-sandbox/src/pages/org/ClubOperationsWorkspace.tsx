import { useState, useEffect } from "react";
import { useAuth } from "../../lib/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Calendar,
  Clock,
  UserCheck,
  Megaphone,
  FileText,
  Award,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  MapPin,
  Sparkles,
} from "lucide-react";

export function ClubOperationsWorkspace() {
  const { activeOrganization } = useAuth();
  const [clubs, setClubs] = useState<any[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<string>("");
  const [activeSubTab, setActiveSubTab] = useState<"sessions" | "attendance" | "announcements" | "resources" | "badges">("sessions");

  // Operational Data States
  const [schedules, setSchedules] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [attendanceRoster, setAttendanceRoster] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);

  // Modal / Form States
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // New Announcement state
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");

  // New Resource state
  const [resTitle, setResTitle] = useState("");
  const [resUrl, setResUrl] = useState("");

  // Award Badge state
  const [selectedStudentForBadge, setSelectedStudentForBadge] = useState("");
  const [selectedBadgeId, setSelectedBadgeId] = useState("");

  const orgSlug = activeOrganization?.slug || "cairo-international-school";

  // 1. Fetch Clubs catalog
  useEffect(() => {
    async function fetchClubs() {
      try {
        const res = await fetch(`/api/organizations/${orgSlug}/clubs`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setClubs(data);
          if (data.length > 0 && !selectedClubId) {
            setSelectedClubId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load clubs:", err);
      }
    }
    if (activeOrganization) fetchClubs();
  }, [activeOrganization]);

  // 2. Fetch Operational Data for selected club
  const loadClubOperationsData = async () => {
    if (!selectedClubId) return;
    setLoading(true);
    try {
      const [schedRes, sessRes, annRes, resRes, badgeRes] = await Promise.all([
        fetch(`/api/organizations/${orgSlug}/clubs/${selectedClubId}/schedules`, { credentials: "include" }),
        fetch(`/api/organizations/${orgSlug}/clubs/${selectedClubId}/sessions`, { credentials: "include" }),
        fetch(`/api/organizations/${orgSlug}/clubs/${selectedClubId}/announcements`, { credentials: "include" }),
        fetch(`/api/organizations/${orgSlug}/clubs/${selectedClubId}/resources`, { credentials: "include" }),
        fetch(`/api/organizations/${orgSlug}/badges`, { credentials: "include" }),
      ]);

      if (schedRes.ok) setSchedules(await schedRes.json());
      if (sessRes.ok) {
        const sessData = await sessRes.json();
        setSessions(sessData);
        if (sessData.length > 0 && !selectedSessionId) {
          setSelectedSessionId(sessData[0].id);
        }
      }
      if (annRes.ok) setAnnouncements(await annRes.json());
      if (resRes.ok) setResources(await resRes.json());
      if (badgeRes.ok) setBadges(await badgeRes.json());
    } catch (err) {
      console.error("Failed to load operations data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClubId) {
      loadClubOperationsData();
    }
  }, [selectedClubId]);

  // 3. Load Attendance Roster when selectedSessionId changes
  const loadAttendanceRoster = async () => {
    if (!selectedSessionId) return;
    try {
      const res = await fetch(`/api/organizations/${orgSlug}/club-sessions/${selectedSessionId}/attendance`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setAttendanceRoster(data.roster || []);
      }
    } catch (err) {
      console.error("Failed to load attendance roster:", err);
    }
  };

  useEffect(() => {
    if (selectedSessionId) {
      loadAttendanceRoster();
    }
  }, [selectedSessionId]);

  // Handlers
  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/organizations/${orgSlug}/clubs/${selectedClubId}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: annTitle, content: annContent }),
        credentials: "include",
      });
      if (res.ok) {
        setAnnTitle("");
        setAnnContent("");
        await loadClubOperationsData();
      }
    } catch (err) {
      console.error("Post announcement error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim() || !resUrl.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/organizations/${orgSlug}/clubs/${selectedClubId}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: resTitle, fileUrl: resUrl }),
        credentials: "include",
      });
      if (res.ok) {
        setResTitle("");
        setResUrl("");
        await loadClubOperationsData();
      }
    } catch (err) {
      console.error("Add resource error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateAttendanceStatus = (studentId: string, status: string) => {
    setAttendanceRoster((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, status } : item))
    );
  };

  const handleSaveAttendance = async () => {
    if (!selectedSessionId || attendanceRoster.length === 0) return;
    setActionLoading(true);
    try {
      const records = attendanceRoster.map((r) => ({
        studentId: r.studentId,
        status: r.status === "UNRECORDED" ? "PRESENT" : r.status,
      }));

      const res = await fetch(`/api/organizations/${orgSlug}/club-sessions/${selectedSessionId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records }),
        credentials: "include",
      });

      if (res.ok) {
        await loadAttendanceRoster();
        alert("Attendance successfully saved!");
      }
    } catch (err) {
      console.error("Save attendance error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAwardBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForBadge || !selectedBadgeId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/organizations/${orgSlug}/students/${selectedStudentForBadge}/badges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badgeId: selectedBadgeId, clubId: selectedClubId }),
        credentials: "include",
      });
      if (res.ok) {
        alert("Badge successfully awarded to student!");
        setSelectedStudentForBadge("");
        setSelectedBadgeId("");
      }
    } catch (err) {
      console.error("Award badge error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const selectedClub = clubs.find((c) => c.id === selectedClubId);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" /> Club Operations Workspace
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage session schedules, record attendance, broadcast announcements, share resources, and award badges.
          </p>
        </div>

        {/* Club Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-semibold">Active Club:</span>
          <select
            value={selectedClubId}
            onChange={(e) => setSelectedClubId(e.target.value)}
            className="h-9 text-xs rounded-md border border-border bg-card px-3 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Operations Sub-Navigation Tabs */}
      <div className="flex border-b border-border/40 gap-2 overflow-x-auto">
        <Button
          variant={activeSubTab === "sessions" ? "default" : "ghost"}
          size="sm"
          className="text-xs rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
          onClick={() => setActiveSubTab("sessions")}
        >
          <Calendar className="h-3.5 w-3.5 mr-1.5" /> Sessions & Schedule
        </Button>

        <Button
          variant={activeSubTab === "attendance" ? "default" : "ghost"}
          size="sm"
          className="text-xs rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
          onClick={() => setActiveSubTab("attendance")}
        >
          <UserCheck className="h-3.5 w-3.5 mr-1.5" /> Attendance Roster
        </Button>

        <Button
          variant={activeSubTab === "announcements" ? "default" : "ghost"}
          size="sm"
          className="text-xs rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
          onClick={() => setActiveSubTab("announcements")}
        >
          <Megaphone className="h-3.5 w-3.5 mr-1.5" /> Announcements ({announcements.length})
        </Button>

        <Button
          variant={activeSubTab === "resources" ? "default" : "ghost"}
          size="sm"
          className="text-xs rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
          onClick={() => setActiveSubTab("resources")}
        >
          <FileText className="h-3.5 w-3.5 mr-1.5" /> Resources ({resources.length})
        </Button>

        <Button
          variant={activeSubTab === "badges" ? "default" : "ghost"}
          size="sm"
          className="text-xs rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
          onClick={() => setActiveSubTab("badges")}
        >
          <Award className="h-3.5 w-3.5 mr-1.5" /> Badges & Recognition
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-muted-foreground">Loading club operations data...</div>
      ) : (
        <div>
          {/* TAB 1: SESSIONS & SCHEDULE */}
          {activeSubTab === "sessions" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" /> Recurring Weekly Schedule
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Fixed meeting times for {selectedClub?.name}.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {schedules.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      No recurring schedule configured yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {schedules.map((s) => (
                        <div key={s.id} className="p-3 border border-border/40 rounded-lg bg-muted/20 flex items-center justify-between text-xs">
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" /> Every {dayNames[s.dayOfWeek]}
                          </div>
                          <div className="text-muted-foreground font-mono">
                            {s.startTime} – {s.endTime}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" /> Scheduled Session Occurrences
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Actual calendar dates for meetings and activities.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sessions.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      No sessions currently scheduled.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((sess) => (
                        <div key={sess.id} className="p-3 border border-border/40 rounded-lg bg-muted/20 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-semibold text-foreground">{sess.scheduledDate}</div>
                            <div className="text-muted-foreground text-[11px]">
                              {new Date(sess.startDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(sess.endDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                            {sess.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 2: ATTENDANCE ROSTER */}
          {activeSubTab === "attendance" && (
            <Card className="border-border/50 bg-card">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" /> Session Attendance Roster
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Take and record attendance for active club members.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={selectedSessionId}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                    className="h-8 text-xs rounded-md border border-border bg-card px-2 text-foreground focus:outline-none"
                  >
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        Session: {s.scheduledDate}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={actionLoading || attendanceRoster.length === 0}
                    onClick={handleSaveAttendance}
                  >
                    {actionLoading ? "Saving..." : "Save Attendance"}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {attendanceRoster.length === 0 ? (
                  <div className="p-12 text-center text-xs text-muted-foreground">
                    No active members found for this club session.
                  </div>
                ) : (
                  <div className="divide-y divide-border/40 border border-border/40 rounded-lg overflow-hidden">
                    {attendanceRoster.map((item) => (
                      <div key={item.studentId} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card hover:bg-muted/10">
                        <div>
                          <div className="font-semibold text-sm text-foreground">{item.fullName || "Student"}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {item.studentIdentifier} · Grade {item.grade}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant={item.status === "PRESENT" ? "default" : "outline"}
                            className={`text-xs h-7 px-2.5 ${item.status === "PRESENT" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
                            onClick={() => handleUpdateAttendanceStatus(item.studentId, "PRESENT")}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Present
                          </Button>

                          <Button
                            size="sm"
                            variant={item.status === "LATE" ? "default" : "outline"}
                            className={`text-xs h-7 px-2.5 ${item.status === "LATE" ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}`}
                            onClick={() => handleUpdateAttendanceStatus(item.studentId, "LATE")}
                          >
                            <Clock className="h-3 w-3 mr-1" /> Late
                          </Button>

                          <Button
                            size="sm"
                            variant={item.status === "EXCUSED" ? "default" : "outline"}
                            className={`text-xs h-7 px-2.5 ${item.status === "EXCUSED" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}`}
                            onClick={() => handleUpdateAttendanceStatus(item.studentId, "EXCUSED")}
                          >
                            <HelpCircle className="h-3 w-3 mr-1" /> Excused
                          </Button>

                          <Button
                            size="sm"
                            variant={item.status === "ABSENT" ? "default" : "outline"}
                            className={`text-xs h-7 px-2.5 ${item.status === "ABSENT" ? "bg-rose-600 hover:bg-rose-700 text-white" : ""}`}
                            onClick={() => handleUpdateAttendanceStatus(item.studentId, "ABSENT")}
                          >
                            <XCircle className="h-3 w-3 mr-1" /> Absent
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB 3: ANNOUNCEMENTS */}
          {activeSubTab === "announcements" && (
            <div className="space-y-6">
              <Card className="border-border/50 bg-card p-4">
                <form onSubmit={handlePostAnnouncement} className="space-y-3">
                  <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-primary" /> Post Club Broadcast Announcement
                  </div>
                  <Input
                    placeholder="Announcement Title..."
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    className="text-xs"
                    required
                  />
                  <textarea
                    placeholder="Announcement content details..."
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    className="w-full text-xs rounded-md border border-border bg-background p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
                    required
                  />
                  <Button size="sm" type="submit" className="text-xs" disabled={actionLoading}>
                    {actionLoading ? "Publishing..." : "Post Announcement"}
                  </Button>
                </form>
              </Card>

              <div className="space-y-4">
                {announcements.length === 0 ? (
                  <Card className="border-border/50">
                    <CardContent className="p-8 text-center text-xs text-muted-foreground">
                      No announcements posted for this club yet.
                    </CardContent>
                  </Card>
                ) : (
                  announcements.map((ann) => (
                    <Card key={ann.id} className="border-border/50 bg-card">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base font-bold">{ann.title}</CardTitle>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {new Date(ann.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <CardDescription className="text-xs">
                          Posted by {ann.authorFullName || "Advisor"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-2 text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {ann.content}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: RESOURCES */}
          {activeSubTab === "resources" && (
            <div className="space-y-6">
              <Card className="border-border/50 bg-card p-4">
                <form onSubmit={handleAddResource} className="space-y-3">
                  <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> Share Club Resource or Document Link
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      placeholder="Resource Title..."
                      value={resTitle}
                      onChange={(e) => setResTitle(e.target.value)}
                      className="text-xs"
                      required
                    />
                    <Input
                      placeholder="Document URL / Link..."
                      value={resUrl}
                      onChange={(e) => setResUrl(e.target.value)}
                      className="text-xs"
                      required
                    />
                  </div>
                  <Button size="sm" type="submit" className="text-xs" disabled={actionLoading}>
                    {actionLoading ? "Uploading..." : "Add Resource"}
                  </Button>
                </form>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.length === 0 ? (
                  <div className="col-span-2 p-8 text-center text-xs text-muted-foreground border border-border/40 rounded-lg">
                    No resources shared for this club yet.
                  </div>
                ) : (
                  resources.map((res) => (
                    <Card key={res.id} className="border-border/50 bg-card p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold text-sm text-foreground">{res.title}</div>
                        <a
                          href={res.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary hover:underline font-mono truncate max-w-xs block"
                        >
                          {res.fileUrl}
                        </a>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {res.resourceType || "document"}
                      </Badge>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: BADGES & RECOGNITION */}
          {activeSubTab === "badges" && (
            <div className="space-y-6">
              <Card className="border-border/50 bg-card p-4">
                <form onSubmit={handleAwardBadge} className="space-y-3">
                  <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" /> Award Student Achievement Badge
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1">Select Student Member:</label>
                      <select
                        value={selectedStudentForBadge}
                        onChange={(e) => setSelectedStudentForBadge(e.target.value)}
                        className="w-full h-8 text-xs rounded-md border border-border bg-background px-2 text-foreground"
                        required
                      >
                        <option value="">-- Choose Active Student --</option>
                        {attendanceRoster.map((s) => (
                          <option key={s.studentId} value={s.studentId}>
                            {s.fullName} ({s.studentIdentifier})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1">Select Badge Template:</label>
                      <select
                        value={selectedBadgeId}
                        onChange={(e) => setSelectedBadgeId(e.target.value)}
                        className="w-full h-8 text-xs rounded-md border border-border bg-background px-2 text-foreground"
                        required
                      >
                        <option value="">-- Choose Badge --</option>
                        {badges.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button size="sm" type="submit" className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white" disabled={actionLoading}>
                    {actionLoading ? "Awarding..." : "Award Badge"}
                  </Button>
                </form>
              </Card>

              {/* Badge Catalog Gallery */}
              <div className="space-y-3">
                <div className="font-semibold text-sm text-foreground">Available School Badge Templates</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {badges.map((b) => (
                    <Card key={b.id} className="border-border/50 bg-card p-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        🏆
                      </div>
                      <div>
                        <div className="font-bold text-sm text-foreground">{b.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">{b.description || "School recognition award."}</div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
