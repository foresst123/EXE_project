import { useState } from "react";

const suggestReply = (input) => {
  const normalized = input.toLowerCase();

  if (normalized.includes("email") || normalized.includes("contact") || normalized.includes("lien he")) {
    return "You can contact the team at support@exestore.local for store questions, product support, or order assistance.";
  }

  if (normalized.includes("about") || normalized.includes("gioi thieu") || normalized.includes("trang nay")) {
    return "This site is a curated ecommerce experience with artist pages, category browsing, Stripe checkout, and an admin dashboard for products, users, orders, and revenue.";
  }

  if (normalized.includes("author") || normalized.includes("tac gia")) {
    return "You can browse all creators from the Artists page, then open a dedicated artist profile to read the bio and see every product from that artist.";
  }

  if (normalized.includes("shop") || normalized.includes("tim kiem") || normalized.includes("search")) {
    return "Use the Shop page when you want to search, filter by category, or narrow products by artist. The homepage is now focused on product discovery and best-seller shelves.";
  }

  if (normalized.includes("ship") || normalized.includes("giao")) {
    return "Orders move to processing right after Stripe confirms payment. From there, the admin can continue shipping and fulfillment steps.";
  }

  if (normalized.includes("pay") || normalized.includes("thanh toan") || normalized.includes("card")) {
    return "At checkout we create a Stripe payment session, then you complete the card payment on Stripe's secure page before the order is marked paid.";
  }

  if (normalized.includes("order") || normalized.includes("don hang")) {
    return "You can review current order status from the Orders page. We show both fulfillment status and payment status there.";
  }

  return "I can help with products, artists, categories, contact email, payment flow, and order tracking. Try asking about the site, artists, or card payment.";
};

const ChatBubbleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.8">
    <path
      d="M7 16.2L4 19V6.8C4 5.81 4.81 5 5.8 5h12.4C19.19 5 20 5.81 20 6.8v8.4c0 .99-.81 1.8-1.8 1.8H7z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M8 10h8M8 13h5" strokeLinecap="round" />
  </svg>
);

const DoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="2">
    <path d="M6 12.5l4 4L18 8.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "bot",
      text: "Hi, I can help with products, artists, the shop page, payment, and order status.",
    },
  ]);

  const submitMessage = (event) => {
    event.preventDefault();

    if (!draft.trim()) {
      return;
    }

    const nextMessages = [
      ...messages,
      { id: Date.now(), role: "user", text: draft.trim() },
      { id: Date.now() + 1, role: "bot", text: suggestReply(draft.trim()) },
    ];

    setMessages(nextMessages);
    setDraft("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {open && (
        <div className="mb-4 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-[30px] border border-white/80 bg-white/95 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between bg-ink px-5 py-4 text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">Support</p>
              <h3 className="mt-1 text-lg font-semibold">Shopping assistant</h3>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/15"
            >
              <DoneIcon />
            </button>
          </div>
          <div className="max-h-80 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  message.role === "bot"
                    ? "bg-sand text-ink"
                    : "ml-auto bg-moss text-white"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>
          <form onSubmit={submitMessage} className="flex gap-2 border-t border-mist px-4 py-4">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about products, shop, or orders..."
              className="flex-1 rounded-full border border-mist px-4 py-3 text-sm outline-none"
            />
            <button type="submit" className="rounded-full bg-clay px-4 py-3 text-sm font-semibold text-white">
              Send
            </button>
          </form>
        </div>
      )}

      {!open ? (
        <div className="relative">
          <span className="absolute inset-0 rounded-full bg-clay/35 blur-xl" />
          <span className="absolute inset-0 rounded-full border border-white/30 animate-ping" />
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open chat support"
            className="relative grid h-16 w-16 place-items-center rounded-full bg-[linear-gradient(135deg,_#111827_0%,_#c67c4e_100%)] text-white shadow-2xl transition hover:-translate-y-1"
          >
            <ChatBubbleIcon />
          </button>
        </div>
      ) : null}
    </div>
  );
};
