BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

TRUNCATE TABLE
  comments,
  order_items,
  orders,
  cart_items,
  events,
  products,
  authors,
  categories,
  users
RESTART IDENTITY CASCADE;

INSERT INTO categories (name)
VALUES
  ('Tranh in & Poster'),
  ('Thời trang & Phụ kiện'),
  ('Decor & Không gian'),
  ('Quà tặng cá nhân hóa');

INSERT INTO authors (name, slug, bio, avatar_url)
VALUES
  (
    'Nguyễn Minh Thư',
    'nguyen-minh-thu',
    'Sinh viên thiết kế theo đuổi poster và tranh in kể chuyện về nhịp sống campus, góc học tập và cảm xúc rất đời của người trẻ.',
    'https://images.pexels.com/photos/30546290/pexels-photo-30546290.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'
  ),
  (
    'Lê Gia Hân',
    'le-gia-han',
    'Gia Hân phát triển các dòng postcard, bookmark và paper goods mang tinh thần câu lạc bộ sinh viên, quà tặng nhỏ và trải nghiệm mở hộp chỉn chu.',
    'https://images.pexels.com/photos/35248043/pexels-photo-35248043.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'
  ),
  (
    'Trần Hoàng Nam',
    'tran-hoang-nam',
    'Hoàng Nam tập trung vào wearable goods như tote và phụ kiện đi học, hướng tới nhóm khách hàng Gen Z cần sản phẩm vừa đẹp vừa dùng được mỗi ngày.',
    'https://images.pexels.com/photos/35988655/pexels-photo-35988655.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'
  ),
  (
    'Phạm Bảo Châu',
    'pham-bao-chau',
    'Bảo Châu làm mạnh về typography, áo thun thiết kế và sticker cho cộng đồng sáng tạo, đặc biệt là các nhóm dự án và câu lạc bộ trong trường.',
    'https://images.pexels.com/photos/35109567/pexels-photo-35109567.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'
  ),
  (
    'Võ Tuấn Kiệt',
    'vo-tuan-kiet',
    'Tuấn Kiệt yêu thích merchandise cho workshop, exhibition booth và các sự kiện sinh viên, với ưu tiên cao cho độ ứng dụng và cảm giác trẻ trung.',
    'https://images.pexels.com/photos/29585803/pexels-photo-29585803.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'
  ),
  (
    'Đỗ Yến Nhi',
    'do-yen-nhi',
    'Yến Nhi phát triển sổ tay, lịch bàn và ấn phẩm học tập mang tinh thần portfolio building, phục vụ đúng nhu cầu ghi chú và trưng bày của sinh viên thiết kế.',
    'https://images.pexels.com/photos/28690597/pexels-photo-28690597.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'
  ),
  (
    'Bùi An Khang',
    'bui-an-khang',
    'An Khang theo đuổi các sản phẩm decor như canvas, mug và đồ dùng bàn làm việc, tập trung vào nhu cầu cá nhân hóa không gian sống của Gen Z.',
    'https://images.pexels.com/photos/29945647/pexels-photo-29945647.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'
  ),
  (
    'Nguyễn Hà My',
    'nguyen-ha-my',
    'Hà My thích các bộ quà tặng cá nhân hóa với tag, card và packaging giàu cảm xúc, phù hợp cho nhu cầu tặng quà và ghi dấu cá nhân.',
    'https://images.pexels.com/photos/30123498/pexels-photo-30123498.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'
  );

INSERT INTO users (
  name,
  email,
  password_hash,
  role,
  phone,
  location,
  bio,
  avatar_url,
  email_verified,
  email_verified_at,
  preferred_auth_method,
  password_changed_at,
  updated_at
)
VALUES
  (
    'Quản trị Artdict',
    'admin@artdict.vn',
    crypt('Admin@123', gen_salt('bf')),
    'admin',
    '+84 28 7300 2468',
    'TP. Hồ Chí Minh',
    'Tài khoản quản trị phụ trách chất lượng hình ảnh, hồ sơ creator, sản phẩm, workshop và các chiến dịch cộng đồng của Artdict.',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    TRUE,
    NOW(),
    'email',
    NOW(),
    NOW()
  ),
  (
    'Linh Trần',
    'linh@artdict.vn',
    crypt('User@1234', gen_salt('bf')),
    'customer',
    '+84 90 555 0123',
    'Đà Nẵng',
    'Mình hay mua tranh in, paper goods và quà tặng nhỏ có câu chuyện vì thích decor góc học tập và chọn quà có dấu ấn riêng.',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    TRUE,
    NOW(),
    'email',
    NOW(),
    NOW()
  ),
  (
    'An Nguyễn',
    'an@artdict.vn',
    crypt('User@1234', gen_salt('bf')),
    'customer',
    '+84 93 222 4567',
    'Hà Nội',
    'Mình quan tâm đến đồ decor, gift box cá nhân hóa và những món merch nhìn gọn gàng nhưng vẫn có cảm giác sáng tạo.',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    FALSE,
    NULL,
    'email',
    NOW(),
    NOW()
  );

