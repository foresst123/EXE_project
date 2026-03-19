import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { AdminModal } from "../components/AdminModal";
import { useAdminDashboard } from "../layouts/AdminLayout";

const emptyArtist = {
  name: "",
  slug: "",
  bio: "",
  avatar_url: "",
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

export const AdminArtistsPage = () => {
  const { dashboard, reloadDashboard } = useAdminDashboard();
  const navigate = useNavigate();
  const { id } = useParams();
  const selectedArtist = useMemo(
    () => dashboard.authors.find((artist) => String(artist.id) === id) || null,
    [dashboard.authors, id],
  );
  const [artistForm, setArtistForm] = useState(emptyArtist);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const closeModal = () => {
    setEditingId(null);
    setArtistForm(emptyArtist);
    setModalOpen(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setArtistForm(emptyArtist);
    setModalOpen(true);
  };

  const openEdit = (artist) => {
    setEditingId(artist.id);
    setArtistForm({
      name: artist.name || "",
      slug: artist.slug || "",
      bio: artist.bio || "",
      avatar_url: artist.avatar_url || "",
    });
    setModalOpen(true);
  };

  const submitArtist = async (event) => {
    event.preventDefault();

    if (editingId) {
      await api.put(`/authors/${editingId}`, artistForm);
    } else {
      await api.post("/authors", artistForm);
    }

    await reloadDashboard();
    closeModal();
  };

  const removeArtist = async (artistId) => {
    await api.delete(`/authors/${artistId}`);
    await reloadDashboard();
    if (id && String(artistId) === id) {
      navigate("/admin/artists");
    }
  };

  if (selectedArtist) {
    return (
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BackButton to="/admin/artists" label="Quay lại nhà thiết kế" />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => openEdit(selectedArtist)}
              className="rounded-full border border-[#d9e8f7] px-5 py-3 text-sm font-semibold text-[#0f4c81]"
            >
              Sửa hồ sơ
            </button>
            <button
              type="button"
              onClick={() => removeArtist(selectedArtist.id)}
              className="rounded-full border border-red-200 px-5 py-3 text-sm font-semibold text-red-600"
            >
              Xóa
            </button>
          </div>
        </div>

        <div className="rounded-[30px] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">Chi tiết nhà thiết kế</p>
          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-start">
            <div className="h-36 w-36 overflow-hidden rounded-full bg-[#eef5fb]">
              {selectedArtist.avatar_url ? (
                <img src={selectedArtist.avatar_url} alt={selectedArtist.name} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-3xl font-semibold text-[#4d7aa7]">
                  {selectedArtist.name?.[0]}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-5">
              <div>
                <h2 className="font-display text-4xl text-[#0f2744]">{selectedArtist.name}</h2>
                <p className="mt-2 text-sm uppercase tracking-[0.18em] text-[#4d7aa7]">{selectedArtist.slug}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border border-[#d9e8f7] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#4d7aa7]">Sản phẩm</p>
                  <p className="mt-2 text-3xl font-semibold text-[#0f2744]">{selectedArtist.product_count || 0}</p>
                </div>
                <div className="rounded-[24px] border border-[#d9e8f7] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#4d7aa7]">Trạng thái hồ sơ</p>
                  <p className="mt-2 text-lg font-semibold text-[#0f2744]">Đang hiển thị trên storefront</p>
                </div>
              </div>
              <div className="rounded-[24px] border border-[#d9e8f7] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4d7aa7]">Tiểu sử</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{selectedArtist.bio || "Chưa có phần giới thiệu cho nhà thiết kế này."}</p>
              </div>
            </div>
          </div>
        </div>

        <AdminModal
          open={modalOpen}
          onClose={closeModal}
          subtitle="Quản lý nhà thiết kế"
          title={editingId ? "Sửa nhà thiết kế" : "Thêm nhà thiết kế"}
        >
          <form onSubmit={submitArtist} className="space-y-3">
            <input className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" placeholder="Tên nhà thiết kế" value={artistForm.name} onChange={(event) => setArtistForm((prev) => ({ ...prev, name: event.target.value }))} />
            <input className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" placeholder="Slug" value={artistForm.slug} onChange={(event) => setArtistForm((prev) => ({ ...prev, slug: event.target.value }))} />
            <textarea className="w-full rounded-[24px] border border-[#d9e8f7] px-4 py-3" placeholder="Giới thiệu nhà thiết kế" rows="6" value={artistForm.bio} onChange={(event) => setArtistForm((prev) => ({ ...prev, bio: event.target.value }))} />
            <input className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" placeholder="Liên kết ảnh đại diện" value={artistForm.avatar_url} onChange={(event) => setArtistForm((prev) => ({ ...prev, avatar_url: event.target.value }))} />
            <button type="submit" className="w-full rounded-full bg-[#0f4c81] px-5 py-3 text-white">
              {editingId ? "Lưu hồ sơ" : "Tạo nhà thiết kế"}
            </button>
          </form>
        </AdminModal>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[30px] bg-white p-6 shadow-card">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">Quản lý nhà thiết kế</p>
          <h2 className="mt-2 font-display text-3xl text-[#0f2744]">Nhà thiết kế</h2>
        </div>
        <button type="button" onClick={openCreate} className="rounded-full bg-[#0f4c81] px-5 py-3 text-sm font-semibold text-white">
          Thêm nhà thiết kế
        </button>
      </div>

      <div className="rounded-[30px] bg-white p-6 shadow-card">
        <div className="space-y-3">
          {dashboard.authors.map((artist) => (
            <button
              key={artist.id}
              type="button"
              onClick={() => navigate(`/admin/artists/${artist.id}`)}
              className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#d9e8f7] px-4 py-4 text-left transition hover:border-[#0f4c81] hover:bg-[#f7fbff]"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="h-14 w-14 overflow-hidden rounded-full bg-[#eef5fb]">
                  {artist.avatar_url ? (
                    <img src={artist.avatar_url} alt={artist.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#0f2744]">{artist.name}</p>
                  <p className="mt-1 truncate text-sm text-slate-500">{artist.slug}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#4d7aa7]">
                    {artist.product_count} sản phẩm
                  </p>
                </div>
              </div>
              <span className="text-2xl text-[#7a99b8]">›</span>
            </button>
          ))}
        </div>
      </div>

      <AdminModal
        open={modalOpen}
        onClose={closeModal}
        subtitle="Quản lý nhà thiết kế"
        title={editingId ? "Sửa nhà thiết kế" : "Thêm nhà thiết kế"}
      >
        <form onSubmit={submitArtist} className="space-y-3">
          <input className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" placeholder="Tên nhà thiết kế" value={artistForm.name} onChange={(event) => setArtistForm((prev) => ({ ...prev, name: event.target.value }))} />
          <input className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" placeholder="Slug" value={artistForm.slug} onChange={(event) => setArtistForm((prev) => ({ ...prev, slug: event.target.value }))} />
          <textarea className="w-full rounded-[24px] border border-[#d9e8f7] px-4 py-3" placeholder="Giới thiệu nhà thiết kế" rows="6" value={artistForm.bio} onChange={(event) => setArtistForm((prev) => ({ ...prev, bio: event.target.value }))} />
          <input className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" placeholder="Liên kết ảnh đại diện" value={artistForm.avatar_url} onChange={(event) => setArtistForm((prev) => ({ ...prev, avatar_url: event.target.value }))} />
          <button type="submit" className="w-full rounded-full bg-[#0f4c81] px-5 py-3 text-white">
            {editingId ? "Lưu hồ sơ" : "Tạo nhà thiết kế"}
          </button>
        </form>
      </AdminModal>
    </section>
  );
};
