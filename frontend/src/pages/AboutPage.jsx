import { Link } from "react-router-dom";

const values = [
  {
    title: "Curated products",
    description:
      "We focus on a smaller catalog with stronger storytelling, clearer quality signals, and cleaner product selection.",
  },
  {
    title: "Trusted checkout",
    description:
      "Payments move through Stripe and only enter fulfillment after the system confirms payment success.",
  },
  {
    title: "Artist visibility",
    description:
      "Every product can be tied to an artist so shoppers can discover the people behind the collection.",
  },
];

export const AboutPage = () => (
  <section className="space-y-8">
    <div className="rounded-[40px] border border-white/60 bg-white/88 p-8 shadow-float lg:p-10">
      <p className="text-sm uppercase tracking-[0.3em] text-moss">About us</p>
      <h1 className="mt-4 max-w-4xl font-display text-[2.8rem] leading-tight text-ink md:text-[4rem]">
        A calmer commerce experience built around trust, creators, and clarity.
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
        Artdict is a modern marketplace-style storefront where customers can explore curated
        products, understand the artist behind each product, and move through a transparent payment
        flow from cart to confirmed order.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
          Back to home
        </Link>
        <Link to="/artists" className="rounded-full border border-mist px-5 py-3 text-sm font-semibold text-ink">
          Meet our artists
        </Link>
      </div>
    </div>

    <div className="grid gap-6 md:grid-cols-3">
      {values.map((value) => (
        <article key={value.title} className="rounded-[28px] border border-white/60 bg-white/88 p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.22em] text-tide">{value.title}</p>
          <p className="mt-4 text-sm leading-7 text-slate-600">{value.description}</p>
        </article>
      ))}
    </div>
  </section>
);
