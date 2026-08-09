import { useEffect, useState, type ComponentType } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./lib/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { modules as discoveredModules } from "./.generated/mockup-components";

// Student components
import { Landing as StudentLanding } from "./components/mockups/guidr/Landing";
import { Login as StudentLogin } from "./components/mockups/guidr/Login";
import { Signup as StudentSignup } from "./components/mockups/guidr/Signup";
import { Dashboard as StudentDashboard } from "./components/mockups/guidr/Dashboard";
import { Opportunities as StudentOpportunities } from "./components/mockups/guidr/Opportunities";
import { OpportunityDetail as StudentOpportunityDetail } from "./components/mockups/guidr/OpportunityDetail";
import { Saved as StudentSaved } from "./components/mockups/guidr/Saved";
import { Tutor as StudentTutor } from "./components/mockups/guidr/Tutor";
import { Lesson as StudentLesson } from "./components/mockups/guidr/Lesson";
import { Profile as StudentProfile } from "./components/mockups/guidr/Profile";

// Admin components
import { Login as AdminLogin } from "./components/mockups/guidr-admin/Login";
import { Dashboard as AdminDashboard } from "./components/mockups/guidr-admin/Dashboard";
import { Opportunities as AdminOpportunities } from "./components/mockups/guidr-admin/Opportunities";
import { Lessons as AdminLessons } from "./components/mockups/guidr-admin/Lessons";
import { Settings as AdminSettings } from "./components/mockups/guidr-admin/Settings";

type ModuleMap = Record<string, () => Promise<Record<string, unknown>>>;

const queryClient = new QueryClient();

function _resolveComponent(mod: Record<string, unknown>, name: string): ComponentType | undefined {
  const fns = Object.values(mod).filter((v) => typeof v === "function") as ComponentType[];
  return (
    (mod.default as ComponentType) ||
    (mod.Preview as ComponentType) ||
    (mod[name] as ComponentType) ||
    fns[fns.length - 1]
  );
}

function PreviewRenderer({ componentPath, modules }: { componentPath: string; modules: ModuleMap }) {
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setComponent(null);
    setError(null);

    async function loadComponent(): Promise<void> {
      const key = `./components/mockups/${componentPath}.tsx`;
      const loader = modules[key];
      if (!loader) {
        setError(`No component found at ${componentPath}.tsx`);
        return;
      }

      try {
        const mod = await loader();
        if (cancelled) return;
        const name = componentPath.split("/").pop()!;
        const comp = _resolveComponent(mod, name);
        if (!comp) {
          setError(`No exported React component found in ${componentPath}.tsx`);
          return;
        }
        setComponent(() => comp);
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : String(e);
        setError(`Failed to load preview.\n${message}`);
      }
    }

    void loadComponent();
    return () => {
      cancelled = true;
    };
  }, [componentPath, modules]);

  if (error) {
    return <pre style={{ color: "red", padding: "2rem", fontFamily: "system-ui" }}>{error}</pre>;
  }

  if (!Component) return null;
  return <Component />;
}

function getBasePath(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, "");
}

function getPreviewPath(): string | null {
  const basePath = getBasePath();
  const { pathname } = window.location;
  const local = basePath && pathname.startsWith(basePath) ? pathname.slice(basePath.length) || "/" : pathname;
  const match = local.match(/^\/preview\/(.+)$/);
  return match ? match[1] : null;
}

function MainRouter() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const path = pathname.toLowerCase();

  // Public routes
  if (path === "/" || path.startsWith("/guidr/landing")) return <StudentLanding />;
  if (path.startsWith("/guidr/login")) return <StudentLogin />;
  if (path.startsWith("/guidr/signup")) return <StudentSignup />;
  if (path.startsWith("/guidr/onboarding")) return <StudentSignup />;
  if (path.startsWith("/guidr/interests")) return <StudentSignup />;
  if (path.startsWith("/guidr-admin/login")) return <AdminLogin />;

  // Admin protected routes
  if (path.startsWith("/guidr-admin/dashboard"))
    return (
      <ProtectedRoute requiredRole="admin">
        <AdminDashboard />
      </ProtectedRoute>
    );
  if (path.startsWith("/guidr-admin/opportunities"))
    return (
      <ProtectedRoute requiredRole="admin">
        <AdminOpportunities />
      </ProtectedRoute>
    );
  if (path.startsWith("/guidr-admin/lessons"))
    return (
      <ProtectedRoute requiredRole="admin">
        <AdminLessons />
      </ProtectedRoute>
    );
  if (path.startsWith("/guidr-admin/settings"))
    return (
      <ProtectedRoute requiredRole="admin">
        <AdminSettings />
      </ProtectedRoute>
    );
  if (path.startsWith("/guidr-admin"))
    return (
      <ProtectedRoute requiredRole="admin">
        <AdminDashboard />
      </ProtectedRoute>
    );

  // Student protected routes
  if (path.startsWith("/guidr/opportunitydetail"))
    return (
      <ProtectedRoute requiredRole="student">
        <StudentOpportunityDetail />
      </ProtectedRoute>
    );
  if (path.startsWith("/guidr/opportunities"))
    return (
      <ProtectedRoute requiredRole="student">
        <StudentOpportunities />
      </ProtectedRoute>
    );
  if (path.startsWith("/guidr/saved"))
    return (
      <ProtectedRoute requiredRole="student">
        <StudentSaved />
      </ProtectedRoute>
    );
  if (path.startsWith("/guidr/tutor"))
    return (
      <ProtectedRoute requiredRole="student">
        <StudentTutor />
      </ProtectedRoute>
    );
  if (path.startsWith("/guidr/lesson"))
    return (
      <ProtectedRoute requiredRole="student">
        <StudentLesson />
      </ProtectedRoute>
    );
  if (path.startsWith("/guidr/profile"))
    return (
      <ProtectedRoute requiredRole="student">
        <StudentProfile />
      </ProtectedRoute>
    );
  if (path.startsWith("/guidr/dashboard") || path.startsWith("/guidr"))
    return (
      <ProtectedRoute requiredRole="student">
        <StudentDashboard />
      </ProtectedRoute>
    );

  // Fallback
  return <StudentLanding />;
}

function App() {
  const previewPath = getPreviewPath();

  if (previewPath) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PreviewRenderer componentPath={previewPath} modules={discoveredModules} />
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MainRouter />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
