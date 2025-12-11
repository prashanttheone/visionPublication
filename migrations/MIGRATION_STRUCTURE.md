# Database Migration Structure - Complete Reference

## 📋 Overview

Your database has been restructured into **12 modular migration files**, each handling one table with clear documentation. This approach provides:

✅ **Maintainability** - Each table is isolated, easy to modify  
✅ **Readability** - Comprehensive inline documentation  
✅ **Scalability** - Easy to add new tables without touching existing ones  
✅ **Auditability** - Clear separation of concerns  
✅ **Versionability** - Can create v2, v3 files for upgrades  

---

## 🎯 Table Dependencies & Execution Order

### ✅ PHASE 1: Root Tables (No Dependencies)

| File | Table | Purpose | Dependencies |
|------|-------|---------|--------------|
| `001_users.sql` | **users** | Authentication & user identity | None |
| `002_courses.sql` | **courses** | Academic programs | None |
| `004_books.sql` | **books** | Book catalog & inventory | None |

### ✅ PHASE 2: Core Reference Tables

| File | Table | Purpose | Dependencies |
|------|-------|---------|--------------|
| `003_semesters.sql` | **semesters** | Course terms/years | courses |
| `006_user_addresses.sql` | **user_addresses** | Shipping addresses | users |
| `007_shopping_cart.sql` | **shopping_cart** | Active cart items | users, books |
| `012_wishlist.sql` | **wishlist** | Bookmarked books | users, books |

### ✅ PHASE 3: Mapping Tables

| File | Table | Purpose | Dependencies |
|------|-------|---------|--------------|
| `005_book_course_map.sql` | **book_course_map** | Books → Courses mapping | books, courses, semesters |

### ✅ PHASE 4: Business Transactions

| File | Table | Purpose | Dependencies |
|------|-------|---------|--------------|
| `008_orders.sql` | **orders** | Purchase orders | users, user_addresses |

### ✅ PHASE 5: Order Details & Audit

| File | Table | Purpose | Dependencies |
|------|-------|---------|--------------|
| `009_order_items.sql` | **order_items** | Order line items | orders, books, courses, semesters |
| `010_order_status_history.sql` | **order_status_history** | Status change audit trail | orders |
| `011_reviews.sql` | **reviews** | Customer ratings & feedback | users, books, order_items |

---

## 📊 Complete Table Schema Summary

### 1️⃣ USERS TABLE
**File**: `001_users.sql`  
**Records**: User accounts  
**Key Fields**:
- `id` (UUID) - Primary key
- `email` (VARCHAR 150, UNIQUE) - Login email
- `password_hash` (TEXT) - Encrypted password
- `role` (ENUM: user, admin, manager) - Access level
- `is_email_verified`, `is_phone_verified` - Verification flags
- `is_active` - Soft delete flag

**Constraints**: Email & phone unique, role validation  
**Indexes**: email, phone, role, created_at

---

### 2️⃣ COURSES TABLE
**File**: `002_courses.sql`  
**Records**: Academic programs  
**Examples**:
- BSc Nursing (4 years, 8 semesters)
- GNM (3 years, 6 semesters)
- Post Basic BSc Nursing
- Pharmacy

**Key Fields**:
- `id` (SERIAL) - Primary key
- `name` (VARCHAR 100, UNIQUE) - Course name
- `description` (TEXT) - Course overview

**Constraints**: Name unique  
**Indexes**: name

---

### 3️⃣ SEMESTERS TABLE
**File**: `003_semesters.sql`  
**Records**: Terms within each course  
**Relationship**: Many semesters per course  
**Examples**:
- Course: BSc Nursing, Semester: 1 (1st Year 1st Term)
- Course: BSc Nursing, Semester: 2 (1st Year 2nd Term)

**Key Fields**:
- `id` (SERIAL) - Primary key
- `course_id` (INT FK) - Reference to courses
- `semester_number` (INT) - Sequential number (1, 2, 3...)
- `description` (VARCHAR 255) - Optional details

