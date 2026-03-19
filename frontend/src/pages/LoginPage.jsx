import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthShell } from "../components/AuthShell";
import { ErrorMessage } from "../components/ErrorMessage";
import { useAuth } from "../context/AuthContext";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();

    try {
      await login(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  return (
    <AuthShell
      eyebrow="Chào mừng trở lại"
      title="Đăng nhập"
      footerText="Chưa có tài khoản?"
      footerLink="/register"
      footerLabel="Đăng ký ngay"
    >
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-full border border-mist px-5 py-3"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          className="w-full rounded-full border border-mist px-5 py-3"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
        />
        {error && <ErrorMessage message={error} />}
        <button type="submit" disabled={loading} className="w-full rounded-full bg-ink px-5 py-3 text-white">
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </AuthShell>
  );
};
