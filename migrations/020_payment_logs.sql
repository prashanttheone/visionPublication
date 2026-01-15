/**
 * ============================================
 * PAYMENT LOGS TABLE
 * ============================================
 */

CREATE TABLE IF NOT EXISTS payment_logs (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) NOT NULL, -- 'created', 'authorized', 'captured', 'failed'
    method VARCHAR(50), -- 'online', 'cod'
    error_code VARCHAR(100),
    error_description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_logs_order_id ON payment_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_razorpay_order ON payment_logs(razorpay_order_id);
