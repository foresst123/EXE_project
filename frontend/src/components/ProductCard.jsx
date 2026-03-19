import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/formatters";

export const ProductCard = ({ product, onAddToCart, isAdded, compact = false, addKey, canAddToCart = true }) => {
  const priceLabel = formatCurrency(product.price);
  const soldLabel = `Đã bán ${product.sold_count || 0}`;
  const reviewLabel = product.comment_count ? `${product.comment_count} đánh giá` : "Mới lên kệ";

  if (compact) {
    return (
      <article className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-[#eadfd3] bg-[#fffdfa] shadow-[0_10px_30px_rgba(39,29,17,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(39,29,17,0.12)]">
        <Link to={`/products/${product.id}`} className="block">
          <div className="relative h-[clamp(8.5rem,10vw,9.5rem)] overflow-hidden bg-[#f5efe7]">
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute left-2 top-2 max-w-[70%] truncate rounded-md bg-[#fff2ea] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-clay">
              {product.category_name || "Chung"}
            </div>
            {product.stock <= 5 ? (
              <div className="absolute right-2 top-2 rounded-md bg-[#111827]/84 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                Còn {product.stock}
              </div>
            ) : null}
          </div>
        </Link>

        <div className="flex flex-1 flex-col px-2.5 pb-2 pt-1.5">
          {product.author_name ? (
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-tide">
              Bởi {product.author_name}
            </p>
          ) : null}

          <Link
            to={`/products/${product.id}`}
            className="mt-1 line-clamp-2 min-h-[2.25rem] text-[clamp(0.9rem,0.9vw,0.98rem)] font-medium leading-[1.15rem] text-[#201915]"
          >
            {product.name}
          </Link>

          <p className="mt-1 text-[10px] text-slate-500">{reviewLabel}</p>

          <div className="mt-auto pt-2">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[clamp(0.98rem,0.95vw,1.06rem)] font-semibold leading-none text-clay">{priceLabel}</p>
                <p className="mt-1 text-[10px] text-slate-500">{soldLabel}</p>
              </div>
              {canAddToCart ? (
                <button
                  type="button"
                  onClick={() => onAddToCart(product, addKey || product.id)}
                  className={`inline-flex h-8 shrink-0 items-center rounded-full px-3.5 text-[12px] font-semibold ${
                    isAdded ? "bg-moss text-white" : "bg-ink text-white"
                  }`}
                >
                  {isAdded ? "Đã thêm" : "Thêm"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[32px] border border-white/70 bg-white/92 shadow-card transition duration-300 hover:-translate-y-2 hover:shadow-float">
      <div className="relative overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="h-[clamp(13.5rem,18vw,15rem)] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-4 top-4 rounded-full bg-white/88 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink">
          {product.category_name || "Chung"}
        </div>
        <div className="absolute right-4 top-4 rounded-full bg-[#111827]/82 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          {soldLabel}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.author_name ? (
          <Link
            to={`/artists/${product.author_slug}`}
            className="inline-flex w-fit rounded-full bg-[#edf5fd] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-tide"
          >
            Bởi {product.author_name}
          </Link>
        ) : null}

        <h3 className="mt-3 font-display text-[clamp(1.4rem,1.55vw,1.7rem)] leading-tight text-ink">{product.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{product.description}</p>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-end justify-between gap-3">
              <span className="text-[clamp(1.45rem,1.6vw,1.8rem)] font-semibold text-clay">{priceLabel}</span>
              <p className="shrink-0 text-[13px] text-slate-500">{reviewLabel}</p>
            </div>
            {product.stock <= 5 ? (
              <span className="rounded-full bg-[#fff1e7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-clay">
                Chỉ còn {product.stock}
              </span>
            ) : null}
          </div>

          <div className="mt-4 flex gap-3">
            <Link
              to={`/products/${product.id}`}
              className="flex-1 rounded-full border border-mist bg-white px-4 py-2.5 text-center text-sm font-medium text-ink"
            >
              Xem chi tiết
            </Link>
            {canAddToCart ? (
              <button
                type="button"
                onClick={() => onAddToCart(product, addKey || product.id)}
                className={`flex-1 rounded-full px-4 py-2.5 text-sm font-medium text-white ${
                  isAdded ? "bg-moss" : "bg-ink"
                }`}
              >
                {isAdded ? "Đã thêm vào giỏ" : "Thêm vào giỏ"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
};
