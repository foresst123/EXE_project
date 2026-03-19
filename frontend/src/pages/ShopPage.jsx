import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { Loader } from "../components/Loader";
import { ProductCard } from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
    <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="11" cy="11" r="6.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FilterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
    <path
      d="M4 6h16M7 12h10M10 18h4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
    <path d="M19 12H5m0 0 5.5-5.5M5 12l5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FilterOption = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-[18px] px-2 py-2.5 text-left transition ${
      active ? "text-[#d14d1f]" : "text-slate-700 hover:text-ink"
    }`}
  >
    <span
      className={`grid h-5 w-5 place-items-center rounded-md border transition ${
        active ? "border-[#d14d1f] bg-[#fff1e8]" : "border-[#ddd2c6] bg-white"
      }`}
    >
      {active ? <span className="h-2.5 w-2.5 rounded-sm bg-[#d14d1f]" /> : null}
    </span>
    <span className="text-[0.98rem] font-medium">{children}</span>
  </button>
);

export const ShopPage = () => {
  const navigate = useNavigate();
  const initialParams = new URLSearchParams(window.location.search);
  const initialSearch = initialParams.get("search") || "";
  const initialCategories = (initialParams.get("category") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const initialAuthors = (initialParams.get("author") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [sortBy, setSortBy] = useState("relevant");
  const [filters, setFilters] = useState({
    search: initialSearch,
    category: initialCategories,
    author: initialAuthors,
    page: 1,
  });
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentlyAddedId, setRecentlyAddedId] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/products", {
        params: {
          page: filters.page,
          search: filters.search,
          category: filters.category.join(","),
          author: filters.author.join(","),
          limit: 20,
        },
      });
      setProducts(data.items);
      setCategories(data.categories);
      setAuthors(data.authors);
      setPagination(data.pagination);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const onSearchSubmit = (event) => {
    event.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleAdd = async (product) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await addToCart({ productId: product.id, quantity: 1, productName: product.name });
      setRecentlyAddedId(product.id);
      window.setTimeout(() => setRecentlyAddedId(null), 1600);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Không thể thêm vào giỏ hàng");
    }
  };

  const activeFilters = useMemo(
    () =>
      [
        filters.search ? `Từ khóa: ${filters.search}` : null,
        ...filters.category.map((category) => `Danh mục: ${category}`),
        ...filters.author.map(
          (authorSlug) =>
            `Nhà thiết kế: ${authors.find((author) => author.slug === authorSlug)?.name || authorSlug}`,
        ),
      ].filter(Boolean),
    [authors, filters.author, filters.category, filters.search],
  );

  const toggleFilterValue = (group, value) => {
    setFilters((prev) => {
      const currentValues = prev[group];
      const hasValue = currentValues.includes(value);

      return {
        ...prev,
        [group]: hasValue ? currentValues.filter((item) => item !== value) : [...currentValues, value],
        page: 1,
      };
    });
  };

  const sortedProducts = [...products].sort((first, second) => {
    if (sortBy === "newest") {
      return Number(second.id) - Number(first.id);
    }

    if (sortBy === "best-selling") {
      return Number(second.sold_count || 0) - Number(first.sold_count || 0);
    }

    if (sortBy === "price-low-high") {
      return Number(first.price) - Number(second.price);
    }

    if (sortBy === "price-high-low") {
      return Number(second.price) - Number(first.price);
    }

    return Number(second.sold_count || 0) - Number(first.sold_count || 0);
  });

  return (
    <section className="space-y-8">
      <header className="border-b border-[#eadfd3] pb-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="grid h-11 w-11 place-items-center rounded-2xl bg-[linear-gradient(135deg,_#541c4a_0%,_#101933_100%)] text-[0.78rem] font-bold text-white shadow-lg"
              >
                ART
              </Link>
              <Link to="/" className="font-display text-[2rem] font-semibold tracking-tight text-ink">
                Artdict
              </Link>
            </div>

            <div className="flex items-center xl:justify-end">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-[#e6d8ca] bg-[#fffaf5] px-4 py-2.5 text-sm font-semibold text-[#342923] transition hover:border-[#d14d1f] hover:text-[#d14d1f]"
              >
                <ArrowLeftIcon />
                <span>Về trang chủ</span>
              </Link>
            </div>
          </div>

          <form onSubmit={onSearchSubmit} className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-full border border-[#e7dacd] bg-[linear-gradient(180deg,_rgba(255,255,255,0.78)_0%,_rgba(255,248,242,0.94)_100%)] px-5 py-3 shadow-[0_14px_35px_rgba(23,19,15,0.07)] backdrop-blur-sm transition focus-within:border-[#d14d1f] focus-within:shadow-[0_16px_40px_rgba(209,77,31,0.12)]">
              <span className="text-[#8e7a69]">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Tìm sản phẩm, nhà thiết kế hoặc bộ sưu tập..."
                className="w-full bg-transparent text-[1rem] font-medium text-ink outline-none placeholder:text-[#97a1ae]"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>
            <button type="submit" className="rounded-full bg-clay px-7 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(200,93,37,0.22)]">
              Tìm kiếm
            </button>
          </form>
        </div>
      </header>

      {error && <ErrorMessage message={error} />}

      <div className="grid gap-8 xl:grid-cols-6">
        <aside className="xl:col-span-1">
          <div className="sticky top-6 space-y-8">
            <div className="flex items-center gap-3">
              <span className="text-[#d14d1f]">
                <FilterIcon />
              </span>
              <p className="text-[1.25rem] font-semibold text-ink">Bộ lọc tìm kiếm</p>
            </div>

            <div className="space-y-6">
              <div className="border-b border-[#eadfd3] pb-6">
                <div className="flex items-center justify-between">
                  <p className="text-[1.05rem] font-semibold text-ink">Từ khóa</p>
                  {filters.search ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput("");
                        setFilters((prev) => ({ ...prev, search: "", page: 1 }));
                      }}
                      className="text-sm font-semibold text-[#d14d1f]"
                    >
                      Xóa
                    </button>
                  ) : null}
                </div>
                <p className="mt-3 text-[0.96rem] leading-7 text-slate-500">
                  {filters.search
                    ? `Đang hiển thị kết quả cho "${filters.search}"`
                    : "Dùng ô tìm kiếm phía trên để thu hẹp danh sách sản phẩm."}
                </p>
              </div>

              <div className="border-b border-[#eadfd3] pb-6">
                <p className="text-[1.05rem] font-semibold text-ink">Danh mục</p>
                <div className="mt-4 space-y-1">
                  <FilterOption
                    active={filters.category.length === 0}
                    onClick={() => setFilters((prev) => ({ ...prev, category: [], page: 1 }))}
                  >
                    Tất cả danh mục
                  </FilterOption>
                  {categories.map((category) => (
                    <FilterOption
                      key={category.id}
                      active={filters.category.includes(category.name)}
                      onClick={() => toggleFilterValue("category", category.name)}
                    >
                      {category.name}
                    </FilterOption>
                  ))}
                </div>
              </div>

              <div className="border-b border-[#eadfd3] pb-6">
                <p className="text-[1.05rem] font-semibold text-ink">Nhà thiết kế</p>
                <div className="mt-4 space-y-1">
                  <FilterOption
                    active={filters.author.length === 0}
                    onClick={() => setFilters((prev) => ({ ...prev, author: [], page: 1 }))}
                  >
                    Tất cả designer
                  </FilterOption>
                  {authors.map((author) => (
                    <FilterOption
                      key={author.id}
                      active={filters.author.includes(author.slug)}
                      onClick={() => toggleFilterValue("author", author.slug)}
                    >
                      {author.name}
                    </FilterOption>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[1.05rem] font-semibold text-ink">Làm mới nhanh</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setFilters({ search: "", category: [], author: [], page: 1 });
                  }}
                  className="rounded-full border border-[#e6d8ca] px-5 py-2.5 text-sm font-semibold text-[#342923] transition hover:border-[#d14d1f] hover:text-[#d14d1f]"
                >
                  Xóa toàn bộ bộ lọc
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-6 xl:col-span-5">
          <div className="border-b border-[#eadfd3] pb-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-tide">Kết quả tìm kiếm</p>
                <h2 className="mt-2 text-[1.85rem] font-semibold text-ink md:text-[2rem]">
                  {activeFilters.length ? "Sản phẩm đã lọc" : "Toàn bộ sản phẩm trên Artdict"}
                </h2>
              </div>
              <div className="rounded-full border border-[#e7dacd] bg-[#fbfaf8] px-4 py-2 text-sm font-semibold text-slate-500">
                {pagination.total} sản phẩm
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-2">
                {activeFilters.length ? (
                  activeFilters.map((filter) => (
                    <span
                      key={filter}
                      className="rounded-full border border-[#e7dacd] bg-[#fbfaf8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
                    >
                      {filter}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full border border-[#e7dacd] bg-[#fbfaf8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Trang {pagination.page} / {pagination.totalPages}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Sắp xếp</span>
                <button
                  type="button"
                  onClick={() => setSortBy("relevant")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${sortBy === "relevant" ? "bg-clay text-white" : "bg-white text-ink"}`}
                >
                  Phù hợp
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("newest")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${sortBy === "newest" ? "bg-clay text-white" : "bg-white text-ink"}`}
                >
                  Mới nhất
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("best-selling")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${sortBy === "best-selling" ? "bg-clay text-white" : "bg-white text-ink"}`}
                >
                  Bán chạy
                </button>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="rounded-full border border-mist bg-white px-4 py-2 text-sm font-semibold text-ink outline-none"
                >
                  <option value="relevant">Mặc định</option>
                  <option value="price-low-high">Giá: thấp đến cao</option>
                  <option value="price-high-low">Giá: cao đến thấp</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <Loader label="Đang tải sản phẩm..." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAdd}
                  isAdded={recentlyAddedId === product.id}
                  compact
                  canAddToCart={Boolean(user)}
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between rounded-[28px] border border-white/60 bg-white/85 px-5 py-4 shadow-card">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
              className="rounded-full border border-mist px-4 py-2 font-semibold disabled:opacity-40"
            >
              Trước
            </button>
            <span className="text-sm text-slate-500">
              Trang {pagination.page} / {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
              className="rounded-full border border-mist px-4 py-2 font-semibold disabled:opacity-40"
            >
              Tiếp
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
