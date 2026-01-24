-- ============================================================================
-- MIGRATION 008: E-Commerce Scaling Patch
-- Vision Publication - Production Ready Order Management & Course Structure
-- ============================================================================

-- ============================================================================
-- SECTION 1: COURSE TYPE ENUM & PERIOD TYPE ENUM
-- BSC_NURSING uses Semesters (8 semesters)
-- GNM uses Years (3 years)
-- POST_BASIC uses Years (2 years)
-- ============================================================================

CREATE TYPE course_type AS ENUM ('BSC_NURSING', 'GNM', 'POST_BASIC');
CREATE TYPE period_type AS ENUM ('SEMESTER', 'YEAR');

-- Add course_type and period_type columns to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_type course_type;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS period_type period_type;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS total_periods INT DEFAULT 1;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration_months INT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Update existing courses or set defaults based on course_type
-- BSC_NURSING: 8 semesters, GNM: 3 years, POST_BASIC: 2 years

-- ============================================================================
-- SECTION 2: REFACTOR SEMESTERS TO ACADEMIC_PERIODS (Semesters OR Years)
-- ============================================================================

ALTER TABLE semesters RENAME TO academic_periods;

ALTER TABLE academic_periods ADD COLUMN IF NOT EXISTS period_type period_type DEFAULT 'SEMESTER';
ALTER TABLE academic_periods RENAME COLUMN semester_number TO period_number;

-- Update constraint for period_number
ALTER TABLE academic_periods DROP CONSTRAINT IF EXISTS semesters_course_id_semester_number_key;
ALTER TABLE academic_periods ADD CONSTRAINT academic_periods_course_period_unique UNIQUE (course_id, period_number, period_type);

-- Add label field for display (e.g., "Semester 1", "Year 1")
ALTER TABLE academic_periods ADD COLUMN IF NOT EXISTS label VARCHAR(50);

-- ============================================================================
-- SECTION 3: UPDATE book_course_map TO REFERENCE academic_periods
-- ============================================================================

ALTER TABLE book_course_map RENAME COLUMN semester_id TO academic_period_id;

-- ============================================================================
-- SECTION 4: ENHANCED ORDER MANAGEMENT FOR SCALING
-- ============================================================================

-- Order Status Type for better consistency
CREATE TYPE order_status_type AS ENUM (
    'pending',
    'confirmed',
    'processing',
    'packed',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'return_requested',
    'return_approved',
    'return_picked',
    'returned',
    'refund_initiated',
    'refunded'
);

CREATE TYPE payment_status_type AS ENUM (
    'pending',
    'authorized',
    'captured',
    'paid',
    'failed',
    'refund_pending',
    'partially_refunded',
    'refunded',
    'cancelled'
);

CREATE TYPE payment_method_type AS ENUM (
    'cod',
    'razorpay',
    'upi',
    'card',
    'netbanking',
    'wallet',
    'emi'
);

-- Add new columns to orders table for scaling
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_source VARCHAR(50) DEFAULT 'website';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_ip VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_discount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10, 4) DEFAULT 1;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS weight_total DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS dimensions_total JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_gift BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gift_message TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_generated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS out_for_delivery_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_requested_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS priority_order BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_b2b BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gstin VARCHAR(20);

-- ============================================================================
-- SECTION 5: SHIPPING ADDRESS SNAPSHOT (Immutable copy at order time)
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_shipping_addresses (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    contact_no VARCHAR(15) NOT NULL,
    alternate_contact_no VARCHAR(15),
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    locality VARCHAR(150) NOT NULL,
    landmark VARCHAR(150),
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    state VARCHAR(100) NOT NULL,
    state_code VARCHAR(10),
    pincode VARCHAR(10) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    country_code VARCHAR(5) DEFAULT 'IN',
    address_type VARCHAR(20) DEFAULT 'home',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(order_id)
);

-- ============================================================================
-- SECTION 6: BILLING ADDRESS (For B2B & GST invoices)
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_billing_addresses (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    company_name VARCHAR(255),
    gstin VARCHAR(20),
    email VARCHAR(150),
    contact_no VARCHAR(15) NOT NULL,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    state_code VARCHAR(10),
    pincode VARCHAR(10) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(order_id)
);

-- ============================================================================
-- SECTION 7: ENHANCED ORDER ITEMS
-- ============================================================================

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS item_status VARCHAR(30) DEFAULT 'active';
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS weight DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS book_name VARCHAR(255);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS book_image VARCHAR(500);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS hsn_code VARCHAR(20);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS cancelled_qty INT DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS returned_qty INT DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS refunded_qty INT DEFAULT 0;

