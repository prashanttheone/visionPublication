/**
 * ============================================
 * COURSES TABLE - Academic Programs
 * ============================================
 * 
 * Purpose: Store academic course information like BSc Nursing, GNM,
 * Post Basic Nursing, Pharmacy, etc.
 * 
 * Key Fields:
 * - id: Serial primary key
 * - name: Course name (unique)
 * - created_at: Timestamp of creation
 * 
 * Dependencies: None (root table)
 * Referenced By: semesters, book_course_map, order_items
 * 
 * Examples:
 * - BSc Nursing
 * - GNM (General Nursing & Midwifery)
 * - Post Basic BSc Nursing
 * - Pharmacy
 */

CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    
    -- Course Information
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_name ON courses(name);
