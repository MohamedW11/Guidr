import React from "react";
import { useAuth } from "../../lib/AuthContext";
import { Card, CardContent } from "../ui/card";
import { ShieldAlert } from "lucide-react";

interface PermissionGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export function PermissionGuard({ allowedRoles, children }: PermissionGuardProps) {
  const { activeOrganization } = useAuth();
  const userRoles = activeOrganization?.roles || [];

  const hasAccess = allowedRoles.some((role) => userRoles.includes(role));

  if (!hasAccess) {
    return (
      <Card className="border-rose-500/30 bg-rose-500/5">
        <CardContent className="p-8 text-center space-y-3">
          <ShieldAlert className="h-10 w-10 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-foreground">Access Restricted</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            You do not have the required role ({allowedRoles.join(" or ")}) to access this module in {activeOrganization?.name || "this organization"}.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
