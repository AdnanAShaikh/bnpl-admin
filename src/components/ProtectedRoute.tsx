// src/components/ProtectedRoute.tsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<"checking" | "ok" | "fail">("checking");

  useEffect(() => {
    apiFetch("/api/auth/verify")
      .then((res) => setStatus(res.ok ? "ok" : "fail"))
      .catch(() => setStatus("fail"));
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Verifying session...</p>
      </div>
    );
  }

  return status === "ok" ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;