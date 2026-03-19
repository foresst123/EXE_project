import { Link } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import { useAdminDashboard } from "../layouts/AdminLayout";
import { formatCurrency, formatShortDate } from "../utils/formatters";

export const AdminOverviewPage = () => {
  const { dashboard } = useAdminDashboard();

  const paidOrders = dashboard.orders.filter((order) => order.payment_status === "paid");
  const paidRevenue = paidOrders.reduce((sum, order) => sum + Number(order.total_price), 0);
  const awaitingPayment = dashboard.orders.filter(
    (order) => order.payment_status === "pending" || order.payment_status === "awaiting_payment",
  ).length;
  const totalUnitsSold = dashboard.products.reduce(
    (sum, product) => sum + Number(product.sold_count || 0),
    0,
  );
  const averageOrderValue = paidOrders.length ? paidRevenue / paidOrders.length : 0;
  const lowStockProducts = dashboard.products.filter((product) => Number(product.stock) <= 5).length;
  const activeFulfillment = dashboard.orders.filter((order) =>
    ["processing", "shipped"].includes(order.status),
  ).length;
  const topProducts = [...dashboard.products]
    .sort((first, second) => Number(second.sold_count || 0) - Number(first.sold_count || 0))
    .slice(0, 4);
  const latestOrders = [...dashboard.orders].slice(0, 5);
  const topCategories = Object.values(
    dashboard.products.reduce((acc, product) => {
      const key = product.category_name || "Chưa phân loại";
      if (!acc[key]) {
        acc[key] = { name: key, units: 0 };
      }
      acc[key].units += Number(product.sold_count || 0);
      return acc;
    }, {}),
  )
    .sort((first, second) => second.units - first.units)
    .slice(0, 4);

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.18fr,0.82fr]">
        <article className="overflow-hidden rounded-[34px] bg-[linear-gradient(135deg,_#0f4c81_0%,_#113963_52%,_#0d2945_100%)] p-8 text-white shadow-float">
          <p className="text-sm uppercase tracking-[0.24em] text-white/55">Toàn cảnh vận hành</p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-5xl">{formatCurrency(paidRevenue)}</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/70">
                Doanh thu được xác nhận qua Stripe webhook, đồng thời kết nối trạng thái đơn hàng, khách hàng và danh mục ngay trên một bảng điều khiển.
              </p>
            </div>
            <Link
              to="/admin/revenue"
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0f4c81]"
            >
              Mở trang doanh thu
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/12 bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">Đơn đã thanh toán</p>
              <p className="mt-3 text-3xl font-semibold">{paidOrders.length}</p>
            </div>
            <div className="rounded-[24px] border border-white/12 bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">Giá trị đơn TB</p>
              <p className="mt-3 text-3xl font-semibold">{formatCurrency(averageOrderValue)}</p>
            </div>
            <div className="rounded-[24px] border border-white/12 bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">Đang xử lý</p>
              <p className="mt-3 text-3xl font-semibold">{activeFulfillment}</p>
            </div>
          </div>
        </article>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <article className="rounded-[28px] bg-white p-6 shadow-card">
            <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">Chờ thanh toán</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#0f2744]">{awaitingPayment}</h2>
            <p className="mt-2 text-sm text-slate-500">Các đơn hàng vẫn đang chờ xác nhận thanh toán.</p>
          </article>
          <article className="rounded-[28px] bg-white p-6 shadow-card">
            <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">Nguy cơ hết hàng</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#0f2744]">{lowStockProducts}</h2>
            <p className="mt-2 text-sm text-slate-500">Sản phẩm còn 5 đơn vị hoặc ít hơn.</p>
          </article>
          <article className="rounded-[28px] bg-white p-6 shadow-card">
            <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">Quy mô hệ thống</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#0f2744]">{dashboard.products.length}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {totalUnitsSold} sản phẩm đã bán trên {dashboard.categories.length} danh mục và {dashboard.authors.length} nhà thiết kế.
            </p>
          </article>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <div className="rounded-[30px] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">Đơn hàng gần đây</p>
              <h2 className="mt-2 font-display text-3xl text-[#0f2744]">Hoạt động mới nhất</h2>
            </div>
            <Link
              to="/admin/orders"
              className="rounded-full border border-[#d9e8f7] px-4 py-2 text-sm font-semibold text-[#0f4c81]"
            >
              Quản lý đơn hàng
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {latestOrders.map((order) => (
              <div key={order.id} className="rounded-[24px] border border-[#d9e8f7] px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#0f2744]">Đơn hàng #{order.id}</p>
                    <p className="mt-1 text-sm text-slate-500">{order.customer_name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                      {formatShortDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#0f4c81]">{formatCurrency(order.total_price)}</p>
                    <div className="mt-2 flex flex-wrap justify-end gap-2">
                      <StatusBadge label={order.payment_status} />
                      <StatusBadge label={order.status} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[30px] bg-white p-6 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">Bán chạy</p>
                <h2 className="mt-2 font-display text-3xl text-[#0f2744]">Sản phẩm nổi bật</h2>
              </div>
              <Link
                to="/admin/products"
                className="rounded-full border border-[#d9e8f7] px-4 py-2 text-sm font-semibold text-[#0f4c81]"
            >
                Mở danh sách sản phẩm
              </Link>
            </div>

            <div className="mt-5 space-y-4">
              {topProducts.map((product) => (
                <div key={product.id} className="rounded-2xl border border-[#d9e8f7] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#0f2744]">{product.name}</p>
                      <p className="text-sm text-slate-500">
                        Tồn kho {product.stock}
                        {product.author_name ? ` • ${product.author_name}` : ""}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#edf5fd] px-3 py-1 text-sm font-semibold text-[#0f4c81]">
                      Đã bán {product.sold_count || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] bg-white p-6 shadow-card">
            <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">Nhu cầu theo danh mục</p>
            <h2 className="mt-2 font-display text-3xl text-[#0f2744]">Doanh số tập trung ở đâu</h2>
            <div className="mt-5 space-y-4">
              {topCategories.map((category) => (
                <div key={category.name}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-[#0f2744]">{category.name}</span>
                    <span className="text-slate-500">{category.units} sản phẩm</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[#eef5fb]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,_#61a8ea_0%,_#0f4c81_100%)]"
                      style={{
                        width: `${Math.max(
                          18,
                          (category.units / Math.max(topCategories[0]?.units || 1, 1)) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
