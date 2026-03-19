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
  ('Tranh & Print'),
  ('Thời trang & Phụ kiện'),
  ('Trang trí không gian'),
  ('Quà tặng cá nhân hóa');

INSERT INTO authors (name, slug, bio, avatar_url)
VALUES
  (
    'Nguyễn Minh Thư',
    'nguyen-minh-thu',
    'Minh Thư theo đuổi ngôn ngữ minh họa dịu, thiên về poster kể chuyện và các bản in dành cho không gian sống nhỏ.',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80'
  ),
  (
    'Lê Gia Hân',
    'le-gia-han',
    'Gia Hân phát triển những bộ ấn phẩm giấy mang tinh thần tuổi trẻ, gần gũi với đời sống sinh viên và các câu chuyện campus.',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80'
  ),
  (
    'Trần Hoàng Nam',
    'tran-hoang-nam',
    'Hoàng Nam tập trung vào thời trang ứng dụng, ưu tiên đồ vải, tote và những sản phẩm dễ dùng trong nhịp sống sáng tạo hằng ngày.',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80'
  ),
  (
    'Phạm Bảo Châu',
    'pham-bao-chau',
    'Bảo Châu thích khai thác typography và màu sắc mạnh để tạo nên những thiết kế cá tính, trẻ và dễ nhận diện.',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80'
  ),
  (
    'Võ Tuấn Kiệt',
    'vo-tuan-kiet',
    'Tuấn Kiệt xây dựng sản phẩm quanh tinh thần streetwear nhẹ, thiên về chi tiết thêu, biểu tượng và khả năng ứng dụng thực tế.',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80'
  ),
  (
    'Đỗ Yến Nhi',
    'do-yen-nhi',
    'Yến Nhi quan tâm đến vật phẩm học tập và quà tặng nhỏ, nơi minh họa có thể đi cùng thói quen ghi chép mỗi ngày.',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80'
  ),
  (
    'Bùi An Khang',
    'bui-an-khang',
    'An Khang phát triển các sản phẩm decor và đồ gốm theo hướng tối giản, ấm áp và dễ hòa vào nhiều kiểu không gian.',
    'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=600&q=80'
  ),
  (
    'Nguyễn Hà My',
    'nguyen-ha-my',
    'Hà My thích biến những ý tưởng đồ họa thành quà tặng cá nhân hóa, từ sticker, lịch bàn đến phụ kiện nhỏ mang dấu ấn riêng.',
    'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80'
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
    'Tài khoản quản trị dùng để quản lý sản phẩm, designer, sự kiện, đơn hàng và doanh thu của Artdict.',
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
    'Mình thích các sản phẩm thiết kế có câu chuyện riêng, đặc biệt là poster, stationery và đồ dùng sáng tạo cho góc học tập.',
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
    'Mình tìm những món quà cá nhân hóa nhỏ xinh và đồ decor tối giản cho phòng làm việc tại nhà.',
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
    'Poster Risograph Sài Gòn Đêm Mưa',
    'Bản in risograph khổ A3 lấy cảm hứng từ nhịp phố đêm, phù hợp cho góc học tập hoặc studio cá nhân.',
    320000,
    18,
    (SELECT id FROM categories WHERE name = 'Tranh & Print'),
    (SELECT id FROM authors WHERE slug = 'nguyen-minh-thu'),
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Bộ Postcard Khoảng Trời Sinh Viên',
    'Bộ 6 postcard minh họa những khoảnh khắc quen thuộc của đời sống sinh viên sáng tạo.',
    120000,
    40,
    (SELECT id FROM categories WHERE name = 'Tranh & Print'),
    (SELECT id FROM authors WHERE slug = 'le-gia-han'),
    'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Tote Canvas Studio Notes',
    'Túi tote canvas in typography dành cho người thường xuyên mang sketchbook, laptop và moodboard.',
    260000,
    24,
    (SELECT id FROM categories WHERE name = 'Thời trang & Phụ kiện'),
    (SELECT id FROM authors WHERE slug = 'tran-hoang-nam'),
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Áo Thun Creative Block',
    'Áo thun cotton unisex với graphic typography nổi bật, phù hợp cho workshop và ngày đi học.',
    340000,
    20,
    (SELECT id FROM categories WHERE name = 'Thời trang & Phụ kiện'),
    (SELECT id FROM authors WHERE slug = 'pham-bao-chau'),
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Nón Thêu Deadline Club',
    'Mũ lưỡi trai thêu chữ nhỏ với tinh thần vui nhộn dành cho cộng đồng làm thiết kế.',
    220000,
    28,
    (SELECT id FROM categories WHERE name = 'Thời trang & Phụ kiện'),
    (SELECT id FROM authors WHERE slug = 'vo-tuan-kiet'),
    'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Sticker Pack Moodboard',
    'Set sticker minh họa gồm 12 mẫu nhỏ, dùng để trang trí laptop, bình nước hoặc sổ tay.',
    90000,
    60,
    (SELECT id FROM categories WHERE name = 'Quà tặng cá nhân hóa'),
    (SELECT id FROM authors WHERE slug = 'nguyen-ha-my'),
    'https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Sổ Tay Sketch Journal',
    'Sổ tay bìa mềm với layout giấy chấm, thích hợp cho ghi chú ý tưởng, phác thảo và journal hằng ngày.',
    180000,
    35,
    (SELECT id FROM categories WHERE name = 'Quà tặng cá nhân hóa'),
    (SELECT id FROM authors WHERE slug = 'do-yen-nhi'),
    'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Cốc Sứ Quiet Studio',
    'Cốc sứ in minh họa tối giản dành cho bàn làm việc và những buổi sáng nhiều cảm hứng.',
    290000,
    18,
    (SELECT id FROM categories WHERE name = 'Trang trí không gian'),
    (SELECT id FROM authors WHERE slug = 'bui-an-khang'),
    'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Tranh Canvas Light On Concrete',
    'Tranh canvas khổ vừa với phối màu ấm, phù hợp cho không gian làm việc hoặc góc phòng ngủ.',
    480000,
    12,
    (SELECT id FROM categories WHERE name = 'Trang trí không gian'),
    (SELECT id FROM authors WHERE slug = 'nguyen-minh-thu'),
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Lịch Bàn Campus Seasons',
    'Lịch để bàn 12 tháng với minh họa thay đổi theo bầu không khí từng mùa của năm học.',
    160000,
    30,
    (SELECT id FROM categories WHERE name = 'Quà tặng cá nhân hóa'),
    (SELECT id FROM authors WHERE slug = 'le-gia-han'),
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Ốp Điện Thoại Color Grid',
    'Ốp điện thoại họa tiết color grid với chất liệu nhám nhẹ, tạo cảm giác cầm chắc tay.',
    210000,
    26,
    (SELECT id FROM categories WHERE name = 'Quà tặng cá nhân hóa'),
    (SELECT id FROM authors WHERE slug = 'pham-bao-chau'),
    'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Gối Tựa Typeface Bloom',
    'Gối tựa in typography mềm, giúp không gian phòng hoặc studio có thêm điểm nhấn sáng tạo.',
    390000,
    15,
    (SELECT id FROM categories WHERE name = 'Trang trí không gian'),
    (SELECT id FROM authors WHERE slug = 'nguyen-ha-my'),
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
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
    'tu-portfolio-den-thi-truong',
    'Từ Portfolio Đến Thị Trường',
    'Sự kiện nổi bật',
    'Câu chuyện thương mại hóa sản phẩm sáng tạo',
    'Một bài sự kiện giới thiệu cách Artdict giúp designer sinh viên chuyển bài làm học tập thành sản phẩm có thể bán và kể chuyện rõ ràng.',
    'Chiến dịch nhấn mạnh hành trình từ ý tưởng, portfolio đến đơn hàng thật của designer sinh viên.',
    '["Portfolio gắn với sản phẩm", "Kết nối khách hàng thật", "Nhấn mạnh giá trị câu chuyện thương hiệu"]'::jsonb,
    '[
      {"heading":"Không chỉ là một gian hàng","body":"Artdict không đặt designer vào một lưới sản phẩm vô danh. Mỗi thiết kế đi kèm hồ sơ cá nhân để người mua hiểu ai đang tạo ra sản phẩm và vì sao nó đáng được lựa chọn.","image_url":"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80"},
      {"heading":"Từ bài tập đến doanh thu","body":"Nhiều sản phẩm trên nền tảng bắt đầu từ những bài học, project lớp hoặc thử nghiệm cá nhân. Khi được biên tập tốt và đặt đúng ngữ cảnh, chúng trở thành hàng hóa sáng tạo có giá trị thực tế.","image_url":"https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1400&q=80"},
      {"heading":"Khách hàng mua cả câu chuyện","body":"Thứ tạo niềm tin không chỉ là hình ảnh đẹp mà còn là nội dung mô tả, chất liệu, hồ sơ designer và dòng sự kiện làm rõ tinh thần bộ sưu tập.","image_url":"https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80"}
    ]'::jsonb,
    '[
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80"
    ]'::jsonb,
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80',
    'hero',
    1,
    (SELECT id FROM products WHERE name = 'Poster Risograph Sài Gòn Đêm Mưa' LIMIT 1)
  ),
  (
    'showcase-designer-sinh-vien',
    'Showcase Designer Sinh Viên',
    'Cộng đồng',
    'Những gương mặt đang tạo dấu ấn',
    'Chuỗi nội dung spotlight những designer có portfolio nhất quán, sản phẩm chỉn chu và câu chuyện cá nhân rõ nét trên Artdict.',
    'Một danh sách tuyển chọn giúp người mua tiếp cận nhanh những hồ sơ sáng tạo nổi bật trong tuần.',
    '["Nổi bật hồ sơ cá nhân", "Sản phẩm đi cùng portfolio", "Tăng độ nhận diện cho designer"]'::jsonb,
    '[
      {"heading":"Portfolio là điểm chạm đầu tiên","body":"Khi khách hàng vào hồ sơ designer, họ nhìn thấy không chỉ một món hàng mà còn là định hướng, gu thẩm mỹ và khả năng kể chuyện của người sáng tạo.","image_url":"https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1400&q=80"},
      {"heading":"Sản phẩm được đặt đúng ngữ cảnh","body":"Một chiếc tote, một bộ postcard hay một tranh canvas sẽ thuyết phục hơn nhiều khi nằm trong một hồ sơ có cá tính rõ ràng và cách trình bày mạch lạc.","image_url":"https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1400&q=80"}
    ]'::jsonb,
    '[
      "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1400&q=80"
    ]'::jsonb,
    'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1600&q=80',
    'hero',
    2,
    (SELECT id FROM products WHERE name = 'Tote Canvas Studio Notes' LIMIT 1)
  ),
  (
    'tuan-le-dat-thiet-ke-theo-yeu-cau',
    'Tuần Lễ Đặt Thiết Kế Theo Yêu Cầu',
    'Dịch vụ cá nhân hóa',
    'Kết nối trực tiếp với người làm sáng tạo',
    'Sự kiện khuyến khích người mua gửi brief và làm việc trực tiếp với designer cho các sản phẩm cần cá nhân hóa cao.',
    'Một hoạt động nhấn mạnh thế mạnh đặt hàng theo yêu cầu và tương tác giữa khách hàng với designer.',
    '["Nhận brief trực tiếp", "Khuyến khích sản phẩm cá nhân hóa", "Tăng tương tác designer - khách hàng"]'::jsonb,
    '[
      {"heading":"Từ ý tưởng của khách hàng","body":"Nhiều nhu cầu quà tặng, decor hoặc ấn phẩm cá nhân không thể giải quyết bằng sản phẩm đại trà. Đây là lúc designer thể hiện khả năng lắng nghe và chuyển brief thành giải pháp sáng tạo.","image_url":"https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1400&q=80"},
      {"heading":"Độ tin cậy đến từ minh bạch","body":"Mô tả rõ quy trình, thời gian thực hiện và ví dụ sản phẩm trước đó giúp người mua có đủ niềm tin để bắt đầu trao đổi.","image_url":"https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80"}
    ]'::jsonb,
    '[
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80"
    ]'::jsonb,
    'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=80',
    'hero',
    3,
    (SELECT id FROM products WHERE name = 'Sticker Pack Moodboard' LIMIT 1)
  ),
  (
    'workshop-ke-chuyen-thuong-hieu-ca-nhan',
    'Workshop Kể Chuyện Thương Hiệu Cá Nhân',
    'Workshop',
    'Học cách viết mô tả và định hình tiếng nói cá nhân',
    'Buổi workshop tập trung vào storytelling cho sản phẩm sáng tạo, giúp designer viết mô tả, bio và định hình cách giới thiệu portfolio.',
    'Nội dung cộng đồng nhằm tăng kỹ năng mềm và khả năng thương mại hóa cho designer mới bắt đầu.',
    '["Storytelling cho portfolio", "Thực hành bio và mô tả sản phẩm", "Tăng khả năng thuyết phục người mua"]'::jsonb,
    '[
      {"heading":"Người mua cần nhiều hơn ảnh đẹp","body":"Ảnh là bước mở đầu, nhưng quyết định mua hàng thường đến từ mô tả rõ ràng, ngôn ngữ nhất quán và câu chuyện thương hiệu có chiều sâu.","image_url":"https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=80"},
      {"heading":"Một giọng kể đáng nhớ","body":"Designer sinh viên có thể khác biệt hơn nếu biết cách viết về cảm hứng, chất liệu, cách sử dụng và giá trị cá nhân của từng thiết kế.","image_url":"https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1400&q=80"}
    ]'::jsonb,
    '[
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1400&q=80"
    ]'::jsonb,
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1600&q=80',
    'side',
    1,
    (SELECT id FROM products WHERE name = 'Sổ Tay Sketch Journal' LIMIT 1)
  ),
  (
    'goc-tin-cay-qc-artdict',
    'Góc Tin Cậy & QC Của Artdict',
    'Niềm tin người mua',
    'Giảm nỗi lo về chất lượng và mô tả sản phẩm',
    'Một thẻ nội dung cố định trên trang chủ để nhấn mạnh vai trò kiểm soát chất lượng, mô tả minh bạch và phản hồi sau mua.',
    'Thông điệp hỗ trợ giúp người mua an tâm hơn khi tiếp cận các sản phẩm sáng tạo từ designer sinh viên.',
    '["Nhấn mạnh kiểm soát chất lượng", "Tăng niềm tin khi mua", "Khuyến khích phản hồi minh bạch"]'::jsonb,
    '[
      {"heading":"Tin cậy được xây từ chi tiết nhỏ","body":"Nội dung QC không cần dài, nhưng cần xuất hiện đúng chỗ để người mua biết rằng sản phẩm trên nền tảng được mô tả minh bạch và có cơ chế phản hồi rõ ràng.","image_url":"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80"}
    ]'::jsonb,
    '[
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80"
    ]'::jsonb,
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    'side',
    2,
    (SELECT id FROM products WHERE name = 'Cốc Sứ Quiet Studio' LIMIT 1)
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
    580000,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
  ),
  (
    (SELECT id FROM users WHERE email = 'an@artdict.vn'),
    'processing',
    'paid',
    'cs_demo_paid_002',
    'pi_demo_paid_002',
    380000,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    (SELECT id FROM users WHERE email = 'linh@artdict.vn'),
    'awaiting_payment',
    'pending',
    'cs_demo_pending_003',
    NULL,
    500000,
    NULL,
    NOW() - INTERVAL '8 hours'
  );

