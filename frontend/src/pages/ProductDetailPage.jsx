import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { Loader } from "../components/Loader";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentError, setCommentError] = useState("");
  const [commentPermission, setCommentPermission] = useState(null);
  const [commentPermissionLoading, setCommentPermissionLoading] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentState, setCommentState] = useState({
    content: "",
    media_url: "",
    media_type: "",
  });
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState(0);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const [productResponse, commentResponse] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products/${id}/comments`),
        ]);
        setProduct(productResponse.data);
        setComments(commentResponse.data.items);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  useEffect(() => {
    const loadCommentPermission = async () => {
      if (!user) {
        setCommentPermission(null);
        return;
      }

      setCommentPermissionLoading(true);
      try {
        const { data } = await api.get(`/products/${id}/comments/permission`);
        setCommentPermission(data);
      } catch (requestError) {
        setCommentPermission({
          hasPurchased: false,
          hasCommented: false,
          canComment: false,
          message: requestError.response?.data?.message || "Could not verify review access",
        });
      } finally {
        setCommentPermissionLoading(false);
      }
    };

    loadCommentPermission();
  }, [id, user]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await addToCart({ productId: product.id, quantity, productName: product.name });
      setError("");
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1800);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not add product to cart");
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await addToCart({ productId: product.id, quantity, productName: product.name });
      setError("");
      navigate("/checkout");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not start checkout");
    }
  };

  const submitComment = async (event) => {
    event.preventDefault();

    if (!user) {
      setCommentError("Please login to comment on this product");
      return;
    }

    setCommentSubmitting(true);
    try {
      await api.post(`/products/${product.id}/comments`, commentState);
      const { data } = await api.get(`/products/${product.id}/comments`);
      setComments(data.items);
      setProduct((current) => ({
        ...(current || {}),
        comment_count: (current?.comment_count || 0) + 1,
      }));
      setCommentState({ content: "", media_url: "", media_type: "" });
      setCommentError("");
      setCommentPermission({ hasPurchased: true, hasCommented: true, canComment: false });
      setShowCommentModal(false);
    } catch (requestError) {
      setCommentError(requestError.response?.data?.message || "Could not submit comment");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const openCommentModal = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!commentPermission?.canComment) {
      setCommentError(
        commentPermission?.hasCommented
          ? "You have already reviewed this product"
          : "Only customers who purchased this product can leave a review",
      );
      return;
    }

    setCommentError("");
    setShowCommentModal(true);
  };

  if (loading) {
    return <Loader label="Loading product details..." />;
  }

  if (!product) {
    return <ErrorMessage message={error || "Product not found"} />;
  }

  const rawGalleryImages = [
    product.image_url,
    ...(Array.isArray(product.images) ? product.images : []),
    ...(Array.isArray(product.gallery_images) ? product.gallery_images : []),
  ];
  const previewItems = [...new Set(rawGalleryImages.filter(Boolean))].map((image, index) => ({
    id: `image-${index}`,
    image,
  }));
  const activePreview = previewItems[selectedPreview] || previewItems[0];

  return (
    <section className="space-y-10">
      <div className="rounded-[40px] border border-white/60 bg-white/90 p-6 shadow-float md:p-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,480px)_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="aspect-[1.16/1] overflow-hidden rounded-[32px] border border-mist bg-[#faf6f1]">
              <img
                src={activePreview?.image || product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {previewItems.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedPreview(index)}
                  className={`w-[92px] overflow-hidden rounded-[18px] border transition ${
                    selectedPreview === index
                      ? "border-[#7c3f18] ring-2 ring-[#e7c9ae]"
                      : "border-mist hover:border-[#d5b79d]"
                  }`}
                >
                  <img
                    src={item.image}
                    alt={`${product.name} preview ${index + 1}`}
                    className="aspect-square h-[92px] w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-[10px] bg-[#7c3f18] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                  Mall
                </span>
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7c3f18]">
                  {product.category_name}
                </span>
              </div>
              <h1 className="mt-4 text-[2.4rem] font-semibold leading-tight text-ink md:text-[2.8rem]">
                {product.name}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[1rem] text-slate-600">
              <span className="font-semibold text-[#7c3f18]">{product.comment_count || 0} Reviews</span>
              <span className="h-5 w-px bg-mist" />
              <span>{product.sold_count || 0} Sold</span>
              <span className="h-5 w-px bg-mist" />
              <span>{product.stock} Available</span>
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap items-end gap-4">
                <span className="text-[2.8rem] font-semibold leading-none text-[#d14d1f] md:text-[3.2rem]">
                  ${Number(product.price).toFixed(2)}
                </span>
                <span className="rounded-full bg-[#fff0e8] px-3 py-1 text-sm font-semibold text-[#7c3f18]">
                  Secure card payment
                </span>
              </div>

              <div className="grid gap-5">
                <div className="grid gap-3 md:grid-cols-[120px,1fr]">
                  <p className="text-sm font-medium text-slate-500">Artist</p>
                  {product.author_name ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-[#edf5fd] px-4 py-2 text-sm font-semibold text-tide">
                        {product.author_name}
                      </span>
                      <Link
                        to={`/artists/${product.author_slug}`}
                        className="text-sm font-semibold text-[#7c3f18] underline decoration-[#d9c1a7] underline-offset-4"
                      >
                        View profile
                      </Link>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">No artist profile connected yet.</p>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-[120px,1fr]">
                  <p className="text-sm font-medium text-slate-500">Shipping</p>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p>Arrives with standard delivery and secure checkout.</p>
                    <p className="font-semibold text-[#2f7c65]">Shipping fee shown at checkout</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-[120px,1fr]">
                  <p className="text-sm font-medium text-slate-500">Quantity</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex gap-3">
                      <input
                        type="number"
                        min="1"
                        max={product.stock}
                        value={quantity}
                        onChange={(event) => setQuantity(Number(event.target.value))}
                        className="w-24 rounded-full border border-mist bg-white px-4 py-3 text-ink"
                      />
                    </div>
                    <span className="text-sm text-slate-500">{product.stock} pieces available</span>
                  </div>
                </div>
              </div>
            </div>

            {user ? (
              <div className="flex max-w-xl flex-wrap gap-3 pt-4 md:pt-6">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`min-w-[220px] rounded-full border px-6 py-4 text-lg font-semibold transition ${
                    added
                      ? "border-moss bg-moss text-white"
                      : "border-[#d14d1f] bg-[#fff0e8] text-[#d14d1f] hover:bg-[#ffe5d8]"
                  }`}
                >
                  {added ? "Added to cart" : "Add to cart"}
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="min-w-[220px] rounded-full bg-[#d14d1f] px-6 py-4 text-lg font-semibold text-white transition hover:bg-[#b93f17]"
                >
                  Buy now
                </button>
              </div>
            ) : (
              <div className="pt-4 md:pt-6">
                <Link
                  to="/login"
                  className="inline-flex min-w-[240px] items-center justify-center rounded-full bg-ink px-6 py-4 text-lg font-semibold text-white"
                >
                  Login to purchase
                </Link>
              </div>
            )}

            {error ? (
              <div className="mt-5">
                <ErrorMessage message={error} />
              </div>
            ) : null}
          </aside>
        </div>
      </div>

      <section className="rounded-[38px] border border-white/60 bg-white/88 p-8 shadow-card">
        <div className="rounded-[8px] border border-[#eadfd3] bg-[#faf6f1] px-6 py-4">
          <h2 className="text-[1.45rem] font-semibold uppercase tracking-[0.02em] text-ink">Product Details</h2>
        </div>

        <div className="mt-8 space-y-8 text-sm md:text-base">
          <div className="grid gap-8 md:grid-cols-[220px,1fr]">
            <p className="text-slate-400">Category</p>
            <div className="font-medium text-ink">{product.category_name}</div>
          </div>
          <div className="grid gap-8 md:grid-cols-[220px,1fr]">
            <p className="text-slate-400">Stock</p>
            <div className="font-medium text-ink">{product.stock > 0 ? "In stock" : "Out of stock"}</div>
          </div>
          <div className="grid gap-8 md:grid-cols-[220px,1fr]">
            <p className="text-slate-400">Units sold</p>
            <div className="font-medium text-ink">{product.sold_count || 0}</div>
          </div>
          <div className="grid gap-8 md:grid-cols-[220px,1fr]">
            <p className="text-slate-400">Reviews</p>
            <div className="font-medium text-ink">{product.comment_count || 0} reviews</div>
          </div>
        </div>

        <div className="mt-10 border-t border-[#eadfd3] pt-8">
          <div className="rounded-[8px] border border-[#eadfd3] bg-[#faf6f1] px-6 py-4">
            <h2 className="text-[1.45rem] font-semibold uppercase tracking-[0.02em] text-ink">Product Description</h2>
          </div>

          <div className="mt-8 space-y-5 text-sm leading-8 text-slate-600 md:text-base">
            <p>{product.description}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.12fr,0.88fr]">
        <div className="xl:col-span-2 rounded-[38px] border border-white/60 bg-white/88 p-8 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-tide">Customer reviews</p>
              <h2 className="mt-2 font-display text-[2.1rem] text-ink md:text-[2.45rem]">What people are saying</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-mist bg-[#fbfaf8] px-4 py-2 text-sm font-semibold text-slate-500">
                {comments.length} published reviews
              </div>
              {user ? (
                <button
                  type="button"
                  onClick={openCommentModal}
                  disabled={commentPermissionLoading || !commentPermission?.canComment}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    commentPermission?.canComment
                      ? "bg-ink text-white hover:bg-[#222f44]"
                      : "bg-[#efe8df] text-[#7a685b]"
                  } disabled:cursor-not-allowed`}
                >
                  {commentPermissionLoading
                    ? "Checking review access..."
                    : commentPermission?.canComment
                      ? "Write a review"
                      : commentPermission?.hasCommented
                        ? "Review submitted"
                        : "Purchase required to review"}
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <div className="rounded-full bg-[#f7f1e8] px-4 py-2 text-[#6f513f]">
              Only verified buyers can post one review per product
            </div>
            <div className="rounded-full bg-[#edf5fd] px-4 py-2 text-[#3e658c]">
              Optional image or video URL supported
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {comments.map((comment) => (
              <article key={comment.id} className="rounded-[28px] border border-mist bg-white p-5 shadow-card">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-[#edf5fd] text-sm font-bold text-tide">
                    {comment.user_name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink">{comment.user_name}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {comment.media_type && (
                        <span className="rounded-full bg-[#f7f1e8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-clay">
                          {comment.media_type}
                        </span>
                      )}
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-600">{comment.content}</p>
                    {comment.media_url && comment.media_type === "image" && (
                      <img
                        src={comment.media_url}
                        alt="Comment attachment"
                        className="mt-4 max-h-64 w-full rounded-[20px] object-cover"
                      />
                    )}
                    {comment.media_url && comment.media_type === "video" && (
                      <video controls className="mt-4 max-h-72 w-full rounded-[20px] bg-black">
                        <source src={comment.media_url} />
                      </video>
                    )}
                  </div>
                </div>
              </article>
            ))}

            {!comments.length && (
              <div className="rounded-[28px] border border-dashed border-mist bg-[#fbfaf8] p-6 text-sm text-slate-500">
                No comments yet. Be the first to leave one.
              </div>
            )}
          </div>
          {commentError ? (
            <div className="mt-4">
              <ErrorMessage message={commentError} />
            </div>
          ) : null}
        </div>
      </section>

      {showCommentModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17120e]/45 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[36px] border border-white/70 bg-[#fffaf4] p-6 shadow-[0_24px_80px_rgba(23,18,14,0.25)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-moss">Leave a review</p>
                <h2 className="mt-2 font-display text-[2.1rem] text-ink md:text-[2.45rem]">Share your experience</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Verified buyers can leave one review per product, with up to 500 characters and an optional image or video URL.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCommentModal(false);
                  setCommentError("");
                }}
                className="rounded-full border border-mist px-4 py-2 text-sm font-semibold text-ink"
              >
                Close
              </button>
            </div>

            <form onSubmit={submitComment} className="mt-6 rounded-[28px] border border-mist bg-white p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-moss">Write your comment</p>
              <textarea
                rows="5"
                maxLength={500}
                value={commentState.content}
                onChange={(event) =>
                  setCommentState((current) => ({ ...current, content: event.target.value }))
                }
                placeholder="Share your experience with this product..."
                className="mt-4 w-full rounded-[22px] border border-mist bg-[#fffaf4] px-4 py-3 outline-none"
              />
              <div className="mt-2 text-right text-xs text-slate-500">
                {commentState.content.length}/500
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-[180px,1fr]">
                <select
                  value={commentState.media_type}
                  onChange={(event) =>
                    setCommentState((current) => ({ ...current, media_type: event.target.value }))
                  }
                  className="rounded-full border border-mist bg-[#fffaf4] px-4 py-3 outline-none"
                >
                  <option value="">No media</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
                <input
                  type="url"
                  value={commentState.media_url}
                  onChange={(event) =>
                    setCommentState((current) => ({ ...current, media_url: event.target.value }))
                  }
                  placeholder="Paste image or video URL"
                  className="rounded-full border border-mist bg-[#fffaf4] px-4 py-3 outline-none"
                />
              </div>
              {commentError ? (
                <div className="mt-4">
                  <ErrorMessage message={commentError} />
                </div>
              ) : null}
              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="text-sm text-slate-500">One review per buyer. Reviews appear publicly after posting.</div>
                <button
                  type="submit"
                  disabled={commentSubmitting}
                  className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {commentSubmitting ? "Posting..." : "Post comment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
};
