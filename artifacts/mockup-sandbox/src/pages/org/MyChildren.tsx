import { useState, useEffect } from "react";
import { useAuth } from "../../lib/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { GraduationCap, HeartHandshake, CheckCircle2, XCircle, Clock, ShieldCheck, AlertCircle } from "lucide-react";

export function MyChildren() {
  const { activeOrganization } = useAuth();
  const [childrenList, setChildrenList] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const orgSlug = activeOrganization?.slug || "cairo-international-school";

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [childrenRes, memRes] = await Promise.all([
        fetch(`/api/organizations/${orgSlug}/my-children`, { credentials: "include" }),
        fetch(`/api/organizations/${orgSlug}/club-memberships`, { credentials: "include" }),
      ]);

      if (childrenRes.ok) {
        const data = await childrenRes.json();
        setChildrenList(data);
        if (data.length > 0 && !selectedChildId) {
          setSelectedChildId(data[0].id);
        }
      }

      if (memRes.ok) {
        const memData = await memRes.json();
        setMemberships(memData);
      }
    } catch (err) {
      console.error("Failed to load parent dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeOrganization) {
      fetchDashboardData();
    }
  }, [activeOrganization]);

  const selectedChild = childrenList.find((c) => c.id === selectedChildId);

  const childMemberships = memberships.filter(
    (m) => m.studentId === selectedChildId
  );

  const pendingParentApprovals = childMemberships.filter(
    (m) => m.status === "PENDING_PARENT_APPROVAL"
  );
  const activeMemberships = childMemberships.filter((m) => m.status === "ACTIVE");

  const handleParentApprove = async (membershipId: string) => {
    setActionLoading(membershipId);
    try {
      const res = await fetch(
        `/api/organizations/${orgSlug}/club-memberships/${membershipId}/parent-approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (res.ok) {
        await fetchDashboardData();
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to approve request");
      }
    } catch (err) {
      console.error("Approve error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleParentReject = async (membershipId: string) => {
    setActionLoading(membershipId);
    try {
      const res = await fetch(
        `/api/organizations/${orgSlug}/club-memberships/${membershipId}/parent-reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (res.ok) {
        await fetchDashboardData();
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to reject request");
      }
    } catch (err) {
      console.error("Reject error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <HeartHandshake className="h-6 w-6 text-primary" /> My Children Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            View activity enrollment, schedules, and approve club join requests for your children at {activeOrganization?.name}.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-muted-foreground">Loading family profile...</div>
      ) : childrenList.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No children are currently linked to your parent account in this school.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Child Switcher Tabs */}
          <div className="flex flex-wrap gap-3">
            {childrenList.map((child) => (
              <Button
                key={child.id}
                variant={selectedChildId === child.id ? "default" : "outline"}
                onClick={() => setSelectedChildId(child.id)}
                className="h-auto py-3 px-4 flex items-center gap-3 text-left"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs">
                  {child.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-sm leading-tight">{child.fullName}</div>
                  <div className="text-xs opacity-80 font-normal">Grade {child.grade} · {child.studentIdentifier}</div>
                </div>
              </Button>
            ))}
          </div>

          {/* Active Selected Child Overview Card */}
          {selectedChild && (
            <div className="space-y-6">
              <Card className="border-border/50 bg-card shadow-sm">
                <CardHeader className="pb-3 border-b border-border/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle className="text-xl">{selectedChild.fullName}</CardTitle>
                        <CardDescription className="text-xs font-mono">
                          Student ID: {selectedChild.studentIdentifier} · Grade {selectedChild.grade}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Linked as {selectedChild.relationshipType || "Parent"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-lg border border-border/40 bg-muted/30 p-4">
                      <div className="text-xs text-muted-foreground font-medium">Enrolled Clubs</div>
                      <div className="text-2xl font-bold text-foreground mt-1">
                        {activeMemberships.length}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Active memberships</div>
                    </div>

                    <div className="rounded-lg border border-border/40 bg-muted/30 p-4">
                      <div className="text-xs text-muted-foreground font-medium">Pending Approvals</div>
                      <div className="text-2xl font-bold text-amber-500 mt-1">
                        {pendingParentApprovals.length}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Requires your decision</div>
                    </div>

                    <div className="rounded-lg border border-border/40 bg-muted/30 p-4">
                      <div className="text-xs text-muted-foreground font-medium">Attendance Record</div>
                      <div className="text-2xl font-bold text-emerald-500 mt-1">100%</div>
                      <div className="text-xs text-muted-foreground mt-1">Present in all sessions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Club Approval Action List */}
              <Card className="border-border/50 bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Club Join Requests & Approvals</CardTitle>
                  <CardDescription className="text-xs">
                    Review and authorize club join requests submitted by {selectedChild.fullName}.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {childMemberships.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      No club membership requests found for {selectedChild.fullName}.
                    </div>
                  ) : (
                    <div className="divide-y divide-border/40 border border-border/40 rounded-lg overflow-hidden">
                      {childMemberships.map((mem) => (
                        <div
                          key={mem.id}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/10 hover:bg-muted/20 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-foreground">{mem.clubName}</span>
                              {mem.status === "PENDING_PARENT_APPROVAL" && (
                                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-xs flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> Pending Your Approval
                                </Badge>
                              )}
                              {mem.status === "PENDING_ADVISOR_APPROVAL" && (
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> Pending Advisor Approval
                                </Badge>
                              )}
                              {mem.status === "ACTIVE" && (
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs flex items-center gap-1">
                                  <ShieldCheck className="h-3 w-3" /> Active Member
                                </Badge>
                              )}
                              {mem.status === "PARENT_REJECTED" && (
                                <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/30 text-xs flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" /> Rejected by You
                                </Badge>
                              )}
                              {mem.status === "ADVISOR_REJECTED" && (
                                <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/30 text-xs flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" /> Rejected by Advisor
                                </Badge>
                              )}
                              {mem.status === "WITHDRAWN" && (
                                <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-xs">
                                  Withdrawn
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Requested: {new Date(mem.requestedAt).toLocaleDateString()}
                              {mem.parentApprovedAt && ` · Parent Approved: ${new Date(mem.parentApprovedAt).toLocaleDateString()}`}
                              {mem.advisorApprovedAt && ` · Advisor Approved: ${new Date(mem.advisorApprovedAt).toLocaleDateString()}`}
                            </div>
                          </div>

                          {mem.status === "PENDING_PARENT_APPROVAL" && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                                disabled={actionLoading === mem.id}
                                onClick={() => handleParentReject(mem.id)}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                              </Button>
                              <Button
                                size="sm"
                                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                disabled={actionLoading === mem.id}
                                onClick={() => handleParentApprove(mem.id)}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve Request
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
