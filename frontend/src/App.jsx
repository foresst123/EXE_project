import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./layouts/AdminLayout";
import { MainLayout } from "./layouts/MainLayout";
import { useAuth } from "./context/AuthContext";
import { AdminOverviewPage } from "./pages/AdminOverviewPage";
import { AdminOrdersPage } from "./pages/AdminOrdersPage";
import { AdminArtistsPage } from "./pages/AdminArtistsPage";
import { AdminEventsPage } from "./pages/AdminEventsPage";
import { AdminProductsPage } from "./pages/AdminProductsPage";
import { AdminRevenuePage } from "./pages/AdminRevenuePage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { AuthorPage } from "./pages/AuthorPage";
import { AboutPage } from "./pages/AboutPage";
import { AccountPage } from "./pages/AccountPage";
import { AuthorsPage } from "./pages/AuthorsPage";
import { CartPage } from "./pages/CartPage";
import { CategoryPage } from "./pages/CategoryPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { CheckoutResultPage } from "./pages/CheckoutResultPage";
import { EventPage } from "./pages/EventPage";
import { EventsPage } from "./pages/EventsPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { OrdersPage } from "./pages/OrdersPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ShopPage } from "./pages/ShopPage";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.role === "admin" ? children : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:slug" element={<EventPage />} />
        <Route path="artists" element={<AuthorsPage />} />
        <Route path="artists/:slug" element={<AuthorPage />} />
        <Route path="authors" element={<AuthorsPage />} />
        <Route path="authors/:slug" element={<AuthorPage />} />
        <Route path="categories/:slug" element={<CategoryPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route
          path="account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout/result"
          element={
            <ProtectedRoute>
              <CheckoutResultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminOverviewPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/:id" element={<AdminProductsPage />} />
        <Route path="artists" element={<AdminArtistsPage />} />
        <Route path="artists/:id" element={<AdminArtistsPage />} />
        <Route path="events" element={<AdminEventsPage />} />
        <Route path="events/:id" element={<AdminEventsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="users/:id" element={<AdminUsersPage />} />
        <Route path="revenue" element={<AdminRevenuePage />} />
      </Route>
    </Routes>
  );
}
