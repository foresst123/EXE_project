import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { Loader } from "../components/Loader";
import { ProductCard } from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { slugify } from "../utils/slugify";

const buildCategoryShelves = (products, categories) =>
  categories
    .map((category) => {
      const categoryProducts = products.filter((product) => product.category_name === category.name);
      const shuffledItems = [...categoryProducts].sort(() => Math.random() - 0.5);
      const sampleSize = shuffledItems.length > 1 ? (Math.random() > 0.5 ? 2 : 1) : 1;
      const items = shuffledItems.slice(0, sampleSize);

      return {
        ...category,
        items,
      };
    })
    .filter((category) => category.items.length)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

const buildCategoryHighlights = (products, categories) =>
  categories
    .map((category) => {
      const items = products.filter((product) => product.category_name === category.name);
      return {
        ...category,
        coverImage: items[0]?.image_url,
        productCount: items.length,
        soldCount: items.reduce((sum, product) => sum + Number(product.sold_count || 0), 0),
      };
    })
    .filter((category) => category.coverImage)
    .sort((first, second) => second.productCount - first.productCount || second.soldCount - first.soldCount);

const buildFallbackEvents = (products) => {
  const ranked = [...products]
    .sort((first, second) => Number(second.sold_count || 0) - Number(first.sold_count || 0))
    .slice(0, 6);

  const heroPresets = [
    {
      eyebrow: "Weekend event",
      subtitle: "Top deals moving now",
      description: "The main event banner rotates through key promotions while the smaller right-side cards stay fixed.",
    },
    {
      eyebrow: "Featured drop",
      subtitle: "Fresh picks to check",
      description: "Use the lead area to spotlight products that deserve the first click on the homepage.",
    },
    {
      eyebrow: "Fast movers",
      subtitle: "Popular this week",
      description: "A cleaner event layout that feels promotional without overwhelming the rest of the page.",
    },
    {
      eyebrow: "Limited highlight",
      subtitle: "Category push",
      description: "A compact promotional slot built for category pushes, weekend deals, or new drops.",
    },
  ];

  const sidePresets = [
    {
      eyebrow: "Shipping perk",
      subtitle: "Free delivery focus",
      description: "A fixed side banner for shipping or store-wide perks.",
    },
    {
      eyebrow: "Store pick",
      subtitle: "Creator picks this week",
      description: "A second fixed side banner for weekly curated products.",
    },
  ];

  return {
    hero: ranked.slice(0, 4).map((product, index) => ({
      id: `fallback-hero-${product.id}`,
      slug: `fallback-hero-${product.id}`,
      title: product.name,
      banner_image_url: product.image_url,
      product_id: product.id,
      ...heroPresets[index % heroPresets.length],
    })),
    side: (ranked.slice(4, 6).length ? ranked.slice(4, 6) : ranked.slice(1, 3)).map((product, index) => ({
      id: `fallback-side-${product.id}`,
      slug: `fallback-side-${product.id}`,
      title: product.name,
      banner_image_url: product.image_url,
      product_id: product.id,
      ...sidePresets[index % sidePresets.length],
    })),
  };
};

const getLoopedItems = (items, startIndex, count) => {
  if (!items.length) {
    return [];
  }

  const total = Math.min(count, items.length);
  return Array.from({ length: total }, (_, index) => items[(startIndex + index) % items.length]);
};

const getEventHref = (event) => (event?.slug ? `/events/${event.slug}` : "/shop");

const HERO_SLIDE_DELAY = 120;
const HERO_SLIDE_DURATION = 760;
const heroSlideTransitionClass =
  "transition-transform duration-[760ms] ease-[cubic-bezier(0.22,1,0.36,1)]";

