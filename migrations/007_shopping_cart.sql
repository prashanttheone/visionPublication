/**
 * ============================================
 * SHOPPING CART TABLE
 * ============================================
 * 
 * Purpose: Temporary storage for items a user has added to their shopping cart.
 * Persists cart items across sessions until order completion or cart clear.
 * 
 * Key Fields:
 * - id: Serial primary key
 * - user_id: Foreign key to users table (identifies cart owner)
 * - book_id: Foreign key to books table (item being purchased)
 * - quantity: Number of units in cart
 * - UNIQUE(user_id, book_id): Only one entry per user-book combination
 * 
 * Dependencies: users, books (both required)
 * Referenced By: None (used for lookups only)
 * 
 * Business Rules:
 * - Each user can add same book only once (quantity increases)
 * - Cart items are temporary (no association to orders here)
 * - Timestamps track when item was added/updated
 * 
 * Data Lifecycle:
 * - Item added when user clicks "Add to Cart"
 * - Quantity updated if same book added again
 * - Deleted when user proceeds to checkout or clears cart
 */

CREATE TABLE IF NOT EXISTS shopping_cart (
    id SERIAL PRIMARY KEY,
    
    -- Foreign Keys
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    
    -- Cart Item Details
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    
    -- Timestamps
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE (user_id, book_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_shopping_cart_user_id ON shopping_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_cart_book_id ON shopping_cart(book_id);
CREATE INDEX IF NOT EXISTS idx_shopping_cart_added_at ON shopping_cart(added_at);

/**
 * ============================================
 * AUTO-UPDATE TRIGGER FOR updated_at
 * ============================================
 * 
 * PostgreSQL trigger to automatically update updated_at timestamp
 * when any row in shopping_cart is modified.
 */

-- Create reusable trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to shopping_cart table
DROP TRIGGER IF EXISTS update_shopping_cart_updated_at ON shopping_cart;
CREATE TRIGGER update_shopping_cart_updated_at
    BEFORE UPDATE ON shopping_cart
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
