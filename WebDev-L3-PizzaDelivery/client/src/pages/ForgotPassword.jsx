import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, Send } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setSubmitted(true);
      if (res.data.devResetToken) {
        setDevToken(res.data.devResetToken);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to request password reset. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

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
        style={{ width: "100%", maxWidth: "440px", padding: "2.5rem" }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "0.4rem" }}>
            Reset Password
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Enter your account email to receive a password reset link
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              padding: "0.8rem 1rem",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.88rem",
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.2rem auto",
              }}
            >
              <CheckCircle2 size={36} color="var(--accent-green)" />
            </div>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "0.6rem" }}>
              Reset Link Sent
            </h3>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.9rem",
                lineHeight: "1.6",
                marginBottom: "1.5rem",
              }}
            >
              If an account with <strong>{email}</strong> exists, an email has
              been sent with instructions to reset your password.
            </p>

            {devToken && (
              <div
                style={{
                  background: "rgba(245, 158, 11, 0.1)",
                  border: "1px dashed rgba(245, 158, 11, 0.4)",
                  padding: "1rem",
                  borderRadius: "8px",
                  marginBottom: "1.5rem",
                  fontSize: "0.82rem",
                  textAlign: "left",
                }}
              >
                <strong
                  style={{
                    color: "var(--accent-amber)",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Quick Test Mode (Simulated SMTP):
                </strong>
                <Link
                  to={`/reset-password?token=${devToken}`}
                  style={{
                    color: "var(--accent-orange)",
                    textDecoration: "underline",
                    wordBreak: "break-all",
                  }}
                >
                  Click here to directly reset password in test mode
                </Link>
              </div>
            )}

            <Link
              to="/login"
              className="btn-secondary"
              style={{ display: "inline-flex", padding: "0.75rem 1.6rem" }}
            >
              <ArrowLeft size={16} /> Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Account Email</label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                  placeholder="name@example.com"
                  style={{ paddingLeft: "2.5rem" }}
                />
                <Mail
                  size={18}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-dim)",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: "100%", marginTop: "1rem", padding: "0.85rem" }}
            >
              {loading ? (
                "Sending link..."
              ) : (
                <>
                  Send Reset Instructions <Send size={16} />
                </>
              )}
            </button>

            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <Link
                to="/login"
                style={{
                  fontSize: "0.88rem",
                  color: "var(--text-muted)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
