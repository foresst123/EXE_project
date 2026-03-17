import { useAdminDashboard } from "../layouts/AdminLayout";

export const AdminRevenuePage = () => {
  const { dashboard } = useAdminDashboard();

  const paidOrders = dashboard.orders.filter((order) => order.payment_status === "paid");
  const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.total_price), 0);
  const averageOrderValue = paidOrders.length ? totalRevenue / paidOrders.length : 0;
  const statusBuckets = [
    { label: "Paid", value: paidOrders.length },
    {
      label: "Pending",
      value: dashboard.orders.filter((order) => order.payment_status === "pending").length,
    },
    {
      label: "Failed",
      value: dashboard.orders.filter((order) => order.payment_status === "failed").length,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[28px] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">Revenue</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#0f2744]">${totalRevenue.toFixed(2)}</h2>
          <p className="mt-2 text-sm text-slate-500">Confirmed from paid orders only</p>
        </article>
        <article className="rounded-[28px] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">Average order value</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#0f2744]">${averageOrderValue.toFixed(2)}</h2>
          <p className="mt-2 text-sm text-slate-500">Based on paid orders</p>
        </article>
        <article className="rounded-[28px] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">Paid orders</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#0f2744]">{paidOrders.length}</h2>
          <p className="mt-2 text-sm text-slate-500">Revenue-contributing orders</p>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr,0.9fr]">
        <div className="rounded-[30px] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">Revenue breakdown</p>
          <h2 className="mt-2 font-display text-3xl text-[#0f2744]">Payment health snapshot</h2>
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
          <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">Recent payouts</p>
          <h2 className="mt-2 font-display text-3xl text-[#0f2744]">Latest paid orders</h2>
          <div className="mt-5 space-y-3">
            {paidOrders.slice(0, 6).map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-2xl border border-[#d9e8f7] px-4 py-3">
                <div>
                  <p className="font-semibold text-[#0f2744]">Order #{order.id}</p>
                  <p className="text-sm text-slate-500">{order.customer_name}</p>
                </div>
                <p className="font-semibold text-[#0f4c81]">${Number(order.total_price).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

