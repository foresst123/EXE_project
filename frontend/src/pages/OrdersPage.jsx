import { useEffect, useState } from "react";
import { api } from "../api/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { Loader } from "../components/Loader";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

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
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (!user) {
    return <ErrorMessage message="Please login to view your orders" />;
  }

  if (loading) {
    return <Loader label="Loading orders..." />;
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-moss">Orders</p>
        <h1 className="mt-3 font-display text-4xl">
          {user.role === "admin" ? "Manage customer orders" : "Your order history"}
        </h1>
      </div>
      {error && <ErrorMessage message={error} />}
      {orders.map((order) => (
        <article key={order.id} className="rounded-[28px] bg-white p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Order #{order.id}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusBadge label={order.payment_status} />
                <StatusBadge label={order.status} />
              </div>
              <p className="mt-2 text-sm text-slate-500">{new Date(order.created_at).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-clay">${Number(order.total_price).toFixed(2)}</p>
              {user.role === "admin" && (
                <p className="text-sm text-slate-500">{order.customer_name} ({order.customer_email})</p>
              )}
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {order.items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-mist px-4 py-3 text-sm text-slate-600">
                {item.name} x {item.quantity} - ${Number(item.price).toFixed(2)}
              </div>
            ))}
          </div>
        </article>
      ))}
      {!orders.length && <div className="rounded-[28px] bg-white p-6 text-slate-500 shadow-card">No orders found yet.</div>}
    </section>
  );
};
