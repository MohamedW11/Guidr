import { useState, useEffect } from "react";
import { useAuth } from "../../lib/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Compass, MapPin, CheckCircle2, XCircle, Search, ArrowRight, Clock, ShieldCheck, AlertCircle } from "lucide-react";

export function ExploreClubs() {
  const { activeOrganization } = useAuth();
  const [clubs, setClubs] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const orgSlug = activeOrganization?.slug || "cairo-international-school";

  const fetchExploreData = async () => {
    setLoading(true);
    try {
      const [clubsRes, memRes] = await Promise.all([
        fetch(`/api/organizations/${orgSlug}/clubs/explore`, { credentials: "include" }),
        fetch(`/api/organizations/${orgSlug}/club-memberships`, { credentials: "include" }),
      ]);

      if (clubsRes.ok) {
        const clubsData = await clubsRes.json();
        setClubs(clubsData);
      }

      if (memRes.ok) {
        const memData = await memRes.json();
        // Map clubId to membership record
        const memMap: Record<string, any> = {};
        for (const item of memData) {
          memMap[item.clubId] = item;
        }
        setMemberships(memMap);
      }
    } catch (err) {
      console.error("Failed to load discovery feed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeOrganization) {
      fetchExploreData();
    }
  }, [activeOrganization]);

  const handleJoinClub = async (clubId: string) => {
    setActionLoading(clubId);
    try {
      const res = await fetch(`/api/organizations/${orgSlug}/clubs/${clubId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        await fetchExploreData();
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to join club");
      }
    } catch (err) {
      console.error("Join error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleWithdraw = async (membershipId: string, clubId: string) => {
    setActionLoading(clubId);
    try {
      const res = await fetch(`/api/organizations/${orgSlug}/club-memberships/${membershipId}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        await fetchExploreData();
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to withdraw membership");
      }
    } catch (err) {
      console.error("Withdraw error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredClubs = clubs.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary" /> Discover School Clubs
          </h1>
          <p className="text-sm text-muted-foreground">
            Explore active clubs, check grade eligibility, and apply for membership at {activeOrganization?.name}.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clubs by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Clubs Discovery Grid */}
      {loading ? (
        <div className="p-12 text-center text-sm text-muted-foreground">Loading discovery feed...</div>
      ) : filteredClubs.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            No active clubs currently matching your query. Check back soon!
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredClubs.map((club) => {
            const membership = memberships[club.id];
            const memStatus = membership?.status;

            return (
              <Card
                key={club.id}
                className={`border-border/50 hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between ${
                  !club.isEligible ? "opacity-75 bg-muted/20" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        {club.name}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1.5 line-clamp-3">
                        {club.description || "No description provided."}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={club.isEligible ? "default" : "secondary"}
                      className={`text-xs shrink-0 flex items-center gap-1 ${
                        club.isEligible ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : ""
                      }`}
                    >
                      {club.isEligible ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Eligible
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 text-muted-foreground" /> Grade Restricted
                        </>
                      )}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div className="grid grid-cols-2 gap-2 text-xs border-y border-border/40 py-3">
                    <div>
                      <span className="text-muted-foreground block">Grade Range:</span>
                      <span className="font-semibold text-foreground">
                        Grades {club.minimumGrade} – {club.maximumGrade}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Location:</span>
                      <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-primary" /> {club.locationName || "TBD"}
                      </span>
                    </div>
                  </div>

                  {/* Membership Action & Lifecycle Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                    <div>
                      {memStatus === "PENDING_PARENT_APPROVAL" && (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-xs flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Pending Parent Approval
                        </Badge>
                      )}
                      {memStatus === "PENDING_ADVISOR_APPROVAL" && (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Pending Advisor Approval
                        </Badge>
                      )}
                      {memStatus === "ACTIVE" && (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" /> Active Member
                        </Badge>
                      )}
                      {memStatus === "PARENT_REJECTED" && (
                        <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/30 text-xs flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Parent Rejected
                        </Badge>
                      )}
                      {memStatus === "ADVISOR_REJECTED" && (
                        <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/30 text-xs flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Advisor Rejected
                        </Badge>
                      )}
                      {memStatus === "WITHDRAWN" && (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-xs flex items-center gap-1">
                          Withdrawn
                        </Badge>
                      )}
                      {!memStatus && (
                        <span className="text-xs text-muted-foreground">
                          {club.isEligible
                            ? "Ready for join request"
                            : `Requires Grade ${club.minimumGrade}–${club.maximumGrade}`}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {memStatus && (memStatus === "PENDING_PARENT_APPROVAL" || memStatus === "PENDING_ADVISOR_APPROVAL" || memStatus === "ACTIVE") ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                          disabled={actionLoading === club.id}
                          onClick={() => handleWithdraw(membership.id, club.id)}
                        >
                          {actionLoading === club.id ? "Processing..." : "Withdraw"}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="text-xs"
                          disabled={!club.isEligible || actionLoading === club.id}
                          onClick={() => handleJoinClub(club.id)}
                        >
                          {actionLoading === club.id ? "Submitting..." : memStatus === "WITHDRAWN" || memStatus === "PARENT_REJECTED" || memStatus === "ADVISOR_REJECTED" ? "Re-apply" : "Request Join"}
                          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
