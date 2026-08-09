import { useMemo, useState, useEffect, useRef } from "react";
import { Plus, Search, Archive, Eye, PenLine, X, Trash2, Upload, ImageIcon } from "lucide-react";
import { AdminShell, AdminTop } from "./_shared/AdminShell";
import { MVP_CATEGORIES, EGYPTIAN_GOVERNORATES } from "../../../lib/governorates";
import { ImageManagerModal } from "./ImageManagerModal";
import "./_group.css";

export function Opportunities() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All statuses");
  const [filterCategory, setCategory] = useState("All categories");
  const [editing, setEditing] = useState<any | null | false>(false);
  const [toast, setToast] = useState("");

  const fetchAdminOpportunities = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/opportunities", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Failed to fetch admin opportunities:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminOpportunities();
  }, []);

  const flash = (s: string) => {
    setToast(s);
    setTimeout(() => setToast(""), 2200);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/opportunities/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (res.ok) {
        const updated = await res.json();
        setItems((xs) => xs.map((x) => (x.id === id ? updated : x)));
        flash("Status updated");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const deleteOpportunity = async (id: string) => {
    if (!confirm("Are you sure you want to delete this opportunity?")) return;
    try {
      const res = await fetch(`/api/admin/opportunities/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setItems((xs) => xs.filter((x) => x.id !== id));
        flash("Opportunity deleted");
      }
    } catch (err) {
      console.error("Failed to delete opportunity:", err);
    }
  };

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        const matchStatus =
          filterStatus === "All statuses" || i.status.toLowerCase() === filterStatus.toLowerCase();
        const matchCat =
          filterCategory === "All categories" || (i.categories && i.categories.includes(filterCategory));
        const matchQuery = `${i.name} ${i.organization} ${i.categories?.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return matchStatus && matchCat && matchQuery;
      }),
    [items, query, filterStatus, filterCategory],
  );

  return (
    <AdminShell active="Opportunities">
      <div className="ga-content">
        <AdminTop
          eyebrow="Catalog / Opportunities"
          title="Opportunities"
          description="Keep the pathways into learning, work and community current for students across Egypt."
          action={
            <button className="ga-btn red" onClick={() => setEditing(null)}>
              <Plus size={15} /> Add opportunity
            </button>
          }
        />

        <div className="ga-summary">
          <div className="ga-stat">
            <strong>{items.length}</strong>
            <span>Total records</span>
          </div>
          <div className="ga-stat">
            <strong>{items.filter((i) => i.status === "active").length}</strong>
            <span>Live for students</span>
          </div>
          <div className="ga-stat">
            <strong>{items.filter((i) => i.status === "draft").length}</strong>
            <span>Needs review</span>
          </div>
          <div className="ga-stat">
            <strong>{items.filter((i) => i.status === "archived").length}</strong>
            <span>Archived</span>
          </div>
        </div>

        <div className="ga-toolbar">
          <div className="ga-search">
            <Search size={14} />
            <input
              placeholder="Search title, organisation or category"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select className="ga-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option>All statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <select className="ga-select" value={filterCategory} onChange={(e) => setCategory(e.target.value)}>
            <option>All categories</option>
            {MVP_CATEGORIES.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </div>

        <div className="ga-table">
          {isLoading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Loading catalog records...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Close date</th>
                  <th>Location</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {i.imageUrl ? (
                          <img 
                            src={i.imageUrl} 
                            alt="" 
                            style={{ 
                              width: 38, 
                              height: 38, 
                              borderRadius: 6, 
                              objectFit: "cover",
                              objectPosition: i.imageFocus || "center center"
                            }} 
                          />
                        ) : (
                          <div style={{ width: 38, height: 38, borderRadius: 6, background: "#222", border: "1px solid #333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#888", fontWeight: 600 }}>
                            IMG
                          </div>
                        )}
                        <div>
                          <div className="ga-title">{i.name}</div>
                          <div className="ga-sub">{i.organization}</div>
                        </div>
                      </div>
                    </td>
                    <td>{i.categories?.[0] || "General"}</td>
                    <td>
                      <span className={`ga-status ${i.status}`}>{i.status}</span>
                    </td>
                    <td>{i.deadlineDate || "No deadline"}</td>
                    <td className="ga-sub">{i.locationDetails || i.locationType}</td>
                    <td>
                      <div className="ga-actions">
                        <button className="ga-icon" title="Edit" onClick={() => setEditing(i)}>
                          <PenLine size={15} />
                        </button>
                        <button
                          className="ga-icon"
                          title={i.status === "archived" ? "Activate" : "Archive"}
                          onClick={() => updateStatus(i.id, i.status === "archived" ? "active" : "archived")}
                        >
                          <Archive size={15} />
                        </button>
                        <button className="ga-icon" title="Delete" onClick={() => deleteOpportunity(i.id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!isLoading && !filtered.length && (
            <div className="ga-empty">
              No opportunities match these filters.
              <br />
              <button
                className="ga-btn small"
                style={{ marginTop: 14 }}
                onClick={() => {
                  setQuery("");
                  setFilterStatus("All statuses");
                  setCategory("All categories");
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {editing !== false && (
        <OpportunityDrawer
          initial={editing}
          onClose={() => setEditing(false)}
          onSave={async (formData) => {
            try {
              const url = editing ? `/api/admin/opportunities/${editing.id}` : "/api/admin/opportunities";
              const method = editing ? "PUT" : "POST";
              const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
                credentials: "include",
              });
              if (res.ok) {
                await fetchAdminOpportunities();
                setEditing(false);
                flash("Opportunity saved successfully");
              }
            } catch (err) {
              console.error("Failed to save opportunity:", err);
            }
          }}
        />
      )}

      {toast && <div className="ga-toast">{toast}</div>}
    </AdminShell>
  );
}

function OpportunityDrawer({
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
      name: "",
      organization: "",
      categories: ["Competitions"],
      description: "",
      imageUrl: "",
      imageFocus: "50% 50%",
      deadlineDate: "",
      locationType: "online",
      locationDetails: "",
      gradeMin: 9,
      gradeMax: 12,
      eligibleGovernorates: ["All"],
      applicationLink: "",
      status: "draft",
    },
  );

  const set = (k: string, v: any) => setForm({ ...form, [k]: v });
  const [showImageManager, setShowImageManager] = useState(false);

  return (
    <div className="ga-modal-backdrop">
      <aside className="ga-drawer" style={{ width: "min(560px, 90vw)", overflowY: "auto" }}>
        <div className="ga-drawer-head">
          <div>
            <div className="ga-label">{initial ? "Edit record" : "New record"}</div>
            <h2 style={{ fontSize: 25, margin: "7px 0" }}>{initial ? "Edit opportunity" : "Add opportunity"}</h2>
          </div>
          <button className="ga-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <label className="ga-field">
          Opportunity title *
          <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. ISEF National Fair" />
        </label>

        <label className="ga-field">
          Organisation *
          <input
            value={form.organization}
            onChange={(e) => set("organization", e.target.value)}
            placeholder="e.g. Ministry of Education"
          />
        </label>

        {/* High-Res Image Manager & Focal Point Selector Section */}
        <div className="ga-field" style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Opportunity Image Banner</label>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            {form.imageUrl ? (
              <div style={{ position: "relative", width: 140, height: 79, borderRadius: 8, overflow: "hidden", border: "1px solid #333", background: "#000" }}>
                <img
                  src={form.imageUrl}
                  alt="Uploaded Banner"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: form.imageFocus || "center center",
                  }}
                />
                <button
                  type="button"
                  onClick={() => set("imageUrl", "")}
                  title="Remove Image"
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    background: "rgba(0,0,0,0.75)",
                    color: "#fff",
                    border: 0,
                    borderRadius: "50%",
                    width: 22,
                    height: 22,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={13} />
                </button>
              </div>
            ) : null}

            <div style={{ flex: 1 }}>
              <button
                type="button"
                className="ga-btn"
                onClick={() => setShowImageManager(true)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px dashed #444",
                  background: "#181818",
                  color: "#fff",
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <ImageIcon size={16} style={{ color: "#bd3b3f" }} />
                {form.imageUrl ? "Manage & Focus Banner Image" : "Upload & Select Banner Image"}
              </button>
            </div>
          </div>
        </div>

        {showImageManager && (
          <ImageManagerModal
            initialImageUrl={form.imageUrl}
            initialFocus={form.imageFocus || "50% 50%"}
            onSave={(url, focus) => {
              setForm((prev: any) => ({ ...prev, imageUrl: url, imageFocus: focus }));
              setShowImageManager(false);
            }}
            onClose={() => setShowImageManager(false)}
          />
        )}

        <label className="ga-field">
          Primary Category
          <select
            value={form.categories?.[0] || "Competitions"}
            onChange={(e) => set("categories", [e.target.value])}
          >
            {MVP_CATEGORIES.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </label>

        <label className="ga-field">
          Description *
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={4}
            placeholder="Enter opportunity overview..."
            style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #444", background: "#222", color: "#fff" }}
          />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label className="ga-field">
            Deadline Date
            <input type="date" value={form.deadlineDate || ""} onChange={(e) => set("deadlineDate", e.target.value)} />
          </label>
          <label className="ga-field">
            Location Type
            <select value={form.locationType} onChange={(e) => set("locationType", e.target.value)}>
              <option value="online">Online</option>
              <option value="in_person">In Person</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </label>
        </div>

        <label className="ga-field">
          Location Details
          <input
            value={form.locationDetails || ""}
            onChange={(e) => set("locationDetails", e.target.value)}
            placeholder="e.g. Cairo International Convention Centre"
          />
        </label>

        <label className="ga-field">
          Application Link
          <input
            value={form.applicationLink || ""}
            onChange={(e) => set("applicationLink", e.target.value)}
            placeholder="https://..."
          />
        </label>

        <label className="ga-field">
          Status
          <select value={form.status} onChange={(e) => set("status", e.target.value)}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </label>

        <div className="ga-form-actions">
          <button className="ga-btn red" disabled={!form.name || !form.organization} onClick={() => onSave(form)}>
            Save opportunity
          </button>
          <button className="ga-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </aside>
    </div>
  );
}