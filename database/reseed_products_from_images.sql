BEGIN;

TRUNCATE TABLE
  comments,
  order_items,
  cart_items,
  events,
  products
RESTART IDENTITY CASCADE;

WITH image_source (filename, product_name, category_name, author_slug) AS (
  VALUES
    ('654746562_122200870490377174_4682948422842574640_n.jpg', 'Poster Nghệ Thuật Đương Đại 01', 'Tranh in & Poster', 'nguyen-minh-thu'),
    ('655018572_122200490258377174_1095625658677615712_n.jpg', 'Poster Nghệ Thuật Đương Đại 02', 'Tranh in & Poster', 'le-gia-han'),
    ('655728112_122200627766377174_2757681508914295297_n.jpg', 'Poster Nghệ Thuật Đương Đại 03', 'Tranh in & Poster', 'tran-hoang-nam'),
    ('655973794_122200628408377174_9147435507863279442_n.jpg', 'Poster Nghệ Thuật Đương Đại 04', 'Tranh in & Poster', 'pham-bao-chau'),
    ('khan-lua-jay-le-1.png', 'Khăn Lụa Họa Tiết Jay LE 01', 'Thời trang & Phụ kiện', 'vo-tuan-kiet'),
    ('khan-lua-jay-le-2.png', 'Khăn Lụa Họa Tiết Jay LE 02', 'Thời trang & Phụ kiện', 'vo-tuan-kiet'),
    ('bandana-jay-le.png', 'Bandana Jay LE Classic', 'Thời trang & Phụ kiện', 'vo-tuan-kiet'),
    ('celebrate-birth-month-bookmark.jpg', 'Bookmark Cung Hoàng Đạo Theo Tháng', 'Quà tặng cá nhân hóa', 'le-gia-han'),
    ('floating-thiengu.png', 'Tranh Floating Nghệ Thuật Thị Giác', 'Tranh in & Poster', 'nguyen-minh-thu'),
    ('never-lose-spot-birth-month-bookmark.jpg', 'Bookmark Sinh Nhật Cá Nhân Hóa', 'Quà tặng cá nhân hóa', 'le-gia-han'),
    ('promotional-custom-shape-paper-bookmark.jpg', 'Bookmark Giấy Cắt Hình Sáng Tạo', 'Quà tặng cá nhân hóa', 'do-yen-nhi'),
    ('tranh-thong-diep-thiengu-x-hap-1.png', 'Tranh Thông Điệp ThieNgu x HAP 01', 'Tranh in & Poster', 'nguyen-minh-thu'),
    ('tranh-thong-diep-thiengu-x-hap-2.png', 'Tranh Thông Điệp ThieNgu x HAP 02', 'Tranh in & Poster', 'nguyen-minh-thu'),
    ('tranh-thong-diep-thiengu-x-hap-4.png', 'Tranh Thông Điệp ThieNgu x HAP 04', 'Tranh in & Poster', 'nguyen-minh-thu'),
    ('tranh-thong-diep-thiengu-x-hap-3.png', 'Tranh Thông Điệp ThieNgu x HAP 03', 'Tranh in & Poster', 'nguyen-minh-thu'),
    ('zeecan-customized-logo-paper.jpg', 'Thiệp Giấy Logo In Nổi Premium', 'Quà tặng cá nhân hóa', 'do-yen-nhi'),
    ('mu-1.webp', 'Mũ Lưỡi Trai Streetwear 01', 'Thời trang & Phụ kiện', 'tran-hoang-nam'),
    ('mu11.webp', 'Mũ Lưỡi Trai Streetwear 01 - Màu 2', 'Thời trang & Phụ kiện', 'tran-hoang-nam'),
    ('mu2.webp', 'Mũ Lưỡi Trai Streetwear 02', 'Thời trang & Phụ kiện', 'tran-hoang-nam'),
    ('mu21.webp', 'Mũ Lưỡi Trai Streetwear 02 - Màu 2', 'Thời trang & Phụ kiện', 'tran-hoang-nam'),
    ('mu3.webp', 'Mũ Lưỡi Trai Streetwear 03', 'Thời trang & Phụ kiện', 'tran-hoang-nam'),
    ('mu31.webp', 'Mũ Lưỡi Trai Streetwear 03 - Màu 2', 'Thời trang & Phụ kiện', 'tran-hoang-nam'),
    ('mu4.webp', 'Mũ Lưỡi Trai Streetwear 04', 'Thời trang & Phụ kiện', 'tran-hoang-nam'),
    ('mu41.webp', 'Mũ Lưỡi Trai Streetwear 04 - Màu 2', 'Thời trang & Phụ kiện', 'tran-hoang-nam'),
    ('tranh-2.jpg', 'Tranh Canvas Tối Giản 02', 'Decor & Không gian', 'bui-an-khang'),
    ('tranh-3.jpg', 'Tranh Canvas Tối Giản 03', 'Decor & Không gian', 'bui-an-khang'),
    ('tranh-4.jpg', 'Tranh Canvas Tối Giản 04', 'Decor & Không gian', 'bui-an-khang'),
    ('tranh.jpg', 'Tranh Canvas Tối Giản 01', 'Decor & Không gian', 'bui-an-khang')
),
prepared AS (
  SELECT
    filename,
    product_name,
    category_name,
    author_slug,
    CASE
      WHEN category_name = 'Tranh in & Poster' THEN 280000
      WHEN category_name = 'Thời trang & Phụ kiện' THEN 240000
      WHEN category_name = 'Decor & Không gian' THEN 320000
      ELSE 120000
    END AS price,
    CASE
      WHEN category_name = 'Thời trang & Phụ kiện' THEN 25
      WHEN category_name = 'Decor & Không gian' THEN 14
      ELSE 35
    END AS stock,
    CASE
      WHEN category_name = 'Tranh in & Poster' THEN
        'Thiết kế tranh lấy cảm hứng từ bố cục và màu sắc trong ảnh mẫu, phù hợp để treo tường phòng ngủ, góc học tập hoặc studio nhỏ.'
      WHEN category_name = 'Thời trang & Phụ kiện' THEN
        'Mẫu phụ kiện thời trang có phong cách trẻ trung, dễ phối đồ hằng ngày và phù hợp dùng khi đi học, đi làm hoặc đi sự kiện.'
      WHEN category_name = 'Decor & Không gian' THEN
        'Sản phẩm decor giúp không gian sống gọn gàng và có điểm nhấn thị giác, phù hợp cho bàn làm việc hoặc kệ trang trí cá nhân.'
      ELSE
        'Sản phẩm quà tặng cá nhân hóa có thiết kế dễ thương, phù hợp để tặng bạn bè, đồng nghiệp hoặc dùng trong các dịp đặc biệt.'
    END
    || ' Bộ ảnh tham chiếu: ' || SPLIT_PART(filename, '.', 1) || '.' AS description
  FROM image_source
)
INSERT INTO products (name, description, price, stock, category_id, author_id, image_url)
SELECT
  p.product_name,
  p.description,
  p.price,
  p.stock,
  c.id,
  a.id,
  '/product-img/' || p.filename
