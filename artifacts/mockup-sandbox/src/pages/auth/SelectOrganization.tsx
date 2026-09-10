import { useAuth } from "../../lib/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Building2, ArrowRight, ShieldCheck } from "lucide-react";

export function SelectOrganization() {
  const { user, organizations, setActiveOrganization, logout } = useAuth();

  const handleSelectOrg = (org: typeof organizations[0]) => {
    setActiveOrganization(org);
    // Navigate to tenant dashboard
    window.location.href = `/${org.slug}/dashboard`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl mb-2">
            G
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Select Your School</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{user?.fullName}</span>. Choose an organization to access your dashboard.
          </p>
        </div>

        <div className="space-y-4">
          {organizations.map((org) => (
            <Card
              key={org.id}
              onClick={() => handleSelectOrg(org)}
              className="group cursor-pointer hover:border-primary transition-all duration-200 hover:shadow-md"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted border border-border/40 font-bold text-lg text-primary">
                    {org.logoUrl ? (
                      <img src={org.logoUrl} alt={org.name} className="h-full w-full rounded-lg object-cover" />
                    ) : (
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {org.name}
                    </CardTitle>
                    <CardDescription className="text-xs font-mono">
                      app.guidr.com/{org.slug}
                    </CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">Assigned Roles:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {org.roles.map((role) => (
                      <Badge key={role} variant="secondary" className="text-xs capitalize">
                        {role.toLowerCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center pt-4">
          <Button variant="outline" size="sm" onClick={() => logout()}>
            Sign out of Guidr
          </Button>
        </div>
      </div>
    </div>
  );
}
