import { useState, useEffect } from "react";
import { useAuth } from "../../lib/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { Layers, Plus, MapPin, UserPlus, Send, Archive, Search, AlertCircle, CheckCircle2 } from "lucide-react";

export function ClubsManager() {
  const { activeOrganization } = useAuth();
  const [clubs, setClubs] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [advisorsList, setAdvisorsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [createClubOpen, setCreateClubOpen] = useState(false);
  const [createLocationOpen, setCreateLocationOpen] = useState(false);
  const [assignAdvisorOpen, setAssignAdvisorOpen] = useState(false);
  const [selectedClubForAdvisor, setSelectedClubForAdvisor] = useState<any | null>(null);

  // Form States
  const [clubName, setClubName] = useState("");
  const [clubDescription, setClubDescription] = useState("");
  const [minGrade, setMinGrade] = useState("9");
  const [maxGrade, setMaxGrade] = useState("12");
  const [locationId, setLocationId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Location Form
  const [locName, setLocName] = useState("");
  const [locDesc, setLocDesc] = useState("");

  // Advisor Selection Form
  const [selectedAdvisorMembershipId, setSelectedAdvisorMembershipId] = useState("");

  const orgSlug = activeOrganization?.slug || "cairo-international-school";

  const fetchClubsAndLocations = async () => {
    setLoading(true);
    try {
      const [resClubs, resLocs, resUsers] = await Promise.all([
        fetch(`/api/organizations/${orgSlug}/clubs`, { credentials: "include" }),
        fetch(`/api/organizations/${orgSlug}/locations`, { credentials: "include" }),
        fetch(`/api/organizations/${orgSlug}/users?role=ADVISOR`, { credentials: "include" }),
      ]);

      if (resClubs.ok) setClubs(await resClubs.json());
      if (resLocs.ok) setLocations(await resLocs.json());
      if (resUsers.ok) setAdvisorsList(await resUsers.json());
    } catch (err) {
      console.error("Failed to load clubs catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeOrganization) {
      fetchClubsAndLocations();
    }
  }, [activeOrganization]);

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/organizations/${orgSlug}/clubs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: clubName,
          description: clubDescription,
          minimumGrade: Number(minGrade),
          maximumGrade: Number(maxGrade),
          locationId: locationId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create club.");
      }

      setCreateClubOpen(false);
      setClubName("");
      setClubDescription("");
      fetchClubsAndLocations();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/organizations/${orgSlug}/locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: locName, description: locDesc }),
      });

      if (res.ok) {
        setCreateLocationOpen(false);
        setLocName("");
        setLocDesc("");
        fetchClubsAndLocations();
      }
    } catch (err) {
      console.error("Failed to create location", err);
    }
  };

  const handlePublishClub = async (clubId: string) => {
    try {
      await fetch(`/api/organizations/${orgSlug}/clubs/${clubId}/publish`, {
        method: "POST",
        credentials: "include",
      });
      fetchClubsAndLocations();
    } catch (err) {
      console.error("Failed to publish club", err);
    }
  };

  const handleArchiveClub = async (clubId: string) => {
    try {
      await fetch(`/api/organizations/${orgSlug}/clubs/${clubId}/archive`, {
        method: "POST",
        credentials: "include",
      });
      fetchClubsAndLocations();
    } catch (err) {
      console.error("Failed to archive club", err);
    }
  };

  const handleAssignAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClubForAdvisor || !selectedAdvisorMembershipId) return;

    try {
      await fetch(`/api/organizations/${orgSlug}/clubs/${selectedClubForAdvisor.id}/advisors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ membershipId: selectedAdvisorMembershipId }),
      });

      setAssignAdvisorOpen(false);
      setSelectedAdvisorMembershipId("");
      fetchClubsAndLocations();
    } catch (err) {
      console.error("Failed to assign advisor", err);
    }
  };

  const filteredClubs = clubs.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.locationName && c.locationName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" /> School Clubs Catalog
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage student club activities, grade eligibility, campus locations, and advisor assignments for {activeOrganization?.name}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setCreateLocationOpen(true)}>
            <MapPin className="h-4 w-4 mr-2" /> Add Location
          </Button>
          <Button size="sm" onClick={() => setCreateClubOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Create Club
          </Button>
        </div>
      </div>

      {/* Search & Location Summary */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clubs or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span>Active Locations:</span>
          {locations.map((loc) => (
            <Badge key={loc.id} variant="secondary" className="text-xs">
              {loc.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Clubs Catalog Grid */}
      {loading ? (
        <div className="p-12 text-center text-sm text-muted-foreground">Loading clubs catalog...</div>
      ) : filteredClubs.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            No clubs found in catalog. Click <strong>Create Club</strong> to build your first student club.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredClubs.map((club) => (
            <Card key={club.id} className="border-border/50 hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg font-bold">{club.name}</CardTitle>
                    <CardDescription className="text-xs mt-1 line-clamp-2">
                      {club.description || "No description provided."}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={club.status === "ACTIVE" ? "default" : club.status === "DRAFT" ? "secondary" : "outline"}
                    className="text-xs uppercase shrink-0"
                  >
                    {club.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-2 gap-2 text-xs border-y border-border/40 py-3">
                  <div>
                    <span className="text-muted-foreground block">Grade Range:</span>
                    <span className="font-semibold text-foreground">Grades {club.minimumGrade} – {club.maximumGrade}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Location:</span>
                    <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-primary" /> {club.locationName || "Unassigned"}
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setSelectedClubForAdvisor(club);
                      setAssignAdvisorOpen(true);
                    }}
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Assign Advisor
                  </Button>

                  <div className="flex items-center gap-2">
                    {club.status === "DRAFT" && (
                      <Button size="sm" className="text-xs" onClick={() => handlePublishClub(club.id)}>
                        <Send className="h-3.5 w-3.5 mr-1" /> Publish
                      </Button>
                    )}
                    {club.status === "ACTIVE" && (
                      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-destructive" onClick={() => handleArchiveClub(club.id)}>
                        <Archive className="h-3.5 w-3.5 mr-1" /> Archive
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Club Modal */}
      <Dialog open={createClubOpen} onOpenChange={setCreateClubOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create School Club</DialogTitle>
            <DialogDescription>Add a new student club to {activeOrganization?.name}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateClub} className="space-y-4 py-2">
            {errorMsg && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" /> {errorMsg}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Club Name</label>
              <Input required placeholder="Robotics & AI Society" value={clubName} onChange={(e) => setClubName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Description</label>
              <textarea
                rows={3}
                className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground"
                placeholder="Club mission and activities description..."
                value={clubDescription}
                onChange={(e) => setClubDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Minimum Grade</label>
                <Input type="number" min="1" max="12" value={minGrade} onChange={(e) => setMinGrade(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Maximum Grade</label>
                <Input type="number" min="1" max="12" value={maxGrade} onChange={(e) => setMaxGrade(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Campus Location</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
              >
                <option value="">Select location (optional)</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateClubOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create Club"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Location Modal */}
      <Dialog open={createLocationOpen} onOpenChange={setCreateLocationOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Campus Location</DialogTitle>
            <DialogDescription>Define a room or outdoor facility.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateLocation} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Location Name</label>
              <Input required placeholder="STEM Lab 3" value={locName} onChange={(e) => setLocName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Description</label>
              <Input placeholder="2nd Floor Science Wing" value={locDesc} onChange={(e) => setLocDesc(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateLocationOpen(false)}>Cancel</Button>
              <Button type="submit">Save Location</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Advisor Modal */}
      <Dialog open={assignAdvisorOpen} onOpenChange={setAssignAdvisorOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Assign Club Advisor</DialogTitle>
            <DialogDescription>Select an advisor for {selectedClubForAdvisor?.name}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignAdvisor} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Select Advisor</label>
              <select
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedAdvisorMembershipId}
                onChange={(e) => setSelectedAdvisorMembershipId(e.target.value)}
              >
                <option value="">Choose an advisor from roster...</option>
                {advisorsList.map((adv) => (
                  <option key={adv.membershipId} value={adv.membershipId}>
                    {adv.fullName} ({adv.email})
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAssignAdvisorOpen(false)}>Cancel</Button>
              <Button type="submit">Assign Advisor</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