INSERT INTO products (name, description, price, stock, category_id, author_id, image_url)
VALUES
  (
    'Poster Riso Campus Flow',
    'Poster risograph lấy cảm hứng từ chuyển động của hành lang, studio và góc học tập trong môi trường đại học sáng tạo.',
    280000,
    18,
    (SELECT id FROM categories WHERE name = 'Tranh in & Poster'),
    (SELECT id FROM authors WHERE slug = 'nguyen-minh-thu'),
    'https://unsplash.com/photos/GdFGePcWB4g/download?force=true'
  ),
  (
    'Bộ Postcard Creative Corners',
    'Bộ 6 postcard kể lại những khoảnh khắc rất quen thuộc của sinh viên thiết kế: bàn làm việc, note nhỏ, deadline và những góc campus yên tĩnh.',
    120000,
    36,
    (SELECT id FROM categories WHERE name = 'Tranh in & Poster'),
    (SELECT id FROM authors WHERE slug = 'le-gia-han'),
    'https://unsplash.com/photos/C7l3tV81fLs/download?force=true'
  ),
  (
    'Sticker Pack Club Signals',
    'Set sticker dùng cho laptop, bình nước và sổ tay với ngôn ngữ đồ họa gợi cảm hứng từ câu lạc bộ, workshop và nhịp sống dự án sinh viên.',
    95000,
    60,
    (SELECT id FROM categories WHERE name = 'Quà tặng cá nhân hóa'),
    (SELECT id FROM authors WHERE slug = 'pham-bao-chau'),
    'https://unsplash.com/photos/BDbuwiZi0fA/download?force=true'
  ),
  (
    'Tote Canvas Studio Route',
    'Túi tote canvas dành cho người thường xuyên mang laptop, sketchbook và tài liệu đi học, đi workshop hoặc dựng booth sự kiện.',
    260000,
    24,
    (SELECT id FROM categories WHERE name = 'Thời trang & Phụ kiện'),
    (SELECT id FROM authors WHERE slug = 'tran-hoang-nam'),
    'https://unsplash.com/photos/EC42DczwPnA/download?force=true'
  ),
  (
    'Áo Thun Creator Mode',
    'Áo thun graphic unisex với bố cục typography tối giản, phù hợp cho team dự án, workshop hoặc những ngày đi học cần một item dễ phối.',
    340000,
    20,
    (SELECT id FROM categories WHERE name = 'Thời trang & Phụ kiện'),
    (SELECT id FROM authors WHERE slug = 'pham-bao-chau'),
    'https://unsplash.com/photos/elbKS4DY21g/download?force=true'
  ),
  (
    'Mũ Canvas Deadline Friendly',
    'Mũ vải có chi tiết thêu nhẹ, lên form gọn và mang tinh thần merchandise dành cho cộng đồng sáng tạo và các buổi campus activation.',
    210000,
    28,
    (SELECT id FROM categories WHERE name = 'Thời trang & Phụ kiện'),
    (SELECT id FROM authors WHERE slug = 'vo-tuan-kiet'),
    'https://unsplash.com/photos/BIr8rxlnD1s/download?force=true'
  ),
  (
    'Sổ Tay Portfolio Notes',
    'Sổ tay chấm dot-grid để ghi brief, sketch nhanh và note ý tưởng, rất hợp với sinh viên đang xây portfolio hoặc theo học studio project.',
    180000,
    34,
    (SELECT id FROM categories WHERE name = 'Quà tặng cá nhân hóa'),
    (SELECT id FROM authors WHERE slug = 'do-yen-nhi'),
    'https://unsplash.com/photos/hBdaqrr5Z3k/download?force=true'
  ),
  (
    'Bookmark Layered Mood',
    'Bộ bookmark in dày với bảng màu trầm ấm, phù hợp làm quà nhỏ, quà kèm packaging hoặc bán tại booth trường đại học.',
    85000,
    48,
    (SELECT id FROM categories WHERE name = 'Quà tặng cá nhân hóa'),
    (SELECT id FROM authors WHERE slug = 'le-gia-han'),
    'https://unsplash.com/photos/FBOcQp8geLY/download?force=true'
  ),
  (
    'Cốc Sứ Type & Brew',
    'Cốc sứ dành cho góc làm việc, kết hợp tinh thần typography và thói quen uống cà phê khi học bài, làm đồ án hay dựng concept.',
    290000,
    16,
    (SELECT id FROM categories WHERE name = 'Decor & Không gian'),
    (SELECT id FROM authors WHERE slug = 'bui-an-khang'),
    'https://unsplash.com/photos/j16dLbiu8Kk/download?force=true'
  ),
  (
    'Tranh Canvas Dorm Light',
    'Tranh canvas khổ vừa cho phòng ngủ, góc học tập hoặc studio nhỏ, đáp ứng đúng nhu cầu decor không gian sống của khách hàng trẻ.',
    460000,
    12,
    (SELECT id FROM categories WHERE name = 'Decor & Không gian'),
    (SELECT id FROM authors WHERE slug = 'nguyen-minh-thu'),
    'https://unsplash.com/photos/m6uTxjfODYc/download?force=true'
  ),
  (
    'Lịch Bàn Semester Palette',
    'Lịch bàn 12 tháng với bảng màu thay đổi theo nhịp học kỳ, phù hợp cho bàn học, bàn làm việc và quầy trưng bày nhỏ.',
    170000,
    30,
    (SELECT id FROM categories WHERE name = 'Quà tặng cá nhân hóa'),
    (SELECT id FROM authors WHERE slug = 'do-yen-nhi'),
    'https://unsplash.com/photos/rjEyCqESNTk/download?force=true'
  ),
  (
    'Gift Box Personalized Print',
    'Bộ quà gồm mini print, card và tag cá nhân hóa, hướng đến nhu cầu tặng quà có thẩm mỹ, câu chuyện và cảm giác mở hộp chỉn chu.',
    390000,
    18,
    (SELECT id FROM categories WHERE name = 'Quà tặng cá nhân hóa'),
    (SELECT id FROM authors WHERE slug = 'nguyen-ha-my'),
    'https://unsplash.com/photos/IsOQu4nML-Y/download?force=true'
  );