const EventArrowIcon = ({ direction = "next" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={`h-6 w-6 transition-transform duration-300 ${direction === "prev" ? "rotate-180" : ""}`}
    stroke="currentColor"
    strokeWidth="2.2"
  >
    <path d="M8 5.5 15 12l-7 6.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowButton = ({ onClick, label, disabled = false, direction = "next" }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-white/90 text-[#16120e] shadow-[0_14px_30px_rgba(25,18,13,0.18)] transition duration-300 hover:h-[3.35rem] hover:w-[3.35rem] hover:bg-white hover:text-[#111827] hover:shadow-[0_18px_36px_rgba(25,18,13,0.24)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:h-12 disabled:hover:w-12"
  >
    <EventArrowIcon direction={direction} />
  </button>
);

const HeroEventSlide = ({ event, className = "" }) => (
  <Link to={getEventHref(event)} className={`absolute inset-0 block ${className}`}>
    <img
      src={event.banner_image_url}
      alt={event.title}
      className="h-full w-full object-cover"
    />
    <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(10,12,18,0.88)_0%,_rgba(10,12,18,0.64)_42%,_rgba(10,12,18,0.18)_100%)]" />
    <div className="absolute left-6 top-6 z-[1] flex flex-wrap gap-2">
      {event.eyebrow ? (
        <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
          {event.eyebrow}
        </span>
      ) : null}
      {event.subtitle ? (
        <span className="rounded-full bg-[#f97316] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
          {event.subtitle}
        </span>
      ) : null}
    </div>
    <div className="absolute inset-x-0 bottom-0 z-[1] p-6 md:p-8">
      <div className="max-w-xl">
        <h1 className="text-[2.35rem] font-semibold leading-tight text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.42)] md:text-[3.1rem]">
          {event.title}
        </h1>
        {event.description ? (
          <p className="mt-4 text-base leading-7 text-white/94 drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)]">
            {event.description}
          </p>
        ) : null}
      </div>
    </div>
  </Link>
);

