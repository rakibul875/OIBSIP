import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Pizza,
  User,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const data = await register(name, email, password);
      setSuccessInfo(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container"
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
      }}
    >
      <div
        className="glass-panel"
        style={{ width: "100%", maxWidth: "480px", padding: "2.5rem" }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: "54px",
              height: "54px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #ff5e28, #ea580c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem auto",
              boxShadow: "0 4px 15px rgba(255, 94, 40, 0.4)",
            }}
          >
            <Pizza size={28} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "0.3rem" }}>
            Create Account
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Join SliceCraft to unlock artisan pizza orders
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

        {successInfo ? (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem auto",
              }}
            >
              <CheckCircle2 size={36} color="var(--accent-green)" />
            </div>
            <h3 style={{ fontSize: "1.4rem", marginBottom: "0.8rem" }}>
              Check Your Email
            </h3>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.92rem",
                lineHeight: "1.6",
                marginBottom: "1.5rem",
              }}
            >
              We've dispatched a secure verification link to{" "}
              <strong>{email}</strong>. Please check your inbox or spam folder
              to activate your account.
            </p>

            {successInfo.devVerificationToken && (
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
                  to={`/verify-email?token=${successInfo.devVerificationToken}`}
                  style={{
                    color: "var(--accent-orange)",
                    textDecoration: "underline",
                    wordBreak: "break-all",
                  }}
                >
                  Click here to instantly verify email in test mode
                </Link>
              </div>
            )}

            <Link
              to="/login"
              className="btn-primary"
              style={{ display: "inline-flex", padding: "0.8rem 1.8rem" }}
            >
              Proceed to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="form-input"
                  placeholder="e.g. John Doe"
                  style={{ paddingLeft: "2.5rem" }}
                />
                <User
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

            <div className="form-group">
              <label className="form-label">Email Address</label>
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

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                  placeholder="At least 6 characters"
                  style={{ paddingLeft: "2.5rem" }}
                />
                <Lock
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

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="form-input"
                  placeholder="Re-enter password"
                  style={{ paddingLeft: "2.5rem" }}
                />
                <Lock
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
                "Registering Account..."
              ) : (
                <>
                  Create Account <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {!successInfo && (
          <div
            style={{
              textAlign: "center",
              marginTop: "1.8rem",
              fontSize: "0.88rem",
              color: "var(--text-muted)",
            }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{ color: "var(--accent-orange)", fontWeight: 600 }}
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
