import { useState } from "react";
import { api } from "../api/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/formatters";

export const CheckoutPage = () => {
  const { user } = useAuth();
  const { cart, updateCartQuantity, removeFromCart } = useCart();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState(null);

  const changeQuantity = async (item, nextQuantity) => {
    if (nextQuantity === 0) {
      setPendingRemoval(item);
      return;
    }

    if (nextQuantity < 1 || nextQuantity > item.stock) {
      return;
    }

    try {
      setError("");
      await updateCartQuantity(item.product_id, nextQuantity);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Không thể cập nhật số lượng");
    }
  };

  const confirmRemoval = async () => {
    if (!pendingRemoval) {
      return;
    }

    try {
      setError("");
      await removeFromCart(pendingRemoval.product_id);
      setPendingRemoval(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Không thể xóa sản phẩm");
    }
  };

  const placeOrder = async () => {
    if (!cart.items.length) {
      setError("Giỏ hàng của bạn đang trống");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/orders/checkout-session");
      setError("");
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tạo phiên thanh toán");
      setLoading(false);
    }
  };

  if (!user) {
    return <ErrorMessage message="Vui lòng đăng nhập để thanh toán" />;
  }

  return (
    <>
      <section className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
      <div className="rounded-[32px] bg-white/90 p-8 shadow-card">
        <p className="text-sm uppercase tracking-[0.3em] text-moss">Thanh toán</p>
        <h1 className="mt-3 font-display text-4xl">Thanh toán an toàn qua thẻ</h1>
        <div className="mt-6 rounded-[28px] border border-mist bg-sand/60 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-moss">Quy trình thanh toán</p>
          <ol className="mt-4 space-y-3 text-sm text-slate-600">
            <li>Artdict tạo đơn hàng và phiên thanh toán Stripe.</li>
            <li>Bạn hoàn tất thanh toán thẻ trên cổng bảo mật của Stripe.</li>
            <li>Stripe gửi webhook xác nhận về máy chủ.</li>
            <li>Đơn hàng được cập nhật sang đã thanh toán và chuyển sang khâu xử lý.</li>
          </ol>
        </div>
        <div className="mt-6 rounded-[28px] border border-mist p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-moss">Thẻ được hỗ trợ</p>
          <div className="mt-4 flex gap-3">
            <span className="rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white">Visa</span>
            <span className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink ring-1 ring-mist">Mastercard</span>
            <span className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink ring-1 ring-mist">Amex</span>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Thông tin thẻ được nhập trực tiếp trên Stripe. Ứng dụng không lưu dữ liệu thẻ thô.
          </p>
        </div>
      </div>

      <aside className="rounded-[32px] bg-ink p-8 text-white shadow-card">
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">Tóm tắt đơn hàng</p>
        <div className="mt-6 space-y-3">
          {cart.items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-white">{item.name}</p>
                  <p className="mt-1 text-sm text-white/65">{formatCurrency(item.price)} / sản phẩm</p>
                </div>
                <p className="shrink-0 font-semibold text-white">{formatCurrency(Number(item.price) * item.quantity)}</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5">
                  <button
                    type="button"
                    onClick={() => changeQuantity(item, item.quantity - 1)}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-semibold text-white disabled:opacity-35"
                  >
                    -
                  </button>
                  <span className="min-w-10 text-center text-sm font-semibold text-white">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => changeQuantity(item, item.quantity + 1)}
                    disabled={item.quantity >= item.stock || loading}
                    className="px-4 py-2 text-sm font-semibold text-white disabled:opacity-35"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingRemoval(item)}
                  disabled={loading}
                  className="text-sm font-semibold text-[#f7c5b6] transition hover:text-white disabled:opacity-45"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between text-sm text-white/60">
          <span>Tổng số lượng</span>
          <span>{cart.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
        </div>
        <div className="mt-6 flex items-center justify-between text-lg font-semibold">
          <span>Tổng cộng</span>
          <span>{formatCurrency(cart.total)}</span>
        </div>
        {error && <div className="mt-4"><ErrorMessage message={error} /></div>}
        <button
          type="button"
          disabled={!cart.items.length || loading}
          onClick={placeOrder}
          className="mt-6 w-full rounded-full bg-clay px-5 py-3 font-semibold text-white disabled:opacity-40"
        >
          {loading ? "Đang chuyển sang Stripe..." : "Tiếp tục thanh toán"}
        </button>
      </aside>
      </section>

      {pendingRemoval ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#17130f]/45 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_30px_80px_rgba(20,15,10,0.22)]">
            <p className="text-sm uppercase tracking-[0.22em] text-moss">Xóa sản phẩm</p>
            <h2 className="mt-3 text-2xl font-semibold text-ink">Xóa sản phẩm này trước khi thanh toán?</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {pendingRemoval.name} sẽ bị xóa khỏi đơn hàng. Nếu hủy, số lượng hiện tại sẽ được giữ nguyên.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setPendingRemoval(null)}
                className="flex-1 rounded-full border border-mist px-4 py-3 text-sm font-semibold text-ink"
              >
                Giữ lại
              </button>
              <button
                type="button"
                onClick={confirmRemoval}
                className="flex-1 rounded-full bg-[#d14d1f] px-4 py-3 text-sm font-semibold text-white"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
