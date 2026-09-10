import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { Login } from "./components/mockups/guidr/Login";
import { Landing } from "./components/mockups/guidr/Landing";
import { SelectOrganization } from "./pages/auth/SelectOrganization";
import { UserRoster } from "./pages/org/UserRoster";
import { MyChildren } from "./pages/org/MyChildren";
import { ClubsManager } from "./pages/org/ClubsManager";
import { ExploreClubs } from "./pages/org/ExploreClubs";
import { MembershipRequests } from "./pages/org/MembershipRequests";
import { ClubOperationsWorkspace } from "./pages/org/ClubOperationsWorkspace";
import { PermissionGuard } from "./components/auth/PermissionGuard";
import {
  StudentDashboard,
  ParentDashboard,
  AdvisorDashboard,
  AdminDashboard,
} from "./pages/org/RoleDashboards";
import {
  Building2,
  Shield,
  Users,
  Calendar,
  Sparkles,
  LogOut,
  HeartHandshake,
  LayoutDashboard,
  Layers,
  Compass,
  ClipboardList,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function GuidrV1Shell() {
  const { user, activeOrganization, organizations, logout, isLoading } = useAuth();
  const [pathname, setPathname] = useState(window.location.pathname);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "roster" | "children" | "clubs" | "explore" | "requests" | "operations"
  >("dashboard");

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">Loading Guidr V1...</p>
        </div>
      </div>
    );
  }

  const path = pathname.toLowerCase();

  // Public & Auth Routing
  if (path === "/" || path === "/landing") return <Landing />;
  if (path === "/login") return <Login />;
  if (!user) return <Login />;

  if (path === "/select-organization" || (!activeOrganization && organizations.length > 1)) {
    return <SelectOrganization />;
  }

  const currentOrg = activeOrganization || organizations[0];
  const userRoles = currentOrg?.roles || [];
  const isAdmin = userRoles.includes("ADMIN");
  const isAdvisor = userRoles.includes("ADVISOR");
  const isAdminOrAdvisor = isAdmin || isAdvisor;
  const isStudent = userRoles.includes("STUDENT");
  const isParent = userRoles.includes("PARENT");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                G
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight">Guidr V1</span>
                {currentOrg && (
                  <Badge variant="outline" className="ml-2 text-xs font-normal">
                    {currentOrg.name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              <Button
                variant={activeTab === "dashboard" ? "secondary" : "ghost"}
                size="sm"
                className="text-xs"
                onClick={() => setActiveTab("dashboard")}
              >
                <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" /> Dashboard
              </Button>

              {isAdminOrAdvisor && (
                <>
                  <Button
                    variant={activeTab === "clubs" ? "secondary" : "ghost"}
                    size="sm"
                    className="text-xs"
                    onClick={() => setActiveTab("clubs")}
                  >
                    <Layers className="h-3.5 w-3.5 mr-1.5" /> Clubs Catalog
                  </Button>
                  <Button
                    variant={activeTab === "operations" ? "secondary" : "ghost"}
                    size="sm"
                    className="text-xs"
                    onClick={() => setActiveTab("operations")}
                  >
                    <Calendar className="h-3.5 w-3.5 mr-1.5" /> Operations & Sessions
                  </Button>
                  <Button
                    variant={activeTab === "requests" ? "secondary" : "ghost"}
                    size="sm"
                    className="text-xs"
                    onClick={() => setActiveTab("requests")}
                  >
                    <ClipboardList className="h-3.5 w-3.5 mr-1.5" /> Membership Approvals
                  </Button>
                  <Button
                    variant={activeTab === "roster" ? "secondary" : "ghost"}
                    size="sm"
                    className="text-xs"
                    onClick={() => setActiveTab("roster")}
                  >
                    <Users className="h-3.5 w-3.5 mr-1.5" /> User Roster
                  </Button>
                </>
              )}

              {isStudent && (
                <Button
                  variant={activeTab === "explore" ? "secondary" : "ghost"}
                  size="sm"
                  className="text-xs"
                  onClick={() => setActiveTab("explore")}
                >
                  <Compass className="h-3.5 w-3.5 mr-1.5" /> Discover Clubs
                </Button>
              )}

              {isParent && (
                <Button
                  variant={activeTab === "children" ? "secondary" : "ghost"}
                  size="sm"
                  className="text-xs"
                  onClick={() => setActiveTab("children")}
                >
                  <HeartHandshake className="h-3.5 w-3.5 mr-1.5" /> My Children
                </Button>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Logged in as <strong className="text-foreground">{user.fullName}</strong>
                </span>
                {userRoles.map((role) => (
                  <Badge key={role} variant="secondary" className="text-[10px] uppercase font-mono">
                    {role}
                  </Badge>
                ))}
              </div>
            )}
            {organizations.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => (window.location.href = "/select-organization")}
              >
                Switch School
              </Button>
            )}
            <Button variant="ghost" size="icon" title="Sign out" onClick={() => logout()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="container mx-auto p-6 space-y-6 flex-1">
        {activeTab === "dashboard" ? (
          isAdmin ? (
            <AdminDashboard onNavigate={setActiveTab} />
          ) : isAdvisor ? (
            <AdvisorDashboard onNavigate={setActiveTab} />
          ) : isParent ? (
            <ParentDashboard onNavigate={setActiveTab} />
          ) : (
            <StudentDashboard onNavigate={setActiveTab} />
          )
        ) : activeTab === "clubs" ? (
          <PermissionGuard allowedRoles={["ADMIN", "ADVISOR"]}>
            <ClubsManager />
          </PermissionGuard>
        ) : activeTab === "operations" ? (
          <PermissionGuard allowedRoles={["ADMIN", "ADVISOR"]}>
            <ClubOperationsWorkspace />
          </PermissionGuard>
        ) : activeTab === "requests" ? (
          <PermissionGuard allowedRoles={["ADMIN", "ADVISOR"]}>
            <MembershipRequests />
          </PermissionGuard>
        ) : activeTab === "explore" ? (
          <ExploreClubs />
        ) : activeTab === "roster" ? (
          <PermissionGuard allowedRoles={["ADMIN", "ADVISOR"]}>
            <UserRoster />
          </PermissionGuard>
        ) : activeTab === "children" ? (
          <PermissionGuard allowedRoles={["PARENT", "ADMIN"]}>
            <MyChildren />
          </PermissionGuard>
        ) : (
          <AdminDashboard onNavigate={setActiveTab} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/95 py-4 text-center text-xs text-muted-foreground">
        Guidr V1 Student Life Platform · Multi-tenant B2B Architecture · {currentOrg?.name}
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GuidrV1Shell />
      </AuthProvider>
    </QueryClientProvider>
  );
}
