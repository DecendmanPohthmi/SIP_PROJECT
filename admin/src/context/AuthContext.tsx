import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

interface AuthContextType {
  token: string | null;
  role: string | null;
  loading: boolean;

  isLoggedIn: boolean;
  isAdmin: boolean;
  isOrganiser: boolean;
  isAttendee: boolean;

  login: (token: string, role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");

    if (savedToken) setToken(savedToken);
    if (savedRole) setRole(savedRole);

    setLoading(false);
  }, []);

  const login = (newToken: string, newRole: string) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", newRole);

    setToken(newToken);
    setRole(newRole);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    setToken(null);
    setRole(null);
  };

  const isLoggedIn = !!token;
  const isAdmin = role === "admin";
  const isOrganiser = role === "organiser";
  const isAttendee = role === "attendee";

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        loading,

        isLoggedIn,
        isAdmin,
        isOrganiser,
        isAttendee,

        login,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};