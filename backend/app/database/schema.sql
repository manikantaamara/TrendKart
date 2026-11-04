-- ====================================================================
-- TRENDKART - HYPERLOCAL FASHION MARKETPLACE DATABASE SCHEMA
-- Production Schema Compatible with Supabase PostgreSQL 14+
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. USERS & PROFILES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('customer', 'shop_owner', 'delivery_partner', 'admin')),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- --------------------------------------------------------------------
-- 2. CUSTOMERS & ADDRESSES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preferred_gender VARCHAR(20) DEFAULT 'unisex',
    default_size VARCHAR(10) DEFAULT 'M',
    loyalty_points INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(50) DEFAULT 'Home',
    street TEXT NOT NULL,
    landmark VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_geo ON addresses(latitude, longitude);

-- --------------------------------------------------------------------
-- 3. SHOPS & OWNERS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shop_name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    banner_url VARCHAR(500),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    gst_number VARCHAR(20),
    rating DECIMAL(3,2) DEFAULT 4.8,
    total_ratings INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    opening_time TIME DEFAULT '09:00:00',
    closing_time TIME DEFAULT '21:00:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shops_slug ON shops(slug);
CREATE INDEX IF NOT EXISTS idx_shops_geo ON shops(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_shops_active ON shops(is_active, is_verified);

-- --------------------------------------------------------------------
-- 4. DELIVERY PARTNERS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS delivery_partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL, -- Bike, Scooter, Electric Vehicle
    vehicle_number VARCHAR(30) NOT NULL,
    driving_licence VARCHAR(50) NOT NULL,
    government_id VARCHAR(50),
    bank_details JSONB DEFAULT '{}'::jsonb,
    kyc_status VARCHAR(20) DEFAULT 'verified', -- pending, verified, rejected
    is_online BOOLEAN DEFAULT TRUE,
    current_lat DECIMAL(10, 8) DEFAULT 28.6180,
    current_lng DECIMAL(11, 8) DEFAULT 77.2100,
    rating DECIMAL(3,2) DEFAULT 4.9,
    total_deliveries INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_delivery_online ON delivery_partners(is_online, kyc_status);

-- --------------------------------------------------------------------
-- 5. CATEGORIES & BRANDS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon_name VARCHAR(50) DEFAULT 'Shirt',
    parent_id INT REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url VARCHAR(500),
    is_featured BOOLEAN DEFAULT FALSE
);

-- --------------------------------------------------------------------
-- 6. PRODUCTS, IMAGES & INVENTORY
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    brand_name VARCHAR(100),
    name VARCHAR(250) NOT NULL,
    slug VARCHAR(250) NOT NULL,
    description TEXT,
    gender VARCHAR(20) DEFAULT 'unisex', -- Men, Women, Kids, Unisex
    base_price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2),
    barcode VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    ai_generated_desc TEXT,
    rating DECIMAL(3,2) DEFAULT 4.8,
    distance_km DECIMAL(4,2) DEFAULT 1.2,
    delivery_mins INT DEFAULT 25,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_shop ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_cat ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size VARCHAR(20) NOT NULL,
    color VARCHAR(50) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 10,
    sku VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_product_size_color UNIQUE(product_id, size, color)
);

CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);

-- --------------------------------------------------------------------
-- 7. ORDERS & ORDER ITEMS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(30) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_name VARCHAR(150) NOT NULL,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
    shop_name VARCHAR(200) NOT NULL,
    delivery_partner_id UUID REFERENCES delivery_partners(id) ON DELETE SET NULL,
    delivery_address TEXT NOT NULL,
    delivery_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    delivery_fee DECIMAL(10,2) DEFAULT 30.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    net_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending_shop_acceptance', 
    -- Status values: pending_shop_acceptance, preparing, ready_for_pickup, assigned, out_for_delivery, delivered, cancelled
    payment_status VARCHAR(20) DEFAULT 'paid', -- pending, paid, failed, refunded
    payment_method VARCHAR(30) DEFAULT 'Razorpay / UPI',
    estimated_delivery_time VARCHAR(50) DEFAULT '25-30 mins',
    otp_code VARCHAR(6) NOT NULL,
    items_count INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_shop ON orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery ON orders(delivery_partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    inventory_id UUID REFERENCES inventory(id) ON DELETE SET NULL,
    product_name VARCHAR(250) NOT NULL,
    size VARCHAR(20) NOT NULL,
    color VARCHAR(50) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- --------------------------------------------------------------------
-- 8. PAYMENTS & TRANSACTIONS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'Razorpay / UPI',
    status VARCHAR(20) NOT NULL DEFAULT 'paid',
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 9. REAL-TIME DELIVERY TRACKING
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS delivery_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    delivery_partner_id UUID REFERENCES delivery_partners(id) ON DELETE CASCADE,
    driver_name VARCHAR(150),
    driver_phone VARCHAR(20),
    vehicle_number VARCHAR(30),
    driver_lat DECIMAL(10, 8) DEFAULT 28.6180,
    driver_lng DECIMAL(11, 8) DEFAULT 77.2100,
    shop_lat DECIMAL(10, 8) DEFAULT 28.6315,
    shop_lng DECIMAL(11, 8) DEFAULT 77.2167,
    customer_lat DECIMAL(10, 8) DEFAULT 28.5562,
    customer_lng DECIMAL(11, 8) DEFAULT 77.2066,
    speed_kmh DECIMAL(5,2) DEFAULT 25.0,
    status VARCHAR(50) DEFAULT 'assigned',
    estimated_minutes INT DEFAULT 15,
    otp_code VARCHAR(6) DEFAULT '4829',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 10. REVIEWS & RATINGS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_name VARCHAR(150),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(150),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL, -- shop, delivery_partner, product
    entity_id UUID NOT NULL,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating DECIMAL(3,2) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 11. COUPONS, NOTIFICATIONS, WALLETS & TRANSACTIONS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) DEFAULT 'fixed',
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0.00,
    valid_until TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP + INTERVAL '30 days',
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(10,2) DEFAULT 1420.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- credit, debit
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    reference_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'order',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    revenue DECIMAL(10,2) DEFAULT 0.00,
    orders_count INT DEFAULT 0,
    top_product_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- SEED DATA FOR DEMO & TESTING
-- ====================================================================
INSERT INTO categories (id, name, slug, icon_name) VALUES
(1, 'Men Fashion', 'men-fashion', 'Shirt'),
(2, 'Women Fashion', 'women-fashion', 'ShoppingBag'),
(3, 'Kids Wear', 'kids-wear', 'Smile'),
(4, 'Ethnic & Festival', 'ethnic-festival', 'Sparkles'),
(5, 'Footwear', 'footwear', 'Footprints'),
(6, 'Accessories', 'accessories', 'Watch')
ON CONFLICT (id) DO NOTHING;

INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount) VALUES
('TREND300', 'Flat ₹300 Off on orders above ₹1499', 'fixed', 300.00, 1499.00),
('INSTANT50', 'Free Express Doorstep Delivery', 'fixed', 30.00, 0.00)
ON CONFLICT (code) DO NOTHING;
