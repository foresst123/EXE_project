import { Link } from "react-router-dom";

export const AuthShell = ({ eyebrow, title, subtitle, footerText, footerLink, footerLabel, children }) => (
  <section className="mx-auto max-w-5xl space-y-10 py-6">
    <header className="flex items-center justify-center md:justify-start">
      <Link to="/" className="inline-flex items-center">
        <img src="/artdict-logo.png" alt="Artdict logo" className="h-16 w-auto object-contain" />
      </Link>
    </header>

    <div className="mx-auto max-w-md rounded-[32px] bg-white/90 p-8 shadow-card">
      <p className="text-sm uppercase tracking-[0.3em] text-moss">{eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl">{title}</h1>
      {subtitle ? <p className="mt-3 text-sm leading-7 text-slate-500">{subtitle}</p> : null}
      {children}
      <p className="mt-5 text-sm text-slate-500">
        {footerText} <Link to={footerLink} className="text-clay">{footerLabel}</Link>
      </p>
    </div>

    <footer className="border-t border-[#eadfd3] pt-6 text-center text-sm text-[#7b6a5f]">
      <p>Artdict</p>
      <p className="mt-1">hello@artdict.vn</p>
    </footer>
  </section>
);