INSERT INTO events (
  slug,
  title,
  eyebrow,
  subtitle,
  description,
  summary,
  highlights,
  content,
  gallery_images,
  banner_image_url,
  slot,
  sort_order,
  product_id
)
VALUES
  (
    'behind-the-project-tu-brief-lop-den-san-pham',
    'Behind the Project: Từ Brief Lớp Đến Sản Phẩm Bán Được',
    'Nội dung cộng đồng',
    'Biến bài tập học kỳ thành sản phẩm có thể kể chuyện và bán thật',
    'Chuỗi nội dung đúng với định hướng của Artdict: giúp sinh viên biến bài làm học thuật thành sản phẩm có hình ảnh, portfolio và câu chuyện đủ mạnh để tiếp cận khách hàng.',
    'Một event hero nhấn mạnh quá trình từ brief trên lớp, moodboard, thử nghiệm đến sản phẩm có thể lên sàn.',
    '["Từ bài tập đến hàng hóa sáng tạo", "Portfolio đi cùng sản phẩm", "Storytelling là điểm tạo niềm tin"]'::jsonb,
    '[
      {"heading":"Brief lớp không nên kết thúc ở điểm số","body":"Nhiều sản phẩm tiềm năng của sinh viên chỉ dừng lại ở slide hoặc file cuối kỳ. Artdict giúp kéo chúng ra khỏi môi trường chấm điểm để trở thành sản phẩm có hình ảnh, mô tả và cơ hội bán thật.","image_url":"https://unsplash.com/photos/FBOcQp8geLY/download?force=true"},
      {"heading":"Portfolio phải cho thấy năng lực thương mại hóa","body":"Khách hàng không chỉ nhìn một món đồ đơn lẻ mà còn nhìn cách creator trình bày portfolio, giải thích cảm hứng và cho thấy quy trình hoàn thiện sản phẩm.","image_url":"https://unsplash.com/photos/C7l3tV81fLs/download?force=true"},
      {"heading":"Người mua cần thấy người đứng sau thiết kế","body":"Khi creator có hồ sơ rõ ràng, hình ảnh đồng bộ và sản phẩm được đặt đúng ngữ cảnh, mức độ tin cậy tăng lên đáng kể.","image_url":"https://unsplash.com/photos/vY56afJh-pU/download?force=true"}
    ]'::jsonb,
    '[
      "https://unsplash.com/photos/vY56afJh-pU/download?force=true",
      "https://unsplash.com/photos/FBOcQp8geLY/download?force=true",
      "https://unsplash.com/photos/C7l3tV81fLs/download?force=true"
    ]'::jsonb,
    'https://unsplash.com/photos/vY56afJh-pU/download?force=true',
    'hero',
    1,
    (SELECT id FROM products WHERE name = 'Poster Riso Campus Flow' LIMIT 1)
  ),
  (
    'creator-of-the-week-fpt-designers',
    'Creator of the Week: Gương Mặt Thiết Kế FPT',
    'Portfolio & cộng đồng',
    'Spotlight những creator có chất riêng và hồ sơ chỉn chu',
    'Hoạt động dựa rất sát kế hoạch cộng đồng trong tài liệu: chọn ra các creator sinh viên nổi bật theo tuần để tăng nhận diện và tạo cảm hứng cho người mới tham gia.',
    'Event hero tập trung vào profile, portfolio và sự phát triển thương hiệu cá nhân của creator sinh viên.',
    '["Nổi bật creator sinh viên", "Đẩy hồ sơ cá nhân", "Tăng niềm tin từ social proof"]'::jsonb,
    '[
      {"heading":"Creator được nhìn nhận như một thương hiệu nhỏ","body":"Artdict không chỉ bày sản phẩm. Mỗi creator cần có profile đủ tốt để khách hàng hiểu phong cách, năng lực và định hướng phát triển dài hạn.","image_url":"https://unsplash.com/photos/xbNnGsM8tQc/download?force=true"},
      {"heading":"Portfolio tốt giúp sản phẩm bán thuyết phục hơn","body":"Một chiếc tote hay bộ postcard trở nên đáng mua hơn khi nằm trong hệ hình ảnh thống nhất, có cách kể chuyện rõ ràng và hồ sơ sáng tạo thật sự có chiều sâu.","image_url":"https://unsplash.com/photos/C7l3tV81fLs/download?force=true"},
      {"heading":"Tạo động lực cho cộng đồng mới tham gia","body":"Khi có chương trình spotlight định kỳ, creator mới sẽ dễ hình dung tiêu chuẩn hình ảnh, cách xây dựng portfolio và con đường phát triển trên nền tảng.","image_url":"https://unsplash.com/photos/hBdaqrr5Z3k/download?force=true"}
    ]'::jsonb,
    '[
      "https://unsplash.com/photos/xbNnGsM8tQc/download?force=true",
      "https://unsplash.com/photos/C7l3tV81fLs/download?force=true",
      "https://unsplash.com/photos/hBdaqrr5Z3k/download?force=true"
    ]'::jsonb,
    'https://unsplash.com/photos/xbNnGsM8tQc/download?force=true',
    'hero',
    2,
    (SELECT id FROM products WHERE name = 'Tote Canvas Studio Route' LIMIT 1)
  ),
  (
    'campus-booth-artdict-fpt',
    'Campus Booth Artdict @ FPT',
    'Trải nghiệm offline',
    'Đưa sản phẩm sinh viên ra không gian thật để tăng niềm tin',
    'Sự kiện tái hiện đúng hướng đi mà tài liệu đề xuất: booth trưng bày, mã QR dẫn tới portfolio, trải nghiệm sản phẩm thực tế và chạm vào nhu cầu decor, quà tặng của sinh viên trong trường.',
    'Một event hero cho thấy Artdict kết hợp online marketplace với booth, workshop và triển lãm nhỏ tại trường.',
    '["Booth trưng bày sản phẩm", "Quét QR để xem portfolio", "Tăng trust qua trải nghiệm offline"]'::jsonb,
    '[
      {"heading":"Khách hàng trẻ cần chạm thử trước khi tin","body":"Tài liệu khảo sát cho thấy khách hàng vẫn lo ngại việc sản phẩm không giống ảnh. Booth và góc trải nghiệm giúp giải tỏa đúng pain point này.","image_url":"https://unsplash.com/photos/IzLatgY17Hs/download?force=true"},
      {"heading":"Online và offline hỗ trợ lẫn nhau","body":"Sản phẩm được xem trực tiếp tại booth nhưng hành trình mua vẫn có thể kết thúc trên website, nơi khách tiếp tục xem profile creator và đánh giá thật.","image_url":"https://unsplash.com/photos/_ljMRDzsNuM/download?force=true"},
      {"heading":"Packaging, merch và quà tặng là điểm hút người xem","body":"Những món như sticker, bookmark, gift box hay tote là nhóm sản phẩm rất phù hợp cho triển lãm nhỏ, club fair và các hoạt động activation trong trường.","image_url":"https://unsplash.com/photos/IsOQu4nML-Y/download?force=true"}
    ]'::jsonb,
    '[
      "https://unsplash.com/photos/mE_36BQ6oeg/download?force=true",
      "https://unsplash.com/photos/IzLatgY17Hs/download?force=true",
      "https://unsplash.com/photos/_ljMRDzsNuM/download?force=true"
    ]'::jsonb,
    'https://unsplash.com/photos/mE_36BQ6oeg/download?force=true',
    'hero',
    3,
    (SELECT id FROM products WHERE name = 'Sticker Pack Club Signals' LIMIT 1)
  ),
  (
    'workshop-storytelling-portfolio-va-mo-ta',
    'Workshop Storytelling Cho Portfolio & Mô Tả Sản Phẩm',
    'Workshop',
    'Rèn kỹ năng viết để tăng độ tin cậy cho sản phẩm sáng tạo',
    'Một workshop bám sát kỳ vọng của cả buyer lẫn seller trong tài liệu: sản phẩm cần hình ảnh tốt, mô tả rõ, câu chuyện hợp vibe và profile creator đáng tin.',
    'Event side thiên về kỹ năng mềm, giúp sinh viên biết cách viết bio, mô tả, mood và context cho từng sản phẩm.',
    '["Viết bio rõ ràng", "Mô tả sản phẩm đúng kỳ vọng", "Tăng khả năng thuyết phục người mua"]'::jsonb,
    '[
      {"heading":"Ảnh đẹp là chưa đủ","body":"Người mua trẻ quyết định nhanh bằng cảm xúc, nhưng vẫn cần mô tả đủ cụ thể để tin rằng sản phẩm thật sẽ giống với những gì họ thấy trên màn hình.","image_url":"https://unsplash.com/photos/6q4mqmGnWUU/download?force=true"},
      {"heading":"Portfolio cần logic kể chuyện","body":"Khi portfolio có bố cục tốt, creator không chỉ bán được một món hàng mà còn cho thấy tư duy sáng tạo và tiềm năng làm việc lâu dài với khách hàng.","image_url":"https://unsplash.com/photos/vY56afJh-pU/download?force=true"}
    ]'::jsonb,
    '[
      "https://unsplash.com/photos/6q4mqmGnWUU/download?force=true",
      "https://unsplash.com/photos/vY56afJh-pU/download?force=true"
    ]'::jsonb,
    'https://unsplash.com/photos/6q4mqmGnWUU/download?force=true',
    'side',
    1,
    (SELECT id FROM products WHERE name = 'Sổ Tay Portfolio Notes' LIMIT 1)
  ),
  (
    'goc-tin-cay-qc-packaging-review',
    'Góc Tin Cậy: QC, Packaging & Review Minh Bạch',
    'Niềm tin người mua',
    'Giảm nỗi lo sản phẩm không giống ảnh và chất lượng không ổn định',
    'Nội dung side này trực tiếp phản hồi pain point lớn nhất trong khảo sát B2C: chất lượng thiếu đồng đều, ảnh và thực tế không khớp, cùng sự dè chừng khi mua từ creator sinh viên.',
    'Thông điệp được đặt cố định để nhấn mạnh Artdict quan tâm đến hình ảnh thật, packaging và review minh bạch chứ không chỉ bán hàng.',
    '["Nhấn mạnh QC hình ảnh", "Khuyến khích review thật", "Tăng niềm tin khi đặt quà và decor"]'::jsonb,
    '[
      {"heading":"Sự tin tưởng đến từ nhiều điểm nhỏ","body":"Hình ảnh nhất quán, thông tin chất liệu, thời gian xử lý, ảnh packaging và review thật là những chi tiết giúp khách hàng dám mua lần đầu trên nền tảng.","image_url":"https://unsplash.com/photos/U8SdW3GEJQ4/download?force=true"},
      {"heading":"Packaging là một phần của trải nghiệm sản phẩm","body":"Đặc biệt với nhóm sản phẩm làm quà, trải nghiệm mở hộp ảnh hưởng mạnh đến cảm nhận về giá trị và mức độ chuyên nghiệp của creator.","image_url":"https://unsplash.com/photos/IsOQu4nML-Y/download?force=true"}
    ]'::jsonb,
    '[
      "https://unsplash.com/photos/U8SdW3GEJQ4/download?force=true",
      "https://unsplash.com/photos/IsOQu4nML-Y/download?force=true"
    ]'::jsonb,
    'https://unsplash.com/photos/U8SdW3GEJQ4/download?force=true',
    'side',
    2,
    (SELECT id FROM products WHERE name = 'Gift Box Personalized Print' LIMIT 1)
  );

