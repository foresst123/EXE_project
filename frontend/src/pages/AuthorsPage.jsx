import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { Loader } from "../components/Loader";
import { getAvatarFallback } from "../utils/avatarFallback";

export const AuthorsPage = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAuthors = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/authors");
        setAuthors(data);
        setError("");
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Không thể tải danh sách nhà thiết kế");
      } finally {
        setLoading(false);
      }
    };

    loadAuthors();
  }, []);

  if (loading) {
    return <Loader label="Đang tải nhà thiết kế..." />;
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[40px] border border-white/60 bg-white/88 p-8 shadow-float">
        <p className="text-sm uppercase tracking-[0.3em] text-tide">Nhà thiết kế</p>
        <h1 className="mt-4 font-display text-[2.8rem] text-ink md:text-[3.8rem]">Gặp gỡ những designer đứng sau bộ sưu tập</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Mỗi hồ sơ là một không gian nhỏ để bạn xem sản phẩm, cá tính sáng tạo và định hướng nghề
          nghiệp của từng designer trên Artdict.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="grid gap-x-4 gap-y-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">
        {authors.map((author) => (
          <Link
            key={author.id}
            to={`/artists/${author.slug}`}
            className="group flex flex-col items-center gap-3 text-center"
          >
            <div className="h-24 w-24 overflow-hidden rounded-full border border-white/70 bg-white shadow-card transition duration-300 group-hover:-translate-y-1">
              <img
                src={author.avatar_url}
                alt={author.name}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = getAvatarFallback(author.name);
                }}
              />
            </div>
            <p className="text-sm font-semibold leading-6 text-ink transition group-hover:text-[#7c3f18]">
              {author.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};