**Constraints**: UNIQUE(course_id, semester_number)  
**Indexes**: course_id, semester_number

---

### 4️⃣ BOOKS TABLE
**File**: `004_books.sql`  
**Records**: Book catalog  
**Typical Count**: 500-5000 books  

**Key Fields**:
- `id` (SERIAL) - Primary key
- `name` (VARCHAR 255) - Book title
- `author` (VARCHAR 255) - Author name
- `isbn` (VARCHAR 50, UNIQUE) - ISBN code
- `edition` (VARCHAR 50) - Edition info
- `actual_price` (DECIMAL 10,2) - List price
- `offer_price` (DECIMAL 10,2) - Selling price
- `stock_quantity` (INT) - Units available
- `in_stock` (BOOLEAN) - Availability flag
- `rating` (DECIMAL 3,1) - Average rating (0-5)
- `reviews_count` (INT) - Number of reviews
- `category` (VARCHAR 100) - Book category
- `image_url` (VARCHAR 500) - Product image

**Constraints**: offer_price ≤ actual_price, ISBN unique  
**Indexes**: isbn, name, author, category, in_stock

---

### 5️⃣ BOOK_COURSE_MAP TABLE
**File**: `005_book_course_map.sql`  
**Records**: Books prescribed for courses  
**Relationship**: Many-to-many (books ↔ courses)  
**Purpose**: Track which books are required for which academic program

**Key Fields**:
- `id` (SERIAL) - Primary key
- `book_id` (INT FK) - Book reference
- `course_id` (INT FK) - Course reference
- `semester_id` (INT FK) - Semester reference
- `is_required` (BOOLEAN) - Is mandatory for semester
- `is_recommended` (BOOLEAN) - Is recommended reading

**Constraints**: UNIQUE(book_id, course_id, semester_id)  
**Indexes**: book_id, course_id, semester_id, (course_id, semester_id)

---

### 6️⃣ USER_ADDRESSES TABLE
**File**: `006_user_addresses.sql`  
**Records**: User shipping & billing addresses  
**Relationship**: Multiple addresses per user (avg 2-3)  

**Key Fields**:
- `id` (SERIAL) - Primary key
- `user_id` (UUID FK) - User reference
- `full_name` (VARCHAR 150) - Recipient name
- `contact_no` (VARCHAR 15) - Primary phone
- `alternate_contact_no` (VARCHAR 15) - Secondary phone
- `address_line_1` (TEXT) - House/Building/Flat
- `address_line_2` (TEXT) - Area/Street/Colony
- `locality` (VARCHAR 150) - Sector/Locality
- `landmark` (VARCHAR 150) - Nearby landmark
- `city` (VARCHAR 100) - City
- `state` (VARCHAR 100) - State/Province
- `pincode` (VARCHAR 10) - ZIP/Postal code
- `country` (VARCHAR 100) - Country (default: India)
- `address_type` (ENUM: home, office, hostel, other)
- `is_default` (BOOLEAN) - Default delivery address

**Indexes**: user_id, pincode, city, (user_id, is_default)

---

### 7️⃣ SHOPPING_CART TABLE
**File**: `007_shopping_cart.sql`  
**Records**: Active shopping cart items  
**Relationship**: Multiple items per user  
**Data Lifecycle**: Temporary (cleared on checkout)

**Key Fields**:
- `id` (SERIAL) - Primary key
- `user_id` (UUID FK) - Cart owner
- `book_id` (INT FK) - Book in cart
- `quantity` (INT) - Number of copies
- `added_at` (TIMESTAMP) - When added
- `updated_at` (TIMESTAMP) - Last modified

**Constraints**: UNIQUE(user_id, book_id), quantity > 0  
**Indexes**: user_id, book_id, added_at

---

### 8️⃣ ORDERS TABLE
**File**: `008_orders.sql`  
**Records**: Purchase orders  
**Relationship**: One order per transaction  
**Data Retention**: Permanent (accounting requirement)

