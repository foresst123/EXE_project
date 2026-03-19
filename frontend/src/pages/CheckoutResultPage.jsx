import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { Loader } from "../components/Loader";
import { StatusBadge } from "../components/StatusBadge";
import { useCart } from "../context/CartContext";

export const CheckoutResultPage = () => {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const status = params.get("status");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { refreshCart } = useCart();

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        if (status === "success") {
          await api.post(`/orders/${orderId}/confirm-payment`);
          await refreshCart();
        }
        const { data } = await api.get(`/orders/${orderId}`);
        setOrder(data);
        if (data?.payment_status === "paid") {
          await refreshCart();
        }
      } catch (err) {
        setError(err.response?.data?.message || "Không thể tải thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, refreshCart, status]);

  if (loading) {
    return <Loader label="Đang kiểm tra kết quả thanh toán..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <section className="mx-auto max-w-3xl rounded-[32px] bg-white/90 p-8 shadow-card">
      <p className="text-sm uppercase tracking-[0.3em] text-moss">Kết quả thanh toán</p>
      <h1 className="mt-3 font-display text-4xl text-ink">
        {status === "cancelled" ? "Thanh toán đã bị hủy" : "Quy trình thanh toán đã hoàn tất"}
      </h1>
      <p className="mt-4 text-slate-600">
        Bạn đã được chuyển về từ Stripe. Trạng thái cuối cùng của đơn hàng sẽ được xác nhận bằng webhook
        đồng bộ trên hệ thống.
      </p>

      {order ? (
        <div className="mt-6 space-y-4 rounded-[28px] border border-mist p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-ink">Đơn hàng #{order.id}</h2>
            <div className="flex gap-2">
              <StatusBadge label={order.payment_status} />
              <StatusBadge label={order.status} />
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Nếu trạng thái thanh toán đã là `paid`, đơn hàng đã được chuyển sang bước xử lý tiếp theo.
          </p>
          <div className="flex gap-3">
            <Link to="/orders" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
              Xem đơn hàng
            </Link>
            <Link to="/" className="rounded-full border border-mist px-5 py-3 text-sm font-semibold text-ink">
              Tiếp tục khám phá
            </Link>
          </div>
        </div>
      ) : (
        <ErrorMessage message="Không nhận được thông tin đơn hàng từ phiên thanh toán." />
      )}
    </section>
  );
};
