import React, { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/lib/AuthContext';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  AdvisorRequestsPage,
  ChildDashboardPage,
  ChildRequestsPage,
  ClubDetailsPage,
  ClubWorkspacePage,
  ClubsPage,
  CreateClubPage,
  DashboardPage,
  ExploreClubsPage,
  LoginPage,
  MyChildrenPage,
  MyClubsPage,
  NotificationsPage,
  ProfilePage,
  RequestsPage,
  SchedulePage,
  SelectOrganizationPage,
  StudentProfilePage,
  UsersPage,
} from '@/pages/guidr-pages';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Home() {
  return <LoginPage />;
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={LoginPage} />
        <Route path="/select-organization" component={SelectOrganizationPage} />

        {/* Dynamic Tenant Org Slugs & Al-Noor Demo Slugs */}
        <Route path="/:orgSlug/clubs/model-united-nations/details" component={ClubDetailsPage} />
        <Route path="/:orgSlug/clubs/model-united-nations" component={() => <ClubWorkspacePage />} />
        <Route path="/:orgSlug/children/layla/clubs/model-united-nations" component={() => <ClubWorkspacePage parent />} />
        <Route path="/:orgSlug/dashboard" component={() => <DashboardPage />} />
        <Route path="/:orgSlug/notifications" component={NotificationsPage} />
        <Route path="/:orgSlug/profile" component={ProfilePage} />
        <Route path="/:orgSlug/clubs/create" component={CreateClubPage} />
        <Route path="/:orgSlug/clubs/explore" component={ExploreClubsPage} />
        <Route path="/:orgSlug/clubs" component={ClubsPage} />
        <Route path="/:orgSlug/clubs/:clubId" component={() => <ClubWorkspacePage />} />
        <Route path="/:orgSlug/users/student-001" component={StudentProfilePage} />
        <Route path="/:orgSlug/users" component={UsersPage} />
        <Route path="/:orgSlug/requests" component={() => <RequestsPage />} />
        <Route path="/:orgSlug/schedule" component={() => <SchedulePage />} />
        <Route path="/:orgSlug/my-clubs" component={MyClubsPage} />
        <Route path="/:orgSlug/advisor-requests" component={AdvisorRequestsPage} />
        <Route path="/:orgSlug/my-schedule" component={() => <SchedulePage student />} />
        <Route path="/:orgSlug/my-children" component={MyChildrenPage} />
        <Route path="/:orgSlug/children/layla" component={ChildDashboardPage} />
        <Route path="/:orgSlug/children/layla/requests" component={ChildRequestsPage} />

        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={baseUrl}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
