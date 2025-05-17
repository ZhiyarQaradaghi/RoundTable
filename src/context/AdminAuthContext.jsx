import { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const AdminAuthContext = createContext();

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

export function AdminAuthProvider({ children }) {
  const { login: authLogin, user, logout: authLogout } = useAuth();
  const [adminUser, setAdminUser] = useState(null);
  const navigate = useNavigate();

  const login = async (credentials) => {
    const data = await authLogin(credentials);
    if (data.user.role !== "admin") {
      await authLogout();
      throw new Error("Not authorized as admin");
    }
    setAdminUser(data.user);
    return data;
  };

  const logout = async () => {
    await authLogout();
    setAdminUser(null);
    navigate("/admin/login");
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin: adminUser,
        user: adminUser,
        login,
        logout,
        isAuthenticated: !!adminUser,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}
