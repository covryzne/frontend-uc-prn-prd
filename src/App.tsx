import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VerifikasiDomain from "./pages/VerifikasiDomain";
import LogServis from "./pages/LogServis";
import KelolaUser from "./pages/KelolaUser";
import AdminConsole from "./pages/AdminConsole";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { user, isAdmin, authReady } = useAuth();
  if (!authReady) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function AppRoutes() {
  const { user, authReady } = useAuth();
  if (!authReady) return null;
  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verifikasi"
        element={
          <ProtectedRoute>
            <VerifikasiDomain />
          </ProtectedRoute>
        }
      />
      <Route
        path="/log-servis"
        element={
          <ProtectedRoute>
            <LogServis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kelola-user"
        element={
          <ProtectedRoute adminOnly>
            <KelolaUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-console"
        element={
          <ProtectedRoute adminOnly>
            <AdminConsole />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
