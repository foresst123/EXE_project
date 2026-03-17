import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { AdminModal } from "../components/AdminModal";
import { useAdminDashboard } from "../layouts/AdminLayout";

const emptyEvent = {
  title: "",
  slug: "",
  eyebrow: "",
  subtitle: "",
  description: "",
  summary: "",
  banner_image_url: "",
  slot: "hero",
  sort_order: 0,
  is_active: true,
  product_id: "",
  content_text: "",
  highlights_text: "",
  gallery_text: "",
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

const parseLines = (value) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const parseContentBlocks = (value) =>
  value
    .split("\n\n")
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      const [firstLine, ...rest] = block.split("\n");
      return {
        heading: firstLine || `Section ${index + 1}`,
        body: rest.join("\n").trim() || firstLine,
      };
    });

export const AdminEventsPage = () => {
  const { dashboard, reloadDashboard } = useAdminDashboard();
  const navigate = useNavigate();
  const { id } = useParams();
  const selectedEvent = useMemo(
    () => dashboard.events.find((eventItem) => String(eventItem.id) === id) || null,
    [dashboard.events, id],
  );
  const [eventForm, setEventForm] = useState(emptyEvent);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [importNotice, setImportNotice] = useState("");

  const closeModal = () => {
    setEditingId(null);
    setEventForm(emptyEvent);
    setImportNotice("");
    setModalOpen(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setEventForm(emptyEvent);
    setImportNotice("");
    setModalOpen(true);
  };

  const openEdit = (eventItem) => {
    setEditingId(eventItem.id);
    setEventForm({
      title: eventItem.title || "",
      slug: eventItem.slug || "",
      eyebrow: eventItem.eyebrow || "",
      subtitle: eventItem.subtitle || "",
      description: eventItem.description || "",
      summary: eventItem.summary || "",
      banner_image_url: eventItem.banner_image_url || "",
      slot: eventItem.slot || "hero",
      sort_order: eventItem.sort_order || 0,
      is_active: Boolean(eventItem.is_active),
      product_id: eventItem.product_id || "",
      content_text: Array.isArray(eventItem.content)
        ? eventItem.content.map((section) => [section.heading, section.body].filter(Boolean).join("\n")).join("\n\n")
        : "",
      highlights_text: Array.isArray(eventItem.highlights) ? eventItem.highlights.join("\n") : "",
      gallery_text: Array.isArray(eventItem.gallery_images) ? eventItem.gallery_images.join("\n") : "",
    });
    setImportNotice("");
    setModalOpen(true);
  };

  const submitEvent = async (event) => {
    event.preventDefault();

    const payload = {
      title: eventForm.title,
      slug: eventForm.slug,
      eyebrow: eventForm.eyebrow,
      subtitle: eventForm.subtitle,
      description: eventForm.description,
      summary: eventForm.summary,
      banner_image_url: eventForm.banner_image_url,
      slot: eventForm.slot,
      sort_order: Number(eventForm.sort_order || 0),
      is_active: Boolean(eventForm.is_active),
      product_id: eventForm.product_id ? Number(eventForm.product_id) : null,
      highlights: parseLines(eventForm.highlights_text),
      content: parseContentBlocks(eventForm.content_text),
      gallery_images: parseLines(eventForm.gallery_text),
    };

    if (editingId) {
      await api.put(`/events/${editingId}`, payload);
    } else {
      await api.post("/events", payload);
    }

    await reloadDashboard();
    closeModal();
  };

  const removeEvent = async (eventId) => {
    await api.delete(`/events/${eventId}`);
    await reloadDashboard();
    if (id && String(eventId) === id) {
      navigate("/admin/events");
    }
  };

  const importEventFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();

    if (file.name.endsWith(".json")) {
      try {
        const parsed = JSON.parse(text);
        setEventForm((prev) => ({
          ...prev,
          title: parsed.title || prev.title,
          slug: parsed.slug || prev.slug,
          eyebrow: parsed.eyebrow || prev.eyebrow,
          subtitle: parsed.subtitle || prev.subtitle,
          description: parsed.description || prev.description,
          summary: parsed.summary || prev.summary,
          banner_image_url: parsed.banner_image_url || prev.banner_image_url,
          content_text: Array.isArray(parsed.content)
            ? parsed.content.map((section) => [section.heading, section.body].filter(Boolean).join("\n")).join("\n\n")
            : prev.content_text,
          highlights_text: Array.isArray(parsed.highlights) ? parsed.highlights.join("\n") : prev.highlights_text,
          gallery_text: Array.isArray(parsed.gallery_images) ? parsed.gallery_images.join("\n") : prev.gallery_text,
        }));
        setImportNotice(`Imported structured content from ${file.name}.`);
      } catch {
        setImportNotice("JSON import failed. Please check the file structure.");
      }
    } else {
      const blocks = text.trim().split("\n\n");
      setEventForm((prev) => ({
        ...prev,
        title: prev.title || file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
        summary: prev.summary || (blocks[0] || ""),
        description: prev.description || text.trim(),
        content_text: prev.content_text || text.trim(),
      }));
      setImportNotice(`Imported article draft from ${file.name}.`);
    }

    event.target.value = "";
  };

  if (selectedEvent) {
    return (
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BackButton to="/admin/events" label="Back to events" />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => openEdit(selectedEvent)}
              className="rounded-full border border-[#d9e8f7] px-5 py-3 text-sm font-semibold text-[#0f4c81]"
            >
              Edit event
            </button>
            <button
              type="button"
              onClick={() => removeEvent(selectedEvent.id)}
              className="rounded-full border border-red-200 px-5 py-3 text-sm font-semibold text-red-600"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="rounded-[30px] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">Event detail</p>
          <h2 className="mt-2 font-display text-3xl text-[#0f2744]">{selectedEvent.title}</h2>
          <div className="mt-6 grid gap-6 xl:grid-cols-[360px,1fr]">
            <div className="overflow-hidden rounded-[28px] border border-[#d9e8f7] bg-[#f4f8fc]">
              {selectedEvent.banner_image_url ? (
                <img src={selectedEvent.banner_image_url} alt={selectedEvent.title} className="h-[320px] w-full object-cover" />
              ) : (
                <div className="grid h-[320px] place-items-center text-sm text-slate-500">No banner image</div>
              )}
            </div>
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[24px] border border-[#d9e8f7] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#4d7aa7]">Slot</p>
                  <p className="mt-2 text-lg font-semibold text-[#0f2744]">{selectedEvent.slot}</p>
                </div>
                <div className="rounded-[24px] border border-[#d9e8f7] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#4d7aa7]">Status</p>
                  <p className="mt-2 text-lg font-semibold text-[#0f2744]">{selectedEvent.is_active ? "Active" : "Inactive"}</p>
                </div>
                <div className="rounded-[24px] border border-[#d9e8f7] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#4d7aa7]">Order</p>
                  <p className="mt-2 text-lg font-semibold text-[#0f2744]">{selectedEvent.sort_order}</p>
                </div>
              </div>
              <div className="rounded-[24px] border border-[#d9e8f7] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4d7aa7]">Event summary</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{selectedEvent.summary || "No summary added yet."}</p>
              </div>
              <div className="rounded-[24px] border border-[#d9e8f7] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4d7aa7]">Article structure</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {Array.isArray(selectedEvent.content) && selectedEvent.content.length
                    ? `${selectedEvent.content.length} content sections prepared for the article layout.`
                    : "No flexible article sections added yet."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <AdminModal
          open={modalOpen}
          onClose={closeModal}
          subtitle="Campaign management"
          title={editingId ? "Edit event" : "Add an event"}
        >
          <form onSubmit={submitEvent} className="space-y-3">
            <div className="rounded-[24px] border border-dashed border-[#c8dcf0] bg-[#f6fbff] p-4">
              <p className="text-sm font-semibold text-[#0f2744]">Import article draft</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Use JSON for structured event pages, or Markdown/TXT for a free-form draft. This keeps the article layout flexible instead of forcing one rigid template.
              </p>
              <input type="file" accept=".json,.md,.txt" onChange={importEventFile} className="mt-3 block text-sm text-slate-500" />
              {importNotice ? <p className="mt-2 text-sm font-medium text-[#0f4c81]">{importNotice}</p> : null}
            </div>
            <input className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" placeholder="Title" value={eventForm.title} onChange={(event) => setEventForm((prev) => ({ ...prev, title: event.target.value }))} />
            <input className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" placeholder="Slug" value={eventForm.slug} onChange={(event) => setEventForm((prev) => ({ ...prev, slug: event.target.value }))} />
            <input className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" placeholder="Eyebrow" value={eventForm.eyebrow} onChange={(event) => setEventForm((prev) => ({ ...prev, eyebrow: event.target.value }))} />
            <input className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" placeholder="Subtitle" value={eventForm.subtitle} onChange={(event) => setEventForm((prev) => ({ ...prev, subtitle: event.target.value }))} />
            <textarea className="w-full rounded-[24px] border border-[#d9e8f7] px-4 py-3" placeholder="Summary" rows="3" value={eventForm.summary} onChange={(event) => setEventForm((prev) => ({ ...prev, summary: event.target.value }))} />
            <textarea className="w-full rounded-[24px] border border-[#d9e8f7] px-4 py-3" placeholder="Description" rows="5" value={eventForm.description} onChange={(event) => setEventForm((prev) => ({ ...prev, description: event.target.value }))} />
            <input className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" placeholder="Banner image URL" value={eventForm.banner_image_url} onChange={(event) => setEventForm((prev) => ({ ...prev, banner_image_url: event.target.value }))} />
            <div className="grid gap-3 md:grid-cols-3">
              <select className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" value={eventForm.slot} onChange={(event) => setEventForm((prev) => ({ ...prev, slot: event.target.value }))}>
                <option value="hero">hero</option>
                <option value="side">side</option>
              </select>
              <input className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" placeholder="Sort order" value={eventForm.sort_order} onChange={(event) => setEventForm((prev) => ({ ...prev, sort_order: event.target.value }))} />
              <select className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" value={eventForm.product_id} onChange={(event) => setEventForm((prev) => ({ ...prev, product_id: event.target.value }))}>
                <option value="">Related product (optional)</option>
                {dashboard.products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            <textarea className="w-full rounded-[24px] border border-[#d9e8f7] px-4 py-3" placeholder={"Highlights (one per line)"} rows="3" value={eventForm.highlights_text} onChange={(event) => setEventForm((prev) => ({ ...prev, highlights_text: event.target.value }))} />
            <textarea className="w-full rounded-[24px] border border-[#d9e8f7] px-4 py-3" placeholder={"Article sections (separate blocks with a blank line)"} rows="8" value={eventForm.content_text} onChange={(event) => setEventForm((prev) => ({ ...prev, content_text: event.target.value }))} />
            <textarea className="w-full rounded-[24px] border border-[#d9e8f7] px-4 py-3" placeholder={"Gallery image URLs (one per line)"} rows="3" value={eventForm.gallery_text} onChange={(event) => setEventForm((prev) => ({ ...prev, gallery_text: event.target.value }))} />
            <label className="flex items-center gap-3 rounded-2xl border border-[#d9e8f7] px-4 py-3 text-sm font-medium text-[#0f2744]">
              <input type="checkbox" checked={eventForm.is_active} onChange={(event) => setEventForm((prev) => ({ ...prev, is_active: event.target.checked }))} />
              Active event
            </label>
            <button type="submit" className="w-full rounded-full bg-[#0f4c81] px-5 py-3 text-white">
              {editingId ? "Save event" : "Create event"}
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
          <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">Campaign management</p>
          <h2 className="mt-2 font-display text-3xl text-[#0f2744]">Events</h2>
        </div>
        <button type="button" onClick={openCreate} className="rounded-full bg-[#0f4c81] px-5 py-3 text-sm font-semibold text-white">
          Add event
        </button>
      </div>

      <div className="rounded-[30px] bg-white p-6 shadow-card">
        <div className="space-y-3">
          {dashboard.events.map((eventItem) => (
            <button
              key={eventItem.id}
              type="button"
              onClick={() => navigate(`/admin/events/${eventItem.id}`)}
              className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#d9e8f7] px-4 py-4 text-left transition hover:border-[#0f4c81] hover:bg-[#f7fbff]"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#0f2744]">{eventItem.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {eventItem.slot} • order {eventItem.sort_order} • {eventItem.is_active ? "active" : "inactive"}
                </p>
                <p className="mt-1 truncate text-xs font-semibold uppercase tracking-[0.18em] text-[#4d7aa7]">
                  {eventItem.product_name || "No related product"}
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
        subtitle="Campaign management"
        title={editingId ? "Edit event" : "Add an event"}
      >
        <form onSubmit={submitEvent} className="space-y-3">
          <div className="rounded-[24px] border border-dashed border-[#c8dcf0] bg-[#f6fbff] p-4">
            <p className="text-sm font-semibold text-[#0f2744]">Import article draft</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Use JSON for structured event pages, or Markdown/TXT for a free-form draft. This keeps the article layout flexible instead of forcing one rigid template.
            </p>
            <input type="file" accept=".json,.md,.txt" onChange={importEventFile} className="mt-3 block text-sm text-slate-500" />
            {importNotice ? <p className="mt-2 text-sm font-medium text-[#0f4c81]">{importNotice}</p> : null}
          </div>
          <input className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" placeholder="Title" value={eventForm.title} onChange={(event) => setEventForm((prev) => ({ ...prev, title: event.target.value }))} />
          <input className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" placeholder="Slug" value={eventForm.slug} onChange={(event) => setEventForm((prev) => ({ ...prev, slug: event.target.value }))} />
          <input className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" placeholder="Eyebrow" value={eventForm.eyebrow} onChange={(event) => setEventForm((prev) => ({ ...prev, eyebrow: event.target.value }))} />
          <input className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" placeholder="Subtitle" value={eventForm.subtitle} onChange={(event) => setEventForm((prev) => ({ ...prev, subtitle: event.target.value }))} />
          <textarea className="w-full rounded-[24px] border border-[#d9e8f7] px-4 py-3" placeholder="Summary" rows="3" value={eventForm.summary} onChange={(event) => setEventForm((prev) => ({ ...prev, summary: event.target.value }))} />
          <textarea className="w-full rounded-[24px] border border-[#d9e8f7] px-4 py-3" placeholder="Description" rows="5" value={eventForm.description} onChange={(event) => setEventForm((prev) => ({ ...prev, description: event.target.value }))} />
          <input className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" placeholder="Banner image URL" value={eventForm.banner_image_url} onChange={(event) => setEventForm((prev) => ({ ...prev, banner_image_url: event.target.value }))} />
          <div className="grid gap-3 md:grid-cols-3">
            <select className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" value={eventForm.slot} onChange={(event) => setEventForm((prev) => ({ ...prev, slot: event.target.value }))}>
              <option value="hero">hero</option>
              <option value="side">side</option>
            </select>
            <input className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" placeholder="Sort order" value={eventForm.sort_order} onChange={(event) => setEventForm((prev) => ({ ...prev, sort_order: event.target.value }))} />
            <select className="w-full rounded-full border border-[#d9e8f7] px-4 py-3" value={eventForm.product_id} onChange={(event) => setEventForm((prev) => ({ ...prev, product_id: event.target.value }))}>
              <option value="">Related product (optional)</option>
              {dashboard.products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <textarea className="w-full rounded-[24px] border border-[#d9e8f7] px-4 py-3" placeholder={"Highlights (one per line)"} rows="3" value={eventForm.highlights_text} onChange={(event) => setEventForm((prev) => ({ ...prev, highlights_text: event.target.value }))} />
          <textarea className="w-full rounded-[24px] border border-[#d9e8f7] px-4 py-3" placeholder={"Article sections (separate blocks with a blank line)"} rows="8" value={eventForm.content_text} onChange={(event) => setEventForm((prev) => ({ ...prev, content_text: event.target.value }))} />
          <textarea className="w-full rounded-[24px] border border-[#d9e8f7] px-4 py-3" placeholder={"Gallery image URLs (one per line)"} rows="3" value={eventForm.gallery_text} onChange={(event) => setEventForm((prev) => ({ ...prev, gallery_text: event.target.value }))} />
          <label className="flex items-center gap-3 rounded-2xl border border-[#d9e8f7] px-4 py-3 text-sm font-medium text-[#0f2744]">
            <input type="checkbox" checked={eventForm.is_active} onChange={(event) => setEventForm((prev) => ({ ...prev, is_active: event.target.checked }))} />
            Active event
          </label>
          <button type="submit" className="w-full rounded-full bg-[#0f4c81] px-5 py-3 text-white">
            {editingId ? "Save event" : "Create event"}
          </button>
        </form>
      </AdminModal>
    </section>
  );
};
