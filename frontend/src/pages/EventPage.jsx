import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { Loader } from "../components/Loader";

const buildFallbackSections = (event) => [
  {
    heading: "Tổng quan sự kiện",
    body:
      event.description ||
      "Trang sự kiện được trình bày theo phong cách biên tập để người xem dễ đọc và hiểu rõ tinh thần của chiến dịch.",
    image_url: event.banner_image_url,
  },
  {
    heading: "Vì sao sự kiện này đáng chú ý",
    body:
      event.summary ||
      "Một sự kiện tốt cần cho thấy mục tiêu, bầu không khí và giá trị của bộ sưu tập chứ không chỉ đơn thuần là banner quảng bá.",
    image_url: event.product_image_url || event.banner_image_url,
  },
  {
    heading: "Khám phá tiếp theo",
    body:
      "Sau khi đọc câu chuyện của sự kiện, người xem có thể đi sâu vào sản phẩm hoặc danh mục liên quan để hiểu rõ hơn về designer và tác phẩm.",
    image_url: event.banner_image_url,
  },
];

const sectionId = (heading, index) =>
  `${heading || "section"}-${index}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export const EventPage = () => {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get(`/events/${slug}`);
        setEvent(data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Không thể tải nội dung sự kiện");
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  if (loading) {
    return <Loader label="Đang tải sự kiện..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!event) {
    return <ErrorMessage message="Không tìm thấy sự kiện" />;
  }

  const sections =
    Array.isArray(event.content) && event.content.length ? event.content : buildFallbackSections(event);
  const galleryImages =
    Array.isArray(event.gallery_images) && event.gallery_images.length
      ? event.gallery_images
      : [event.banner_image_url, event.product_image_url].filter(Boolean);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <Link to="/" className="font-medium text-ink">
          Trang chủ
        </Link>
        <span>/</span>
        <span>Sự kiện</span>
        <span>/</span>
        <span className="text-slate-700">{event.title}</span>
      </div>

      <article className="overflow-hidden rounded-[36px] bg-white/92 shadow-float">
        <div className="relative h-[380px] overflow-hidden md:h-[500px]">
          <img src={event.banner_image_url} alt={event.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(10,14,25,0.1)_0%,_rgba(10,14,25,0.72)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <div className="max-w-4xl">
              {event.eyebrow ? (
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/74">
                  {event.eyebrow}
                </p>
              ) : null}
              <h1 className="mt-3 text-[2.35rem] font-semibold leading-tight text-white md:text-[3.1rem] lg:text-[3.8rem]">
                {event.title}
              </h1>
              {event.subtitle ? (
                <p className="mt-4 max-w-3xl text-lg leading-8 text-white/82 md:text-xl">{event.subtitle}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-6 py-10 md:px-8 lg:py-12">
          <div className="space-y-12">
            <div>
              <p className="text-[1.08rem] leading-9 text-slate-600">
                {event.description || event.summary}
              </p>
            </div>

            {sections.map((section, index) => {
              const id = sectionId(section.heading, index);

              return (
                <section key={id} id={id} className="space-y-6 border-t border-[#eee3d9] pt-10 first:border-t-0 first:pt-0">
                  <div className="space-y-5">
                    <h2 className="text-[1.9rem] font-semibold leading-tight text-ink md:text-[2.05rem]">
                      {section.heading}
                    </h2>
                    <p className="text-base leading-8 text-slate-600">{section.body}</p>
                    {section.image_url ? (
                      <img
                        src={section.image_url}
                        alt={section.heading}
                        className="h-72 w-full rounded-[28px] object-cover md:h-80"
                      />
                    ) : null}
                  </div>
                </section>
              );
            })}

            {galleryImages.length ? (
              <section className="space-y-5 border-t border-[#eee3d9] pt-10">
                <div className="max-w-3xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-moss">Nhật ký hình ảnh</p>
                  <h2 className="mt-3 text-[1.9rem] font-semibold text-ink md:text-[2.05rem]">Chuỗi hình ảnh của sự kiện</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {galleryImages.map((image, index) => (
                    <img
                      key={`${image}-${index}`}
                      src={image}
                      alt={`${event.title} gallery ${index + 1}`}
                      className="h-56 w-full rounded-[24px] object-cover"
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {event.product_id ? (
              <section className="border-t border-[#eee3d9] pt-10">
                <div className="rounded-[30px] bg-[#f8f3ed] p-6 md:p-8">
                  <div className="space-y-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-moss">Sản phẩm liên quan</p>
                    {event.product_image_url ? (
                      <img
                        src={event.product_image_url}
                        alt={event.product_name || event.title}
                        className="h-60 w-full rounded-[26px] object-cover"
                      />
                    ) : null}
                    <h2 className="text-[1.9rem] font-semibold text-ink md:text-[2.05rem]">
                      {event.product_name || "Khám phá sản phẩm nổi bật"}
                    </h2>
                    <p className="text-base leading-8 text-slate-600">
                      Khi muốn tìm hiểu sâu hơn, bạn có thể chuyển từ câu chuyện sự kiện sang trang chi
                      tiết sản phẩm để xem mô tả, giá bán và thông tin designer.
                    </p>
                    <Link
                      to={`/products/${event.product_id}`}
                      className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
                    >
                      Mở sản phẩm nổi bật
                    </Link>
                  </div>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </article>
    </section>
  );
};
