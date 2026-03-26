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
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const isSearchPage = location.pathname === "/shop";
  const isAccountPage = location.pathname === "/account";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isStandalonePage = isSearchPage || isAccountPage || isAuthPage;
  const cartItemCount = cart.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const secondaryTextClass = "text-white/92";
  const navItemClass = (isActive) =>
    `px-1 py-1 transition ${
      isActive
        ? "text-[1.22rem] font-extrabold text-[#ffdd57]"
        : "text-[1.06rem] font-semibold text-white/90 hover:text-[1.1rem] hover:font-bold hover:text-[#ffad00]"
    }`;

  const isFloating = false;

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!profileRef.current?.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div className="min-h-screen text-ink">
      {!isStandalonePage ? (
        <header className="z-30 w-full pt-0">
          <div className="w-full">
            <div className="w-full bg-[linear-gradient(135deg,#ed0000_0%,#ff1515_62%,#a70000_100%)] px-8 py-5 shadow-[0_16px_36px_rgba(167,0,0,0.24)] md:px-10 md:py-6">
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center">
                <div className="flex min-w-0 items-center gap-3 justify-self-start">
                  <Link
                    to="/"
                    className="inline-flex items-center"
                  >
                    <img src="/artdict-logo.png" alt="Artdict logo" className="h-20 w-auto object-contain md:h-24" />
                  </Link>
                </div>

                <nav
                  className="hidden items-center justify-center gap-7 xl:flex xl:-translate-x-14"
                >
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) => navItemClass(isActive)}
                  >
                    Trang chủ
                  </NavLink>
                  <NavLink
                    to="/events"
                    className={({ isActive }) => navItemClass(isActive)}
                  >
                    Sự kiện
                  </NavLink>
                  <NavLink
                    to="/artists"
                    className={({ isActive }) => navItemClass(isActive)}
                  >
                    Nhà thiết kế
                  </NavLink>
                  {user?.role === "admin" && (
                    <NavLink
                      to="/admin"
                      className={({ isActive }) => navItemClass(isActive)}
                    >
                      Quản trị
                    </NavLink>
                  )}
                  <NavLink
                    to="/about"
                    className={({ isActive }) => navItemClass(isActive)}
                  >
                    Giới thiệu
                  </NavLink>
                </nav>

                <div className="flex shrink-0 items-center gap-2 justify-self-end">
                  {user ? (
                    <NavLink
                      to="/cart"
                      className={({ isActive }) =>
                        `relative inline-flex items-center rounded-full px-4 py-2 text-[0.96rem] font-semibold transition ${
                          isActive
                            ? "bg-[#f3e7db] text-[#7c3f18]"
                            : "text-white hover:bg-white/14"
                        }`
                      }
                      aria-label="Giỏ hàng"
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
                          "text-white hover:bg-white/14"
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
                            <p className="mt-1 truncate text-sm text-[#7b6a5f]">{user.email || "Tài khoản đã đăng nhập"}</p>
                          </div>
                          <div className="h-px bg-[#eadfd3]" />
                          <div className="mt-2">
                            <NavLink
                              to="/account"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center justify-between rounded-[18px] px-3 py-3 text-[1rem] font-medium text-[#221a15] transition hover:bg-[#f3e7db]"
                            >
                              <span>Tài khoản của tôi</span>
                              <span className="text-[#8b7768]">›</span>
                            </NavLink>
                            <NavLink
                              to="/cart"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center justify-between rounded-[18px] px-3 py-3 text-[1rem] font-medium text-[#221a15] transition hover:bg-[#f3e7db]"
                            >
                              <span>Giỏ hàng</span>
                              <span className="text-[#8b7768]">›</span>
                            </NavLink>
                            <NavLink
                              to="/orders"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center justify-between rounded-[18px] px-3 py-3 text-[1rem] font-medium text-[#221a15] transition hover:bg-[#f3e7db]"
                            >
                              <span>Lịch sử đơn hàng</span>
                              <span className="text-[#8b7768]">›</span>
                            </NavLink>
                            {user.role === "admin" ? (
                              <NavLink
                                to="/admin"
                                onClick={() => setProfileOpen(false)}
                                className="flex items-center justify-between rounded-[18px] px-3 py-3 text-[1rem] font-medium text-[#221a15] transition hover:bg-[#f3e7db]"
                              >
                                <span>Bảng quản trị</span>
                                <span className="text-[#8b7768]">›</span>
                              </NavLink>
                            ) : null}
                            <Link
                              to="/about"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center justify-between rounded-[18px] px-3 py-3 text-[1rem] font-medium text-[#221a15] transition hover:bg-[#f3e7db]"
                            >
                              <span>Trợ giúp và hỗ trợ</span>
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
                                <span>Đăng xuất</span>
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
                        className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full border border-white/16 bg-white/10 px-4 py-2 text-[0.98rem] font-medium transition hover:bg-white/14 ${
                          "text-white"
                        }`}
                      >
                        Đăng nhập
                      </NavLink>
                      <NavLink
                        to="/register"
                        className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-[#ffad00] px-4 py-2 text-[0.98rem] font-semibold text-[#600000] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#ffc333]"
                      >
                        Đăng ký
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
              <p>Email: <a href="mailto:hello@artdict.vn" className="font-semibold text-[#111827]">hello@artdict.vn</a></p>
              <p>Hotline: <span className="font-semibold text-[#111827]">1900 2468</span></p>
              <p>Địa chỉ: <span className="font-semibold text-[#111827]">TP. Hồ Chí Minh, Việt Nam</span></p>
            </div>

            <div className="mt-8 border-t border-[#eadfd3] pt-6 text-center text-sm text-[#7b6a5f]">
              <p>© 2026 Artdict. Nền tảng kết nối designer sinh viên và khách hàng sáng tạo.</p>
            </div>
          </div>
        </footer>
      ) : null}

      <CartToast notice={cartNotice} onClose={clearCartNotice} />
      {!isAuthPage ? <ChatbotWidget /> : null}
    </div>
  );
};
