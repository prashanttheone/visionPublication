/**
 * ============================================
 * WISHLIST TABLE - Save for Later
 * ============================================
 * 
 * Purpose: Allow users to bookmark/favorite books for future purchase.
 * Supports personalized recommendations and marketing analytics.
 * Temporary storage (unlike cart, not for immediate purchase).
 * 
 * Key Fields:
 * - id: Serial primary key
 * - user_id: Foreign key to users table (whose wishlist)
 * - book_id: Foreign key to books table (bookmarked book)
 * - added_at: When was book added to wishlist
 * - UNIQUE(user_id, book_id): Only one entry per user-book
 * 
 * Dependencies: users, books (both required)
 * Referenced By: None (used for lookups only)
 * 
 * Business Rules:
 * - Each user can wishlist same book only once
 * - Multiple users can wishlist same book
 * - Wishlist items persist until explicitly removed
 * - No quantity concept (unlike cart)
 * 
 * Data Lifecycle:
 * - Item added when user clicks "Add to Wishlist"
 * - Transferred to cart when user clicks "Move to Cart"
 * - Deleted when user removes from wishlist
 * - Persist across user sessions
 * 
 * Use Cases:
 * - Display user's wishlist on profile
 * - Send availability notifications
 * - Marketing: recommend similar books
 * - Analytics: track most wishlisted books
 * - Encourage purchase: "X users saved this book"
 */

CREATE TABLE IF NOT EXISTS wishlist (
    id SERIAL PRIMARY KEY,
    
    -- Foreign Keys
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    
    -- Timestamps
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE (user_id, book_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_book_id ON wishlist(book_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_added_at ON wishlist(added_at DESC);
