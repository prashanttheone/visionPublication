# Database Migration Files

This directory contains modular SQL migration files for the Vision Publications e-commerce platform. Each file creates a single table with comprehensive documentation.

## 📋 File Structure & Execution Order

Migrations must be executed in dependency order (tables with no foreign keys first):

### Phase 1: Root Tables (No Dependencies)
```
001_users.sql              → User authentication & identity
002_courses.sql            → Academic programs (BSc Nursing, GNM, etc.)
004_books.sql              → Book catalog & inventory
```

### Phase 2: Reference Tables (Depend on Phase 1)
```
003_semesters.sql          → Course semesters/years (depends on courses)
006_user_addresses.sql     → User delivery addresses (depends on users)
007_shopping_cart.sql      → Shopping cart items (depends on users, books)
012_wishlist.sql           → Wishlist/bookmarks (depends on users, books)
```

### Phase 3: Business Tables (Depend on Phase 2)
```
005_book_course_map.sql    → Maps books to courses/semesters
008_orders.sql             → Purchase orders (depends on users, user_addresses)
```

### Phase 4: Detail Tables (Depend on Phase 3)
```
009_order_items.sql        → Order line items (depends on orders, books)
010_order_status_history.sql → Order status audit trail
011_reviews.sql            → Customer reviews & ratings
```

## 🔄 Dependency Graph

```
Users ──────────┐
                ├─→ Shopping Cart
Books ──────────┤
                ├─→ Wishlist
Courses ────────┐
                ├─→ Semesters ──┐
                │               ├─→ Book Course Map
                └─→────────────┘

Users ──────┐
            ├─→ User Addresses ──┐
Books ──────┤                    ├─→ Orders ──→ Order Items ──→ Reviews
            └─→────────────────┘
                                 └─→ Order Status History
```

## 📁 Table Documentation

Each SQL file contains:

### File Header
- Table purpose and business context
- Key fields with descriptions
- Dependencies (what tables it requires)
- References (what tables reference it)

### Create Table Statement
- Detailed field definitions with comments
- Data types optimized for e-commerce
- NOT NULL constraints where required
- CHECK constraints for data validation
- DEFAULT values for common fields

### Indexes
- Performance-optimized indexes
- Composite indexes for common queries
- Indexes on foreign keys

## 🚀 How to Use

### Initial Setup (Create All Tables)
```bash
# Execute migrations in order
psql -U <user> -d <database> -f migrations/001_users.sql
psql -U <user> -d <database> -f migrations/002_courses.sql
psql -U <user> -d <database> -f migrations/003_semesters.sql
psql -U <user> -d <database> -f migrations/004_books.sql
psql -U <user> -d <database> -f migrations/005_book_course_map.sql
psql -U <user> -d <database> -f migrations/006_user_addresses.sql
psql -U <user> -d <database> -f migrations/007_shopping_cart.sql
psql -U <user> -d <database> -f migrations/008_orders.sql
psql -U <user> -d <database> -f migrations/009_order_items.sql
psql -U <user> -d <database> -f migrations/010_order_status_history.sql
psql -U <user> -d <database> -f migrations/011_reviews.sql
psql -U <user> -d <database> -f migrations/012_wishlist.sql
```

### Or Execute All at Once
```bash
cat migrations/001_users.sql \
    migrations/002_courses.sql \
    migrations/003_semesters.sql \
    migrations/004_books.sql \
    migrations/005_book_course_map.sql \
    migrations/006_user_addresses.sql \
    migrations/007_shopping_cart.sql \
    migrations/008_orders.sql \
    migrations/009_order_items.sql \
    migrations/010_order_status_history.sql \
    migrations/011_reviews.sql \
    migrations/012_wishlist.sql \
    | psql -U <user> -d <database>
```

### Future Migrations (Upgrading Individual Tables)
Each file is self-contained, making it easy to:
- Add new columns to existing tables
- Modify indexes
- Add new constraints
- Create new migrations without touching existing files

Example: To upgrade `books` table with new fields:
```sql
-- NEW FILE: migrations/004_books_v2.sql
ALTER TABLE books ADD COLUMN publisher VARCHAR(255);
ALTER TABLE books ADD COLUMN publication_year INT;
CREATE INDEX idx_books_publisher ON books(publisher);
```

## 📊 Table Descriptions

### Users (001_users.sql)
**Purpose**: User authentication and identity management  
**Key Records**: One per registered user  
**Typical Rows**: 1000+ for active platform  
**Data Retention**: Lifetime (with soft delete via is_active flag)

