import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { CartToast } from "../components/CartToast";
import { ChatbotWidget } from "../components/ChatbotWidget";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const UserAvatarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
    <path
      d="M12 12.2a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 20c1.7-3.2 4.1-4.8 7-4.8s5.3 1.6 7 4.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
    <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
    <path d="M10 7V5.8c0-.99.81-1.8 1.8-1.8h5.4c.99 0 1.8.81 1.8 1.8v12.4c0 .99-.81 1.8-1.8 1.8h-5.4c-.99 0-1.8-.81-1.8-1.8V17" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 12H4m0 0 3-3m-3 3 3 3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.8">
    <path
      d="M3.5 5h2l1.7 9.2a1.2 1.2 0 0 0 1.18.98h8.86a1.2 1.2 0 0 0 1.18-.95L20 8H6.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="19" r="1.5" />
    <circle cx="17" cy="19" r="1.5" />
  </svg>
);

export const MainLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { cart, cartNotice, clearCartNotice } = useCart();
  const [isFloating, setIsFloating] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const isSearchPage = location.pathname === "/shop";
  const isAccountPage = location.pathname === "/account";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isStandalonePage = isSearchPage || isAccountPage || isAuthPage;
  const cartItemCount = cart.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const brandTextClass = "text-[#17120e]";
  const secondaryTextClass = "text-[#342923]";
  const navItemClass = (isActive) =>
    `px-1 py-1 transition ${
      isActive
        ? "text-[1.2rem] font-bold text-[#7c3f18]"
        : "text-[1.06rem] font-semibold text-[#3b2f29] hover:text-[1.1rem] hover:font-bold hover:text-[#111827]"
    }`;

  useEffect(() => {
    if (isStandalonePage) {
      setIsFloating(false);
      return undefined;
    }

    const handleScroll = () => {
      setIsFloating(window.scrollY > 180);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isStandalonePage]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!profileRef.current?.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (isFloating) {
      setProfileOpen(false);
    }
  }, [isFloating]);

  return (
    <div className="min-h-screen text-ink">
      {!isStandalonePage ? (
        <header
          className="sticky top-0 z-30 px-4 pt-4 transition-all delay-[90ms] duration-[1150ms] ease-[cubic-bezier(0.23,0.82,0.2,1)] md:px-6"
        >
          <div
            className={`mx-auto transition-all delay-[90ms] duration-[1150ms] ease-[cubic-bezier(0.23,0.82,0.2,1)] ${
              isFloating ? "nav-shell-floating px-0" : "nav-shell px-0"
            }`}
          >
            <div
              className={`rounded-[40px] px-7 py-3 transition-all delay-[90ms] duration-[1150ms] ease-[cubic-bezier(0.23,0.82,0.2,1)] ${
                isFloating
                  ? "border border-white/16 bg-[#17130f]/96 shadow-float backdrop-blur"
                  : "border border-transparent bg-[#17130f]/88 shadow-none"
              }`}
            >
              <div className="grid grid-cols-[1fr_auto_1fr] items-center">
                <div className="flex items-center gap-3 justify-self-start transition-all delay-[90ms] duration-[1150ms] ease-[cubic-bezier(0.23,0.82,0.2,1)]">
                  <Link
                    to="/"
                    className="grid h-9 w-9 place-items-center rounded-2xl bg-[linear-gradient(135deg,_#541c4a_0%,_#101933_100%)] text-[0.7rem] font-bold text-white shadow-lg transition-all delay-[90ms] duration-[1150ms] ease-[cubic-bezier(0.23,0.82,0.2,1)]"
                  >
                    ART
                  </Link>

                  <div className="overflow-hidden transition-all delay-[90ms] duration-[1150ms] ease-[cubic-bezier(0.23,0.82,0.2,1)]">
                    {isFloating ? (
                      <span className={`text-[1.8rem] font-semibold leading-none ${brandTextClass}`}>|</span>
                    ) : (
                      <Link
                        to="/"
                        className={`font-display text-[2.15rem] font-semibold leading-none tracking-tight ${brandTextClass}`}
                      >
                        Artdict
                      </Link>
                    )}
                  </div>
                </div>

                <nav
                  className="hidden items-center justify-center gap-7 transition-all delay-[90ms] duration-[1150ms] ease-[cubic-bezier(0.23,0.82,0.2,1)] xl:flex"
                >
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) => navItemClass(isActive)}
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/events"
                    className={({ isActive }) => navItemClass(isActive)}
                  >
                    Events
                  </NavLink>
                  <NavLink
                    to="/artists"
                    className={({ isActive }) => navItemClass(isActive)}
                  >
                    Artists
                  </NavLink>
                  {user?.role === "admin" && (
                    <NavLink
                      to="/admin"
                      className={({ isActive }) => navItemClass(isActive)}
                    >
                      Admin
                    </NavLink>
                  )}
                  <NavLink
                    to="/about"
                    className={({ isActive }) => navItemClass(isActive)}
                  >
                    About
                  </NavLink>
                </nav>

                <div className="flex items-center gap-2 justify-self-end transition-all delay-[90ms] duration-[1150ms] ease-[cubic-bezier(0.23,0.82,0.2,1)]">
                  {user ? (
                    <NavLink
                      to="/cart"
                      className={({ isActive }) =>
                        `relative inline-flex items-center rounded-full px-4 py-2 text-[0.96rem] font-semibold transition ${
                          isActive
                            ? "bg-[#f3e7db] text-[#7c3f18]"
                            : "text-[#17120e] hover:bg-black/5"
                        }`
                      }
                      aria-label="Cart"
                    >
                      <CartIcon />
                      {cartItemCount > 0 ? (
                        <span className="absolute -right-0 top-0 inline-flex h-5 min-w-[1.3rem] items-center justify-center rounded-[999px] bg-clay px-1 text-[0.68rem] font-bold leading-none text-white shadow-[0_6px_14px_rgba(200,93,37,0.28)]">
                          {cartItemCount}
                        </span>
                      ) : null}
                    </NavLink>
                  ) : null}
                  {user ? (
                    <div className="relative" ref={profileRef}>
                      <button
                        type="button"
                        onClick={() => setProfileOpen((current) => !current)}
                        className={`flex items-center gap-2 rounded-full px-1 py-1 transition ${
                          "text-[#17120e] hover:bg-black/5"
                        }`}
                      >
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f2eee9] text-[#17130f]">
                          <UserAvatarIcon />
                        </span>
                        <span className={`hidden text-[0.95rem] font-medium xl:inline-flex ${secondaryTextClass}`}>{user.name}</span>
                        <span className={secondaryTextClass}>
                          <ChevronDownIcon />
                        </span>
                      </button>

                      {profileOpen ? (
                        <div className="absolute right-0 top-[calc(100%+14px)] w-[340px] rounded-[30px] border border-white/70 bg-[#fffaf4] p-4 text-[#17120e] shadow-[0_24px_70px_rgba(29,23,18,0.18)]">
                          <div className="px-3 pb-3">
                            <p className="text-[1.55rem] font-semibold text-[#17120e]">{user.name}</p>
                            <p className="mt-1 truncate text-sm text-[#7b6a5f]">{user.email || "Signed in account"}</p>
                          </div>
                          <div className="h-px bg-[#eadfd3]" />
                          <div className="mt-2">
                            <NavLink
                              to="/account"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center justify-between rounded-[18px] px-3 py-3 text-[1rem] font-medium text-[#221a15] transition hover:bg-[#f3e7db]"
                            >
                              <span>My account</span>
                              <span className="text-[#8b7768]">›</span>
                            </NavLink>
                            <NavLink
                              to="/cart"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center justify-between rounded-[18px] px-3 py-3 text-[1rem] font-medium text-[#221a15] transition hover:bg-[#f3e7db]"
                            >
                              <span>Cart</span>
                              <span className="text-[#8b7768]">›</span>
                            </NavLink>
                            <NavLink
                              to="/orders"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center justify-between rounded-[18px] px-3 py-3 text-[1rem] font-medium text-[#221a15] transition hover:bg-[#f3e7db]"
                            >
                              <span>Order history</span>
                              <span className="text-[#8b7768]">›</span>
                            </NavLink>
                            {user.role === "admin" ? (
                              <NavLink
                                to="/admin"
                                onClick={() => setProfileOpen(false)}
                                className="flex items-center justify-between rounded-[18px] px-3 py-3 text-[1rem] font-medium text-[#221a15] transition hover:bg-[#f3e7db]"
                              >
                                <span>Admin dashboard</span>
                                <span className="text-[#8b7768]">›</span>
                              </NavLink>
                            ) : null}
                            <Link
                              to="/about"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center justify-between rounded-[18px] px-3 py-3 text-[1rem] font-medium text-[#221a15] transition hover:bg-[#f3e7db]"
                            >
                              <span>Help and support</span>
                              <span className="text-[#8b7768]">›</span>
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                setProfileOpen(false);
                                logout();
                              }}
                              className="flex w-full items-center justify-between rounded-[18px] px-3 py-3 text-left text-[1rem] font-medium text-[#221a15] transition hover:bg-[#f3e7db]"
                            >
                              <span className="flex items-center gap-3">
                                <span className="text-[#6f513f]">
                                  <LogoutIcon />
                                </span>
                                <span>Logout</span>
                              </span>
                              <span className="text-[#8b7768]">›</span>
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <>
                      <NavLink
                        to="/login"
                        className={`rounded-full border border-white/16 bg-white/10 px-4 py-2 text-[0.98rem] font-medium transition hover:bg-white/14 ${
                          "text-[#17120e]"
                        }`}
                      >
                        Login
                      </NavLink>
                      <NavLink
                        to="/register"
                        className="rounded-full bg-[#f2eee9] px-4 py-2 text-[0.98rem] font-medium text-[#17130f] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      >
                        Sign up
                      </NavLink>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
      ) : null}

      <main className={isStandalonePage ? "app-shell-wide px-4 pb-14 pt-6 md:px-6" : "app-shell px-2 pb-14 pt-8 md:px-3 md:pt-5"}>
        <Outlet />
      </main>

      {!isStandalonePage ? (
        <footer className="mt-8 border-t border-[#eadfd3] bg-[#fbf7f2]">
          <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
            <div className="flex flex-col items-center gap-4 text-center text-sm text-slate-600">
              <p className="font-display text-2xl text-ink">Artdict</p>
              <p>Email: <a href="mailto:support@artdict.local" className="font-semibold text-[#111827]">support@artdict.local</a></p>
              <p>Hotline: <span className="font-semibold text-[#111827]">1900 0000</span></p>
              <p>Address: <span className="font-semibold text-[#111827]">Ho Chi Minh City, Vietnam</span></p>
            </div>

            <div className="mt-8 border-t border-[#eadfd3] pt-6 text-center text-sm text-[#7b6a5f]">
              <p>© 2026 Artdict. All rights reserved.</p>
            </div>
          </div>
        </footer>
      ) : null}

      <CartToast notice={cartNotice} onClose={clearCartNotice} />
      {!isAuthPage ? <ChatbotWidget /> : null}
    </div>
  );
};
