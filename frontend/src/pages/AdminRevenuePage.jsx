import { useAdminDashboard } from "../layouts/AdminLayout";
import { formatCurrency } from "../utils/formatters";

export const AdminRevenuePage = () => {
  const { dashboard } = useAdminDashboard();

  const paidOrders = dashboard.orders.filter((order) => order.payment_status === "paid");
  const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.total_price), 0);
  const averageOrderValue = paidOrders.length ? totalRevenue / paidOrders.length : 0;
  const statusBuckets = [
    { label: "Đã thanh toán", value: paidOrders.length },
    {
      label: "Chờ thanh toán",
      value: dashboard.orders.filter((order) => order.payment_status === "pending").length,
    },
    {
      label: "Thất bại",
      value: dashboard.orders.filter((order) => order.payment_status === "failed").length,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[28px] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">Doanh thu</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#0f2744]">{formatCurrency(totalRevenue)}</h2>
          <p className="mt-2 text-sm text-slate-500">Chỉ tính từ các đơn đã thanh toán</p>
        </article>
        <article className="rounded-[28px] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">Giá trị đơn trung bình</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#0f2744]">{formatCurrency(averageOrderValue)}</h2>
          <p className="mt-2 text-sm text-slate-500">Dựa trên các đơn đã thanh toán</p>
        </article>
        <article className="rounded-[28px] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">Đơn đã thanh toán</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#0f2744]">{paidOrders.length}</h2>
          <p className="mt-2 text-sm text-slate-500">Những đơn đang đóng góp doanh thu</p>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr,0.9fr]">
        <div className="rounded-[30px] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">Cơ cấu doanh thu</p>
          <h2 className="mt-2 font-display text-3xl text-[#0f2744]">Bức tranh sức khỏe thanh toán</h2>
          <div className="mt-6 space-y-4">
            {statusBuckets.map((bucket) => (
              <div key={bucket.label}>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>{bucket.label}</span>
                  <span>{bucket.value}</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#e6f0fa]">
                  <div
                    className="h-full rounded-full bg-[#0f4c81]"
                    style={{
                      width: `${dashboard.orders.length ? (bucket.value / dashboard.orders.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">Thu gần đây</p>
          <h2 className="mt-2 font-display text-3xl text-[#0f2744]">Các đơn vừa thanh toán</h2>
          <div className="mt-5 space-y-3">
            {paidOrders.slice(0, 6).map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-2xl border border-[#d9e8f7] px-4 py-3">
                <div>
                  <p className="font-semibold text-[#0f2744]">Đơn hàng #{order.id}</p>
                  <p className="text-sm text-slate-500">{order.customer_name}</p>
                </div>
                <p className="font-semibold text-[#0f4c81]">{formatCurrency(order.total_price)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
