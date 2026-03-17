import { api } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import { useAdminDashboard } from "../layouts/AdminLayout";

export const AdminOrdersPage = () => {
  const { dashboard, reloadDashboard } = useAdminDashboard();

  const updateOrderStatus = async (id, status) => {
    await api.patch(`/orders/${id}/status`, { status });
    await reloadDashboard();
  };

  return (
    <section className="rounded-[30px] bg-white p-6 shadow-card">
      <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">Fulfillment control</p>
      <h2 className="mt-2 font-display text-3xl text-[#0f2744]">Orders</h2>
      <div className="mt-5 space-y-4">
        {dashboard.orders.map((order) => (
          <div key={order.id} className="rounded-2xl border border-[#d9e8f7] p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-[#0f2744]">Order #{order.id}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {order.customer_name} • {order.customer_email}
                </p>
                <div className="mt-3 flex gap-2">
                  <StatusBadge label={order.payment_status} />
                  <StatusBadge label={order.status} />
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#0f4c81]">${Number(order.total_price).toFixed(2)}</p>
                <select
                  value={order.status}
                  onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                  className="mt-3 rounded-full border border-[#d9e8f7] px-4 py-2 text-sm"
                >
                  <option value="awaiting_payment">awaiting payment</option>
                  <option value="payment_failed">payment failed</option>
                  <option value="processing">processing</option>
                  <option value="shipped">shipped</option>
                  <option value="completed">completed</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

