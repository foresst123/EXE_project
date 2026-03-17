import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { Loader } from "../components/Loader";
import { ProductCard } from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export const AuthorPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentlyAddedId, setRecentlyAddedId] = useState(null);

  useEffect(() => {
    const loadAuthor = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/authors/${slug}`);
        setAuthor(data);
        setError("");
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load artist");
      } finally {
        setLoading(false);
      }
    };

    loadAuthor();
  }, [slug]);

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
      setError(requestError.response?.data?.message || "Failed to add to cart");
    }
  };

  if (loading) {
    return <Loader label="Loading artist profile..." />;
  }

  if (!author) {
    return <ErrorMessage message={error || "Artist not found"} />;
  }

  return (
    <section className="space-y-8">
      <div className="grid gap-6 rounded-[38px] border border-white/60 bg-white/88 p-8 shadow-float lg:grid-cols-[220px,1fr]">
        <img
          src={author.avatar_url}
          alt={author.name}
          className="h-52 w-52 rounded-[28px] object-cover"
        />
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.28em] text-tide">Artist spotlight</p>
          <h1 className="font-display text-[2.8rem] text-ink md:text-[3.8rem]">{author.name}</h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-600">{author.bio}</p>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-[#edf5fd] px-4 py-2 text-sm font-semibold text-tide">
              {author.product_count} products
            </span>
            <Link to="/" className="rounded-full border border-mist px-4 py-2 text-sm font-semibold text-ink">
              Back to home
            </Link>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-moss">By this artist</p>
          <h2 className="mt-2 font-display text-[2.1rem] text-ink md:text-[2.45rem]">Products from {author.name}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {author.products.map((product) => (
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
      </div>
    </section>
  );
};
