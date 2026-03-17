import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ErrorMessage } from "../components/ErrorMessage";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

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
      setError(requestError.response?.data?.message || "Could not update quantity");
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
      setError(requestError.response?.data?.message || "Could not remove item");
    }
  };

  if (!user) {
    return <ErrorMessage message="Please login to view your cart" />;
  }

  return (
    <>
      <section className="grid gap-8 lg:grid-cols-[1.4fr,0.6fr]">
      <div className="space-y-4">
        {loading && <p className="text-sm text-slate-500">Refreshing cart...</p>}
        {error ? <ErrorMessage message={error} /> : null}
        {cart.items.map((item) => (
          <article key={item.id} className="flex items-center gap-4 rounded-[28px] bg-white p-4 shadow-card">
            <img src={item.image_url} alt={item.name} className="h-24 w-24 rounded-2xl object-cover" />
            <div className="flex-1">
              <h2 className="font-semibold">{item.name}</h2>
              <p className="mt-1 text-sm text-slate-500">In stock: {item.stock}</p>
              <p className="mt-1 text-sm font-semibold text-clay">${Number(item.price).toFixed(2)}</p>
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
              <p className="text-sm text-slate-500">Subtotal</p>
              <p className="mt-1 font-semibold text-ink">${(Number(item.price) * item.quantity).toFixed(2)}</p>
            </div>
            <button
              type="button"
              onClick={() => setPendingRemoval(item)}
              className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-600"
            >
              Remove
            </button>
          </article>
        ))}
        {!cart.items.length && (
          <div className="rounded-[28px] bg-white p-6 text-slate-500 shadow-card">
            Your cart is empty.
          </div>
        )}
      </div>
      <aside className="h-fit rounded-[28px] bg-ink p-6 text-white shadow-card">
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">Summary</p>
        <div className="mt-4 flex items-center justify-between text-sm text-white/70">
          <span>Items</span>
          <span>{cart.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
        </div>
        <div className="mt-6 flex items-center justify-between text-lg">
          <span>Total</span>
          <span>${Number(cart.total).toFixed(2)}</span>
        </div>
        <button
          type="button"
          disabled={!cart.items.length}
          onClick={() => navigate("/checkout")}
          className="mt-6 w-full rounded-full bg-clay px-5 py-3 font-semibold text-white disabled:opacity-40"
        >
          Continue to secure payment
        </button>
      </aside>
      </section>

      {pendingRemoval ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#17130f]/40 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_30px_80px_rgba(20,15,10,0.22)]">
            <p className="text-sm uppercase tracking-[0.22em] text-moss">Remove item</p>
            <h2 className="mt-3 text-2xl font-semibold text-ink">Remove this product from your cart?</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {pendingRemoval.name} will be removed from your cart. If you cancel, the current quantity will stay the same.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setPendingRemoval(null)}
                className="flex-1 rounded-full border border-mist px-4 py-3 text-sm font-semibold text-ink"
              >
                Keep item
              </button>
              <button
                type="button"
                onClick={confirmRemoval}
                className="flex-1 rounded-full bg-[#d14d1f] px-4 py-3 text-sm font-semibold text-white"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
