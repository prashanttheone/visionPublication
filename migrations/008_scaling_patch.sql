-- ============================================================================
-- MIGRATION 008: E-Commerce Scaling Patch + Flexible Course Periods
-- Vision Publication - Production Ready Order Management & Course Structure
-- ============================================================================

-- ============================================================================
-- SECTION 1: ADD PERIOD TYPE AND LABEL TO SEMESTERS TABLE
-- Allows semesters table to store both Years and Semesters
-- ============================================================================

ALTER TABLE semesters ADD COLUMN IF NOT EXISTS period_type VARCHAR(20) DEFAULT 'SEMESTER';
ALTER TABLE semesters ADD COLUMN IF NOT EXISTS label VARCHAR(100);

-- ============================================================================
-- SECTION 2: ENHANCED ORDER MANAGEMENT FOR SCALING
-- ============================================================================

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
-- SECTION 3: SHIPPING ADDRESS SNAPSHOT (Immutable copy at order time)
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
-- SECTION 4: BILLING ADDRESS (For B2B & GST invoices)
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
-- SECTION 5: ENHANCED ORDER ITEMS
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
-- SECTION 6: REFUNDS TABLE
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
-- SECTION 7: INVOICES TABLE
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
-- SECTION 8: SHIPPING TRACKING EVENTS
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
-- SECTION 9: COUPONS & PROMOTIONS (For E-Commerce Scaling)
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
-- SECTION 10: ORDER CANCELLATION REQUESTS
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
-- SECTION 11: RETURN REQUESTS
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
-- SECTION 12: INVENTORY MANAGEMENT
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
-- SECTION 13: INDEXES FOR PERFORMANCE
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

CREATE INDEX IF NOT EXISTS idx_semesters_course_id ON semesters(course_id);
CREATE INDEX IF NOT EXISTS idx_book_course_map_book_id ON book_course_map(book_id);
CREATE INDEX IF NOT EXISTS idx_book_course_map_course_id ON book_course_map(course_id);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_dates ON coupons(valid_from, valid_until);

-- ============================================================================
-- SECTION 14: TRIGGERS FOR NEW TABLES
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_order_refunds_updated_at ON order_refunds;
CREATE TRIGGER trg_order_refunds_updated_at BEFORE UPDATE ON order_refunds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_order_invoices_updated_at ON order_invoices;
CREATE TRIGGER trg_order_invoices_updated_at BEFORE UPDATE ON order_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_coupons_updated_at ON coupons;
CREATE TRIGGER trg_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_order_cancellation_requests_updated_at ON order_cancellation_requests;
CREATE TRIGGER trg_order_cancellation_requests_updated_at BEFORE UPDATE ON order_cancellation_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_order_return_requests_updated_at ON order_return_requests;
CREATE TRIGGER trg_order_return_requests_updated_at BEFORE UPDATE ON order_return_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
