# Artdict

Ứng dụng fullstack cho dự án Artdict: nền tảng kết hợp `portfolio + marketplace + community` dành cho designer sinh viên.

## Công nghệ

- Frontend: React, Vite, TailwindCSS, Axios, React Router
- Backend: Node.js, Express, PostgreSQL, JWT, bcrypt
- Thanh toán: Stripe Checkout + webhook xác nhận đơn
- Dữ liệu mẫu: PostgreSQL schema + seed theo đúng ngữ cảnh Artdict

## Cấu trúc thư mục

```text
.
├── backend
├── database
└── frontend
```

## Tài khoản mẫu

- Quản trị: `admin@artdict.vn` / `Admin@123`
- Khách hàng: `linh@artdict.vn` / `User@1234`

## Chạy nhanh với Docker

### 1. Khởi động PostgreSQL

```bash
docker compose up -d db
```

### 2. Cấu hình biến môi trường

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Nếu bạn chạy DB local bằng Docker, sửa `DATABASE_URL` trong `backend/.env` thành:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/artdict_db
```

### 3. Tạo schema DB

```bash
docker compose exec -T db psql -U postgres -d artdict_db -f /database/schema.sql
```

### 4. Nạp lại dữ liệu mẫu Artdict

Lưu ý: lệnh seed sẽ `TRUNCATE` toàn bộ dữ liệu mẫu hiện có trước khi nạp lại dữ liệu mới.

```bash
docker compose exec -T db psql -U postgres -d artdict_db -f /database/seed.sql
```

### 5. Cài dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 6. Chạy backend và frontend

Backend:

```bash
cd backend && npm run dev
```

Frontend:

```bash
cd frontend && npm run dev
```

## Chạy với PostgreSQL local hoặc Supabase

Nếu bạn không dùng Docker, chỉ cần chạy 2 file SQL vào đúng database mà `DATABASE_URL` đang trỏ tới:

```bash
psql "postgresql://USER:PASSWORD@HOST:5432/DB_NAME" -f database/schema.sql
psql "postgresql://USER:PASSWORD@HOST:5432/DB_NAME" -f database/seed.sql
```

## Hướng dẫn sửa DB khi dữ liệu bị lệch

Khi bạn muốn làm sạch dữ liệu cũ và nạp lại đúng dữ liệu Artdict:

1. Dừng backend nếu đang chạy.
2. Chạy lại `schema.sql` để đảm bảo bảng/cột mới nhất đã có.
3. Chạy `seed.sql` để xóa dữ liệu mẫu cũ và nạp lại dữ liệu mới.
4. Khởi động lại backend.

Với Docker:

```bash
docker compose exec -T db psql -U postgres -d artdict_db -f /database/schema.sql
docker compose exec -T db psql -U postgres -d artdict_db -f /database/seed.sql
```

Với DB remote:

```bash
psql "$DATABASE_URL" -f database/schema.sql
psql "$DATABASE_URL" -f database/seed.sql
```

## Ghi chú

- `backend/src/config/runMigrations.js` hiện đọc trực tiếp `database/schema.sql`, nên khi backend khởi động nó sẽ luôn áp lại schema mới nhất.
- Seed mới đã đổi dữ liệu sang tiếng Việt, dùng giá VND và có sẵn sản phẩm, sự kiện, đơn hàng, đánh giá mẫu đúng ngữ cảnh Artdict.
- Stripe đang được cấu hình theo `VND`, nên giá trong DB và giao diện đã đồng bộ với thị trường Việt Nam.
