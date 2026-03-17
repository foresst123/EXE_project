import { pool } from "./db.js";

const bootstrapStatements = [
  `CREATE EXTENSION IF NOT EXISTS pgcrypto`,
  `CREATE TABLE IF NOT EXISTS users (
     id SERIAL PRIMARY KEY,
     name VARCHAR(120) NOT NULL,
     email VARCHAR(160) NOT NULL UNIQUE,
     password_hash VARCHAR(255) NOT NULL,
     role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
     created_at TIMESTAMP NOT NULL DEFAULT NOW()
   )`,
  `CREATE TABLE IF NOT EXISTS categories (
     id SERIAL PRIMARY KEY,
     name VARCHAR(120) NOT NULL UNIQUE
   )`,
  `CREATE TABLE IF NOT EXISTS authors (
     id SERIAL PRIMARY KEY,
     name VARCHAR(160) NOT NULL UNIQUE,
     slug VARCHAR(180) NOT NULL UNIQUE,
     bio TEXT NOT NULL DEFAULT '',
     avatar_url TEXT
   )`,
  `CREATE TABLE IF NOT EXISTS products (
     id SERIAL PRIMARY KEY,
     name VARCHAR(180) NOT NULL,
     description TEXT NOT NULL,
     price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
     stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
     category_id INT REFERENCES categories(id) ON DELETE SET NULL,
     image_url TEXT,
     created_at TIMESTAMP NOT NULL DEFAULT NOW()
   )`,
  `CREATE TABLE IF NOT EXISTS orders (
     id SERIAL PRIMARY KEY,
     user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     status VARCHAR(30) NOT NULL DEFAULT 'pending'
       CHECK (status IN ('pending', 'processing', 'shipped', 'completed', 'cancelled')),
     total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
     created_at TIMESTAMP NOT NULL DEFAULT NOW()
   )`,
  `CREATE TABLE IF NOT EXISTS order_items (
     id SERIAL PRIMARY KEY,
     order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
     product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
     quantity INT NOT NULL CHECK (quantity > 0),
     price NUMERIC(10, 2) NOT NULL CHECK (price >= 0)
   )`,
  `CREATE TABLE IF NOT EXISTS cart_items (
     id SERIAL PRIMARY KEY,
     user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
     quantity INT NOT NULL CHECK (quantity > 0),
     UNIQUE(user_id, product_id)
   )`,
];