export const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const heroTimerRef = useRef([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [events, setEvents] = useState({ hero: [], side: [] });
  const [categoryShelves, setCategoryShelves] = useState([]);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [pendingHeroIndex, setPendingHeroIndex] = useState(null);
  const [isHeroAnimating, setIsHeroAnimating] = useState(false);
  const [heroDirection, setHeroDirection] = useState(1);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentlyAddedCardKey, setRecentlyAddedCardKey] = useState(null);

  const clearHeroTimers = () => {
    heroTimerRef.current.forEach((timerId) => window.clearTimeout(timerId));
    heroTimerRef.current = [];
  };

  const loadHome = async () => {
    setLoading(true);
    setError("");
    try {
      const [productsResponse, eventsResponse] = await Promise.all([
        api.get("/products", { params: { page: 1, limit: 48 } }),
        api.get("/events").catch(() => ({ data: { hero: [], side: [] } })),
      ]);

      const { data } = productsResponse;
      setProducts(data.items);
      setCategories(data.categories);
      setAuthors(data.authors);
      setEvents(eventsResponse.data);
      setCategoryShelves(buildCategoryShelves(data.items, data.categories));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHome();
  }, []);

  useEffect(() => {
    clearHeroTimers();
    setActiveHeroIndex(0);
    setPendingHeroIndex(null);
    setIsHeroAnimating(false);
    setCategoryIndex(0);
  }, [events.hero.length, categories.length]);

  useEffect(() => () => clearHeroTimers(), []);

  const handleAdd = async (product, cardKey) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await addToCart({ productId: product.id, quantity: 1, productName: product.name });
      setRecentlyAddedCardKey(cardKey);
      window.setTimeout(() => setRecentlyAddedCardKey(null), 1600);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to add to cart");
    }
  };

  const fallbackEvents = buildFallbackEvents(products);
  const heroEvents = events.hero.length ? events.hero : fallbackEvents.hero;
  const sideEvents = events.side.length ? events.side.slice(0, 2) : fallbackEvents.side.slice(0, 2);
  const activeHeroEvent = heroEvents.length ? heroEvents[activeHeroIndex % heroEvents.length] : null;
  const pendingHeroEvent =
    pendingHeroIndex !== null && heroEvents.length ? heroEvents[pendingHeroIndex % heroEvents.length] : null;
  const categoryHighlights = buildCategoryHighlights(products, categories);
  const visibleCategories = getLoopedItems(categoryHighlights, categoryIndex, 6);

  const bestSellingProducts = [...products]
    .sort((first, second) => Number(second.sold_count || 0) - Number(first.sold_count || 0))
    .slice(0, 6);
  const newArrivals = products.slice(0, 6);

  const getHeroDirection = (nextIndex) => {
    if (!heroEvents.length || nextIndex === activeHeroIndex) {
      return 1;
    }

    const forwardDistance = (nextIndex - activeHeroIndex + heroEvents.length) % heroEvents.length;
    const backwardDistance = (activeHeroIndex - nextIndex + heroEvents.length) % heroEvents.length;

    return forwardDistance <= backwardDistance ? 1 : -1;
  };

  const startHeroSlide = (nextIndex, direction = 1) => {
    if (
      heroEvents.length <= 1 ||
      nextIndex === activeHeroIndex ||
      pendingHeroIndex !== null ||
      isHeroAnimating
    ) {
      return;
    }

    clearHeroTimers();
    setHeroDirection(direction);
    setPendingHeroIndex(nextIndex);

    const startTimer = window.setTimeout(() => {
      setIsHeroAnimating(true);
    }, HERO_SLIDE_DELAY);

    const finishTimer = window.setTimeout(() => {
      setActiveHeroIndex(nextIndex);
      setPendingHeroIndex(null);
      setIsHeroAnimating(false);
    }, HERO_SLIDE_DELAY + HERO_SLIDE_DURATION);

    heroTimerRef.current = [startTimer, finishTimer];
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const trimmed = searchTerm.trim();
    navigate(trimmed ? `/shop?search=${encodeURIComponent(trimmed)}` : "/shop");
  };

  return (
    <section className="space-y-10">
      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loader label="Loading storefront..." />
      ) : (
        <>
          <section>
            <form onSubmit={submitSearch} className="mx-auto max-w-3xl">
              <div className="flex items-center rounded-full border border-mist bg-[#fbfaf8] px-3 py-2 shadow-[0_8px_24px_rgba(20,15,10,0.08)]">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search products, collections, or artists..."
                  className="w-full bg-transparent px-3 text-[0.98rem] font-medium text-ink outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#2a211d]"
                >
                  Search
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-[38px] bg-white/88 p-4 shadow-float md:p-5">
            <div className="grid gap-4 xl:grid-cols-[1.95fr,0.95fr]">
              <div className="relative min-h-[360px] overflow-hidden rounded-[30px] bg-[#e9dfd3]">
                {activeHeroEvent ? (
                  <>
                    <HeroEventSlide
                      key={activeHeroEvent.id}
                      event={activeHeroEvent}
                      className={`${heroSlideTransitionClass} ${
                        pendingHeroEvent
                          ? isHeroAnimating
                            ? heroDirection === 1
                              ? "-translate-x-full"
                              : "translate-x-full"
                            : "translate-x-0"
                          : "translate-x-0"
                      }`}
                    />
                    {pendingHeroEvent ? (
                      <HeroEventSlide
                        key={pendingHeroEvent.id}
                        event={pendingHeroEvent}
                        className={`${heroSlideTransitionClass} ${
                          isHeroAnimating
                            ? "translate-x-0"
                            : heroDirection === 1
                              ? "translate-x-full"
                              : "-translate-x-full"
                        }`}
                      />
                    ) : null}
                  </>
                ) : null}

                {heroEvents.length > 1 ? (
                  <>
                    <div className="absolute left-5 top-1/2 z-10 -translate-y-1/2">
                      <ArrowButton
                        onClick={() =>
                          startHeroSlide(
                            (activeHeroIndex - 1 + heroEvents.length) % heroEvents.length,
                            -1,
                          )
                        }
                        label="Show previous event"
                        direction="prev"
                        disabled={pendingHeroIndex !== null || isHeroAnimating}
                      />
                    </div>
                    <div className="absolute right-5 top-1/2 z-10 -translate-y-1/2">
                    <ArrowButton
                      onClick={() => startHeroSlide((activeHeroIndex + 1) % heroEvents.length, 1)}
                      label="Show next event"
                      disabled={pendingHeroIndex !== null || isHeroAnimating}
                    />
                    </div>
                  </>
                ) : null}

                {heroEvents.length > 1 ? (
                  <div className="absolute bottom-5 left-6 z-10 flex items-center gap-2">
                    {heroEvents.map((event, index) => (
                      <button
                        key={event.id}
                        type="button"
                        aria-label={`Open event ${index + 1}`}
                        onClick={() => startHeroSlide(index, getHeroDirection(index))}
                        disabled={pendingHeroIndex !== null || isHeroAnimating}
                        className={`h-2.5 rounded-full transition ${
                          index === activeHeroIndex ? "w-8 bg-white" : "w-2.5 bg-white/45"
                        } disabled:cursor-not-allowed`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                {sideEvents.map((event) => (
                  <Link
                    key={event.id}
                    to={getEventHref(event)}
                    className="relative min-h-[172px] overflow-hidden rounded-[26px] border border-white/60 shadow-card"
                  >
                    <img
                      src={event.banner_image_url}
                      alt={event.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(9,12,18,0.22)_0%,_rgba(9,12,18,0.82)_100%)]" />
                    <div className="relative flex h-full flex-col justify-end p-5">
                      {event.eyebrow ? (
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/82 drop-shadow-[0_4px_14px_rgba(0,0,0,0.32)]">
                          {event.eyebrow}
                        </p>
                      ) : null}
                      <h2 className="mt-3 max-w-[80%] text-2xl font-semibold leading-tight text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.42)]">
                        {event.title}
                      </h2>
                      {event.subtitle ? (
                        <p className="mt-3 text-sm leading-6 text-white/90 drop-shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
                          {event.subtitle}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[34px] bg-white/88 p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-moss">Categories</p>
              </div>
              <div className="flex items-center gap-3">
                {categoryHighlights.length > 6 ? (
                  <ArrowButton
                    onClick={() => setCategoryIndex((current) => (current + 6) % categoryHighlights.length)}
                    label="Show more categories"
                  />
                ) : null}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {visibleCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/categories/${slugify(category.name)}`}
                  className="group rounded-[22px] border border-[#efe3d8] bg-[#fffdfa] px-4 py-5 text-center transition hover:-translate-y-1 hover:shadow-card"
                >
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#f5eee7]">
                    <img
                      src={category.coverImage}
                      alt={category.name}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  </div>
              <p className="mt-4 line-clamp-2 text-sm font-semibold leading-5 text-ink">{category.name}</p>
            </Link>
          ))}
        </div>
          </section>

          <div className="space-y-10 px-2 md:px-4 xl:px-7 2xl:px-10">
            <section className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-moss">Best sellers</p>
                  <h2 className="mt-2 font-display text-[2.1rem] text-ink md:text-[2.45rem]">Products people are buying now</h2>
                </div>
                <Link to="/shop" className="rounded-full border border-mist px-4 py-2 text-sm font-semibold text-ink">
                  Shop all
                </Link>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {bestSellingProducts.map((product) => (
                  <ProductCard
                    key={`best-${product.id}`}
                    product={product}
                    onAddToCart={handleAdd}
                    isAdded={recentlyAddedCardKey === `best-${product.id}`}
                    addKey={`best-${product.id}`}
                    compact
                    canAddToCart={Boolean(user)}
                  />
                ))}
              </div>
            </section>

            <section className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-tide">Fresh arrivals</p>
                  <h2 className="mt-2 font-display text-[2.1rem] text-ink md:text-[2.45rem]">New in the catalog</h2>
                </div>
                <Link to="/shop" className="rounded-full border border-mist px-4 py-2 text-sm font-semibold text-ink">
                  View all products
                </Link>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {newArrivals.map((product) => (
                  <ProductCard
                    key={`new-${product.id}`}
                    product={product}
                    onAddToCart={handleAdd}
                    isAdded={recentlyAddedCardKey === `new-${product.id}`}
                    addKey={`new-${product.id}`}
                    compact
                    canAddToCart={Boolean(user)}
                  />
                ))}
              </div>
            </section>

            {categoryShelves.map((category) => (
              <section key={category.id} className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-tide">Category shelf</p>
                    <h2 className="mt-2 font-display text-[2.1rem] text-ink md:text-[2.45rem]">{category.name}</h2>
                  </div>
                  <Link
                    to={`/categories/${slugify(category.name)}`}
                    className="rounded-full border border-mist px-4 py-2 text-sm font-semibold text-ink"
                  >
                    View all in {category.name}
                  </Link>
                </div>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  {category.items.map((product) => (
                    <ProductCard
                      key={`${category.id}-${product.id}`}
                      product={product}
                      onAddToCart={handleAdd}
                      isAdded={recentlyAddedCardKey === `${category.id}-${product.id}`}
                      addKey={`${category.id}-${product.id}`}
                      compact
                      canAddToCart={Boolean(user)}
                    />
                  ))}
                </div>
              </section>
            ))}

            <section className="rounded-[34px] border border-white/60 bg-white/88 p-6 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-moss">Artists</p>
                  <h2 className="mt-2 font-display text-[2.1rem] text-ink md:text-[2.45rem]">People behind the products</h2>
                </div>
                <Link to="/artists" className="rounded-full border border-mist px-4 py-2 text-sm font-semibold text-ink">
                  View all artists
                </Link>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {authors.slice(0, 3).map((author) => (
                  <Link
                    key={author.id}
                    to={`/artists/${author.slug}`}
                    className="flex items-center gap-4 rounded-[24px] border border-mist bg-[#fbfaf8] px-4 py-4 transition hover:-translate-y-1"
                  >
                    <img src={author.avatar_url} alt={author.name} className="h-16 w-16 rounded-2xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink">{author.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{author.bio.slice(0, 78)}...</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </section>
  );
};
