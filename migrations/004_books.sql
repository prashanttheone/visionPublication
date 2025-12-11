/**
 * ============================================
 * BOOKS TABLE - Book Catalog
 * ============================================
 * 
 * Purpose: Store complete book information including pricing, metadata,
 * and publication details.
 * 
 * Key Fields:
 * - id: Serial primary key
 * - name: Book title
 * - author: Author name
 * - isbn: Unique ISBN identifier
 * - actual_price: Original/list price
 * - offer_price: Discounted/selling price (must be <= actual_price)
 * - created_at, updated_at: Lifecycle timestamps
 * 
 * Dependencies: None (root table)
 * Referenced By: book_course_map, order_items, reviews, cart, wishlist
 * 
 * Business Rules:
 * - offer_price must not exceed actual_price
 * - ISBN must be unique
 * - Name and author are required
 * 
 * Note: Additional fields like category, rating, review_count,
 * stock_quantity should be added based on e-commerce requirements.
 */

CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    
    -- Book Information
    name VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    isbn VARCHAR(50) UNIQUE,
    edition VARCHAR(50),
    description TEXT,
    image_url VARCHAR(500),
    
    -- Pricing
    actual_price DECIMAL(10, 2) NOT NULL,
    offer_price DECIMAL(10, 2) NOT NULL CHECK (offer_price <= actual_price),
    
    -- Stock & Availability
    stock_quantity INT DEFAULT 0,
    in_stock BOOLEAN DEFAULT TRUE,
    
    -- Ratings & Reviews
    rating DECIMAL(3, 1) DEFAULT 0,
    reviews_count INT DEFAULT 0,
    
    -- Category/Classification
    category VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_name ON books(name);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_in_stock ON books(in_stock);
