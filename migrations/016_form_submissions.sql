-- Create Contact Inquiries Table
CREATE TABLE IF NOT EXISTS contact_inquiries (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Author Applications Table
CREATE TABLE IF NOT EXISTS author_applications (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    qualification VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    experience VARCHAR(100) NOT NULL,
    book_title VARCHAR(500) NOT NULL,
    book_description TEXT NOT NULL,
    publishing_goal TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to auto-update updated_at for contact_inquiries
CREATE OR REPLACE FUNCTION update_contact_inquiries_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_contact_inquiries_timestamp ON contact_inquiries;
CREATE TRIGGER trigger_update_contact_inquiries_timestamp
BEFORE UPDATE ON contact_inquiries
FOR EACH ROW
EXECUTE FUNCTION update_contact_inquiries_timestamp();

-- Create trigger to auto-update updated_at for author_applications
CREATE OR REPLACE FUNCTION update_author_applications_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_author_applications_timestamp ON author_applications;
CREATE TRIGGER trigger_update_author_applications_timestamp
BEFORE UPDATE ON author_applications
FOR EACH ROW
EXECUTE FUNCTION update_author_applications_timestamp();
