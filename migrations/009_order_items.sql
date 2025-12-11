/**
 * ============================================
 * ORDER ITEMS TABLE - Order Line Items
 * ============================================
 * 
 * Purpose: Store individual books/items within each order.
 * Maintains historical pricing at time of purchase (price snapshot).
 * Enables tracking of books ordered for each course/semester.
 * 
 * Key Fields:
 * - id: Serial primary key
 * - order_id: Foreign key to orders table (which order this belongs to)
 * - book_id: Foreign key to books table (which book was ordered)
 * - course_id, semester_id: Optional links to academic program
 * - price: Snapshot of book price at time of order
 * - offer_price: Snapshot of discount at time of order
 * 
 * Dependencies: orders (required), books (required), courses/semesters (optional)
 * Referenced By: reviews (customers review based on order items)
 * 
 * Data Preservation:
 * - Prices stored as snapshots (not linked to current book prices)
 * - Allows historical order reconstruction even if book prices change
 * - Multiple items per order supported
 * - Course/semester info preserved for context
 * 
 * Business Rules:
 * - quantity must be at least 1
 * - offer_price must be <= price (if provided)
 * - Can have multiple items from same book in one order
 * - Provides audit trail of what was purchased
 */

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    
    -- Foreign Keys
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    book_id INT NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
    
    -- Academic Context (Optional)
    course_id INT REFERENCES courses(id),
    semester_id INT REFERENCES semesters(id),
    
    -- Item Details
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    
    -- Price Snapshot (at time of purchase)
    price DECIMAL(10, 2) NOT NULL,                    -- Regular price
    offer_price DECIMAL(10, 2) CHECK (offer_price <= price),  -- Discount price
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_book_id ON order_items(book_id);
CREATE INDEX idx_order_items_course_id ON order_items(course_id);
CREATE INDEX idx_order_items_semester_id ON order_items(semester_id);
