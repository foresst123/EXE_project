import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAdminDashboard } from "../layouts/AdminLayout";
import { formatCurrency } from "../utils/formatters";

const BackButton = ({ to, label }) => (
  <Link
    to={to}
    className="inline-flex items-center gap-2 rounded-full border border-[#d9e8f7] bg-white px-4 py-2.5 text-sm font-semibold text-[#0f4c81] transition hover:bg-[#f3f8fe]"
  >
    <span className="text-lg leading-none">‹</span>
    <span>{label}</span>
  </Link>
);

export const AdminUsersPage = () => {
  const { dashboard, reloadDashboard } = useAdminDashboard();
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [passwordDraft, setPasswordDraft] = useState("");

  const selectedUser = useMemo(
    () => dashboard.users.find((member) => String(member.id) === id) || null,
    [dashboard.users, id],
  );

  useEffect(() => {
    if (!id) {
      setSelectedUserDetail(null);
      return;
    }

    const loadUser = async () => {
      const { data } = await api.get(`/users/${id}`);
      setSelectedUserDetail(data);
    };

    loadUser();
  }, [id]);

  const updateUserRole = async (userId, role) => {
    await api.patch(`/users/${userId}/role`, { role });
    await reloadDashboard();
    if (id && String(userId) === id) {
      const { data } = await api.get(`/users/${userId}`);
      setSelectedUserDetail(data);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    if (!id || !passwordDraft) {
      return;
    }

    await api.patch(`/users/${id}/password`, { password: passwordDraft });
    setPasswordDraft("");
    const { data } = await api.get(`/users/${id}`);
    setSelectedUserDetail(data);
    await reloadDashboard();
  };

  if (selectedUser && selectedUserDetail) {
    return (
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BackButton to="/admin/users" label="Quay lại người dùng" />
          <select
            value={selectedUser.role}
            onChange={(event) => updateUserRole(selectedUser.id, event.target.value)}
            className="rounded-full border border-[#d9e8f7] px-4 py-2.5 text-sm font-semibold text-[#0f2744]"
          >
            <option value="customer">Khách hàng</option>
            <option value="admin">Quản trị viên</option>
          </select>
        </div>

        <div className="rounded-[30px] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">Chi tiết người dùng</p>
          <h2 className="mt-2 font-display text-3xl text-[#0f2744]">{selectedUser.name}</h2>
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-5">
              <div className="grid gap-3 rounded-2xl border border-[#d9e8f7] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Email</span>
                  <span className="text-sm font-semibold text-[#0f2744]">{selectedUserDetail.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Số điện thoại</span>
                  <span className="text-sm font-semibold text-[#0f2744]">{selectedUserDetail.phone || "Chưa cập nhật"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Địa điểm</span>
                  <span className="text-sm font-semibold text-[#0f2744]">{selectedUserDetail.location || "Chưa cập nhật"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Xác minh</span>
                  <span className="text-sm font-semibold text-[#0f2744]">
                    {selectedUserDetail.email_verified ? "Đã xác minh" : "Chờ xác minh"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Đơn hàng</span>
                  <span className="text-sm font-semibold text-[#0f2744]">{selectedUserDetail.order_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Tổng chi tiêu</span>
                  <span className="text-sm font-semibold text-[#0f2744]">
                    {formatCurrency(selectedUserDetail.total_spent || 0)}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-[#d9e8f7] p-4">
                <p className="text-sm font-semibold text-[#0f2744]">Giới thiệu người dùng</p>
                <p className="mt-2 text-sm leading-7 text-slate-500">{selectedUserDetail.bio || "Người dùng này chưa có phần giới thiệu."}</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-[#d9e8f7] p-4">
                <p className="text-sm font-semibold text-[#0f2744]">Điều khiển tài khoản</p>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  Hãy kiểm tra kỹ hồ sơ trước khi đổi quyền hoặc đặt lại mật khẩu để đảm bảo việc vận hành tài khoản luôn rõ ràng và an toàn.
                </p>
              </div>

              <form onSubmit={resetPassword} className="rounded-2xl border border-[#d9e8f7] p-4">
                <p className="text-sm font-semibold text-[#0f2744]">Đặt lại mật khẩu</p>
                <input
                  type="password"
                  placeholder="Mật khẩu mới"
                  value={passwordDraft}
                  onChange={(event) => setPasswordDraft(event.target.value)}
                  className="mt-3 w-full rounded-full border border-[#d9e8f7] px-4 py-3"
                />
                <button type="submit" className="mt-3 rounded-full bg-[#0f4c81] px-5 py-3 text-sm font-semibold text-white">
                  Lưu mật khẩu mới
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[30px] bg-white p-6 shadow-card">
        <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">Phân quyền truy cập</p>
        <h2 className="mt-2 font-display text-3xl text-[#0f2744]">Người dùng</h2>
        <div className="mt-5 space-y-3">
          {dashboard.users.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => navigate(`/admin/users/${member.id}`)}
              className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#d9e8f7] px-4 py-4 text-left transition hover:border-[#0f4c81] hover:bg-[#f7fbff]"
            >
              <div>
                <p className="font-semibold text-[#0f2744]">{member.name}</p>
                <p className="mt-1 text-sm text-slate-500">{member.email}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#4d7aa7]">
                  {member.role === "admin" ? "quản trị viên" : "khách hàng"}
                </p>
              </div>
              <span className="text-2xl text-[#7a99b8]">›</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
