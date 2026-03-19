import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { Loader } from "../components/Loader";
import { ProductCard } from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { slugify } from "../utils/slugify";

export const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentlyAddedId, setRecentlyAddedId] = useState(null);

  useEffect(() => {
    const loadCategory = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/products", {
          params: { limit: 48 },
        });
        const matchedCategory = data.categories.find((category) => slugify(category.name) === slug);

        if (!matchedCategory) {
          setProducts([]);
          setCategoryName("");
          setError("Không tìm thấy danh mục");
          return;
        }

        const response = await api.get("/products", {
          params: { category: matchedCategory.name, limit: 48 },
        });

        setCategoryName(matchedCategory.name);
        setProducts(response.data.items);
        setError("");
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Không thể tải danh mục");
      } finally {
        setLoading(false);
      }
    };

    loadCategory();
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
      setError(requestError.response?.data?.message || "Không thể thêm vào giỏ hàng");
    }
  };

  if (loading) {
    return <Loader label="Đang tải danh mục..." />;
  }

  if (error && !products.length) {
    return <ErrorMessage message={error} />;
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[40px] border border-white/60 bg-white/88 p-8 shadow-float">
        <p className="text-sm uppercase tracking-[0.3em] text-tide">Danh mục</p>
        <h1 className="mt-4 font-display text-[2.8rem] text-ink md:text-[3.8rem]">{categoryName}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Khám phá những sản phẩm sáng tạo cùng chủ đề và đi thẳng vào trang chi tiết khi bạn muốn
          xem kỹ chất liệu, câu chuyện và nhà thiết kế phía sau.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {products.map((product) => (
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
    </section>
  );
};
