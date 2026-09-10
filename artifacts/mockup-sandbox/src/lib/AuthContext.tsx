import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserIdentity {
  id: string;
  email: string;
  fullName: string;
}

export interface UserOrganization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  membershipId: string;
  roles: string[]; // ADMIN, ADVISOR, STUDENT, PARENT
}

interface AuthContextType {
  user: UserIdentity | null;
  organizations: UserOrganization[];
  activeOrganization: UserOrganization | null;
  isLoading: boolean;
  setActiveOrganization: (org: UserOrganization | null) => void;
  refetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  organizations: [],
  activeOrganization: null,
  isLoading: true,
  setActiveOrganization: () => {},
  refetchUser: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserIdentity | null>(null);
  const [organizations, setOrganizations] = useState<UserOrganization[]>([]);
  const [activeOrganization, setActiveOrganization] = useState<UserOrganization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setOrganizations(data.organizations || []);

        // Auto-select single organization if available
        if (data.organizations && data.organizations.length === 1) {
          setActiveOrganization(data.organizations[0]);
        }
      } else {
        setUser(null);
        setOrganizations([]);
        setActiveOrganization(null);
      }
    } catch (err) {
      setUser(null);
      setOrganizations([]);
      setActiveOrganization(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetchUser();
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (err) {}
    setUser(null);
    setOrganizations([]);
    setActiveOrganization(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organizations,
        activeOrganization,
        isLoading,
        setActiveOrganization,
        refetchUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
