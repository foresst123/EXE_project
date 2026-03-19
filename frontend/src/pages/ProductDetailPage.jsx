import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { Loader } from "../components/Loader";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatShortDate } from "../utils/formatters";

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
        setError(requestError.response?.data?.message || "Không thể tải thông tin sản phẩm");
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
          message: requestError.response?.data?.message || "Không thể kiểm tra quyền đánh giá",
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
      setError(requestError.response?.data?.message || "Không thể thêm sản phẩm vào giỏ hàng");
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
      setError(requestError.response?.data?.message || "Không thể bắt đầu thanh toán");
    }
  };

  const submitComment = async (event) => {
    event.preventDefault();

    if (!user) {
      setCommentError("Vui lòng đăng nhập để đánh giá sản phẩm này");
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
      setCommentError(requestError.response?.data?.message || "Không thể gửi đánh giá");
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
          ? "Bạn đã đánh giá sản phẩm này rồi"
          : "Chỉ khách đã mua sản phẩm mới có thể đánh giá",
      );
      return;
    }

    setCommentError("");
    setShowCommentModal(true);
  };

  if (loading) {
    return <Loader label="Đang tải chi tiết sản phẩm..." />;
  }

  if (!product) {
    return <ErrorMessage message={error || "Không tìm thấy sản phẩm"} />;
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
                  Artdict
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
              <span className="font-semibold text-[#7c3f18]">{product.comment_count || 0} đánh giá</span>
              <span className="h-5 w-px bg-mist" />
              <span>{product.sold_count || 0} đã bán</span>
              <span className="h-5 w-px bg-mist" />
              <span>Còn {product.stock}</span>
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap items-end gap-4">
                <span className="text-[2.8rem] font-semibold leading-none text-[#d14d1f] md:text-[3.2rem]">
                  {formatCurrency(product.price)}
                </span>
                <span className="rounded-full bg-[#fff0e8] px-3 py-1 text-sm font-semibold text-[#7c3f18]">
                  Thanh toán an toàn qua thẻ
                </span>
              </div>

              <div className="grid gap-5">
                <div className="grid gap-3 md:grid-cols-[120px,1fr]">
                  <p className="text-sm font-medium text-slate-500">Nhà thiết kế</p>
                  {product.author_name ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-[#edf5fd] px-4 py-2 text-sm font-semibold text-tide">
                        {product.author_name}
                      </span>
                      <Link
                        to={`/artists/${product.author_slug}`}
                        className="text-sm font-semibold text-[#7c3f18] underline decoration-[#d9c1a7] underline-offset-4"
                      >
                        Xem hồ sơ
                      </Link>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">Sản phẩm này chưa gắn với hồ sơ designer.</p>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-[120px,1fr]">
                  <p className="text-sm font-medium text-slate-500">Giao nhận</p>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p>Đơn hàng được xác nhận sau khi thanh toán và chuyển sang khâu xử lý/giao nhận.</p>
                    <p className="font-semibold text-[#2f7c65]">Phí giao hàng được hiển thị ở bước thanh toán</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-[120px,1fr]">
                  <p className="text-sm font-medium text-slate-500">Số lượng</p>
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
                    <span className="text-sm text-slate-500">Tồn kho {product.stock} sản phẩm</span>
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
                  {added ? "Đã thêm vào giỏ" : "Thêm vào giỏ"}
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="min-w-[220px] rounded-full bg-[#d14d1f] px-6 py-4 text-lg font-semibold text-white transition hover:bg-[#b93f17]"
                >
                  Mua ngay
                </button>
              </div>
            ) : (
              <div className="pt-4 md:pt-6">
                <Link
                  to="/login"
                  className="inline-flex min-w-[240px] items-center justify-center rounded-full bg-ink px-6 py-4 text-lg font-semibold text-white"
                >
                  Đăng nhập để mua
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
          <h2 className="text-[1.45rem] font-semibold uppercase tracking-[0.02em] text-ink">Thông tin sản phẩm</h2>
        </div>

        <div className="mt-8 space-y-8 text-sm md:text-base">
          <div className="grid gap-8 md:grid-cols-[220px,1fr]">
            <p className="text-slate-400">Danh mục</p>
            <div className="font-medium text-ink">{product.category_name}</div>
          </div>
          <div className="grid gap-8 md:grid-cols-[220px,1fr]">
            <p className="text-slate-400">Tồn kho</p>
            <div className="font-medium text-ink">{product.stock > 0 ? "Còn hàng" : "Hết hàng"}</div>
          </div>
          <div className="grid gap-8 md:grid-cols-[220px,1fr]">
            <p className="text-slate-400">Số lượng đã bán</p>
            <div className="font-medium text-ink">{product.sold_count || 0}</div>
          </div>
          <div className="grid gap-8 md:grid-cols-[220px,1fr]">
            <p className="text-slate-400">Đánh giá</p>
            <div className="font-medium text-ink">{product.comment_count || 0} đánh giá</div>
          </div>
        </div>

        <div className="mt-10 border-t border-[#eadfd3] pt-8">
          <div className="rounded-[8px] border border-[#eadfd3] bg-[#faf6f1] px-6 py-4">
            <h2 className="text-[1.45rem] font-semibold uppercase tracking-[0.02em] text-ink">Mô tả sản phẩm</h2>
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
              <p className="text-sm uppercase tracking-[0.24em] text-tide">Đánh giá khách hàng</p>
              <h2 className="mt-2 font-display text-[2.1rem] text-ink md:text-[2.45rem]">Mọi người nói gì về sản phẩm này</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-mist bg-[#fbfaf8] px-4 py-2 text-sm font-semibold text-slate-500">
                {comments.length} đánh giá đã hiển thị
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
                    ? "Đang kiểm tra quyền đánh giá..."
                    : commentPermission?.canComment
                      ? "Viết đánh giá"
                      : commentPermission?.hasCommented
                        ? "Đã gửi đánh giá"
                        : "Cần mua hàng để đánh giá"}
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <div className="rounded-full bg-[#f7f1e8] px-4 py-2 text-[#6f513f]">
              Chỉ người mua đã xác minh mới được đăng một đánh giá cho mỗi sản phẩm
            </div>
            <div className="rounded-full bg-[#edf5fd] px-4 py-2 text-[#3e658c]">
              Hỗ trợ đính kèm liên kết ảnh hoặc video
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
                          {formatShortDate(comment.created_at)}
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
                        alt="Tệp đính kèm đánh giá"
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
                Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ trải nghiệm.
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
                <p className="text-sm uppercase tracking-[0.24em] text-moss">Viết đánh giá</p>
                <h2 className="mt-2 font-display text-[2.1rem] text-ink md:text-[2.45rem]">Chia sẻ trải nghiệm của bạn</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Người mua đã xác minh có thể để lại một đánh giá cho mỗi sản phẩm, tối đa 500 ký tự và
                  có thể đính kèm liên kết ảnh hoặc video.
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
                Đóng
              </button>
            </div>

            <form onSubmit={submitComment} className="mt-6 rounded-[28px] border border-mist bg-white p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-moss">Nội dung đánh giá</p>
              <textarea
                rows="5"
                maxLength={500}
                value={commentState.content}
                onChange={(event) =>
                  setCommentState((current) => ({ ...current, content: event.target.value }))
                }
                placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này..."
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
                  <option value="">Không có tệp</option>
                  <option value="image">Ảnh</option>
                  <option value="video">Video</option>
                </select>
                <input
                  type="url"
                  value={commentState.media_url}
                  onChange={(event) =>
                    setCommentState((current) => ({ ...current, media_url: event.target.value }))
                  }
                  placeholder="Dán liên kết ảnh hoặc video"
                  className="rounded-full border border-mist bg-[#fffaf4] px-4 py-3 outline-none"
                />
              </div>
              {commentError ? (
                <div className="mt-4">
                  <ErrorMessage message={commentError} />
                </div>
              ) : null}
              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="text-sm text-slate-500">Mỗi người mua được đánh giá một lần. Đánh giá sẽ hiển thị công khai sau khi gửi.</div>
                <button
                  type="submit"
                  disabled={commentSubmitting}
                  className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {commentSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
};
