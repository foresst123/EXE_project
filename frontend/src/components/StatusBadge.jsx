const tones = {
  paid: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  failed: "bg-red-50 text-red-700",
  awaiting_payment: "bg-amber-50 text-amber-700",
  payment_failed: "bg-red-50 text-red-700",
  processing: "bg-sky-50 text-sky-700",
  shipped: "bg-indigo-50 text-indigo-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-slate-100 text-slate-600",
};

export const StatusBadge = ({ label }) => (
  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${tones[label] || "bg-slate-100 text-slate-700"}`}>
    {label.replaceAll("_", " ")}
  </span>
);

