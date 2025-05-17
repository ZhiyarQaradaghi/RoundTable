import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";
import ConfirmJoinDiscussion from "./pages/ConfirmJoinDiscussion";
import ProfilePage from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import DiscussionPage from "./pages/DiscussionPage";
import { SocketProvider } from "./context/SocketContext.jsx";
import AdminDashboard from "./pages/AdminDashboard";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import AdminLogin from "./pages/AdminLogin";

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/discussions/:discussionId/join"
              element={
                <ProtectedRoute>
                  <ConfirmJoinDiscussion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/discussions/:discussionId"
              element={
                <ProtectedRoute>
                  <DiscussionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SocketProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
