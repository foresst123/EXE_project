import { Link } from "react-router-dom";

export const ProductCard = ({ product, onAddToCart, isAdded, compact = false, addKey, canAddToCart = true }) => {
  const priceLabel = `$${Number(product.price).toFixed(2)}`;
  const soldLabel = `Sold ${product.sold_count || 0}`;
  const reviewLabel = product.comment_count ? `${product.comment_count} reviews` : "New in the catalog";

  if (compact) {
    return (
      <article className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-[#eadfd3] bg-[#fffdfa] shadow-[0_10px_30px_rgba(39,29,17,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(39,29,17,0.12)]">
        <Link to={`/products/${product.id}`} className="block">
          <div className="relative h-36 overflow-hidden bg-[#f5efe7]">
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute left-2 top-2 max-w-[70%] truncate rounded-md bg-[#fff2ea] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-clay">
              {product.category_name || "General"}
            </div>
            {product.stock <= 5 ? (
              <div className="absolute right-2 top-2 rounded-md bg-[#111827]/84 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                Only {product.stock}
              </div>
            ) : null}
          </div>
        </Link>

        <div className="flex flex-1 flex-col px-2.5 pb-2 pt-1.5">
          {product.author_name ? (
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-tide">
              By {product.author_name}
            </p>
          ) : null}

          <Link
            to={`/products/${product.id}`}
            className="mt-1 line-clamp-2 min-h-[2.25rem] text-[0.92rem] font-medium leading-[1.15rem] text-[#201915]"
          >
            {product.name}
          </Link>

          <p className="mt-1 text-[10px] text-slate-500">{reviewLabel}</p>

          <div className="mt-auto pt-2">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[1rem] font-semibold leading-none text-clay">{priceLabel}</p>
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
                  {isAdded ? "Added" : "Add"}
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
          className="h-60 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-4 top-4 rounded-full bg-white/88 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink">
          {product.category_name || "General"}
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
            By {product.author_name}
          </Link>
        ) : null}

        <h3 className="mt-3 font-display text-[1.65rem] leading-tight text-ink">{product.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{product.description}</p>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-end justify-between gap-3">
              <span className="text-[1.7rem] font-semibold text-clay">{priceLabel}</span>
              <p className="shrink-0 text-[13px] text-slate-500">{reviewLabel}</p>
            </div>
            {product.stock <= 5 ? (
              <span className="rounded-full bg-[#fff1e7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-clay">
                Only {product.stock} left
              </span>
            ) : null}
          </div>

          <div className="mt-4 flex gap-3">
            <Link
              to={`/products/${product.id}`}
              className="flex-1 rounded-full border border-mist bg-white px-4 py-2.5 text-center text-sm font-medium text-ink"
            >
              View detail
            </Link>
            {canAddToCart ? (
              <button
                type="button"
                onClick={() => onAddToCart(product, addKey || product.id)}
                className={`flex-1 rounded-full px-4 py-2.5 text-sm font-medium text-white ${
                  isAdded ? "bg-moss" : "bg-ink"
                }`}
              >
                {isAdded ? "Added to cart" : "Add to cart"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
};
