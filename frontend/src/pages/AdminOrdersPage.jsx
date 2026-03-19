import { api } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import { useAdminDashboard } from "../layouts/AdminLayout";
import { formatCurrency } from "../utils/formatters";

export const AdminOrdersPage = () => {
  const { dashboard, reloadDashboard } = useAdminDashboard();

  const updateOrderStatus = async (id, status) => {
    await api.patch(`/orders/${id}/status`, { status });
    await reloadDashboard();
  };

  return (
    <section className="rounded-[30px] bg-white p-6 shadow-card">
      <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">Kiểm soát xử lý đơn</p>
      <h2 className="mt-2 font-display text-3xl text-[#0f2744]">Đơn hàng</h2>
      <div className="mt-5 space-y-4">
        {dashboard.orders.map((order) => (
          <div key={order.id} className="rounded-2xl border border-[#d9e8f7] p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-[#0f2744]">Đơn hàng #{order.id}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {order.customer_name} • {order.customer_email}
                </p>
                <div className="mt-3 flex gap-2">
                  <StatusBadge label={order.payment_status} />
                  <StatusBadge label={order.status} />
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#0f4c81]">{formatCurrency(order.total_price)}</p>
                <select
                  value={order.status}
                  onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                  className="mt-3 rounded-full border border-[#d9e8f7] px-4 py-2 text-sm"
                >
                  <option value="awaiting_payment">Chờ thanh toán</option>
                  <option value="payment_failed">Thanh toán lỗi</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="shipped">Đang giao</option>
                  <option value="completed">Hoàn tất</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
