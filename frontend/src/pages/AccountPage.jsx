import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { useAuth } from "../context/AuthContext";
import { formatShortDate } from "../utils/formatters";

const formatDate = (value) => {
  if (!value) {
    return "Chưa cập nhật";
  }

  return formatShortDate(value);
};

const methodOptions = [
  {
    value: "email",
    title: "Xác minh qua email",
    description: "Nhận thông báo xác minh và đăng nhập thông qua hộp thư.",
  },
  {
    value: "authenticator",
    title: "Ứng dụng xác thực",
    description: "Sử dụng mã thời gian từ ứng dụng xác thực bạn tin dùng.",
  },
  {
    value: "backup_codes",
    title: "Mã dự phòng",
    description: "Giữ sẵn mã khôi phục để đăng nhập trên thiết bị tin cậy.",
  },
];

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
    <path d="M19 12H5m0 0 5.5-5.5M5 12l5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const AccountPage = () => {
  const { user, syncUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [savingSection, setSavingSection] = useState("");
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    location: "",
    bio: "",
    avatar_url: "",
  });
  const [emailForm, setEmailForm] = useState({
    email: "",
    current_password: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [authMethod, setAuthMethod] = useState("email");

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const currentUser = await refreshUser();

        if (currentUser) {
          setProfileForm({
            name: currentUser.name || "",
            phone: currentUser.phone || "",
            location: currentUser.location || "",
            bio: currentUser.bio || "",
            avatar_url: currentUser.avatar_url || "",
          });
          setEmailForm((prev) => ({
            ...prev,
            email: currentUser.email || "",
          }));
          setAuthMethod(currentUser.preferred_auth_method || "email");
        }
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Không thể tải thông tin tài khoản");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [refreshUser]);

  const account = useMemo(
    () => ({
      ...user,
      name: profileForm.name || user?.name,
      email: emailForm.email || user?.email,
      avatar_url: profileForm.avatar_url || user?.avatar_url,
      preferred_auth_method: authMethod,
    }),
    [authMethod, emailForm.email, profileForm.avatar_url, profileForm.name, user],
  );

  const withNotice = (message, nextUser) => {
    if (nextUser) {
      syncUser(nextUser);
    }
    setNotice(message);
    setError("");
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSavingSection("profile");

    try {
      const { data } = await api.patch("/users/me/profile", profileForm);
      withNotice("Đã cập nhật thông tin cá nhân.", data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Không thể cập nhật hồ sơ");
    } finally {
      setSavingSection("");
    }
  };

  const saveEmail = async (event) => {
    event.preventDefault();
    setSavingSection("email");

    try {
      const { data } = await api.patch("/users/me/email", emailForm);
      withNotice("Đã cập nhật email. Vui lòng kiểm tra hộp thư để xác minh địa chỉ mới.", data);
      setEmailForm((prev) => ({ ...prev, current_password: "" }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Không thể cập nhật email");
    } finally {
      setSavingSection("");
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setSavingSection("password");

    try {
      const { data } = await api.patch("/users/me/password", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      withNotice("Đổi mật khẩu thành công.", data);
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Không thể đổi mật khẩu");
    } finally {
      setSavingSection("");
    }
  };

  const saveSecurityMethod = async (nextMethod) => {
    const previousMethod = authMethod;
    setAuthMethod(nextMethod);
    setSavingSection("security");

    try {
      const { data } = await api.patch("/users/me/security", {
        preferred_auth_method: nextMethod,
      });
      withNotice("Đã cập nhật phương thức xác minh.", data);
    } catch (requestError) {
      setAuthMethod(previousMethod || "email");
      setError(requestError.response?.data?.message || "Không thể cập nhật phương thức xác minh");
    } finally {
      setSavingSection("");
    }
  };

  const sendVerification = async () => {
    setSavingSection("verification");

    try {
      const { data } = await api.post("/users/me/email-verification");
      withNotice(data.message, data.user);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Không thể gửi email xác minh");
    } finally {
      setSavingSection("");
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Đang tải tài khoản của bạn...</div>;
  }

  return (
    <section className="space-y-8">
      <header className="border-b border-[#eadfd3] pb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="grid h-11 w-11 place-items-center rounded-2xl bg-[linear-gradient(135deg,_#541c4a_0%,_#101933_100%)] text-[0.78rem] font-bold text-white shadow-lg"
            >
              ART
            </Link>
            <Link to="/" className="font-display text-[2rem] font-semibold tracking-tight text-ink">
              Artdict
            </Link>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#e6d8ca] bg-[#fffaf5] px-4 py-2.5 text-sm font-semibold text-[#342923] transition hover:border-[#d14d1f] hover:text-[#d14d1f]"
          >
            <ArrowLeftIcon />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-5 rounded-[32px] border border-[#eadfd3] bg-[#fffaf6] p-6 shadow-[0_18px_50px_rgba(29,23,18,0.08)]">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-full bg-[#efe6dc]">
              {account.avatar_url ? (
                <img src={account.avatar_url} alt={account.name} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-tide">Tài khoản của tôi</p>
              <h1 className="mt-2 font-display text-[2.2rem] text-ink">{account.name}</h1>
              <p className="mt-1 text-sm text-slate-500">{account.email}</p>
            </div>
          </div>

          <div className="grid gap-3 rounded-[24px] bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Trạng thái email</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${account.email_verified ? "bg-[#e8f6ef] text-[#227a52]" : "bg-[#fff1e8] text-[#d14d1f]"}`}>
                {account.email_verified ? "Đã xác minh" : "Chờ xác minh"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Phương thức xác minh</span>
              <span className="text-sm font-semibold text-ink">
                {methodOptions.find((item) => item.value === account.preferred_auth_method)?.title || "Xác minh qua email"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Tham gia từ</span>
              <span className="text-sm font-semibold text-ink">{formatDate(account.created_at)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Cập nhật mật khẩu</span>
              <span className="text-sm font-semibold text-ink">{formatDate(account.password_changed_at)}</span>
            </div>
          </div>

          <div className="rounded-[24px] bg-[#121c2e] p-5 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/60">Ghi chú bảo mật</p>
            <p className="mt-3 text-sm leading-7 text-white/85">
              Hãy giữ email liên hệ luôn hoạt động. Các yêu cầu xác minh và thông báo quan trọng sẽ được gửi tới đó trước tiên.
            </p>
          </div>
        </aside>

        <div className="space-y-6">
          {notice ? (
            <div className="rounded-[24px] border border-[#cfe7d9] bg-[#f2faf5] px-5 py-4 text-sm font-medium text-[#26714d]">
              {notice}
            </div>
          ) : null}
          {error ? <ErrorMessage message={error} /> : null}

          <section className="rounded-[32px] border border-[#eadfd3] bg-white p-6 shadow-[0_18px_50px_rgba(29,23,18,0.06)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-tide">Hồ sơ</p>
                <h2 className="mt-2 text-[1.85rem] font-semibold text-ink md:text-[2rem]">Thông tin cá nhân</h2>
              </div>
            </div>

            <form onSubmit={saveProfile} className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-600">Họ và tên</span>
                <input
                  className="w-full rounded-[18px] border border-[#e5d8cb] px-4 py-3 outline-none transition focus:border-[#d14d1f]"
                  value={profileForm.name}
                  onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-600">Số điện thoại</span>
                <input
                  className="w-full rounded-[18px] border border-[#e5d8cb] px-4 py-3 outline-none transition focus:border-[#d14d1f]"
                  value={profileForm.phone}
                  onChange={(event) => setProfileForm((prev) => ({ ...prev, phone: event.target.value }))}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-600">Địa điểm</span>
                <input
                  className="w-full rounded-[18px] border border-[#e5d8cb] px-4 py-3 outline-none transition focus:border-[#d14d1f]"
                  value={profileForm.location}
                  onChange={(event) => setProfileForm((prev) => ({ ...prev, location: event.target.value }))}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-600">Liên kết ảnh đại diện</span>
                <input
                  className="w-full rounded-[18px] border border-[#e5d8cb] px-4 py-3 outline-none transition focus:border-[#d14d1f]"
                  value={profileForm.avatar_url}
                  onChange={(event) => setProfileForm((prev) => ({ ...prev, avatar_url: event.target.value }))}
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-600">Giới thiệu ngắn</span>
                <textarea
                  rows={4}
                  className="w-full rounded-[18px] border border-[#e5d8cb] px-4 py-3 outline-none transition focus:border-[#d14d1f]"
                  value={profileForm.bio}
                  onChange={(event) => setProfileForm((prev) => ({ ...prev, bio: event.target.value }))}
                />
              </label>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={savingSection === "profile"}
                  className="rounded-full bg-clay px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {savingSection === "profile" ? "Đang lưu..." : "Lưu hồ sơ"}
                </button>
              </div>
            </form>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-[32px] border border-[#eadfd3] bg-white p-6 shadow-[0_18px_50px_rgba(29,23,18,0.06)]">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-tide">Email</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Đổi email liên hệ</h2>
              <form onSubmit={saveEmail} className="mt-6 space-y-4">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-600">Địa chỉ email</span>
                  <input
                    type="email"
                    className="w-full rounded-[18px] border border-[#e5d8cb] px-4 py-3 outline-none transition focus:border-[#d14d1f]"
                    value={emailForm.email}
                    onChange={(event) => setEmailForm((prev) => ({ ...prev, email: event.target.value }))}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-600">Mật khẩu hiện tại</span>
                  <input
                    type="password"
                    className="w-full rounded-[18px] border border-[#e5d8cb] px-4 py-3 outline-none transition focus:border-[#d14d1f]"
                    value={emailForm.current_password}
                    onChange={(event) => setEmailForm((prev) => ({ ...prev, current_password: event.target.value }))}
                  />
                </label>
                <button
                  type="submit"
                  disabled={savingSection === "email"}
                  className="rounded-full bg-[#1b2940] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {savingSection === "email" ? "Đang cập nhật..." : "Cập nhật email"}
                </button>
              </form>
            </div>

            <div className="rounded-[32px] border border-[#eadfd3] bg-white p-6 shadow-[0_18px_50px_rgba(29,23,18,0.06)]">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-tide">Mật khẩu</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Đổi mật khẩu</h2>
              <form onSubmit={savePassword} className="mt-6 space-y-4">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-600">Mật khẩu hiện tại</span>
                  <input
                    type="password"
                    className="w-full rounded-[18px] border border-[#e5d8cb] px-4 py-3 outline-none transition focus:border-[#d14d1f]"
                    value={passwordForm.current_password}
                    onChange={(event) => setPasswordForm((prev) => ({ ...prev, current_password: event.target.value }))}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-600">Mật khẩu mới</span>
                  <input
                    type="password"
                    className="w-full rounded-[18px] border border-[#e5d8cb] px-4 py-3 outline-none transition focus:border-[#d14d1f]"
                    value={passwordForm.new_password}
                    onChange={(event) => setPasswordForm((prev) => ({ ...prev, new_password: event.target.value }))}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-600">Xác nhận mật khẩu mới</span>
                  <input
                    type="password"
                    className="w-full rounded-[18px] border border-[#e5d8cb] px-4 py-3 outline-none transition focus:border-[#d14d1f]"
                    value={passwordForm.confirm_password}
                    onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirm_password: event.target.value }))}
                  />
                </label>
                <button
                  type="submit"
                  disabled={savingSection === "password"}
                  className="rounded-full bg-[#1b2940] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {savingSection === "password" ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                </button>
              </form>
            </div>
          </section>

          <section className="rounded-[32px] border border-[#eadfd3] bg-white p-6 shadow-[0_18px_50px_rgba(29,23,18,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-tide">Xác minh</p>
            <h2 className="mt-2 text-[1.85rem] font-semibold text-ink md:text-[2rem]">Bảo mật email và đăng nhập</h2>
            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
              <div className="space-y-4">
                <div className="rounded-[24px] bg-[#fbf7f2] p-5">
                  <p className="text-sm font-semibold text-slate-500">Email xác minh</p>
                  <p className="mt-2 text-base leading-7 text-slate-600">
                    {account.email_verified
                      ? "Tài khoản này đã được xác minh."
                      : "Bạn có thể gửi lại email xác minh bất cứ lúc nào sau khi cập nhật địa chỉ hoặc muốn xác nhận quyền sở hữu tài khoản."}
                  </p>
                  <p className="mt-3 text-sm text-slate-500">
                    Gửi gần nhất: {formatDate(account.verification_email_sent_at)}
                  </p>
                  <button
                    type="button"
                    onClick={sendVerification}
                    disabled={savingSection === "verification"}
                    className="mt-5 rounded-full border border-[#d14d1f] px-5 py-2.5 text-sm font-semibold text-[#d14d1f] disabled:opacity-60"
                  >
                    {savingSection === "verification" ? "Đang gửi..." : "Gửi email xác minh"}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {methodOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => saveSecurityMethod(option.value)}
                    className={`block w-full rounded-[24px] border px-5 py-4 text-left transition ${
                      authMethod === option.value
                        ? "border-[#d14d1f] bg-[#fff2ea]"
                        : "border-[#eadfd3] bg-white hover:border-[#d14d1f]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-ink">{option.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">{option.description}</p>
                      </div>
                      <span className={`h-3.5 w-3.5 rounded-full ${authMethod === option.value ? "bg-[#d14d1f]" : "bg-[#d9cfc3]"}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
};