FROM prepared p
JOIN categories c ON c.name = p.category_name
JOIN authors a ON a.slug = p.author_slug;

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
    'Biến ý tưởng thành sản phẩm có thể bán',
    'Sự kiện tập trung vào hành trình biến bản phác thảo ban đầu thành sản phẩm hoàn chỉnh: từ ý tưởng, phối màu, chỉnh chất liệu đến trưng bày và thương mại hóa.',
    'Một sự kiện hero dành cho người quan tâm quá trình làm sản phẩm sáng tạo từ đầu đến cuối.',
    '["Quy trình tạo sản phẩm", "Từ concept đến bán hàng", "Bài học thực chiến cho designer trẻ"]'::jsonb,
    '[
      {"heading":"Từ concept đến sản phẩm thật","body":"Sự kiện mô tả cách một ý tưởng ban đầu được cụ thể hóa thành sản phẩm có thể trưng bày và bán trên sàn.","image_url":"/product-img/tranh-thong-diep-thiengu-x-hap-1.png"},
      {"heading":"Hoàn thiện portfolio cùng sản phẩm","body":"Người tham gia học cách kể câu chuyện thiết kế, chụp ảnh sản phẩm và xây hồ sơ creator nhất quán.","image_url":"/product-img/tranh-thong-diep-thiengu-x-hap-2.png"}
    ]'::jsonb,
    '[
      "/product-img/tranh-thong-diep-thiengu-x-hap-1.png",
      "/product-img/tranh-thong-diep-thiengu-x-hap-2.png",
      "/product-img/tranh-thong-diep-thiengu-x-hap-3.png"
    ]'::jsonb,
    '/product-img/tranh-thong-diep-thiengu-x-hap-1.png',
    'hero',
    1,
    (SELECT id FROM products WHERE name = 'Tranh Thông Điệp ThieNgu x HAP 01' LIMIT 1)
  ),
  (
    'creator-of-the-week-fpt-designers',
    'Creator of the Week: Gương Mặt Thiết Kế Nổi Bật',
    'Portfolio & cộng đồng',
    'Spotlight creator có cá tính thị giác rõ ràng',
    'Sự kiện tôn vinh các creator có phong cách thiết kế nổi bật, hình ảnh chỉn chu và khả năng kể chuyện sản phẩm tốt.',
    'Event hero nhấn mạnh giá trị thương hiệu cá nhân của designer trên nền tảng.',
    '["Spotlight creator", "Tăng nhận diện cá nhân", "Khuyến khích cộng đồng sáng tạo"]'::jsonb,
    '[
      {"heading":"Tạo niềm tin từ hồ sơ cá nhân","body":"Khi profile rõ ràng và sản phẩm nhất quán, khách hàng dễ đưa ra quyết định mua hơn.","image_url":"/product-img/654746562_122200870490377174_4682948422842574640_n.jpg"},
      {"heading":"Tăng cơ hội bán hàng cho creator","body":"Các creator được giới thiệu sẽ có thêm lượt xem sản phẩm, lượt lưu và khả năng chuyển đổi đơn hàng.","image_url":"/product-img/655018572_122200490258377174_1095625658677615712_n.jpg"}
    ]'::jsonb,
    '[
      "/product-img/654746562_122200870490377174_4682948422842574640_n.jpg",
      "/product-img/655018572_122200490258377174_1095625658677615712_n.jpg"
    ]'::jsonb,
    '/product-img/654746562_122200870490377174_4682948422842574640_n.jpg',
    'hero',
    2,
    (SELECT id FROM products WHERE name = 'Poster Nghệ Thuật Đương Đại 01' LIMIT 1)
  ),
  (
    'campus-booth-artdict',
    'Campus Booth Artdict: Trải Nghiệm Sản Phẩm Thật',
    'Trải nghiệm offline',
    'Kết nối online và booth trưng bày tại trường',
    'Sự kiện mô phỏng không gian booth trưng bày để người dùng xem sản phẩm trực tiếp, quét mã xem profile creator và đặt hàng ngay trên web.',
    'Event hero kết nối trải nghiệm offline với hành trình mua online.',
    '["Booth thực tế", "Xem sản phẩm trực tiếp", "Quét mã vào trang creator"]'::jsonb,
    '[
      {"heading":"Chạm sản phẩm trước khi quyết định","body":"Người dùng có thể trải nghiệm chất liệu, màu sắc thực tế trước khi quay lại mua online.","image_url":"/product-img/tranh-2.jpg"},
      {"heading":"Mua ngay bằng trải nghiệm liền mạch","body":"Sau khi tham quan booth, người dùng tiếp tục đặt hàng qua website với cùng sản phẩm đã xem.","image_url":"/product-img/tranh-3.jpg"}
    ]'::jsonb,
    '[
      "/product-img/tranh-2.jpg",
      "/product-img/tranh-3.jpg",
      "/product-img/tranh-4.jpg"
    ]'::jsonb,
    '/product-img/tranh-2.jpg',
    'hero',
    3,
    (SELECT id FROM products WHERE name = 'Tranh Canvas Tối Giản 02' LIMIT 1)
  ),
  (
    'silk-story-jay-le-soft-lines',
    'Silk Story: Soft Lines Collection',
    'Bộ sưu tập mới',
    'Khăn lụa Jay LE 01',
    'Thiết kế khăn lụa tập trung vào đường nét mềm và bảng màu nổi bật, phù hợp để tạo điểm nhấn cho outfit đi học, đi làm hoặc gặp gỡ cuối tuần.',
    'Giới thiệu mẫu khăn lụa Jay LE 01 với ngôn ngữ thị giác trẻ trung và ứng dụng cao.',
    '["Chất liệu nhẹ, dễ phối", "Tạo điểm nhấn nhanh cho trang phục", "Phù hợp phong cách hằng ngày"]'::jsonb,
    '[
      {"heading":"Từ họa tiết đến ứng dụng thực tế","body":"Mẫu khăn hướng đến việc phối nhanh với áo basic, blazer hoặc túi xách để tăng điểm nhấn mà vẫn giữ tổng thể gọn gàng.","image_url":"/product-img/khan-lua-jay-le-1.png"},
      {"heading":"Ngôn ngữ thị giác trẻ trung","body":"Bộ màu và nhịp điệu họa tiết được chọn để dễ dùng trong nhiều ngữ cảnh: đi học, đi làm, đi chơi.","image_url":"/product-img/khan-lua-jay-le-1.png"}
    ]'::jsonb,
    '["/product-img/khan-lua-jay-le-1.png"]'::jsonb,
    '/product-img/khan-lua-jay-le-1.png',
    'side',
    1,
    (SELECT id FROM products WHERE name = 'Khăn Lụa Họa Tiết Jay LE 01' LIMIT 1)
  ),
  (
    'silk-story-jay-le-bold-accent',
    'Silk Story: Bold Accent Collection',
    'Gợi ý phối đồ',
    'Khăn lụa Jay LE 02',
    'Mẫu khăn lụa thứ hai mang tinh thần nổi bật hơn, phù hợp với những set đồ cần điểm nhấn rõ ràng nhưng vẫn tinh tế.',
    'Mẫu Jay LE 02 dành cho người muốn tạo dấu ấn thị giác mạnh hơn trong cùng hệ khăn lụa.',
    '["Tông màu tạo độ nổi cao", "Phối tốt với trang phục trung tính", "Dùng được cho cả tóc, cổ và túi"]'::jsonb,
    '[
      {"heading":"Điểm nhấn cho outfit tối giản","body":"Khi kết hợp với áo trơn hoặc gam màu trung tính, khăn lụa giúp tổng thể có chiều sâu hơn mà không rối mắt.","image_url":"/product-img/khan-lua-jay-le-2.png"},
      {"heading":"Linh hoạt nhiều kiểu phối","body":"Có thể buộc cổ, buộc tóc hoặc tạo điểm nhấn cho túi xách để thay đổi phong cách nhanh trong ngày.","image_url":"/product-img/khan-lua-jay-le-2.png"}
    ]'::jsonb,
    '["/product-img/khan-lua-jay-le-2.png"]'::jsonb,
    '/product-img/khan-lua-jay-le-2.png',
    'side',
    2,
    (SELECT id FROM products WHERE name = 'Khăn Lụa Họa Tiết Jay LE 02' LIMIT 1)
  );

COMMIT;
