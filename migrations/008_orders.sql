/**
 * ============================================
 * ORDERS TABLE - Purchase Orders
 * ============================================
 * 
 * Purpose: Core order table storing complete order information including
 * financial details, payment status, delivery tracking, and order lifecycle.
 * 
 * Key Fields:
 * - id: Serial primary key
 * - user_id: Foreign key to users table (who made the order)
 * - address_id: Foreign key to user_addresses (delivery address)
 * - Financial fields: subtotal, discount, shipping, total
 * - Payment & Order Status enums with strict validation
 * - Tracking fields for courier integration
 * 
 * Dependencies: users (required), user_addresses (required)
 * Referenced By: order_items, order_status_history
 * 
 * Status Workflow:
 * - pending → confirmed → processing → shipped → delivered
 * - Any status can transition to cancelled or returned
 * 
 * Payment Methods:
 * - cod (Cash on Delivery)
 * - online (Credit Card, Debit Card)
 * - upi (UPI Payment)
 * - card (Direct Card Payment)
 * 
 * Business Rules:
 * - total_amount must equal (subtotal - discount + shipping_charge)
 * - Only one order per transaction
 * - Payment status and order status are independently tracked
 * - Tracking info added when order ships
 */

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE, -- VP-10001
    
    -- User & Delivery Info
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_id INT NOT NULL REFERENCES user_addresses(id) ON DELETE SET NULL,
    
    -- Financial Details
    subtotal DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0,
    shipping_charge DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    
    -- Payment Information
    payment_method VARCHAR(50) NOT NULL
        CHECK (payment_method IN ('cod', 'online', 'upi', 'card')),
    
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    
    -- Razorpay Integration
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    
    -- Order Status
    order_status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (order_status IN (
            'pending',
            'confirmed',
            'processing',
            'shipped',
            'delivered',
            'cancelled',
            'returned'
        )),
    
    -- Tracking Information
    shiprocket_order_id VARCHAR(100),
    shiprocket_shipment_id VARCHAR(100),
    awb_number VARCHAR(100),
    tracking_id VARCHAR(100),
    courier_name VARCHAR(100),
    pickup_location VARCHAR(100),
    estimated_delivery_date DATE,
    delivered_at TIMESTAMP NULL,
    
    -- Cancellation Info
    cancelled_at TIMESTAMP NULL,
    cancellation_reason VARCHAR(500),
    
    -- Additional Info
    notes TEXT,
    metadata JSONB, -- For storing raw API responses or extra config
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure columns exist for cases where table was created by older migrations
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(50) UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_signature VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_order_id VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_shipment_id VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS awb_number VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_location VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR(500);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_id ON orders(tracking_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders(user_id, created_at);
