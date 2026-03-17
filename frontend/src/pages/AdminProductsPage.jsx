import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { AdminModal } from "../components/AdminModal";
import { useAdminDashboard } from "../layouts/AdminLayout";

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category_id: "",
  author_id: "",
  image_url: "",
};

const BackButton = ({ to, label }) => (
  <Link
    to={to}
    className="inline-flex items-center gap-2 rounded-full border border-[#d9e8f7] bg-white px-4 py-2.5 text-sm font-semibold text-[#0f4c81] transition hover:bg-[#f3f8fe]"
  >
    <span className="text-lg leading-none">‹</span>
    <span>{label}</span>
  </Link>
);

const ProductForm = ({ dashboard, productForm, setProductForm, onSubmit, submitLabel }) => (
  <form onSubmit={onSubmit} className="space-y-3">
    <input className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" placeholder="Name" value={productForm.name} onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))} />
    <textarea className="w-full rounded-[24px] border border-[#d9e8f7] px-4 py-3" placeholder="Description" rows="5" value={productForm.description} onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))} />
    <div className="grid gap-3 md:grid-cols-2">
      <input className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" placeholder="Price" value={productForm.price} onChange={(event) => setProductForm((prev) => ({ ...prev, price: event.target.value }))} />
      <input className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" placeholder="Stock" value={productForm.stock} onChange={(event) => setProductForm((prev) => ({ ...prev, stock: event.target.value }))} />
    </div>
    <select className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" value={productForm.category_id} onChange={(event) => setProductForm((prev) => ({ ...prev, category_id: event.target.value }))}>
      <option value="">Select category</option>
      {dashboard.categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
    <select className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" value={productForm.author_id} onChange={(event) => setProductForm((prev) => ({ ...prev, author_id: event.target.value }))}>
      <option value="">Select artist</option>
      {dashboard.authors.map((artist) => (
        <option key={artist.id} value={artist.id}>
          {artist.name}
        </option>
      ))}
    </select>
    <input className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" placeholder="Image URL" value={productForm.image_url} onChange={(event) => setProductForm((prev) => ({ ...prev, image_url: event.target.value }))} />
    <button type="submit" className="w-full rounded-full bg-[#0f4c81] px-5 py-3 text-white">
      {submitLabel}
    </button>
  </form>
);

