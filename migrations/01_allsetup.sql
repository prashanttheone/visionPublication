-- 1-COURSES TABLE
         -- Stores BSC Nursing, GNM, Post Basic, Pharmacy
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 2 SEMESTERS TABLE
-- Each course can have multiple semesters/years.

CREATE TABLE semesters (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    semester_number INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(course_id, semester_number)
);

-- 3  BOOKS TABLE
 -- Main book details
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    isbn VARCHAR(50) UNIQUE,
    edition VARCHAR(50),
    description TEXT,
    
    actual_price DECIMAL(10,2) NOT NULL,
    offer_price DECIMAL(10,2) NOT NULL CHECK (offer_price <= actual_price),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. BOOK–COURSE–SEMESTER MAPPING
-- This allows same book to belong to multiple courses & semesters
CREATE TABLE book_course_map (
    id SERIAL PRIMARY KEY,

    book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    semester_id INT NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(book_id, course_id, semester_id)
);


-- 1️ USERS (AUTH + CORE IDENTITY)
-- This is your main user table used for login & ownership.

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE,

    password_hash TEXT NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'user'
        CHECK (role IN ('user', 'admin', 'manager')),

    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--2 STANDARD user_addresses TABLE
CREATE TABLE user_addresses (
    id SERIAL PRIMARY KEY,

    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    -- Person Details
    full_name VARCHAR(150) NOT NULL,

    contact_no VARCHAR(15) NOT NULL,
    alternate_contact_no VARCHAR(15),

    -- Address Details
    address_line_1 TEXT NOT NULL,        -- House No, Building, Flat
    address_line_2 TEXT,                 -- Area, Street, Colony

    locality VARCHAR(150) NOT NULL,      -- Mohalla / Sector / Area
    landmark VARCHAR(150),               -- Near Temple, Hospital etc.

    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',

    -- Extra Delivery Flags
    address_type VARCHAR(20) DEFAULT 'home'
        CHECK (address_type IN ('home', 'office', 'hostel', 'other')),

    is_default BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,

    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    address_id INT NOT NULL
        REFERENCES user_addresses(id) ON DELETE SET NULL,

    -- Financials
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    shipping_charge DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,

    -- Payment
    payment_method VARCHAR(50) NOT NULL
        CHECK (payment_method IN ('cod', 'online', 'upi', 'card')),

    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),

    -- Order Status
    order_status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (order_status IN (
            'pending', 
            'confirmed',
            'processing',
            'shipped',
            'delivered',
            'cancelled',
            'returned'
        )),

    -- Tracking
    tracking_id VARCHAR(100),
    courier_name VARCHAR(100),

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ORDER ITEMS (LIST OF BOOKS IN EACH ORDER)
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,

    order_id INT NOT NULL
        REFERENCES orders(id) ON DELETE CASCADE,

    book_id INT NOT NULL
        REFERENCES books(id) ON DELETE RESTRICT,

    -- Course/Semester mapping for academic relevance
    course_id INT REFERENCES courses(id),
    semester_id INT REFERENCES semesters(id),

    quantity INT NOT NULL DEFAULT 1,

    price DECIMAL(10,2) NOT NULL,      -- Price at the time of purchase
    offer_price DECIMAL(10,2),         -- Effective price (if discount applied)

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

