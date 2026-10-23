import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";
import { CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const triggerVerification = async () => {
      if (!token) {
        setStatus("error");
        setMessage("No verification token provided in URL.");
        return;
      }

      try {
        const res = await api.get(`/auth/verify-email/${token}`);
        if (res.data.success) {
          setStatus("success");
          setMessage(res.data.message);
        }
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Verification link is invalid or has expired.",
        );
      }
    };

    triggerVerification();
  }, [token]);

  return (
    <div
      className="container"
      style={{
        minHeight: "75vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "480px",
          padding: "3rem 2.5rem",
          textAlign: "center",
        }}
      >
        {status === "loading" && (
          <div>
            <Clock
              size={48}
              color="var(--accent-orange)"
              style={{
                animation: "spin 2s linear infinite",
                margin: "0 auto 1.5rem auto",
              }}
            />
            <h2 style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>
              Verifying Your Email
            </h2>
            <p style={{ color: "var(--text-muted)" }}>
              Confirming token with SliceCraft authentication servers...
            </p>
          </div>
        )}

        {status === "success" && (
          <div>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem auto",
              }}
            >
              <CheckCircle2 size={40} color="var(--accent-green)" />
            </div>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "0.8rem" }}>
              Email Verified!
            </h2>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.95rem",
                lineHeight: "1.6",
                marginBottom: "2rem",
              }}
            >
              {message}
            </p>
            <Link
              to="/login"
              className="btn-primary"
              style={{ display: "inline-flex", padding: "0.8rem 2rem" }}
            >
              Sign In to Your Account <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {status === "error" && (
          <div>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem auto",
              }}
            >
              <XCircle size={40} color="var(--accent-red)" />
            </div>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "0.8rem" }}>
              Verification Failed
            </h2>
            <p
              style={{
                color: "#f87171",
                fontSize: "0.95rem",
                lineHeight: "1.6",
                marginBottom: "2rem",
              }}
            >
              {message}
            </p>
            <div
              style={{ display: "flex", gap: "1rem", justifyContent: "center" }}
            >
              <Link to="/register" className="btn-secondary">
                Register Again
              </Link>
              <Link to="/login" className="btn-primary">
                Go to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