**Key Fields**:
- `id` (SERIAL) - Primary key
- `user_id` (UUID FK) - Who ordered
- `address_id` (INT FK) - Delivery address
- `subtotal` (DECIMAL 10,2) - Sum of items
- `discount` (DECIMAL 10,2) - Discount amount
- `shipping_charge` (DECIMAL 10,2) - Shipping cost
- `total_amount` (DECIMAL 10,2) - Final amount
- `payment_method` (ENUM: cod, online, upi, card)
- `payment_status` (ENUM: pending, paid, failed, refunded)
- `order_status` (ENUM: pending, confirmed, processing, shipped, delivered, cancelled, returned)
- `tracking_id` (VARCHAR 100) - Courier tracking ID
- `courier_name` (VARCHAR 100) - Shipping company
- `estimated_delivery_date` (DATE)
- `delivered_at` (TIMESTAMP) - When delivered
- `notes` (TEXT) - Special instructions

**Status Workflow**: pending → confirmed → processing → shipped → delivered  
**Indexes**: user_id, order_status, payment_status, created_at, tracking_id, (user_id, created_at)

---

### 9️⃣ ORDER_ITEMS TABLE
**File**: `009_order_items.sql`  
**Records**: Line items per order  
**Relationship**: Multiple items per order (avg 2-3)  
**Purpose**: Stores what was ordered (with price snapshots)

**Key Fields**:
- `id` (SERIAL) - Primary key
- `order_id` (INT FK) - Which order
- `book_id` (INT FK) - Which book
- `course_id` (INT FK) - Course context (optional)
- `semester_id` (INT FK) - Semester context (optional)
- `quantity` (INT) - Number of copies ordered
- `price` (DECIMAL 10,2) - Unit price at purchase time
- `offer_price` (DECIMAL 10,2) - Discount price at purchase time

**Data Preservation**: Prices stored as snapshots (historical accuracy)  
**Indexes**: order_id, book_id, course_id, semester_id

---

### 🔟 ORDER_STATUS_HISTORY TABLE
**File**: `010_order_status_history.sql`  
**Records**: Audit trail of status changes  
**Relationship**: Multiple entries per order (avg 4-5)  
**Data Retention**: Permanent (immutable audit log)

**Key Fields**:
- `id` (SERIAL) - Primary key
- `order_id` (INT FK) - Which order
- `status` (ENUM) - New status assigned
- `description` (VARCHAR 500) - Reason for change
- `changed_by` (VARCHAR 100) - Who made the change
- `changed_at` (TIMESTAMP) - When changed

**Use Cases**:
- Track complete order timeline
- Customer service: see order history
- Dispute resolution: proof of transitions
- Analytics: how long orders stay in each status

**Indexes**: order_id, status, changed_at, (order_id, changed_at DESC)

---

### 1️⃣1️⃣ REVIEWS TABLE
**File**: `011_reviews.sql`  
**Records**: Customer ratings & feedback  
**Relationship**: One review per user-book pair  

**Key Fields**:
- `id` (SERIAL) - Primary key
- `user_id` (UUID FK) - Who reviewed
- `book_id` (INT FK) - What was reviewed
- `order_item_id` (INT FK) - From which order
- `rating` (INT 1-5) - Star rating
- `title` (VARCHAR 255) - Review headline
- `review_text` (TEXT) - Full review
- `helpful_count` (INT) - "Helpful" votes
- `created_at` (TIMESTAMP) - Posted when
- `updated_at` (TIMESTAMP) - Updated when

**Constraints**: rating 1-5, UNIQUE(user_id, book_id)  
**Indexes**: user_id, book_id, rating, helpful_count, created_at

---

### 1️⃣2️⃣ WISHLIST TABLE
**File**: `012_wishlist.sql`  
**Records**: Bookmarked books  
**Relationship**: Multiple books per user  
**Purpose**: Save books for future purchase

**Key Fields**:
- `id` (SERIAL) - Primary key
- `user_id` (UUID FK) - Whose wishlist
- `book_id` (INT FK) - Bookmarked book
- `added_at` (TIMESTAMP) - When added

