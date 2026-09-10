import { useState, useEffect } from "react";
import { useAuth } from "../../lib/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { Users, UserPlus, Upload, Search, Shield, GraduationCap, Mail, AlertCircle, CheckCircle2 } from "lucide-react";

export function UserRoster() {
  const { activeOrganization } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("ALL");

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Manual Add Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [grade, setGrade] = useState("10");
  const [studentIdentifier, setStudentIdentifier] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // CSV Import State
  const [csvContent, setCsvContent] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);

  const orgSlug = activeOrganization?.slug || "cairo-international-school";

  const fetchRoster = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/organizations/${orgSlug}/users?role=${selectedRoleFilter}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to load roster:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeOrganization) {
      fetchRoster();
    }
  }, [activeOrganization, selectedRoleFilter]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/organizations/${orgSlug}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fullName, email, role, grade: Number(grade), studentIdentifier }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add user.");
      }

      setAddModalOpen(false);
      setFullName("");
      setEmail("");
      setStudentIdentifier("");
      fetchRoster();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setImporting(true);
    setImportResult(null);

    try {
      // Parse CSV text into rows
      const lines = csvContent.trim().split("\n");
      if (lines.length < 2) {
        throw new Error("CSV must contain a header line and at least 1 data row.");
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const rows: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        if (values.length === headers.length) {
          const row: any = {};
          headers.forEach((h, idx) => {
            row[h] = values[idx];
          });
          rows.push(row);
        }
      }

      const res = await fetch(`/api/organizations/${orgSlug}/users/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rows, fileName: "user_roster_import.csv" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Import failed.");
      }

      setImportResult(data);
      fetchRoster();
    } catch (err: any) {
      setImportResult({ error: err.message });
    } finally {
      setImporting(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.studentProfile?.studentIdentifier && u.studentProfile.studentIdentifier.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> School User Roster
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage administrators, advisors, students, and parents for {activeOrganization?.name}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)}>
            <Upload className="h-4 w-4 mr-2" /> Bulk CSV Import
          </Button>
          <Button size="sm" onClick={() => setAddModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" /> Add User
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <Card className="border-border/50 bg-card/60 backdrop-blur">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Role Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {["ALL", "STUDENT", "ADVISOR", "PARENT", "ADMIN"].map((r) => (
              <Button
                key={r}
                variant={selectedRoleFilter === r ? "default" : "outline"}
                size="sm"
                className="text-xs capitalize"
                onClick={() => setSelectedRoleFilter(r)}
              >
                {r.toLowerCase()}s
              </Button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">Loading roster...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No users found matching your query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border/50 bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Roles</th>
                    <th className="px-6 py-3">Student Details</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                            {u.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{u.fullName}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r: string) => (
                            <Badge key={r} variant="secondary" className="text-xs uppercase">
                              {r}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {u.studentProfile ? (
                          <div className="space-y-0.5">
                            <span className="font-mono text-foreground">{u.studentProfile.studentIdentifier}</span>
                            <div className="text-muted-foreground">Grade {u.studentProfile.grade}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-xs text-emerald-500 border-emerald-500/30">
                          Active
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Add User Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add User to Roster</DialogTitle>
            <DialogDescription>Manually onboard a student, advisor, or parent.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-4 py-2">
            {formError && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" /> {formError}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Full Name</label>
              <Input required placeholder="Dr. Sarah Mansour" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Email Address</label>
              <Input required type="email" placeholder="sarah@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Role</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="STUDENT">Student</option>
                <option value="ADVISOR">Club Advisor</option>
                <option value="PARENT">Parent</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
            {role === "STUDENT" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Student ID</label>
                  <Input placeholder="STU-2026-003" value={studentIdentifier} onChange={(e) => setStudentIdentifier(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Grade</label>
                  <Input type="number" min="1" max="12" value={grade} onChange={(e) => setGrade(e.target.value)} />
                </div>
              </div>
            )}
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Adding..." : "Add User"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CSV Bulk Import Modal */}
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk CSV Roster Import</DialogTitle>
            <DialogDescription>Paste CSV data with columns: full_name, email, role, student_identifier, grade, parent_email</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCsvImport} className="space-y-4 py-2">
            <textarea
              required
              rows={6}
              className="w-full rounded-md border border-input bg-background p-3 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder={`full_name,email,role,student_identifier,grade,parent_email\nOmar Ali,omar@school.edu,STUDENT,STU-2026-010,10,fatima@gmail.com\nFatima Ali,fatima@gmail.com,PARENT,,`}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
            />

            {importResult && (
              <div className={`p-3 rounded-lg text-xs space-y-1 ${importResult.error ? "bg-destructive/10 border border-destructive/30 text-destructive" : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"}`}>
                <div className="font-semibold flex items-center gap-1.5">
                  {importResult.error ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  {importResult.error ? "Import Failed" : "Import Summary"}
                </div>
                <div>{importResult.error || importResult.summary}</div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setImportModalOpen(false)}>Close</Button>
              <Button type="submit" disabled={importing}>{importing ? "Processing CSV..." : "Start Import"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
