import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ErrorMessage } from "../components/ErrorMessage";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/formatters";

export const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, removeFromCart, updateCartQuantity, loading } = useCart();
  const [error, setError] = useState("");
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

  if (!user) {
    return <ErrorMessage message="Vui lòng đăng nhập để xem giỏ hàng" />;
  }

  return (
    <>
      <section className="grid gap-8 lg:grid-cols-[1.4fr,0.6fr]">
      <div className="space-y-4">
        {loading && <p className="text-sm text-slate-500">Đang làm mới giỏ hàng...</p>}
        {error ? <ErrorMessage message={error} /> : null}
        {cart.items.map((item) => (
          <article key={item.id} className="flex items-center gap-4 rounded-[28px] bg-white p-4 shadow-card">
            <img src={item.image_url} alt={item.name} className="h-24 w-24 rounded-2xl object-cover" />
            <div className="flex-1">
              <h2 className="font-semibold">{item.name}</h2>
              <p className="mt-1 text-sm text-slate-500">Tồn kho: {item.stock}</p>
              <p className="mt-1 text-sm font-semibold text-clay">{formatCurrency(item.price)}</p>
              <div className="mt-3 inline-flex items-center rounded-full border border-mist bg-[#fbfaf8]">
                <button
                  type="button"
                  onClick={() => changeQuantity(item, item.quantity - 1)}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-semibold text-ink disabled:opacity-35"
                >
                  -
                </button>
                <span className="min-w-10 text-center text-sm font-semibold text-ink">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => changeQuantity(item, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                  className="px-4 py-2 text-sm font-semibold text-ink disabled:opacity-35"
                >
                  +
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Tạm tính</p>
              <p className="mt-1 font-semibold text-ink">{formatCurrency(Number(item.price) * item.quantity)}</p>
            </div>
            <button
              type="button"
              onClick={() => setPendingRemoval(item)}
              className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-600"
            >
              Xóa
            </button>
          </article>
        ))}
        {!cart.items.length && (
          <div className="rounded-[28px] bg-white p-6 text-slate-500 shadow-card">
            Giỏ hàng của bạn đang trống.
          </div>
        )}
      </div>
      <aside className="h-fit rounded-[28px] bg-ink p-6 text-white shadow-card">
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">Tóm tắt</p>
        <div className="mt-4 flex items-center justify-between text-sm text-white/70">
          <span>Sản phẩm</span>
          <span>{cart.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
        </div>
        <div className="mt-6 flex items-center justify-between text-lg">
          <span>Tổng cộng</span>
          <span>{formatCurrency(cart.total)}</span>
        </div>
        <button
          type="button"
          disabled={!cart.items.length}
          onClick={() => navigate("/checkout")}
          className="mt-6 w-full rounded-full bg-clay px-5 py-3 font-semibold text-white disabled:opacity-40"
        >
          Tiếp tục thanh toán
        </button>
      </aside>
      </section>

      {pendingRemoval ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#17130f]/40 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_30px_80px_rgba(20,15,10,0.22)]">
            <p className="text-sm uppercase tracking-[0.22em] text-moss">Xóa sản phẩm</p>
            <h2 className="mt-3 text-2xl font-semibold text-ink">Xóa sản phẩm này khỏi giỏ hàng?</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {pendingRemoval.name} sẽ bị xóa khỏi giỏ hàng. Nếu bạn hủy, số lượng hiện tại sẽ được giữ nguyên.
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