INSERT INTO order_items (order_id, product_id, quantity, price)
VALUES
  (
    1,
    (SELECT id FROM products WHERE name = 'Poster Risograph Sài Gòn Đêm Mưa'),
    1,
    320000
  ),
  (
    1,
    (SELECT id FROM products WHERE name = 'Tote Canvas Studio Notes'),
    1,
    260000
  ),
  (
    2,
    (SELECT id FROM products WHERE name = 'Cốc Sứ Quiet Studio'),
    1,
    290000
  ),
  (
    2,
    (SELECT id FROM products WHERE name = 'Sticker Pack Moodboard'),
    1,
    90000
  ),
  (
    3,
    (SELECT id FROM products WHERE name = 'Áo Thun Creative Block'),
    1,
    340000
  ),
  (
    3,
    (SELECT id FROM products WHERE name = 'Lịch Bàn Campus Seasons'),
    1,
    160000
  );

INSERT INTO comments (product_id, user_id, content, media_url, media_type, created_at)
VALUES
  (
    (SELECT id FROM products WHERE name = 'Poster Risograph Sài Gòn Đêm Mưa'),
    (SELECT id FROM users WHERE email = 'linh@artdict.vn'),
    'Bản in đẹp hơn mình nghĩ, màu lên rất ấm và hợp với góc học tập. Mô tả sản phẩm rõ ràng nên lúc nhận hàng không bị hụt hẫng.',
    NULL,
    NULL,
    NOW() - INTERVAL '4 days'
  ),
  (
    (SELECT id FROM products WHERE name = 'Cốc Sứ Quiet Studio'),
    (SELECT id FROM users WHERE email = 'an@artdict.vn'),
    'Cốc cầm chắc tay, hình in tinh tế và đúng tinh thần tối giản. Rất hợp để làm quà tặng cho bạn làm thiết kế.',
    NULL,
    NULL,
    NOW() - INTERVAL '1 day'
  );

COMMIT;
