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
    ('BST Khăn 1_Jay LE.png', 'Khăn Lụa Họa Tiết Jay LE 01', 'Thời trang & Phụ kiện', 'vo-tuan-kiet'),
    ('BST Khăn 2_Jay LE.png', 'Khăn Lụa Họa Tiết Jay LE 02', 'Thời trang & Phụ kiện', 'vo-tuan-kiet'),
    ('Bandana_Jay LE.png', 'Bandana Jay LE Classic', 'Thời trang & Phụ kiện', 'vo-tuan-kiet'),
    ('Celebrate your birth month with this….jpg', 'Bookmark Cung Hoàng Đạo Theo Tháng', 'Quà tặng cá nhân hóa', 'le-gia-han'),
    ('Floating_ThieNgu.PNG', 'Tranh Floating Nghệ Thuật Thị Giác', 'Tranh in & Poster', 'nguyen-minh-thu'),
    ('Never lose your spot with our Birth Month….jpg', 'Bookmark Sinh Nhật Cá Nhân Hóa', 'Quà tặng cá nhân hóa', 'le-gia-han'),
    ('Promotional Gift Custom Shape Paper Bookmark Paper….jpg', 'Bookmark Giấy Cắt Hình Sáng Tạo', 'Quà tặng cá nhân hóa', 'do-yen-nhi'),
    ('Tranh Thông điệp_ThieNgu x HAP 1.png', 'Tranh Thông Điệp ThieNgu x HAP 01', 'Tranh in & Poster', 'nguyen-minh-thu'),
    ('Tranh Thông điệp_ThieNgu x HAP 2.png', 'Tranh Thông Điệp ThieNgu x HAP 02', 'Tranh in & Poster', 'nguyen-minh-thu'),
    ('Tranh Thông điệp_ThieNgu x HAP 4.png', 'Tranh Thông Điệp ThieNgu x HAP 04', 'Tranh in & Poster', 'nguyen-minh-thu'),
    ('Tranh thông điệp_ThieNgu x HAP 3.png', 'Tranh Thông Điệp ThieNgu x HAP 03', 'Tranh in & Poster', 'nguyen-minh-thu'),
    ('Zeecan Brands Designs Customized Logo Paper High….jpg', 'Thiệp Giấy Logo In Nổi Premium', 'Quà tặng cá nhân hóa', 'do-yen-nhi'),
    ('mu-1.webp', 'Mũ Lưỡi Trai Streetwear 01', 'Thời trang & Phụ kiện', 'tran-hoang-nam'),
    ('mu11.webp', 'Mũ Lưỡi Trai Streetwear 01 - Màu 2', 'Thời trang & Phụ kiện', 'tran-hoang-nam'),
    ('mu2.webp', 'Mũ Lưỡi Trai Streetwear 02', 'Thời trang & Phụ kiện', 'tran-hoang-nam'),
    ('mu21.webp', 'Mũ Lưỡi Trai Streetwear 02 - Màu 2', 'Thời trang & Phụ kiện', 'tran-hoang-nam'),
    ('mu3.webp', 'Mũ Lưỡi Trai Streetwear 03', 'Thời trang & Phụ kiện', 'tran-hoang-nam'),
    ('mu31.webp', 'Mũ Lưỡi Trai Streetwear 03 - Màu 2', 'Thời trang & Phụ kiện', 'tran-hoang-nam'),
    ('mu4.webp', 'Mũ Lưỡi Trai Streetwear 04', 'Thời trang & Phụ kiện', 'tran-hoang-nam'),
    ('mu41.webp', 'Mũ Lưỡi Trai Streetwear 04 - Màu 2', 'Thời trang & Phụ kiện', 'tran-hoang-nam'),
    ('tranh 2.jpg', 'Tranh Canvas Tối Giản 02', 'Decor & Không gian', 'bui-an-khang'),
    ('tranh 3.jpg', 'Tranh Canvas Tối Giản 03', 'Decor & Không gian', 'bui-an-khang'),
    ('tranh 4.jpg', 'Tranh Canvas Tối Giản 04', 'Decor & Không gian', 'bui-an-khang'),
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
  '/product img/' || p.filename
FROM prepared p
JOIN categories c ON c.name = p.category_name
JOIN authors a ON a.slug = p.author_slug;

COMMIT;
