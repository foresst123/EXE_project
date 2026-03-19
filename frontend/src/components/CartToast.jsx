import { Link } from "react-router-dom";
import { useEffect } from "react";

export const CartToast = ({ notice, onClose }) => {
  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      onClose();
    }, 3200);

    return () => window.clearTimeout(timeoutId);
  }, [notice, onClose]);

  if (!notice) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-6 z-40 w-[min(360px,calc(100vw-2rem))] rounded-[26px] border border-white/70 bg-ink p-4 text-white shadow-2xl">
      <p className="text-xs uppercase tracking-[0.24em] text-white/50">Đã thêm vào giỏ</p>
      <h3 className="mt-2 text-lg font-semibold">{notice.productName}</h3>
      <p className="mt-1 text-sm text-white/75">
        Số lượng {notice.quantity}. Bạn có thể tiếp tục khám phá hoặc mở giỏ hàng trước khi thanh toán.
      </p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/20 px-4 py-2 text-sm"
        >
          Tiếp tục
        </button>
        <Link to="/cart" className="rounded-full bg-clay px-4 py-2 text-sm font-semibold text-white">
          Xem giỏ hàng
        </Link>
      </div>
    </div>
  );
};