### Courses (002_courses.sql)
**Purpose**: Define academic programs  
**Key Records**: ~10 courses (BSc Nursing, GNM, Pharmacy, etc.)  
**Typical Rows**: 10-20  
**Data Retention**: Permanent

### Semesters (003_semesters.sql)
**Purpose**: Define terms/years within courses  
**Key Records**: Multiple per course  
**Typical Rows**: 40-60 (4-6 semesters per course)  
**Data Retention**: Permanent

### Books (004_books.sql)
**Purpose**: Main book catalog  
**Key Records**: One per unique book  
**Typical Rows**: 500-5000  
**Data Retention**: Permanent with soft delete option

### Book Course Map (005_book_course_map.sql)
**Purpose**: Maps books to courses/semesters  
**Key Records**: Many books per semester  
**Typical Rows**: 1000-10000  
**Data Retention**: Permanent

### User Addresses (006_user_addresses.sql)
**Purpose**: Shipping and billing addresses  
**Key Records**: Multiple per user (avg 2-3)  
**Typical Rows**: 2000-10000  
**Data Retention**: Until user deletion

### Shopping Cart (007_shopping_cart.sql)
**Purpose**: Active shopping sessions  
**Key Records**: One per item in active carts  
**Typical Rows**: 100-500 (fluctuates)  
**Data Retention**: Until checkout or session expiry

### Orders (008_orders.sql)
**Purpose**: Completed and pending orders  
**Key Records**: One per transaction  
**Typical Rows**: 100+ per day  
**Data Retention**: Permanent (for accounting)

### Order Items (009_order_items.sql)
**Purpose**: Line items within orders  
**Key Records**: Multiple per order (avg 2-3)  
**Typical Rows**: 200+ per day  
**Data Retention**: Permanent (audit trail)

### Order Status History (010_order_status_history.sql)
**Purpose**: Audit trail of order status changes  
**Key Records**: Multiple per order (avg 4-5)  
**Typical Rows**: 500+ per day  
**Data Retention**: Permanent (immutable)

### Reviews (011_reviews.sql)
**Purpose**: Customer ratings and feedback  
**Key Records**: One per user-book combination  
**Typical Rows**: 10-20% of orders  
**Data Retention**: Permanent (trust data)

### Wishlist (012_wishlist.sql)
**Purpose**: Bookmarked books for future purchase  
**Key Records**: One per user-book combination  
**Typical Rows**: 2000-10000  
**Data Retention**: Until removal or user deletion

## 🔧 Customization Guide

### Adding New Fields
Edit the relevant `.sql` file and add to the CREATE TABLE statement:

```sql
ALTER TABLE books ADD COLUMN publisher VARCHAR(255);
ALTER TABLE books ADD COLUMN isbn_13 VARCHAR(13);
```

### Adding New Indexes
Each file has an indexes section. Add performance indexes as needed:

```sql
CREATE INDEX idx_books_publisher ON books(publisher);
```

### Creating New Tables
Follow the naming convention: `NNN_table_name.sql` and include comprehensive documentation headers.

## 📝 Best Practices

1. **Immutability**: Once a migration is executed, never modify it
2. **Version Control**: Always commit migration files to git
3. **Documentation**: Every table has comprehensive headers explaining purpose and usage
4. **Performance**: Indexes are included for all common query patterns
5. **Data Validation**: CHECK constraints prevent invalid data entry
6. **Audit Trail**: Use order_status_history for complete traceability
7. **Price Snapshots**: order_items stores prices at purchase time for historical accuracy

## 🔄 Migration Workflow for Upgrades

When you need to upgrade the schema in the future:

1. **Create a new versioned file** (e.g., `004_books_v2.sql`)
2. **Add ALTER TABLE statements** with clear comments
3. **Include index modifications**
4. **Test in development first**
5. **Execute in production** with proper backup
6. **Document changes** in commit message

## 🆘 Troubleshooting

### Foreign Key Constraint Errors
Ensure you're executing migrations in the correct order (dependencies first).

### Duplicate Index Errors
Check if indexes already exist. Use `IF NOT EXISTS` for idempotent operations.

### Type Mismatch Errors
Verify that referenced columns have compatible data types (e.g., UUID for user_id).

---

**Created**: 2025-12-11  
**Database**: PostgreSQL 12+  
**Purpose**: Vision Publications E-Commerce Platform