INSERT INTO orders (
  user_id,
  status,
  payment_status,
  stripe_session_id,
  payment_intent_id,
  total_price,
  paid_at,
  created_at
)
VALUES
  (
    (SELECT id FROM users WHERE email = 'linh@artdict.vn'),
    'completed',
    'paid',
    'cs_demo_paid_001',
    'pi_demo_paid_001',
    625000,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
  ),
  (
    (SELECT id FROM users WHERE email = 'an@artdict.vn'),
    'processing',
    'paid',
    'cs_demo_paid_002',
    'pi_demo_paid_002',
    485000,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    (SELECT id FROM users WHERE email = 'linh@artdict.vn'),
    'awaiting_payment',
    'pending',
    'cs_demo_pending_003',
    NULL,
    510000,
    NULL,
    NOW() - INTERVAL '8 hours'
  );

INSERT INTO order_items (order_id, product_id, quantity, price)
VALUES
  (
    1,
    (SELECT id FROM products WHERE name = 'Poster Riso Campus Flow'),
    1,
    280000
  ),
  (
    1,
    (SELECT id FROM products WHERE name = 'Tote Canvas Studio Route'),
    1,
    260000
  ),
  (
    1,
    (SELECT id FROM products WHERE name = 'Bookmark Layered Mood'),
    1,
    85000
  ),
  (
    2,
    (SELECT id FROM products WHERE name = 'Gift Box Personalized Print'),
    1,
    390000
  ),
  (
    2,
    (SELECT id FROM products WHERE name = 'Sticker Pack Club Signals'),
    1,
    95000
  ),
  (
    3,
    (SELECT id FROM products WHERE name = 'Áo Thun Creator Mode'),
    1,
    340000
  ),
  (
    3,
    (SELECT id FROM products WHERE name = 'Lịch Bàn Semester Palette'),
    1,
    170000
  );

INSERT INTO comments (product_id, user_id, content, media_url, media_type, created_at)
VALUES
  (
    (SELECT id FROM products WHERE name = 'Poster Riso Campus Flow'),
    (SELECT id FROM users WHERE email = 'linh@artdict.vn'),
    'Màu in ngoài đời rất gần với ảnh trên web, treo lên góc học tập nhìn ấm và có cảm giác đúng chất sinh viên thiết kế.',
    NULL,
    NULL,
    NOW() - INTERVAL '4 days'
  ),
  (
    (SELECT id FROM products WHERE name = 'Gift Box Personalized Print'),
    (SELECT id FROM users WHERE email = 'an@artdict.vn'),
    'Hộp quà đóng gói gọn, tag cá nhân hóa đúng nội dung mình gửi và phần hình ảnh sản phẩm ngoài đời khớp với mô tả.',
    NULL,
    NULL,
    NOW() - INTERVAL '1 day'
  );

COMMIT;
