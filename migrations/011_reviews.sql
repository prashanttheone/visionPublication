/**
 * ============================================
 * REVIEWS TABLE - Customer Ratings & Feedback
 * ============================================
 * 
 * Purpose: Store customer reviews, ratings, and feedback for books.
 * Links reviews to actual orders (verified purchase).
 * Enables product recommendations and trust signals.
 * 
 * Key Fields:
 * - id: Serial primary key
 * - user_id: Foreign key to users table (who reviewed)
 * - book_id: Foreign key to books table (what was reviewed)
 * - order_item_id: Foreign key to order_items (from which purchase)
 * - rating: 1-5 star rating
 * - title & review_text: Review content
 * - helpful_count: How many found this review helpful
 * 
 * Dependencies: users, books, order_items (order_items is optional)
 * Referenced By: None (used for lookups only)
 * 
 * Business Rules:
 * - Rating must be between 1 and 5
 * - One review per user per book (UNIQUE constraint)
 * - Can only review books you've ordered (optional enforcement)
 * - Reviews are immutable once posted
 * - Helpful votes tracked for sorting
 * 
 * Data Preservation:
 * - Never delete reviews (maintain trust)
 * - Track creation/update timestamps
 * - Link to specific order for authenticity
 * - Support filtering and sorting by rating/helpfulness
 * 
 * Use Cases:
 * - Display book ratings on product page
 * - Show recent reviews
 * - Sort by most helpful reviews
 * - User review history
 * - Seller review metrics
 */

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    
    -- Foreign Keys
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    order_item_id INT REFERENCES order_items(id) ON DELETE SET NULL,
    
    -- Review Content
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    review_text TEXT,
    
    -- Engagement
    helpful_count INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE (user_id, book_id)
);

-- Indexes for performance
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_book_id ON reviews(book_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_helpful_count ON reviews(helpful_count DESC);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