export const AdminProductsPage = () => {
  const { dashboard, reloadDashboard } = useAdminDashboard();
  const navigate = useNavigate();
  const { id } = useParams();
  const selectedProduct = useMemo(
    () => dashboard.products.find((product) => String(product.id) === id) || null,
    [dashboard.products, id],
  );
  const [productForm, setProductForm] = useState(emptyProduct);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setProductForm(emptyProduct);
  };

  const openCreate = () => {
    setEditingId(null);
    setProductForm(emptyProduct);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingId(product.id);
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      stock: product.stock || "",
      category_id: product.category_id || "",
      author_id: product.author_id || "",
      image_url: product.image_url || "",
    });
    setModalOpen(true);
  };

  const submitProduct = async (event) => {
    event.preventDefault();

    const payload = {
      ...productForm,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      category_id: Number(productForm.category_id),
      author_id: Number(productForm.author_id),
    };

    if (editingId) {
      await api.put(`/products/${editingId}`, payload);
    } else {
      await api.post("/products", payload);
    }

    await reloadDashboard();
    closeModal();
  };

  const deleteProduct = async (productId) => {
    await api.delete(`/products/${productId}`);
    await reloadDashboard();
    if (id && String(productId) === id) {
      navigate("/admin/products");
    }
  };

  if (selectedProduct) {
    return (
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BackButton to="/admin/products" label="Back to products" />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => openEdit(selectedProduct)}
              className="rounded-full border border-[#d9e8f7] px-5 py-3 text-sm font-semibold text-[#0f4c81]"
            >
              Edit product
            </button>
            <button
              type="button"
              onClick={() => deleteProduct(selectedProduct.id)}
              className="rounded-full border border-red-200 px-5 py-3 text-sm font-semibold text-red-600"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="rounded-[30px] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">Product detail</p>
          <h2 className="mt-2 font-display text-3xl text-[#0f2744]">{selectedProduct.name}</h2>
          <div className="mt-6 grid gap-6 xl:grid-cols-[360px,1fr]">
            <div className="overflow-hidden rounded-[28px] border border-[#d9e8f7] bg-[#f4f8fc]">
              {selectedProduct.image_url ? (
                <img src={selectedProduct.image_url} alt={selectedProduct.name} className="h-[320px] w-full object-cover" />
              ) : (
                <div className="grid h-[320px] place-items-center text-sm text-slate-500">No image</div>
              )}
            </div>
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border border-[#d9e8f7] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#4d7aa7]">Price</p>
                  <p className="mt-2 text-3xl font-semibold text-[#0f2744]">${Number(selectedProduct.price).toFixed(2)}</p>
                </div>
                <div className="rounded-[24px] border border-[#d9e8f7] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#4d7aa7]">Inventory</p>
                  <p className="mt-2 text-3xl font-semibold text-[#0f2744]">{selectedProduct.stock}</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[24px] border border-[#d9e8f7] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#4d7aa7]">Category</p>
                  <p className="mt-2 text-lg font-semibold text-[#0f2744]">{selectedProduct.category_name || "Not set"}</p>
                </div>
                <div className="rounded-[24px] border border-[#d9e8f7] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#4d7aa7]">Artist</p>
                  <p className="mt-2 text-lg font-semibold text-[#0f2744]">{selectedProduct.author_name || "Not set"}</p>
                </div>
                <div className="rounded-[24px] border border-[#d9e8f7] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#4d7aa7]">Sold</p>
                  <p className="mt-2 text-lg font-semibold text-[#0f2744]">{selectedProduct.sold_count || 0}</p>
                </div>
              </div>
              <div className="rounded-[24px] border border-[#d9e8f7] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4d7aa7]">Description</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{selectedProduct.description || "No description added yet."}</p>
              </div>
            </div>
          </div>
        </div>

        <AdminModal
          open={modalOpen}
          onClose={closeModal}
          subtitle="Catalog management"
          title={editingId ? "Edit product" : "Add a product"}
        >
          <ProductForm
            dashboard={dashboard}
            productForm={productForm}
            setProductForm={setProductForm}
            onSubmit={submitProduct}
            submitLabel={editingId ? "Save product" : "Create product"}
          />
        </AdminModal>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[30px] bg-white p-6 shadow-card">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">Catalog management</p>
          <h2 className="mt-2 font-display text-3xl text-[#0f2744]">Products</h2>
        </div>
        <button type="button" onClick={openCreate} className="rounded-full bg-[#0f4c81] px-5 py-3 text-sm font-semibold text-white">
          Add product
        </button>
      </div>

      <div className="rounded-[30px] bg-white p-6 shadow-card">
        <div className="space-y-3">
          {dashboard.products.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => navigate(`/admin/products/${product.id}`)}
              className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#d9e8f7] px-4 py-4 text-left transition hover:border-[#0f4c81] hover:bg-[#f7fbff]"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#0f2744]">{product.name}</p>
                <p className="mt-1 text-sm text-slate-500">
                  ${Number(product.price).toFixed(2)} • Stock {product.stock} • Sold {product.sold_count || 0}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#4d7aa7]">
                  {product.author_name || "No artist"}
                </p>
              </div>
              <span className="text-2xl text-[#7a99b8]">›</span>
            </button>
          ))}
        </div>
      </div>

      <AdminModal
        open={modalOpen}
        onClose={closeModal}
        subtitle="Catalog management"
        title={editingId ? "Edit product" : "Add a product"}
      >
        <ProductForm
          dashboard={dashboard}
          productForm={productForm}
          setProductForm={setProductForm}
          onSubmit={submitProduct}
          submitLabel={editingId ? "Save product" : "Create product"}
        />
      </AdminModal>
    </section>
  );
};
