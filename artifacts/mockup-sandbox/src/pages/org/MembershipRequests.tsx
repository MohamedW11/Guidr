import { useState, useEffect } from "react";
import { useAuth } from "../../lib/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { ClipboardList, CheckCircle2, XCircle, Clock, ShieldCheck, AlertCircle, Search, Filter } from "lucide-react";
import { Input } from "../../components/ui/input";

export function MembershipRequests() {
  const { activeOrganization } = useAuth();
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("PENDING_ADVISOR_APPROVAL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const orgSlug = activeOrganization?.slug || "cairo-international-school";

  const fetchMemberships = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/organizations/${orgSlug}/club-memberships`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setMemberships(data);
      }
    } catch (err) {
      console.error("Failed to load club memberships:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeOrganization) {
      fetchMemberships();
    }
  }, [activeOrganization]);

  const handleAdvisorApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/organizations/${orgSlug}/club-memberships/${id}/advisor-approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        await fetchMemberships();
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to approve membership request");
      }
    } catch (err) {
      console.error("Advisor approve error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAdvisorReject = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/organizations/${orgSlug}/club-memberships/${id}/advisor-reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        await fetchMemberships();
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to reject membership request");
      }
    } catch (err) {
      console.error("Advisor reject error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredMemberships = memberships.filter((m) => {
    const matchesStatus =
      statusFilter === "ALL" ? true : m.status === statusFilter;
    const matchesSearch =
      m.clubName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.studentFullName && m.studentFullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.studentIdentifier && m.studentIdentifier.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" /> Club Membership Approval Center
          </h1>
          <p className="text-sm text-muted-foreground">
            Review parent-approved student requests, manage club roster, and audit membership history at {activeOrganization?.name}.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border/50 bg-card p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <Button
              size="sm"
              variant={statusFilter === "PENDING_ADVISOR_APPROVAL" ? "default" : "outline"}
              onClick={() => setStatusFilter("PENDING_ADVISOR_APPROVAL")}
              className="text-xs shrink-0"
            >
              Pending Advisor Approval
              <Badge variant="secondary" className="ml-1.5 text-[10px]">
                {memberships.filter((m) => m.status === "PENDING_ADVISOR_APPROVAL").length}
              </Badge>
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "PENDING_PARENT_APPROVAL" ? "default" : "outline"}
              onClick={() => setStatusFilter("PENDING_PARENT_APPROVAL")}
              className="text-xs shrink-0"
            >
              Pending Parent
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "ACTIVE" ? "default" : "outline"}
              onClick={() => setStatusFilter("ACTIVE")}
              className="text-xs shrink-0"
            >
              Active Members
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "ALL" ? "default" : "outline"}
              onClick={() => setStatusFilter("ALL")}
              className="text-xs shrink-0"
            >
              All Records (Audit)
            </Button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by student or club..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>
      </Card>

      {/* Membership Requests List */}
      {loading ? (
        <div className="p-12 text-center text-sm text-muted-foreground">Loading approval requests...</div>
      ) : filteredMemberships.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            No membership records found matching the selected filter.
          </CardContent>
        </Card>
      ) : (
        <div className="divide-y divide-border/40 border border-border/40 rounded-xl overflow-hidden bg-card shadow-sm">
          {filteredMemberships.map((mem) => (
            <div
              key={mem.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card hover:bg-muted/10 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-bold text-base text-foreground">{mem.studentFullName || "Student"}</span>
                  <span className="text-xs font-mono text-muted-foreground">
                    ({mem.studentIdentifier || "ID"} · Grade {mem.studentGrade || "N/A"})
                  </span>
                  <span className="text-muted-foreground">➔</span>
                  <Badge variant="outline" className="text-xs font-semibold bg-primary/10 text-primary border-primary/30">
                    {mem.clubName}
                  </Badge>

                  {mem.status === "PENDING_PARENT_APPROVAL" && (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-xs flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Pending Parent Approval
                    </Badge>
                  )}
                  {mem.status === "PENDING_ADVISOR_APPROVAL" && (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Action Required (Advisor)
                    </Badge>
                  )}
                  {mem.status === "ACTIVE" && (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Active Member
                    </Badge>
                  )}
                  {mem.status === "PARENT_REJECTED" && (
                    <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/30 text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Parent Rejected
                    </Badge>
                  )}
                  {mem.status === "ADVISOR_REJECTED" && (
                    <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/30 text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Advisor Rejected
                    </Badge>
                  )}
                  {mem.status === "WITHDRAWN" && (
                    <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-xs">
                      Withdrawn
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                  <span>Requested: {new Date(mem.requestedAt).toLocaleString()}</span>
                  {mem.parentApprovedAt && (
                    <span className="text-emerald-400/90 font-medium">
                      ✓ Parent Approved: {new Date(mem.parentApprovedAt).toLocaleString()}
                    </span>
                  )}
                  {mem.advisorApprovedAt && (
                    <span className="text-emerald-400/90 font-medium">
                      ✓ Advisor Approved: {new Date(mem.advisorApprovedAt).toLocaleString()}
                    </span>
                  )}
                  {mem.withdrawnAt && (
                    <span className="text-muted-foreground">
                      Withdrawn: {new Date(mem.withdrawnAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {mem.status === "PENDING_ADVISOR_APPROVAL" && (
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                    disabled={actionLoading === mem.id}
                    onClick={() => handleAdvisorReject(mem.id)}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Reject Request
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={actionLoading === mem.id}
                    onClick={() => handleAdvisorApprove(mem.id)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve & Activate
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