const migrationStatements = [
  `ALTER TABLE users
   ADD COLUMN IF NOT EXISTS phone VARCHAR(40)`,
  `ALTER TABLE users
   ADD COLUMN IF NOT EXISTS location VARCHAR(120)`,
  `ALTER TABLE users
   ADD COLUMN IF NOT EXISTS bio TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE users
   ADD COLUMN IF NOT EXISTS avatar_url TEXT`,
  `ALTER TABLE users
   ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE`,
  `ALTER TABLE users
   ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP`,
  `ALTER TABLE users
   ADD COLUMN IF NOT EXISTS verification_email_sent_at TIMESTAMP`,
  `ALTER TABLE users
   ADD COLUMN IF NOT EXISTS preferred_auth_method VARCHAR(30) NOT NULL DEFAULT 'email'`,
  `ALTER TABLE users
   ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP`,
  `ALTER TABLE users
   ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW()`,
  `ALTER TABLE users
   DROP CONSTRAINT IF EXISTS users_preferred_auth_method_check`,
  `ALTER TABLE users
   ADD CONSTRAINT users_preferred_auth_method_check
   CHECK (preferred_auth_method IN ('email', 'authenticator', 'backup_codes'))`,
  `CREATE TABLE IF NOT EXISTS authors (
     id SERIAL PRIMARY KEY,
     name VARCHAR(160) NOT NULL UNIQUE,
     slug VARCHAR(180) NOT NULL UNIQUE,
     bio TEXT NOT NULL DEFAULT '',
     avatar_url TEXT
   )`,
  `ALTER TABLE products
   ADD COLUMN IF NOT EXISTS author_id INT REFERENCES authors(id) ON DELETE SET NULL`,
  `CREATE TABLE IF NOT EXISTS comments (
     id SERIAL PRIMARY KEY,
     product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
     user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     content VARCHAR(500) NOT NULL,
     media_url TEXT,
     media_type VARCHAR(20) CHECK (media_type IN ('image', 'video')),
     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
     UNIQUE(product_id, user_id)
   )`,
  `ALTER TABLE orders
   ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'pending'`,
  `ALTER TABLE orders
   ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255)`,
  `ALTER TABLE orders
   ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255)`,
  `ALTER TABLE orders
   ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP`,
  `ALTER TABLE orders
   DROP CONSTRAINT IF EXISTS orders_status_check`,
  `ALTER TABLE orders
   ALTER COLUMN status SET DEFAULT 'awaiting_payment'`,
  `UPDATE orders
   SET status = 'awaiting_payment'
   WHERE status = 'pending'`,
  `ALTER TABLE orders
   ADD CONSTRAINT orders_status_check
   CHECK (status IN ('awaiting_payment', 'payment_failed', 'processing', 'shipped', 'completed', 'cancelled'))`,
  `ALTER TABLE orders
   DROP CONSTRAINT IF EXISTS orders_payment_status_check`,
  `ALTER TABLE orders
   ADD CONSTRAINT orders_payment_status_check
   CHECK (payment_status IN ('pending', 'paid', 'failed'))`,
  `CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status)`,
  `CREATE INDEX IF NOT EXISTS idx_products_author_id ON products(author_id)`,
  `INSERT INTO authors (name, slug, bio, avatar_url)
   VALUES
     ('Avery Stone', 'avery-stone', 'Avery curates calm, minimal everyday tech and desk essentials with a strong focus on practical quality.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'),
     ('Mina Harper', 'mina-harper', 'Mina designs lifestyle pieces that balance warmth, utility, and clean visual detail for modern homes.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80'),
     ('Leo Carter', 'leo-carter', 'Leo focuses on travel-ready accessories and wearable devices that feel polished, durable, and useful every day.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'),
     ('Nora Quinn', 'nora-quinn', 'Nora builds bright everyday collections around movement, audio, and compact accessories.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'),
     ('Ethan Vale', 'ethan-vale', 'Ethan shapes clean gadget edits with an emphasis on durable materials and practical form.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80'),
     ('Sofia Lane', 'sofia-lane', 'Sofia mixes home utility with warm minimal styling for shelves, desks, and compact living spaces.', 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&q=80'),
     ('Kai Mercer', 'kai-mercer', 'Kai curates wearable tech and daily-carry gear with a sporty, lightweight point of view.', 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=400&q=80'),
     ('Ivy Brooks', 'ivy-brooks', 'Ivy focuses on calming desk rituals, soft light, and small products that improve long work sessions.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80'),
     ('Mason Reed', 'mason-reed', 'Mason creates product stories around commuting, travel, and resilient accessories that age well.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'),
     ('Chloe Hart', 'chloe-hart', 'Chloe favors soft lifestyle objects, clean silhouettes, and products that look light in a room.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'),
     ('Julian Park', 'julian-park', 'Julian brings a sharper electronics perspective to audio, charging, and streamlined mobile setups.', 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=400&q=80'),
     ('Emma Wren', 'emma-wren', 'Emma curates versatile home and lifestyle pieces that feel airy, useful, and easy to live with.', 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80'),
     ('Noah Finch', 'noah-finch', 'Noah works around travel edits, hybrid work tools, and accessories built to move between spaces.', 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=400&q=80'),
     ('Lila Monroe', 'lila-monroe', 'Lila brings warmth to the catalog through bold accent products and compact everyday upgrades.', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80')
   ON CONFLICT (slug) DO NOTHING`,
  `UPDATE products
   SET author_id = (SELECT id FROM authors WHERE slug = 'avery-stone')
   WHERE author_id IS NULL AND name = 'Noise-Canceling Headphones'`,
  `UPDATE products
   SET author_id = (SELECT id FROM authors WHERE slug = 'mina-harper')
   WHERE author_id IS NULL AND name = 'Minimal Desk Lamp'`,
  `UPDATE products
   SET author_id = (SELECT id FROM authors WHERE slug = 'leo-carter')
   WHERE author_id IS NULL AND name = 'Leather Laptop Sleeve'`,
  `UPDATE products
   SET author_id = (SELECT id FROM authors WHERE slug = 'leo-carter')
   WHERE author_id IS NULL AND name = 'Smart Watch'`,
  `INSERT INTO products (name, description, price, stock, category_id, author_id, image_url)
   SELECT
     'Portable Speaker',
     'Compact Bluetooth speaker with warm bass and a travel-friendly form.',
     89.00,
     28,
     (SELECT id FROM categories WHERE name = 'Electronics'),
     (SELECT id FROM authors WHERE slug = 'nora-quinn'),
     'https://images.unsplash.com/photo-1507878866276-a947ef722fee?auto=format&fit=crop&w=900&q=80'
   WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Portable Speaker')`,
  `INSERT INTO products (name, description, price, stock, category_id, author_id, image_url)
   SELECT
     'Wireless Charger Pad',
     'Slim charging pad designed for desks, nightstands, and hybrid work setups.',
     34.90,
     36,
     (SELECT id FROM categories WHERE name = 'Electronics'),
     (SELECT id FROM authors WHERE slug = 'ethan-vale'),
     'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80'
   WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Wireless Charger Pad')`,
  `INSERT INTO products (name, description, price, stock, category_id, author_id, image_url)
   SELECT
     'Ceramic Table Vase',
     'Soft matte vase for shelves, tables, and calm interior corners.',
     28.00,
     40,
     (SELECT id FROM categories WHERE name = 'Lifestyle'),
     (SELECT id FROM authors WHERE slug = 'sofia-lane'),
     'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=900&q=80'
   WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Ceramic Table Vase')`,
  `INSERT INTO products (name, description, price, stock, category_id, author_id, image_url)
   SELECT
     'Canvas Travel Tote',
     'Wide everyday tote for commuting, errands, and light weekend trips.',
     42.50,
     25,
     (SELECT id FROM categories WHERE name = 'Accessories'),
     (SELECT id FROM authors WHERE slug = 'mason-reed'),
     'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'
   WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Canvas Travel Tote')`,
  `INSERT INTO products (name, description, price, stock, category_id, author_id, image_url)
   SELECT
     'Desk Organizer Tray',
     'Low-profile tray set for pens, cables, and small work essentials.',
     24.00,
     50,
     (SELECT id FROM categories WHERE name = 'Lifestyle'),
     (SELECT id FROM authors WHERE slug = 'ivy-brooks'),
     'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=900&q=80'
   WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Desk Organizer Tray')`,
  `INSERT INTO products (name, description, price, stock, category_id, author_id, image_url)
   SELECT
     'Sport Earbuds',
     'Sweat-ready wireless earbuds built for short runs and daily movement.',
     74.00,
     31,
     (SELECT id FROM categories WHERE name = 'Electronics'),
     (SELECT id FROM authors WHERE slug = 'kai-mercer'),
     'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f37?auto=format&fit=crop&w=900&q=80'
   WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Sport Earbuds')`,
  `INSERT INTO products (name, description, price, stock, category_id, author_id, image_url)
   SELECT
     'Glass Water Bottle',
     'Clean reusable bottle with a silicone sleeve and light carry loop.',
     22.00,
     48,
     (SELECT id FROM categories WHERE name = 'Lifestyle'),
     (SELECT id FROM authors WHERE slug = 'chloe-hart'),
     'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=900&q=80'
   WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Glass Water Bottle')`,
  `INSERT INTO products (name, description, price, stock, category_id, author_id, image_url)
   SELECT
     'Laptop Stand',
     'Foldable aluminum stand for a better work angle at home or on the go.',
     46.00,
     32,
     (SELECT id FROM categories WHERE name = 'Accessories'),
     (SELECT id FROM authors WHERE slug = 'julian-park'),
     'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80'
   WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Laptop Stand')`,
  `INSERT INTO products (name, description, price, stock, category_id, author_id, image_url)
   SELECT
     'Ambient Floor Light',
     'Tall warm light with a soft glow for living rooms and bedrooms.',
     118.00,
     14,
     (SELECT id FROM categories WHERE name = 'Lifestyle'),
     (SELECT id FROM authors WHERE slug = 'emma-wren'),
     'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80'
   WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Ambient Floor Light')`,
  `INSERT INTO products (name, description, price, stock, category_id, author_id, image_url)
   SELECT
     'Travel Cable Kit',
     'Compact pouch with charging essentials for mobile work and short trips.',
     31.00,
     44,
     (SELECT id FROM categories WHERE name = 'Accessories'),
     (SELECT id FROM authors WHERE slug = 'noah-finch'),
     'https://images.unsplash.com/photo-1511385348-a52b4a160dc2?auto=format&fit=crop&w=900&q=80'
   WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Travel Cable Kit')`,
  `INSERT INTO products (name, description, price, stock, category_id, author_id, image_url)
   SELECT
     'Accent Desk Clock',
     'Minimal desktop clock with a quiet mechanism and brushed metal finish.',
     38.00,
     22,
     (SELECT id FROM categories WHERE name = 'Lifestyle'),
     (SELECT id FROM authors WHERE slug = 'lila-monroe'),
     'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=900&q=80'
   WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Accent Desk Clock')`,
  `CREATE TABLE IF NOT EXISTS events (
     id SERIAL PRIMARY KEY,
     slug VARCHAR(180) NOT NULL UNIQUE,
     title VARCHAR(180) NOT NULL,
     eyebrow VARCHAR(120),
     subtitle VARCHAR(180),
     description TEXT NOT NULL DEFAULT '',
     summary TEXT NOT NULL DEFAULT '',
     highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
     content JSONB NOT NULL DEFAULT '[]'::jsonb,
     gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb,
     banner_image_url TEXT NOT NULL,
     slot VARCHAR(20) NOT NULL DEFAULT 'hero',
     sort_order INT NOT NULL DEFAULT 0,
     is_active BOOLEAN NOT NULL DEFAULT TRUE,
     product_id INT REFERENCES products(id) ON DELETE SET NULL,
     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
     CHECK (slot IN ('hero', 'side'))
   )`,
  `ALTER TABLE events
   ADD COLUMN IF NOT EXISTS summary TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE events
   ADD COLUMN IF NOT EXISTS highlights JSONB NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE events
   ADD COLUMN IF NOT EXISTS content JSONB NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE events
   ADD COLUMN IF NOT EXISTS gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb`,
  `CREATE INDEX IF NOT EXISTS idx_comments_product_id ON comments(product_id)`,
  `CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_events_slot_sort_order ON events(slot, sort_order)`,
  `UPDATE users
   SET
     phone = COALESCE(phone, '+84 28 7300 5050'),
     location = COALESCE(location, 'Ho Chi Minh City, Vietnam'),
     bio = CASE
       WHEN COALESCE(bio, '') = '' AND email = 'admin@example.com'
         THEN 'Admin account for managing the EXE Store catalog, customers, orders, and campaign content.'
       WHEN COALESCE(bio, '') = '' AND email = 'john@example.com'
         THEN 'John keeps an eye on audio gear, home office tools, and small upgrades worth saving for.'
       ELSE COALESCE(bio, '')
     END,
     avatar_url = CASE
       WHEN avatar_url IS NULL AND email = 'admin@example.com'
         THEN 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80'
       WHEN avatar_url IS NULL AND email = 'john@example.com'
         THEN 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
       ELSE avatar_url
     END,
     email_verified = CASE WHEN email = 'admin@example.com' THEN TRUE ELSE email_verified END,
     email_verified_at = CASE WHEN email = 'admin@example.com' AND email_verified_at IS NULL THEN NOW() ELSE email_verified_at END,
     preferred_auth_method = COALESCE(preferred_auth_method, 'email'),
     updated_at = NOW()
   WHERE email IN ('admin@example.com', 'john@example.com')`,
  `INSERT INTO events (slug, title, eyebrow, subtitle, description, summary, highlights, content, gallery_images, banner_image_url, slot, sort_order, product_id)
   VALUES
     (
       'weekend-tech-drop',
       'Weekend Tech Drop',
       'Weekend event',
       'Fresh audio and wearable picks',
       'A rotating homepage event area built for product-led campaigns and short-term promotions.',
       'A short editorial event story about audio, focus, and the products shaping this week''s storefront.',
       '["Noise-canceling focus", "Fast-moving audio gear", "Editorial event storytelling"]'::jsonb,
       '[
         {"heading":"What this event highlights","body":"Weekend Tech Drop gathers the products that are pulling attention right now and frames them like a campaign story instead of a plain product grid.","image_url":"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=80"},
         {"heading":"Why the layout matters","body":"The page is structured to be scanned quickly: a strong lead image, short supporting copy, and clearly separated sections so the event feels closer to an editorial article than a raw promotion.","image_url":"https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1400&q=80"},
         {"heading":"How to explore the drop","body":"Visitors can move from the homepage banner into a richer event page, then continue into the related collection or product pages when they are ready to shop deeper.","image_url":"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80"}
       ]'::jsonb,
       '[
         "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=80",
         "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1400&q=80",
         "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80"
       ]'::jsonb,
       'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80',
       'hero',
       1,
       (SELECT id FROM products WHERE name = 'Noise-Canceling Headphones' LIMIT 1)
     ),
     (
       'desk-setup-edit',
       'Desk Setup Edit',
       'Featured drop',
       'Calm essentials for focused work',
       'A second homepage event to keep the lead banner moving without changing the static side cards.',
       'A slower editorial feature about minimal desk tools, warm light, and the feel of a focused setup.',
       '["Calm workspace mood", "Minimal product framing", "Short-form editorial sections"]'::jsonb,
       '[
         {"heading":"A workspace with less noise","body":"Desk Setup Edit turns a simple promotion into an article-like page that explains the atmosphere behind the collection, not just the discount or CTA.","image_url":"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1400&q=80"},
         {"heading":"Editorial blocks, not crowded widgets","body":"Breaking the story into compact sections keeps it readable. It helps visitors skim the page the same way they skim a well-designed feature article.","image_url":"https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80"},
         {"heading":"From event page to product decision","body":"The goal is not to trap the visitor in content. The article format builds trust and context first, then hands off to the shopping journey when the user is ready.","image_url":"https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1400&q=80"}
       ]'::jsonb,
       '[
         "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1400&q=80",
         "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80",
         "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1400&q=80"
       ]'::jsonb,
       'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1600&q=80',
       'hero',
       2,
       (SELECT id FROM products WHERE name = 'Minimal Desk Lamp' LIMIT 1)
     ),
     (
       'travel-ready-picks',
       'Travel-Ready Picks',
       'Fast movers',
       'Carry, protect, and go',
       'Use hero events to spotlight compact campaigns around accessories and everyday essentials.',
       'An event story about lightweight accessories, quick movement, and products made to leave the desk with you.',
       '["Mobile-friendly accessories", "Travel-ready essentials", "Compact shopping story"]'::jsonb,
       '[
         {"heading":"Products that move with you","body":"Travel-Ready Picks is structured like a short magazine feature: a strong visual lead, quick highlights, and simple sections that keep the event page easy to scan.","image_url":"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=80"},
         {"heading":"Designed for quick understanding","body":"Users rarely read every word. The page uses short paragraphs, distinct headings, and spaced sections so visitors can pick out the important parts fast.","image_url":"https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80"},
         {"heading":"A campaign page that still feels editorial","body":"Even when the goal is promotion, the page benefits from a cleaner story arc. That makes the event feel more curated and less like a wall of offers.","image_url":"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80"}
       ]'::jsonb,
       '[
         "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=80",
         "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80",
         "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80"
       ]'::jsonb,
       'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80',
       'hero',
       3,
       (SELECT id FROM products WHERE name = 'Leather Laptop Sleeve' LIMIT 1)
     ),
     (
       'smart-watch-focus',
       'Smart Watch Focus',
       'Limited highlight',
       'Health tracking meets clean design',
       'A dedicated event slot for wearables, gifting, or new-week promotions.',
       'A wearable-focused event page that reads like a campaign feature, with enough structure to keep the story clear.',
       '["Wearable spotlight", "Clear reading rhythm", "Image-led storytelling"]'::jsonb,
       '[
         {"heading":"A focused wearable story","body":"Smart Watch Focus uses imagery and short structured copy to make the event page feel purposeful rather than overloaded with promos.","image_url":"https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1400&q=80"},
         {"heading":"The value of article-like flow","body":"A banner may grab attention, but the event page is where visitors understand why the product belongs in the campaign. That is where article structure helps most.","image_url":"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80"},
         {"heading":"What readers can do next","body":"The layout keeps product interest alive without rushing the visitor. Read first, skim key points, then continue to product discovery from a clearer context.","image_url":"https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1400&q=80"}
       ]'::jsonb,
       '[
         "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1400&q=80",
         "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
         "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1400&q=80"
       ]'::jsonb,
       'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=80',
       'hero',
       4,
       (SELECT id FROM products WHERE name = 'Smart Watch' LIMIT 1)
     ),
     (
       'free-shipping-week',
       'Free Shipping Week',
       'Shipping perk',
       'Limited-time delivery benefits',
       'Keep this side banner fixed for shipping, voucher, or store-wide campaign messaging.',
       'A static supporting event about delivery perks, written as a short campaign note.',
       '["Fixed supporting banner", "Delivery-focused messaging"]'::jsonb,
       '[
         {"heading":"Why supporting events stay fixed","body":"The side banners should stay stable while the main hero rotates. That gives the page rhythm without making every element compete for attention.","image_url":"https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1400&q=80"}
       ]'::jsonb,
       '[
         "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1400&q=80"
       ]'::jsonb,
       'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
       'side',
       1,
       (SELECT id FROM products WHERE name = 'Leather Laptop Sleeve' LIMIT 1)
     ),
     (
       'creator-picks',
       'Creator Picks',
       'Store feature',
       'Top products selected for the week',
       'A second static banner to balance the hero area while the large left banner rotates.',
       'A supporting event about curation and product selection, meant to stay visible beside the rotating hero.',
       '["Static supporting feature", "Curated weekly picks"]'::jsonb,
       '[
         {"heading":"Curated side stories","body":"Not every event needs to animate. Some should stay visible and dependable so the hero slider remains the only moving part in the top section.","image_url":"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80"}
       ]'::jsonb,
       '[
         "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80"
       ]'::jsonb,
       'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
       'side',
       2,
       (SELECT id FROM products WHERE name = 'Minimal Desk Lamp' LIMIT 1)
     ),
     (
       'audio-week-notes',
       'Audio Week Notes',
       'Weekly edit',
       'Portable listening and desk-ready sound',
       'A story-led event around audio gear, portable listening, and the shift toward smaller devices with stronger everyday use.',
       'An article-style event focused on audio products worth keeping close all week.',
       '["Portable speaker story", "Desk-to-travel audio", "Lightweight listening setup"]'::jsonb,
       '[
         {"heading":"A tighter listening setup","body":"This event frames a small group of audio products as a lifestyle story. Instead of a wall of deals, the article leads with utility and rhythm.","image_url":"https://images.unsplash.com/photo-1507878866276-a947ef722fee?auto=format&fit=crop&w=1400&q=80"},
         {"heading":"Why compact audio keeps winning","body":"Portable speakers and earbuds continue to fit more moments of the day, from focused work to short travel windows.","image_url":"https://images.unsplash.com/photo-1606220588913-b3aacb4d2f37?auto=format&fit=crop&w=1400&q=80"}
       ]'::jsonb,
       '[
         "https://images.unsplash.com/photo-1507878866276-a947ef722fee?auto=format&fit=crop&w=1400&q=80",
         "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f37?auto=format&fit=crop&w=1400&q=80"
       ]'::jsonb,
       'https://images.unsplash.com/photo-1507878866276-a947ef722fee?auto=format&fit=crop&w=1600&q=80',
       'hero',
       5,
       (SELECT id FROM products WHERE name = 'Portable Speaker' LIMIT 1)
     ),
     (
       'calm-home-roundup',
       'Calm Home Roundup',
       'Room edit',
       'Warm objects for quieter interiors',
       'A quieter event for home objects, room lighting, and the small additions that make a space feel more settled.',
       'A slower home-focused event with a more magazine-like tone.',
       '["Warm room lighting", "Soft decor additions", "Quiet object-led curation"]'::jsonb,
       '[
         {"heading":"Objects that soften a room","body":"This event leans on materials, shape, and atmosphere. It reads more like a magazine spread than a standard promotion.","image_url":"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80"},
         {"heading":"Styling without clutter","body":"A smaller product story can feel stronger when it avoids overloading the page with too many modules and too much promotional copy.","image_url":"https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1400&q=80"}
       ]'::jsonb,
       '[
         "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
         "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1400&q=80"
       ]'::jsonb,
       'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
       'hero',
       6,
       (SELECT id FROM products WHERE name = 'Ambient Floor Light' LIMIT 1)
     ),
     (
       'commute-ready-gear',
       'Commute-Ready Gear',
       'Daily carry',
       'Move between desk, cafe, and train',
       'A practical event built around daily-carry items, slim travel tools, and products that move easily between spaces.',
       'A commuting story about bags, cable kits, and lightweight carry pieces.',
       '["Daily carry focus", "Compact essentials", "Mobile work routine"]'::jsonb,
       '[
         {"heading":"Carry less, move easier","body":"The strongest commuting products are the ones that disappear into the day. This event tells that story through a smaller set of essentials.","image_url":"https://images.unsplash.com/photo-1511385348-a52b4a160dc2?auto=format&fit=crop&w=1400&q=80"},
         {"heading":"A campaign built from movement","body":"Product stories around commuting work best when the pacing stays quick, visual, and grounded in routine use.","image_url":"https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80"}
       ]'::jsonb,
       '[
         "https://images.unsplash.com/photo-1511385348-a52b4a160dc2?auto=format&fit=crop&w=1400&q=80",
         "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80"
       ]'::jsonb,
       'https://images.unsplash.com/photo-1511385348-a52b4a160dc2?auto=format&fit=crop&w=1600&q=80',
       'side',
       3,
       (SELECT id FROM products WHERE name = 'Travel Cable Kit' LIMIT 1)
     ),
     (
       'studio-desk-notes',
       'Studio Desk Notes',
       'Work ritual',
       'Desk objects, lighting, and focus tools',
       'An event that collects a handful of desk products into a short, readable studio story.',
       'A supporting editorial note on desk rhythm and focused work.',
       '["Desk rhythm", "Focus-friendly objects"]'::jsonb,
       '[
         {"heading":"A desk story that breathes","body":"The page uses fewer objects, more space, and a slower reading pace so the products feel more considered.","image_url":"https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1400&q=80"}
       ]'::jsonb,
       '[
         "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1400&q=80"
       ]'::jsonb,
       'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1200&q=80',
       'side',
       4,
       (SELECT id FROM products WHERE name = 'Desk Organizer Tray' LIMIT 1)
     )
   ON CONFLICT (slug) DO UPDATE SET
     title = EXCLUDED.title,
     eyebrow = EXCLUDED.eyebrow,
     subtitle = EXCLUDED.subtitle,
     description = EXCLUDED.description,
     summary = EXCLUDED.summary,
     highlights = EXCLUDED.highlights,
     content = EXCLUDED.content,
     gallery_images = EXCLUDED.gallery_images,
     banner_image_url = EXCLUDED.banner_image_url,
     slot = EXCLUDED.slot,
     sort_order = EXCLUDED.sort_order,
     product_id = EXCLUDED.product_id,
     is_active = TRUE`,
];

export const runMigrations = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const statement of bootstrapStatements) {
      await client.query(statement);
    }

    for (const statement of migrationStatements) {
      await client.query(statement);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
