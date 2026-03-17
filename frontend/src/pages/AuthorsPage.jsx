import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { Loader } from "../components/Loader";

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
        setError(requestError.response?.data?.message || "Failed to load authors");
      } finally {
        setLoading(false);
      }
    };

    loadAuthors();
  }, []);

  if (loading) {
    return <Loader label="Loading artists..." />;
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[40px] border border-white/60 bg-white/88 p-8 shadow-float">
        <p className="text-sm uppercase tracking-[0.3em] text-tide">Artists</p>
        <h1 className="mt-4 font-display text-[2.8rem] text-ink md:text-[3.8rem]">Meet the artists behind the catalog</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Browse the people shaping the collection. Open any artist profile to see their products and story.
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
              <img src={author.avatar_url} alt={author.name} className="h-full w-full object-cover" />
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
