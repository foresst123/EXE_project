import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { Loader } from "../components/Loader";
import { StatusBadge } from "../components/StatusBadge";

export const CheckoutResultPage = () => {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const status = params.get("status");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        if (status === "success") {
          await api.post(`/orders/${orderId}/confirm-payment`);
        }
        const { data } = await api.get(`/orders/${orderId}`);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load order");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, status]);

  if (loading) {
    return <Loader label="Checking payment result..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <section className="mx-auto max-w-3xl rounded-[32px] bg-white/90 p-8 shadow-card">
      <p className="text-sm uppercase tracking-[0.3em] text-moss">Payment result</p>
      <h1 className="mt-3 font-display text-4xl text-ink">
        {status === "cancelled" ? "Payment was cancelled" : "Payment flow completed"}
      </h1>
      <p className="mt-4 text-slate-600">
        Stripe has returned you to the store. The final source of truth is the webhook confirmation recorded on your order.
      </p>

      {order ? (
        <div className="mt-6 space-y-4 rounded-[28px] border border-mist p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-ink">Order #{order.id}</h2>
            <div className="flex gap-2">
              <StatusBadge label={order.payment_status} />
              <StatusBadge label={order.status} />
            </div>
          </div>
          <p className="text-sm text-slate-500">
            If payment is already marked `paid`, the order has moved into the next step for fulfillment.
          </p>
          <div className="flex gap-3">
            <Link to="/orders" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
              View orders
            </Link>
            <Link to="/" className="rounded-full border border-mist px-5 py-3 text-sm font-semibold text-ink">
              Continue shopping
            </Link>
          </div>
        </div>
      ) : (
        <ErrorMessage message="No order information was returned from checkout." />
      )}
    </section>
  );
};
