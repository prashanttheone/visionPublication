/**
 * ============================================
 * BOOK_SLIDERS TABLE - Homepage Banner Sliders
 * ============================================
 * 
 * Purpose: Manage dynamic book slider/carousel content for the homepage banner.
 * Store featured book promotions with custom messaging and images.
 * 
 * Key Fields:
 * - id: Serial primary key
 * - title: Main headline for the slider
 * - subtitle: Secondary headline/tagline
 * - description: Detailed description text
 * - image_url: Banner image URL (from Cloudinary)
 * - gradient: CSS gradient background for visual appeal
 * - book_id: Reference to featured book (optional, nullable)
 * - is_active: Control slider visibility without deletion
 * - display_order: Sort order for carousel presentation
 * - created_at, updated_at: Lifecycle timestamps
 * 
 * Dependencies: books table (optional foreign key)
 * Referenced By: None
 * 
 * Business Rules:
 * - Title and subtitle are required
 * - image_url should be a valid Cloudinary URL
 * - Only active sliders display on homepage
 * - display_order determines carousel sequence
 * - Book reference is optional for promotional content
 * 
 * Note: Supports unlimited carousel items with flexible scheduling
 * for seasonal promotions and featured content.
 */

CREATE TABLE IF NOT EXISTS book_sliders (
    id SERIAL PRIMARY KEY,
    
    -- Slider Content
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Media
    image_url VARCHAR(500) NOT NULL,
    
    -- References
    book_id INT,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL,
    
    -- Display Control
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_book_sliders_is_active ON book_sliders(is_active);
CREATE INDEX IF NOT EXISTS idx_book_sliders_display_order ON book_sliders(display_order);
CREATE INDEX IF NOT EXISTS idx_book_sliders_book_id ON book_sliders(book_id);
