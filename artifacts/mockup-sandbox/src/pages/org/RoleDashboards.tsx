import { useState, useEffect } from "react";
import { useAuth } from "../../lib/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Sparkles,
  Layers,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Award,
  ArrowRight,
  HeartHandshake,
  MapPin,
  ClipboardList,
} from "lucide-react";

interface RoleDashboardProps {
  onNavigate: (tab: any) => void;
}

/**
 * 1. STUDENT DASHBOARD
 */
export function StudentDashboard({ onNavigate }: RoleDashboardProps) {
  const { activeOrganization, user } = useAuth();
  const [memberships, setMemberships] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const orgSlug = activeOrganization?.slug || "cairo-international-school";

  useEffect(() => {
    async function fetchStudentData() {
      setLoading(true);
      try {
        const memRes = await fetch(`/api/organizations/${orgSlug}/club-memberships`, {
          credentials: "include",
        });
        if (memRes.ok) {
          const data = await memRes.json();
          setMemberships(data);
        }
      } catch (err) {
        console.error("Failed to load student dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    if (activeOrganization) fetchStudentData();
  }, [activeOrganization]);

  const activeClubs = memberships.filter((m) => m.status === "ACTIVE");
  const pendingRequests = memberships.filter(
    (m) => m.status === "PENDING_PARENT_APPROVAL" || m.status === "PENDING_ADVISOR_APPROVAL"
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
              <Sparkles className="h-4 w-4" /> Student Life Dashboard
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome back, {user?.fullName}!
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track your active club memberships, pending approvals, and school recognitions at {activeOrganization?.name}.
            </p>
          </div>

          <Button size="sm" onClick={() => onNavigate("explore")} className="text-xs shrink-0">
            Discover Clubs <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card p-4">
          <div className="text-xs text-muted-foreground font-medium">Active Enrolled Clubs</div>
          <div className="text-3xl font-bold text-emerald-400 mt-1">{activeClubs.length}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Official club member</div>
        </Card>

        <Card className="border-border/50 bg-card p-4">
          <div className="text-xs text-muted-foreground font-medium">Pending Join Requests</div>
          <div className="text-3xl font-bold text-amber-400 mt-1">{pendingRequests.length}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Awaiting approval</div>
        </Card>

        <Card className="border-border/50 bg-card p-4">
          <div className="text-xs text-muted-foreground font-medium">Achievement Badges</div>
          <div className="text-3xl font-bold text-primary mt-1">1</div>
          <div className="text-[11px] text-muted-foreground mt-1">Earned honors</div>
        </Card>
      </div>

      {/* Active & Pending Memberships */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" /> My Active Clubs
            </CardTitle>
            <CardDescription className="text-xs">
              Clubs where your membership is active.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Loading memberships...</div>
            ) : activeClubs.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                You are not currently an active member of any clubs. Browse catalog to apply!
              </div>
            ) : (
              activeClubs.map((mem) => (
                <div key={mem.id} className="p-3.5 border border-border/40 rounded-lg bg-muted/20 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-foreground">{mem.clubName}</div>
                    <div className="text-[11px] text-muted-foreground">
                      Grade Eligibility: {mem.minimumGrade}–{mem.maximumGrade}
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                    Active Member
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-400" /> Pending Join Applications
            </CardTitle>
            <CardDescription className="text-xs">
              Membership requests working through approval stage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Loading applications...</div>
            ) : pendingRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No pending membership applications.
              </div>
            ) : (
              pendingRequests.map((mem) => (
                <div key={mem.id} className="p-3.5 border border-border/40 rounded-lg bg-muted/20 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-foreground">{mem.clubName}</div>
                    <div className="text-[11px] text-muted-foreground">
                      Submitted: {new Date(mem.requestedAt).toLocaleDateString()}
                    </div>
                  </div>
                  {mem.status === "PENDING_PARENT_APPROVAL" ? (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs">
                      Pending Parent
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
                      Pending Advisor
                    </Badge>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * 2. PARENT DASHBOARD
 */
export function ParentDashboard({ onNavigate }: RoleDashboardProps) {
  const { activeOrganization, user } = useAuth();
  const [childrenList, setChildrenList] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const orgSlug = activeOrganization?.slug || "cairo-international-school";

  useEffect(() => {
    async function fetchParentData() {
      setLoading(true);
      try {
        const [chRes, memRes] = await Promise.all([
          fetch(`/api/organizations/${orgSlug}/my-children`, { credentials: "include" }),
          fetch(`/api/organizations/${orgSlug}/club-memberships`, { credentials: "include" }),
        ]);

        if (chRes.ok) setChildrenList(await chRes.json());
        if (memRes.ok) setMemberships(await memRes.json());
      } catch (err) {
        console.error("Failed to load parent dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    if (activeOrganization) fetchParentData();
  }, [activeOrganization]);

  const pendingParentAction = memberships.filter((m) => m.status === "PENDING_PARENT_APPROVAL");

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
              <HeartHandshake className="h-4 w-4" /> Family Overview
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Parent Dashboard — {user?.fullName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Authorize student club join requests and monitor activity enrollment at {activeOrganization?.name}.
            </p>
          </div>

          <Button size="sm" onClick={() => onNavigate("children")} className="text-xs shrink-0">
            Manage Children <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card p-4">
          <div className="text-xs text-muted-foreground font-medium">Linked Children</div>
          <div className="text-3xl font-bold text-foreground mt-1">{childrenList.length}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Students under your account</div>
        </Card>

        <Card className="border-border/50 bg-card p-4">
          <div className="text-xs text-muted-foreground font-medium">Action Required</div>
          <div className="text-3xl font-bold text-amber-400 mt-1">{pendingParentAction.length}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Requests awaiting your approval</div>
        </Card>

        <Card className="border-border/50 bg-card p-4">
          <div className="text-xs text-muted-foreground font-medium">Overall Attendance</div>
          <div className="text-3xl font-bold text-emerald-400 mt-1">100%</div>
          <div className="text-[11px] text-muted-foreground mt-1">Verified attendance rate</div>
        </Card>
      </div>
    </div>
  );
}

/**
 * 3. ADVISOR DASHBOARD
 */
export function AdvisorDashboard({ onNavigate }: RoleDashboardProps) {
  const { activeOrganization, user } = useAuth();
  const [clubs, setClubs] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const orgSlug = activeOrganization?.slug || "cairo-international-school";

  useEffect(() => {
    async function fetchAdvisorData() {
      setLoading(true);
      try {
        const [clRes, memRes] = await Promise.all([
          fetch(`/api/organizations/${orgSlug}/clubs`, { credentials: "include" }),
          fetch(`/api/organizations/${orgSlug}/club-memberships`, { credentials: "include" }),
        ]);

        if (clRes.ok) setClubs(await clRes.json());
        if (memRes.ok) setMemberships(await memRes.json());
      } catch (err) {
        console.error("Failed to load advisor dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    if (activeOrganization) fetchAdvisorData();
  }, [activeOrganization]);

  const pendingAdvisorAction = memberships.filter((m) => m.status === "PENDING_ADVISOR_APPROVAL");

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
              <Sparkles className="h-4 w-4" /> Advisor Workspace
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Advisor Dashboard — {user?.fullName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your assigned clubs, approve parent-cleared student requests, and lead sessions at {activeOrganization?.name}.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" onClick={() => onNavigate("requests")} className="text-xs">
              Review Approvals ({pendingAdvisorAction.length})
            </Button>
            <Button size="sm" variant="outline" onClick={() => onNavigate("operations")} className="text-xs">
              Open Operations
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card p-4">
          <div className="text-xs text-muted-foreground font-medium">Assigned Clubs</div>
          <div className="text-3xl font-bold text-primary mt-1">1</div>
          <div className="text-[11px] text-muted-foreground mt-1">Robotics & AI Club</div>
        </Card>

        <Card className="border-border/50 bg-card p-4">
          <div className="text-xs text-muted-foreground font-medium">Pending Approvals</div>
          <div className="text-3xl font-bold text-amber-400 mt-1">{pendingAdvisorAction.length}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Awaiting advisor sign-off</div>
        </Card>

        <Card className="border-border/50 bg-card p-4">
          <div className="text-xs text-muted-foreground font-medium">Active Club Members</div>
          <div className="text-3xl font-bold text-emerald-400 mt-1">
            {memberships.filter((m) => m.status === "ACTIVE").length}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">Enrolled active roster</div>
        </Card>
      </div>
    </div>
  );
}

/**
 * 4. ADMIN DASHBOARD
 */
export function AdminDashboard({ onNavigate }: RoleDashboardProps) {
  const { activeOrganization, user } = useAuth();
  const [clubs, setClubs] = useState<any[]>([]);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const orgSlug = activeOrganization?.slug || "cairo-international-school";

  useEffect(() => {
    async function fetchAdminData() {
      setLoading(true);
      try {
        const [clRes, uRes, memRes] = await Promise.all([
          fetch(`/api/organizations/${orgSlug}/clubs`, { credentials: "include" }),
          fetch(`/api/organizations/${orgSlug}/users`, { credentials: "include" }),
          fetch(`/api/organizations/${orgSlug}/club-memberships`, { credentials: "include" }),
        ]);

        if (clRes.ok) setClubs(await clRes.json());
        if (uRes.ok) {
          const uData = await uRes.json();
          setUsersCount(uData.length);
        }
        if (memRes.ok) setMemberships(await memRes.json());
      } catch (err) {
        console.error("Failed to load admin dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    if (activeOrganization) fetchAdminData();
  }, [activeOrganization]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
              <Sparkles className="h-4 w-4" /> School Administration Portal
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Admin Overview — {activeOrganization?.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage school clubs catalog, user roster imports, campus locations, and tenant settings.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" onClick={() => onNavigate("clubs")} className="text-xs">
              <Layers className="h-3.5 w-3.5 mr-1" /> Clubs Manager
            </Button>
            <Button size="sm" variant="outline" onClick={() => onNavigate("roster")} className="text-xs">
              <Users className="h-3.5 w-3.5 mr-1" /> User Roster
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card p-4">
          <div className="text-xs text-muted-foreground font-medium">Total Active Clubs</div>
          <div className="text-3xl font-bold text-foreground mt-1">
            {clubs.filter((c) => c.status === "ACTIVE").length}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">Active student life clubs</div>
        </Card>

        <Card className="border-border/50 bg-card p-4">
          <div className="text-xs text-muted-foreground font-medium">Registered School Roster</div>
          <div className="text-3xl font-bold text-primary mt-1">{usersCount}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Students, Parents & Staff</div>
        </Card>

        <Card className="border-border/50 bg-card p-4">
          <div className="text-xs text-muted-foreground font-medium">Total Club Memberships</div>
          <div className="text-3xl font-bold text-emerald-400 mt-1">{memberships.length}</div>
          <div className="text-[11px] text-muted-foreground mt-1">All membership states</div>
        </Card>

        <Card className="border-border/50 bg-card p-4">
          <div className="text-xs text-muted-foreground font-medium">Campus Locations</div>
          <div className="text-3xl font-bold text-amber-400 mt-1">2</div>
          <div className="text-[11px] text-muted-foreground mt-1">STEM Lab & Auditorium</div>
        </Card>
      </div>
    </div>
  );
}
