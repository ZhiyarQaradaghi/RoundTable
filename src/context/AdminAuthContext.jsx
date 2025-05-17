import { createContext, useContext, useState } from "react";

const AdminAuthContext = createContext();

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);

  const login = async ({ email, password }) => {
    if (email === "admin@roundtable.com" && password === "admin123") {
      setAdmin({ email });
      return true;
    }
    throw new Error("Invalid admin credentials");
  };

  const logout = () => {
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
