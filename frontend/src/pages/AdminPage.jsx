import { useEffect, useState } from "react";
import { api } from "../api/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { Loader } from "../components/Loader";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category_id: "",
  image_url: "",
};

const sidebarItems = [
  { id: "overview", label: "Overview" },
  { id: "products", label: "Products" },
  { id: "orders", label: "Orders" },
  { id: "users", label: "Users" },
];

export const AdminPage = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState("overview");
  const [dashboard, setDashboard] = useState({ products: [], categories: [], orders: [], users: [] });
  const [productForm, setProductForm] = useState(emptyProduct);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [productRes, orderRes, userRes] = await Promise.all([
        api.get("/products", { params: { page: 1, limit: 50 } }),
        api.get("/orders"),
        api.get("/users"),
      ]);

      setDashboard({
        products: productRes.data.items,
        categories: productRes.data.categories,
        orders: orderRes.data,
        users: userRes.data,
      });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadDashboard();
    }
  }, [user]);

  const createProduct = async (event) => {
    event.preventDefault();
    try {
      await api.post("/products", {
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        category_id: Number(productForm.category_id),
      });
      setProductForm(emptyProduct);
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create product");
    }
  };

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete product");
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update order");
    }
  };

  const updateUserRole = async (id, role) => {
    try {
      await api.patch(`/users/${id}/role`, { role });
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user role");
    }
  };

  if (user?.role !== "admin") {
    return <ErrorMessage message="Admin access required" />;
  }

  if (loading) {
    return <Loader label="Loading admin dashboard..." />;
  }

  const paidOrders = dashboard.orders.filter((order) => order.payment_status === "paid");
  const paidRevenue = paidOrders.reduce((sum, order) => sum + Number(order.total_price), 0);
  const awaitingPayment = dashboard.orders.filter((order) => order.payment_status === "pending").length;
  const totalUnitsSold = dashboard.products.reduce(
    (sum, product) => sum + Number(product.sold_count || 0),
    0,
  );
  const topProducts = [...dashboard.products]
    .sort((first, second) => Number(second.sold_count || 0) - Number(first.sold_count || 0))
    .slice(0, 4);
  const latestOrders = [...dashboard.orders].slice(0, 5);

  return (
    <section className="grid gap-8 lg:grid-cols-[280px,1fr]">
      <aside className="rounded-[32px] bg-[#17313a] p-6 text-white shadow-card">
        <p className="text-sm uppercase tracking-[0.28em] text-white/50">Admin workspace</p>
        <h1 className="mt-3 font-display text-4xl">Control panel</h1>
        <p className="mt-4 text-sm text-white/70">
          Manage products, users, and revenue from a single sidebar-driven dashboard.
        </p>
        <div className="mt-8 space-y-3">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.id)}
              className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                activeView === item.id
                  ? "bg-white text-[#17313a]"
                  : "bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </aside>

      <div className="space-y-6">
        {error && <ErrorMessage message={error} />}

        {activeView === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-[28px] bg-white p-6 shadow-card">
                <p className="text-sm uppercase tracking-[0.2em] text-moss">Paid revenue</p>
                <h2 className="mt-3 text-3xl font-semibold text-ink">${paidRevenue.toFixed(2)}</h2>
                <p className="mt-2 text-sm text-slate-500">{paidOrders.length} paid orders</p>
              </article>
              <article className="rounded-[28px] bg-white p-6 shadow-card">
                <p className="text-sm uppercase tracking-[0.2em] text-moss">Awaiting payment</p>
                <h2 className="mt-3 text-3xl font-semibold text-ink">{awaitingPayment}</h2>
                <p className="mt-2 text-sm text-slate-500">Orders waiting on Stripe confirmation</p>
              </article>
              <article className="rounded-[28px] bg-white p-6 shadow-card">
                <p className="text-sm uppercase tracking-[0.2em] text-moss">Products</p>
                <h2 className="mt-3 text-3xl font-semibold text-ink">{dashboard.products.length}</h2>
                <p className="mt-2 text-sm text-slate-500">{totalUnitsSold} units sold overall</p>
              </article>
              <article className="rounded-[28px] bg-white p-6 shadow-card">
                <p className="text-sm uppercase tracking-[0.2em] text-moss">Users</p>
                <h2 className="mt-3 text-3xl font-semibold text-ink">{dashboard.users.length}</h2>
                <p className="mt-2 text-sm text-slate-500">Customer and admin accounts</p>
              </article>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
              <div className="rounded-[30px] bg-white p-6 shadow-card">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-moss">Revenue overview</p>
                    <h2 className="mt-2 font-display text-3xl text-ink">Recent paid orders</h2>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {latestOrders.map((order) => (
                    <div key={order.id} className="rounded-2xl border border-mist px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink">Order #{order.id}</p>
                          <p className="text-sm text-slate-500">{order.customer_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-clay">${Number(order.total_price).toFixed(2)}</p>
                          <div className="mt-2 flex gap-2">
                            <StatusBadge label={order.payment_status} />
                            <StatusBadge label={order.status} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[30px] bg-white p-6 shadow-card">
                <p className="text-sm uppercase tracking-[0.2em] text-moss">Top sellers</p>
                <h2 className="mt-2 font-display text-3xl text-ink">Best-performing products</h2>
                <div className="mt-5 space-y-4">
                  {topProducts.map((product) => (
                    <div key={product.id} className="rounded-2xl border border-mist px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink">{product.name}</p>
                          <p className="text-sm text-slate-500">Stock {product.stock}</p>
                        </div>
                        <span className="rounded-full bg-sand px-3 py-1 text-sm font-semibold text-ink">
                          Sold {product.sold_count || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === "products" && (
          <div className="grid gap-6 xl:grid-cols-[380px,1fr]">
            <form onSubmit={createProduct} className="rounded-[30px] bg-white p-6 shadow-card">
              <p className="text-sm uppercase tracking-[0.2em] text-moss">Catalog management</p>
              <h2 className="mt-2 font-display text-3xl text-ink">Add a product</h2>
              <div className="mt-5 space-y-3">
                <input className="w-full rounded-full border border-mist px-4 py-3" placeholder="Name" value={productForm.name} onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))} />
                <textarea className="w-full rounded-[24px] border border-mist px-4 py-3" placeholder="Description" rows="5" value={productForm.description} onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))} />
                <input className="w-full rounded-full border border-mist px-4 py-3" placeholder="Price" value={productForm.price} onChange={(event) => setProductForm((prev) => ({ ...prev, price: event.target.value }))} />
                <input className="w-full rounded-full border border-mist px-4 py-3" placeholder="Stock" value={productForm.stock} onChange={(event) => setProductForm((prev) => ({ ...prev, stock: event.target.value }))} />
                <select className="w-full rounded-full border border-mist px-4 py-3" value={productForm.category_id} onChange={(event) => setProductForm((prev) => ({ ...prev, category_id: event.target.value }))}>
                  <option value="">Select category</option>
                  {dashboard.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <input className="w-full rounded-full border border-mist px-4 py-3" placeholder="Image URL" value={productForm.image_url} onChange={(event) => setProductForm((prev) => ({ ...prev, image_url: event.target.value }))} />
                <button type="submit" className="w-full rounded-full bg-[#17313a] px-5 py-3 text-white">
                  Create product
                </button>
              </div>
            </form>

            <div className="rounded-[30px] bg-white p-6 shadow-card">
              <p className="text-sm uppercase tracking-[0.2em] text-moss">Current catalog</p>
              <h2 className="mt-2 font-display text-3xl text-ink">Products</h2>
              <div className="mt-5 space-y-3">
                {dashboard.products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between gap-4 rounded-2xl border border-mist px-4 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink">{product.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        ${Number(product.price).toFixed(2)} • Stock {product.stock} • Sold {product.sold_count || 0}
                      </p>
                    </div>
                    <button type="button" onClick={() => deleteProduct(product.id)} className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-600">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === "orders" && (
          <div className="rounded-[30px] bg-white p-6 shadow-card">
            <p className="text-sm uppercase tracking-[0.2em] text-moss">Fulfillment control</p>
            <h2 className="mt-2 font-display text-3xl text-ink">Orders</h2>
            <div className="mt-5 space-y-4">
              {dashboard.orders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-mist p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-ink">Order #{order.id}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {order.customer_name} • {order.customer_email}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <StatusBadge label={order.payment_status} />
                        <StatusBadge label={order.status} />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-clay">${Number(order.total_price).toFixed(2)}</p>
                      <select
                        value={order.status}
                        onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                        className="mt-3 rounded-full border border-mist px-4 py-2 text-sm"
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
          </div>
        )}

        {activeView === "users" && (
          <div className="rounded-[30px] bg-white p-6 shadow-card">
            <p className="text-sm uppercase tracking-[0.2em] text-moss">Access control</p>
            <h2 className="mt-2 font-display text-3xl text-ink">Users</h2>
            <div className="mt-5 space-y-3">
              {dashboard.users.map((member) => (
                <div key={member.id} className="flex items-center justify-between gap-4 rounded-2xl border border-mist px-4 py-4">
                  <div>
                    <p className="font-semibold text-ink">{member.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{member.email}</p>
                  </div>
                  <select
                    value={member.role}
                    onChange={(event) => updateUserRole(member.id, event.target.value)}
                    className="rounded-full border border-mist px-4 py-2 text-sm"
                  >
                    <option value="customer">customer</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
