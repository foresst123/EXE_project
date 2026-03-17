import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { Loader } from "../components/Loader";

const flattenEvents = (payload) => {
  const hero = Array.isArray(payload?.hero) ? payload.hero : [];
  const side = Array.isArray(payload?.side) ? payload.side : [];

  return [...hero, ...side].sort((first, second) => {
    if (first.slot === second.slot) {
      return Number(first.sort_order || 0) - Number(second.sort_order || 0);
    }

    return first.slot === "hero" ? -1 : 1;
  });
};

export const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get("/events");
        setEvents(flattenEvents(data));
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  if (loading) {
    return <Loader label="Loading events..." />;
  }

  return (
    <section className="space-y-8  md:px-4 xl:px-10 2xl:px-16">
      <div className="border-b border-[#e8ddd2] pb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-tide">Events</p>
        <h1 className="mt-4 max-w-4xl text-[2.8rem] font-semibold leading-[1.02] text-ink md:text-[3.8rem]">
          Event stories and storefront campaigns
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Browse the latest campaign stories in a cleaner editorial list, then open each article for the full event page.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {events.length ? (
        <div className="divide-y px-4 divide-[#e8ddd2]">
          {events.map((event, index) => (
            <Link
              key={event.id}
              to={`/events/${event.slug}`}
              className="grid gap-6 py-6 transition md:grid-cols-[260px,1fr] md:items-start lg:grid-cols-[320px,1fr] lg:gap-8"
            >
              <img
                src={event.banner_image_url}
                alt={event.title}
                className="h-48 w-full rounded-[18px] object-cover md:h-44"
              />
              <div className="space-y-3 md:pt-1">
                <h2
                  className={`leading-tight text-ink transition ${
                    index === 0 ? "text-[2.35rem] font-semibold" : "text-[2rem] font-medium"
                  }`}
                >
                  {event.title}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                  <span className="font-semibold uppercase tracking-[0.16em] text-tide">
                    {event.eyebrow || "Store event"}
                  </span>
                  {event.subtitle ? <span>{event.subtitle}</span> : null}
                  <span>{event.slot === "hero" ? "Main event" : "Supporting event"}</span>
                </div>
                <p className="max-w-4xl text-base leading-8 text-slate-600">
                  {event.summary || event.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-[32px] bg-white/92 p-8 text-slate-600 shadow-card">
          No events available yet.
        </div>
      )}
    </section>
  );
};
