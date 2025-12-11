/**
 * ============================================
 * SEMESTERS TABLE - Course Terms/Years
 * ============================================
 * 
 * Purpose: Define semesters/years within each course.
 * Each course can have multiple semesters (1st Year Sem 1, 1st Year Sem 2, etc.)
 * 
 * Key Fields:
 * - id: Serial primary key
 * - course_id: Foreign key to courses table
 * - semester_number: Sequential semester number within a course
 * - UNIQUE(course_id, semester_number): Ensures no duplicate semesters per course
 * 
 * Dependencies: courses (required)
 * Referenced By: book_course_map, order_items
 * 
 * Examples:
 * - Course: BSc Nursing, Semester: 1 (1st Year 1st Sem)
 * - Course: BSc Nursing, Semester: 2 (1st Year 2nd Sem)
 * - Course: GNM, Semester: 1 (1st Year 1st Sem)
 */

CREATE TABLE IF NOT EXISTS semesters (
    id SERIAL PRIMARY KEY,
    
    -- Foreign Key
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    
    -- Semester Information
    semester_number INT NOT NULL,
    description VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(course_id, semester_number)
);

-- Indexes for performance
CREATE INDEX idx_semesters_course_id ON semesters(course_id);
CREATE INDEX idx_semesters_semester_number ON semesters(semester_number);
