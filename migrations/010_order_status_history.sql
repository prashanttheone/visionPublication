/**
 * ============================================
 * ORDER STATUS HISTORY TABLE - Audit Trail
 * ============================================
 * 
 * Purpose: Complete audit trail of all status changes for each order.
 * Tracks who changed status, when, and why (description).
 * Enables historical reconstruction of order lifecycle.
 * 
 * Key Fields:
 * - id: Serial primary key
 * - order_id: Foreign key to orders table
 * - status: The new status assigned (enum with valid values)
 * - description: Optional reason/details for the status change
 * - changed_by: Username/admin ID who made the change
 * - changed_at: Timestamp of when change occurred
 * 
 * Dependencies: orders (required)
 * Referenced By: None (used for lookups only)
 * 
 * Status Values:
 * - pending: Order created, awaiting confirmation
 * - confirmed: Order confirmed by store
 * - processing: Order being prepared for shipment
 * - shipped: Order handed to courier
 * - delivered: Order delivered to customer
 * - cancelled: Order cancelled
 * - returned: Order items returned by customer
 * 
 * Data Preservation:
 * - Never delete order status changes (immutable audit trail)
 * - Always recorded with timestamp and user info
 * - Enables customer service to see order timeline
 * - Required for dispute resolution
 * 
 * Business Rules:
 * - Each status change creates a new row (append-only)
 * - Can track status transitions over time
 * - Useful for customer notifications and tracking
 */

CREATE TABLE IF NOT EXISTS order_status_history (
    id SERIAL PRIMARY KEY,
    
    -- Foreign Key
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Status Information
    status VARCHAR(30) NOT NULL
        CHECK (status IN (
            'pending',
            'confirmed',
            'processing',
            'shipped',
            'delivered',
            'cancelled',
            'returned'
        )),
    
    -- Change Details
    description VARCHAR(500),
    metadata JSONB,           -- For storing raw webhook response or extra data
    changed_by VARCHAR(100),  -- Admin/system user who made the change
    
    -- Timestamp
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure columns exist for cases where table was created by older migrations
ALTER TABLE order_status_history ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_status ON order_status_history(status);
CREATE INDEX IF NOT EXISTS idx_order_status_history_changed_at ON order_status_history(changed_at);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_time ON order_status_history(order_id, changed_at DESC);
