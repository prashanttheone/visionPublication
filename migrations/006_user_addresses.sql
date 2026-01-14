/**
 * ============================================
 * USER ADDRESSES TABLE - Delivery & Billing
 * ============================================
 * 
 * Purpose: Store multiple shipping and billing addresses for each user.
 * Supports delivery to different locations (home, office, hostel, etc.)
 * 
 * Key Fields:
 * - id: Serial primary key
 * - user_id: Foreign key to users table
 * - address_type: home, office, hostel, or other
 * - is_default: Flag to identify default address
 * - Full address with all postal details
 * 
 * Dependencies: users (required)
 * Referenced By: orders (via order creation)
 * 
 * Business Rules:
 * - Each user can have multiple addresses
 * - Only one address can be default per type (optional constraint)
 * - Address fields are structured for postal/delivery service integration
 * 
 * Note: Contact_no is required for delivery. Alternate contact is optional.
 */

CREATE TABLE IF NOT EXISTS user_addresses (
    id SERIAL PRIMARY KEY,
    
    -- Foreign Key
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Person Details
    full_name VARCHAR(150) NOT NULL,
    contact_no VARCHAR(15) NOT NULL,
    alternate_contact_no VARCHAR(15),
    
    -- Address Details
    address_line_1 TEXT NOT NULL,        -- House No, Building, Flat
    address_line_2 TEXT,                 -- Area, Street, Colony
    locality VARCHAR(150) NOT NULL,      -- Mohalla / Sector / Area
    landmark VARCHAR(150),               -- Near Temple, Hospital etc.
    
    -- Postal Details
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    
    -- Address Classification
    address_type VARCHAR(20) DEFAULT 'home'
        CHECK (address_type IN ('home', 'office', 'hostel', 'other')),
    
    -- Default Flag
    is_default BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_pincode ON user_addresses(pincode);
CREATE INDEX IF NOT EXISTS idx_user_addresses_city ON user_addresses(city);
CREATE INDEX IF NOT EXISTS idx_user_addresses_is_default ON user_addresses(user_id, is_default);