**Constraints**: UNIQUE(user_id, book_id)  
**Indexes**: user_id, book_id, added_at

---

## 🔄 Data Flow Diagram

```
User Registration
    ↓
Creates USER → Multiple USER_ADDRESSES
    ↓
Browses BOOKS (filtered by COURSE/SEMESTER via BOOK_COURSE_MAP)
    ↓
Adds to SHOPPING_CART or WISHLIST
    ↓
Checkout (SHOPPING_CART → ORDERS)
    ↓
Create ORDER_ITEMS (price snapshot)
    ↓
Payment Processing (update ORDER payment_status)
    ↓
Fulfillment (update ORDER order_status)
    ↓
Add ORDER_STATUS_HISTORY entries for each change
    ↓
Delivery & Notification
    ↓
Customer Reviews (create REVIEWS entry)
```

---

## 📝 Useful SQL Queries

### Get User's Cart with Prices
```sql
SELECT sc.id, b.name, b.offer_price, sc.quantity, 
       (b.offer_price * sc.quantity) as line_total
FROM shopping_cart sc
JOIN books b ON sc.book_id = b.id
WHERE sc.user_id = $1
ORDER BY sc.added_at DESC;
```

### Get Order History for User
```sql
SELECT o.id, o.total_amount, o.order_status, o.created_at,
       COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = $1
GROUP BY o.id
ORDER BY o.created_at DESC;
```

### Get Books for a Specific Course-Semester
```sql
SELECT b.id, b.name, b.author, b.offer_price
FROM books b
JOIN book_course_map bcm ON b.id = bcm.book_id
WHERE bcm.course_id = $1 AND bcm.semester_id = $2
AND bcm.is_required = TRUE
ORDER BY b.name;
```

### Track Order Status Changes
```sql
SELECT status, description, changed_by, changed_at
FROM order_status_history
WHERE order_id = $1
ORDER BY changed_at DESC;
```

### Get Book Reviews with Rating Distribution
```sql
SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews,
       SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_stars,
       SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_stars,
       SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_stars,
       SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_stars,
       SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
FROM reviews
WHERE book_id = $1;
```

### Get Books Frequently Ordered Together
```sql
SELECT oi1.book_id as book_1, oi2.book_id as book_2, COUNT(*) as times_together
FROM order_items oi1
JOIN order_items oi2 ON oi1.order_id = oi2.order_id AND oi1.book_id < oi2.book_id
GROUP BY oi1.book_id, oi2.book_id
ORDER BY times_together DESC
LIMIT 10;
```

---

## 🚀 How to Extend in Future

### To Add a New Table
1. Create `NNN_table_name.sql` following the existing format
2. Add comprehensive documentation header
3. Include all necessary indexes
4. Execute in correct dependency order

### To Modify an Existing Table
1. Create new file: `NNN_table_name_v2.sql`
2. Use ALTER TABLE statements
3. Add/update indexes as needed
4. Test in development first

### Example Upgrade
```sql
-- File: 004_books_v2.sql
-- Add publisher and publication year fields

ALTER TABLE books ADD COLUMN publisher VARCHAR(255);
ALTER TABLE books ADD COLUMN publication_year INT;
ALTER TABLE books ADD COLUMN isbn_13 VARCHAR(13);

CREATE INDEX idx_books_publisher ON books(publisher);
CREATE INDEX idx_books_publication_year ON books(publication_year);
```

---

## ✅ Implementation Checklist

- [x] User & Auth Tables (001-002)
- [x] Academic Tables (002-005)
- [x] E-Commerce Tables (006-012)
- [x] Comprehensive Documentation
- [x] Performance Indexes
- [x] Data Validation Constraints
- [x] Audit Trail Capability
- [x] Price Snapshot Storage
- [x] Order Tracking

---

**Database**: PostgreSQL 12+  
**Platform**: Vision Publications E-Commerce  
**Created**: 2025-12-11  
**Last Updated**: 2025-12-11
