/**
 * ============================================
 * USERS TABLE - User Authentication & Identity
 * ============================================
 * 
 * Purpose: Core user table for authentication, profile management,
 * and role-based access control.
 * 
 * Key Fields:
 * - id: UUID primary key (auto-generated)
 * - email: Unique email for authentication
 * - role: User role (user, admin, manager)
 * - Verification flags for email and phone
 * - Timestamps for tracking user lifecycle
 * 
 * Dependencies: None (root table)
 * Referenced By: user_addresses, orders, order_items, reviews, cart, wishlist
 */

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE,
    
    -- Security
    password_hash TEXT NOT NULL,
    
    -- Role & Status
    role VARCHAR(20) NOT NULL DEFAULT 'user'
        CHECK (role IN ('user', 'admin', 'manager')),
    
    -- Verification Status
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
