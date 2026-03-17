export const AdminModal = ({ open, title, subtitle, onClose, children }) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061120]/52 px-4 py-8">
      <div className="w-full max-w-2xl rounded-[32px] border border-[#cfe3f6] bg-white p-6 shadow-[0_40px_100px_rgba(10,31,54,0.28)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#4d7aa7]">{subtitle}</p>
            <h2 className="mt-2 font-display text-3xl text-[#0f2744]">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d9e8f7] text-lg font-semibold text-[#0f4c81] transition hover:bg-[#f3f8fe]"
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
};
