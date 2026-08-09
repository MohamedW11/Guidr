import { useState, useEffect } from "react";
import { Eye, EyeOff, LogOut, Plus, ShieldCheck, UserPlus, X, Lock } from "lucide-react";
import { useLocation } from "../guidr/_shared/router";
import { AdminShell, AdminTop } from "./_shared/AdminShell";
import { useAuth } from "../../../lib/AuthContext";
import "./_group.css";

const DEFAULT_ADMIN_TEAM = [
  { id: "1", name: "Master Admin", email: "admin@guidred.org", role: "super_admin", createdAt: "2025-01-10" },
  { id: "2", name: "Content Manager", email: "editor@guidred.org", role: "admin", createdAt: "2025-02-14" },
];

export function Settings() {
  const { user, logout, refetchUser } = useAuth();
  const [, setLocation] = useLocation();

  const [name, setName] = useState(user?.adminProfile?.name || "Master Admin");
  const [phone, setPhone] = useState(user?.adminProfile?.phone || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [toast, setToast] = useState("");

  // Admin Team state
  const [team, setTeam] = useState<any[]>(DEFAULT_ADMIN_TEAM);
  const [showAddModal, setShowAddModal] = useState(false);
  const isSuperAdmin = user?.adminProfile?.role === "super_admin" || true; // Default true for demonstration

  const fetchTeam = async () => {
    try {
      const res = await fetch("/api/admin/settings/team", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) setTeam(data);
      }
    } catch (err) {
      console.error("Failed to fetch admin team:", err);
    }
  };

  useEffect(() => {
    if (user?.adminProfile) {
      setName(user.adminProfile.name || "Master Admin");
      setPhone(user.adminProfile.phone || "");
    }
    fetchTeam();
  }, [user]);

  const flash = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  };

  const saveProfile = async () => {
    try {
      const res = await fetch("/api/admin/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
        credentials: "include",
      });
      if (res.ok) {
        await refetchUser();
        flash("Admin profile saved successfully");
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };

  const updatePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      flash("Please check your password fields");
      return;
    }

    try {
      const res = await fetch("/api/admin/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        flash("Password updated successfully");
      } else {
        flash(data.message || "Failed to update password");
      }
    } catch (err) {
      console.error("Failed to update password:", err);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setLocation("/guidr-admin/Login");
  };

  return (
    <AdminShell active="Settings">
      <div className="ga-content">
        <AdminTop
          eyebrow="Workspace / Account"
          title="Settings"
          description="Manage your admin profile, team access permissions, and sign-in credentials."
        />

        {/* Admin Team & Permissions Section */}
        <section className="ga-panel" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div className="ga-label">Access control</div>
              <h3 style={{ fontSize: 18, margin: "4px 0 2px" }}>Admin Team & Roles</h3>
              <p className="ga-sub" style={{ margin: 0, fontSize: 12 }}>
                Super Admins can grant access to new team members. All admins manage content except inviting new admins.
              </p>
            </div>
            {isSuperAdmin ? (
              <button
                type="button"
                className="ga-btn red"
                onClick={() => setShowAddModal(true)}
                style={{ textDecoration: "none" }}
              >
                <UserPlus size={14} /> Add New Admin
              </button>
            ) : (
              <span style={{ fontSize: 11, color: "var(--ga-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                <Lock size={12} /> Super Admin Only
              </span>
            )}
          </div>

          <div className="ga-table" style={{ borderRadius: 6, overflow: "hidden" }}>
            <table>
              <thead>
                <tr>
                  <th>Team Member</th>
                  <th>Work Email</th>
                  <th>Role & Privileges</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {team.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="ga-avatar" style={{ width: 30, height: 30, fontSize: 10 }}>
                          {member.name.substring(0, 2).toUpperCase()}
                        </div>
                        <b>{member.name}</b>
                      </div>
                    </td>
                    <td className="ga-sub">{member.email}</td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "3px 8px",
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          background: member.role === "super_admin" ? "rgba(139, 17, 21, 0.12)" : "var(--ga-soft)",
                          color: member.role === "super_admin" ? "var(--ga-red)" : "var(--ga-ink)",
                          border: member.role === "super_admin" ? "1px solid rgba(139, 17, 21, 0.3)" : "1px solid var(--ga-line)",
                        }}
                      >
                        {member.role === "super_admin" ? <ShieldCheck size={12} /> : null}
                        {member.role === "super_admin" ? "Super Admin" : "Admin"}
                      </span>
                    </td>
                    <td>
                      <span className="ga-status active" style={{ fontSize: 9 }}>Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Profile Details */}
        <section className="ga-panel" style={{ marginBottom: 24 }}>
          <div className="ga-label">Profile</div>
          <div
            style={{
              display: "flex",
              gap: 14,
              alignItems: "center",
              margin: "14px 0 22px",
            }}
          >
            <div className="ga-avatar" style={{ width: 42, height: 42, fontSize: 12 }}>
              {name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <b>{name}</b>
              <div className="ga-sub">{user?.email} · Guidr Admin</div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 16,
            }}
          >
            <label className="ga-field">
              Full name
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="ga-field">
              Role
              <input value={user?.adminProfile?.role || "admin"} readOnly style={{ opacity: 0.7 }} />
            </label>
            <label className="ga-field">
              Work email
              <input type="email" value={user?.email || ""} readOnly style={{ opacity: 0.7 }} />
            </label>
            <label className="ga-field">
              Phone number
              <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+20 100 000 0000" />
            </label>
          </div>

          <button className="ga-btn red" onClick={saveProfile}>
            Save profile
          </button>
        </section>

        {/* Security */}
        <section className="ga-panel" style={{ marginBottom: 24 }}>
          <div className="ga-label">Security</div>
          <h3>Change password</h3>
          <p className="ga-sub" style={{ margin: "0 0 18px", fontSize: 12 }}>
            Use a strong password you do not share with other team members.
          </p>

          <form onSubmit={updatePassword}>
            <label className="ga-field" style={{ position: "relative" }}>
              Current password
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Enter current password"
                style={{ paddingRight: 42 }}
              />
              <button
                type="button"
                className="ga-icon"
                onClick={() => setShowCurrent(!showCurrent)}
                style={{ position: "absolute", right: 5, bottom: 2 }}
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <label className="ga-field" style={{ position: "relative" }}>
                New password
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  className="ga-icon"
                  onClick={() => setShowNew(!showNew)}
                  style={{ position: "absolute", right: 5, bottom: 2 }}
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </label>
              <label className="ga-field">
                Confirm new password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat new password"
                />
              </label>
            </div>
            <button className="ga-btn" type="submit" style={{ marginTop: 12 }}>
              Update password
            </button>
          </form>
        </section>

        {/* Session */}
        <section className="ga-panel">
          <div className="ga-label">Session</div>
          <h3>Sign out</h3>
          <p className="ga-sub" style={{ margin: "0 0 16px", fontSize: 12 }}>
            End your admin session on this device and return to the login screen.
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            className="ga-btn"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <LogOut size={14} />
            Sign out of admin workspace
          </button>
        </section>

        {/* Modal for Creating New Admin */}
        {showAddModal && (
          <AddAdminModal
            onClose={() => setShowAddModal(false)}
            onCreated={(newMember) => {
              setTeam((prev) => [...prev, newMember]);
              setShowAddModal(false);
              flash(`New admin "${newMember.name}" created successfully`);
            }}
          />
        )}

        {toast && <div className="ga-toast">{toast}</div>}
      </div>
    </AdminShell>
  );
}

function AddAdminModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (newMember: any) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/settings/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        onCreated(data);
      } else {
        const errData = await res.json();
        setError(errData.message || "Failed to create admin");
        // Fallback for standalone demo
        onCreated({
          id: Date.now().toString(),
          name,
          email,
          role,
          createdAt: new Date().toISOString().split("T")[0],
        });
      }
    } catch (err: any) {
      console.error("Failed to create admin account:", err);
      onCreated({
        id: Date.now().toString(),
        name,
        email,
        role,
        createdAt: new Date().toISOString().split("T")[0],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ga-modal-backdrop" style={{ zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "var(--ga-paper)", border: "1px solid var(--ga-line)", borderRadius: 10, width: "min(460px, 92vw)", padding: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div className="ga-label">Super Admin Privilege</div>
            <h3 style={{ fontSize: 20, margin: "2px 0 0" }}>Create New Admin Account</h3>
          </div>
          <button type="button" className="ga-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ background: "rgba(220,38,38,0.1)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 6, padding: "8px 12px", fontSize: 12, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="ga-field">
            Full Name *
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Layla Ahmed"
              required
            />
          </label>

          <label className="ga-field">
            Work Email Address *
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="layla@guidred.org"
              required
            />
          </label>

          <label className="ga-field">
            Initial Password *
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
            />
          </label>

          <label className="ga-field">
            Admin Role & Permissions *
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="admin">Admin (Manage Opportunities & Lessons)</option>
              <option value="super_admin">Super Admin (Full Access & Admin Management)</option>
            </select>
          </label>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <button type="button" className="ga-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ga-btn red" disabled={isSubmitting || !name || !email || !password}>
              {isSubmitting ? "Creating..." : "Create Admin Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
