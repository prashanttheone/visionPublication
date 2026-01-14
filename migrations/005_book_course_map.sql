/**
 * ============================================
 * BOOK-COURSE MAPPING TABLE
 * ============================================
 * 
 * Purpose: Many-to-many relationship between books, courses, and semesters.
 * Allows a single book to be prescribed for multiple courses/semesters.
 * Enables tracking which books are required for which academic programs.
 * 
 * Key Fields:
 * - id: Serial primary key
 * - book_id, course_id, semester_id: Foreign keys
 * - UNIQUE(book_id, course_id, semester_id): Prevents duplicate mappings
 * 
 * Dependencies: books, courses, semesters (all required)
 * Referenced By: None directly (used for lookups)
 * 
 * Use Cases:
 * - Find all books for BSc Nursing 1st Year 1st Semester
 * - Find all courses where a specific book is prescribed
 * - Filter books by academic program when shopping
 */

CREATE TABLE IF NOT EXISTS book_course_map (
    id SERIAL PRIMARY KEY,
    
    -- Foreign Keys
    book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    semester_id INT NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    
    -- Additional Info
    is_required BOOLEAN DEFAULT TRUE,
    is_recommended BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(book_id, course_id, semester_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_book_course_map_book_id ON book_course_map(book_id);
CREATE INDEX IF NOT EXISTS idx_book_course_map_course_id ON book_course_map(course_id);
CREATE INDEX IF NOT EXISTS idx_book_course_map_semester_id ON book_course_map(semester_id);
CREATE INDEX IF NOT EXISTS idx_book_course_map_course_semester ON book_course_map(course_id, semester_id);
