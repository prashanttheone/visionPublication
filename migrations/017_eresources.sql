/**
 * ============================================
 * E-RESOURCES TABLES - Digital Study Materials
 * ============================================
 * 
 * Purpose: Store e-resource books and chapters linked to courses/semesters.
 * Each course/semester can have multiple e-resource books.
 * Each book can have multiple chapters with document links.
 * 
 * Dependencies: courses, semesters (required)
 */

-- E-Resource Books Table
CREATE TABLE IF NOT EXISTS eresource_books (
    id SERIAL PRIMARY KEY,
    
    -- Foreign Keys
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    semester_id INT NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    
    -- Book Information
    book_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(course_id, semester_id, book_name)
);

-- E-Resource Chapters Table
CREATE TABLE IF NOT EXISTS eresource_chapters (
    id SERIAL PRIMARY KEY,
    
    -- Foreign Key
    eresource_book_id INT NOT NULL REFERENCES eresource_books(id) ON DELETE CASCADE,
    
    -- Chapter Information
    chapter_number INT NOT NULL,
    chapter_name VARCHAR(255) NOT NULL,
    doc_link VARCHAR(1000),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(eresource_book_id, chapter_number)
);


-- Triggers for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_eresource_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_eresource_books_updated_at
    BEFORE UPDATE ON eresource_books
    FOR EACH ROW
    EXECUTE FUNCTION update_eresource_updated_at();

CREATE TRIGGER trigger_eresource_chapters_updated_at
    BEFORE UPDATE ON eresource_chapters
    FOR EACH ROW
    EXECUTE FUNCTION update_eresource_updated_at();
