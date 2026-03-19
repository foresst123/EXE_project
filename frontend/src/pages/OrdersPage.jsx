import { useEffect, useState } from "react";
import { api } from "../api/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { Loader } from "../components/Loader";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatDateTime } from "../utils/formatters";

export const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data } = await api.get("/orders");
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || "Không thể tải danh sách đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (!user) {
    return <ErrorMessage message="Vui lòng đăng nhập để xem đơn hàng" />;
  }

  if (loading) {
    return <Loader label="Đang tải đơn hàng..." />;
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-moss">Đơn hàng</p>
        <h1 className="mt-3 font-display text-4xl">
          {user.role === "admin" ? "Quản lý đơn hàng khách hàng" : "Lịch sử đơn hàng của bạn"}
        </h1>
      </div>
      {error && <ErrorMessage message={error} />}
      {orders.map((order) => (
        <article key={order.id} className="rounded-[28px] bg-white p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Đơn hàng #{order.id}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusBadge label={order.payment_status} />
                <StatusBadge label={order.status} />
              </div>
              <p className="mt-2 text-sm text-slate-500">{formatDateTime(order.created_at)}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-clay">{formatCurrency(order.total_price)}</p>
              {user.role === "admin" && (
                <p className="text-sm text-slate-500">{order.customer_name} ({order.customer_email})</p>
              )}
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {order.items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-mist px-4 py-3 text-sm text-slate-600">
                {item.name} x {item.quantity} - {formatCurrency(item.price)}
              </div>
            ))}
          </div>
        </article>
      ))}
      {!orders.length && <div className="rounded-[28px] bg-white p-6 text-slate-500 shadow-card">Chưa có đơn hàng nào.</div>}
    </section>
  );
};
