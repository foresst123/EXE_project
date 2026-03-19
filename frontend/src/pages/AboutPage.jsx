import { Link } from "react-router-dom";

const values = [
  {
    title: "Portfolio song song bán hàng",
    description:
      "Mỗi sản phẩm trên Artdict đều gắn với hồ sơ cá nhân của designer để người mua không chỉ thấy món đồ, mà còn thấy câu chuyện và năng lực sáng tạo phía sau.",
  },
  {
    title: "Trải nghiệm mua đáng tin cậy",
    description:
      "Artdict ưu tiên minh bạch thông tin, thanh toán rõ ràng và quy trình xác nhận đơn để giảm nỗi lo về chất lượng hay sản phẩm không giống mô tả.",
  },
  {
    title: "Cộng đồng phát triển nghề nghiệp",
    description:
      "Ngoài marketplace, nền tảng còn hướng đến workshop, sự kiện và tương tác cộng đồng để designer sinh viên phát triển kỹ năng thực chiến.",
  },
];

export const AboutPage = () => (
  <section className="space-y-8">
    <div className="rounded-[40px] border border-white/60 bg-white/88 p-8 shadow-float lg:p-10">
      <p className="text-sm uppercase tracking-[0.3em] text-moss">Giới thiệu</p>
      <h1 className="mt-4 max-w-4xl font-display text-[2.8rem] leading-tight text-ink md:text-[4rem]">
        Nền tảng kết nối designer sinh viên với khách hàng qua một trải nghiệm mua sắm sáng tạo và đáng tin cậy.
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
        Artdict là một hệ sinh thái kết hợp giữa portfolio, marketplace và community, nơi sinh
        viên thiết kế có thể trưng bày sản phẩm, xây dựng thương hiệu cá nhân, nhận đơn hàng thật
        và phát triển kỹ năng nghề nghiệp ngay trong môi trường học tập.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
          Về trang chủ
        </Link>
        <Link to="/artists" className="rounded-full border border-mist px-5 py-3 text-sm font-semibold text-ink">
          Xem nhà thiết kế
        </Link>
      </div>
    </div>

    <div className="grid gap-6 md:grid-cols-3">
      {values.map((value) => (
        <article key={value.title} className="rounded-[28px] border border-white/60 bg-white/88 p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.22em] text-tide">{value.title}</p>
          <p className="mt-4 text-sm leading-7 text-slate-600">{value.description}</p>
        </article>
      ))}
    </div>
  </section>
);
