import { NavLink, Outlet, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { Loader } from "../components/Loader";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/admin", label: "Tổng quan", end: true },
  { to: "/admin/products", label: "Sản phẩm" },
  { to: "/admin/artists", label: "Nhà thiết kế" },
  { to: "/admin/events", label: "Sự kiện" },
  { to: "/admin/orders", label: "Đơn hàng" },
  { to: "/admin/users", label: "Người dùng" },
  { to: "/admin/revenue", label: "Doanh thu" },
];

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState({
    products: [],
    categories: [],
    authors: [],
    events: [],
    orders: [],
    users: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [productRes, eventRes, orderRes, userRes] = await Promise.all([
        api.get("/products", { params: { page: 1, limit: 50 } }),
        api.get("/events/admin/list"),
        api.get("/orders"),
        api.get("/users"),
      ]);

      setDashboard({
        products: productRes.data.items,
        categories: productRes.data.categories,
        authors: productRes.data.authors,
        events: eventRes.data,
        orders: orderRes.data,
        users: userRes.data,
      });
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Không thể tải bảng điều khiển quản trị");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadDashboard();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef5fb] p-6 text-[#0f2744]">
        <Loader label="Đang tải khu vực quản trị..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,124,215,0.16),_transparent_24%),linear-gradient(180deg,_#eef6ff_0%,_#f8fbff_42%,_#f2f7fd_100%)] text-[#0f2744]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 p-6 lg:grid-cols-[290px,1fr]">
        <aside className="rounded-[36px] bg-[linear-gradient(180deg,_#0f4c81_0%,_#0c3d67_100%)] p-6 text-white shadow-float">
          <p className="text-sm uppercase tracking-[0.28em] text-white/55">Vận hành Artdict</p>
          <h1 className="mt-3 font-display text-4xl">Quản trị Artdict</h1>
          <p className="mt-4 text-sm text-white/75">
            Quản lý danh mục, nhà thiết kế, người dùng và đơn hàng từ một không gian vận hành thống nhất.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">Đơn hàng</p>
              <p className="mt-2 text-2xl font-extrabold">{dashboard.orders.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">Người dùng</p>
              <p className="mt-2 text-2xl font-extrabold">{dashboard.users.length}</p>
            </div>
          </div>
          <div className="mt-8 space-y-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-white text-[#0f4c81]"
                      : "bg-white/10 text-white/85 hover:bg-white/16"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="mt-8 rounded-[24px] border border-white/15 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/55">Tác vụ nhanh</p>
            <NavLink
              to="/"
              className="mt-3 block rounded-full bg-white px-4 py-3 text-center text-sm font-semibold text-[#0f4c81]"
            >
              Mở giao diện người dùng
            </NavLink>
            <button
              type="button"
              onClick={logout}
              className="mt-3 w-full rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-white"
            >
              Đăng xuất
            </button>
          </div>
        </aside>

        <main className="space-y-6">
          <header className="rounded-[34px] border border-[#cfe3f6] bg-white/92 px-6 py-5 shadow-card">
            <p className="text-sm uppercase tracking-[0.24em] text-[#4d7aa7]">Chế độ quản trị</p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-4xl text-[#0f2744]">Chào mừng trở lại, {user?.name}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Khu vực này được tối ưu cho vận hành, báo cáo và kiểm soát dữ liệu Artdict.
                </p>
              </div>
              <div className="rounded-full border border-[#d9e8f7] bg-[#f3f8fe] px-4 py-2 text-sm font-semibold text-[#0f4c81]">
                Bảng điều khiển nội bộ
              </div>
            </div>
          </header>

          {error && <ErrorMessage message={error} />}

          <Outlet context={{ dashboard, reloadDashboard: loadDashboard }} />
        </main>
      </div>
    </div>
  );
};

export const useAdminDashboard = () => useOutletContext();