-- ============================================================================
-- SECTION 8: REFUNDS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_refunds (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    refund_number VARCHAR(50) UNIQUE,
    refund_type VARCHAR(30) NOT NULL DEFAULT 'full',
    refund_reason TEXT NOT NULL,
    refund_amount DECIMAL(10, 2) NOT NULL,
    original_payment_id VARCHAR(100),
    razorpay_refund_id VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SECTION 9: INVOICES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_invoices (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_type VARCHAR(30) DEFAULT 'standard',
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    shipping_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_status VARCHAR(30) DEFAULT 'pending',
    pdf_url TEXT,
    notes TEXT,
    metadata JSONB,
    generated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SECTION 10: SHIPPING TRACKING EVENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_tracking_events (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_status VARCHAR(100) NOT NULL,
    event_description TEXT,
    location VARCHAR(255),
    event_time TIMESTAMP WITH TIME ZONE NOT NULL,
    awb_number VARCHAR(100),
    courier_name VARCHAR(100),
    raw_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_tracking_events_order_id ON order_tracking_events(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_events_awb ON order_tracking_events(awb_number);

-- ============================================================================
-- SECTION 11: COUPONS & PROMOTIONS (For E-Commerce Scaling)
-- ============================================================================

CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(30) NOT NULL DEFAULT 'percentage',
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount DECIMAL(10, 2),
    usage_limit INT,
    usage_count INT DEFAULT 0,
    per_user_limit INT DEFAULT 1,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    applicable_courses JSONB,
    applicable_books JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    is_first_order_only BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coupon_usage (
    id SERIAL PRIMARY KEY,
    coupon_id INT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id INT REFERENCES orders(id) ON DELETE SET NULL,
    discount_applied DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(coupon_id, order_id)
);

-- ============================================================================
-- SECTION 12: ORDER CANCELLATION REQUESTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_cancellation_requests (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    additional_info TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SECTION 13: RETURN REQUESTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_return_requests (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    order_item_id INT REFERENCES order_items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    return_type VARCHAR(30) NOT NULL DEFAULT 'refund',
    reason VARCHAR(100) NOT NULL,
    detailed_reason TEXT,
    quantity INT NOT NULL DEFAULT 1,
    images JSONB,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    pickup_address_id INT REFERENCES user_addresses(id),
    pickup_scheduled_at TIMESTAMP WITH TIME ZONE,
    pickup_completed_at TIMESTAMP WITH TIME ZONE,
    quality_check_status VARCHAR(30),
    quality_check_notes TEXT,
    refund_amount DECIMAL(10, 2),
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SECTION 14: INVENTORY MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS inventory_transactions (
    id SERIAL PRIMARY KEY,
    book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    transaction_type VARCHAR(30) NOT NULL,
    quantity INT NOT NULL,
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,
    reference_type VARCHAR(50),
    reference_id INT,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_book_id ON inventory_transactions(book_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(transaction_type);

-- ============================================================================
-- SECTION 15: INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_shiprocket_order_id ON orders(shiprocket_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_awb_number ON orders(awb_number);
CREATE INDEX IF NOT EXISTS idx_orders_invoice_number ON orders(invoice_number);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_book_id ON order_items(book_id);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);

CREATE INDEX IF NOT EXISTS idx_academic_periods_course_id ON academic_periods(course_id);
CREATE INDEX IF NOT EXISTS idx_book_course_map_book_id ON book_course_map(book_id);
CREATE INDEX IF NOT EXISTS idx_book_course_map_course_id ON book_course_map(course_id);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_dates ON coupons(valid_from, valid_until);

-- ============================================================================
-- SECTION 16: TRIGGERS FOR NEW TABLES
-- ============================================================================

CREATE TRIGGER trg_order_refunds_updated_at BEFORE UPDATE ON order_refunds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_order_invoices_updated_at BEFORE UPDATE ON order_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_order_cancellation_requests_updated_at BEFORE UPDATE ON order_cancellation_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_order_return_requests_updated_at BEFORE UPDATE ON order_return_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SECTION 17: UPDATE eresource_books TO USE academic_periods
-- ============================================================================

ALTER TABLE eresource_books RENAME COLUMN semester_id TO academic_period_id;
ALTER TABLE eresource_books DROP CONSTRAINT IF EXISTS eresource_books_course_id_semester_id_book_name_key;
ALTER TABLE eresource_books ADD CONSTRAINT eresource_books_course_period_book_unique UNIQUE (course_id, academic_period_id, book_name);

-- ============================================================================
-- SECTION 18: ADD DEFAULT COURSES DATA
-- ============================================================================

-- Insert BSC_NURSING course with 8 semesters
INSERT INTO courses (name, description, course_type, period_type, total_periods, duration_months, is_active)
VALUES ('BSC Nursing', 'Bachelor of Science in Nursing - 4 Year Program', 'BSC_NURSING', 'SEMESTER', 8, 48, TRUE)
ON CONFLICT (name) DO UPDATE SET
    course_type = 'BSC_NURSING',
    period_type = 'SEMESTER',
    total_periods = 8,
    duration_months = 48;

-- Insert GNM course with 3 years
INSERT INTO courses (name, description, course_type, period_type, total_periods, duration_months, is_active)
VALUES ('GNM', 'General Nursing and Midwifery - 3 Year Program', 'GNM', 'YEAR', 3, 36, TRUE)
ON CONFLICT (name) DO UPDATE SET
    course_type = 'GNM',
    period_type = 'YEAR',
    total_periods = 3,
    duration_months = 36;

-- Insert POST_BASIC course with 2 years
INSERT INTO courses (name, description, course_type, period_type, total_periods, duration_months, is_active)
VALUES ('Post Basic BSC Nursing', 'Post Basic BSC Nursing - 2 Year Program', 'POST_BASIC', 'YEAR', 2, 24, TRUE)
ON CONFLICT (name) DO UPDATE SET
    course_type = 'POST_BASIC',
    period_type = 'YEAR',
    total_periods = 2,
    duration_months = 24;
