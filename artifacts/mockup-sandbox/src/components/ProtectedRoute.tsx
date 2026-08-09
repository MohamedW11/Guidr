import React, { useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { useLocation } from "./mockups/guidr/_shared/router";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: "student" | "admin";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        if (requiredRole === "admin") {
          setLocation("/guidr-admin/Login");
        } else {
          setLocation("/guidr/Login");
        }
      } else if (user.role !== requiredRole) {
        if (user.role === "admin") {
          setLocation("/guidr-admin/Dashboard");
        } else {
          setLocation("/guidr/Dashboard");
        }
      }
    }
  }, [user, isLoading, requiredRole, setLocation]);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111",
          color: "#fff",
          fontSize: 14,
          fontFamily: "sans-serif",
        }}
      >
        Loading session...
      </div>
    );
  }

  if (!user || user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
