import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthShell } from "../components/AuthShell";
import { ErrorMessage } from "../components/ErrorMessage";
import { useAuth } from "../context/AuthContext";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();

    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <AuthShell
      eyebrow="Start shopping"
      title="Create account"
      footerText="Already have an account?"
      footerLink="/login"
      footerLabel="Login"
    >
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Full name"
          className="w-full rounded-full border border-mist px-5 py-3"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-full border border-mist px-5 py-3"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-full border border-mist px-5 py-3"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
        />
        {error && <ErrorMessage message={error} />}
        <button type="submit" disabled={loading} className="w-full rounded-full bg-ink px-5 py-3 text-white">
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
    </AuthShell>
  );
};
