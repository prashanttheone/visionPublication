# 🚀 Quick Migration Reference

## 📋 File Listing

### Core SQL Migration Files (12 tables)
| # | File | Table | Rows | Status |
|---|------|-------|------|--------|
| 1 | `001_users.sql` | users | 1000+ | ✅ Auth |
| 2 | `002_courses.sql` | courses | 10-20 | ✅ Academic |
| 3 | `003_semesters.sql` | semesters | 40-60 | ✅ Academic |
| 4 | `004_books.sql` | books | 500-5000 | ✅ Catalog |
| 5 | `005_book_course_map.sql` | book_course_map | 1000-10K | ✅ Mapping |
| 6 | `006_user_addresses.sql` | user_addresses | 2000-10K | ✅ Shipping |
| 7 | `007_shopping_cart.sql` | shopping_cart | 100-500 | ✅ E-Commerce |
| 8 | `008_orders.sql` | orders | 100+/day | ✅ Orders |
| 9 | `009_order_items.sql` | order_items | 200+/day | ✅ Order Lines |
| 10 | `010_order_status_history.sql` | order_status_history | 500+/day | ✅ Audit |
| 11 | `011_reviews.sql` | reviews | 10-20% of orders | ✅ Feedback |
| 12 | `012_wishlist.sql` | wishlist | 2000-10K | ✅ Bookmarks |

### Documentation Files
| File | Purpose |
|------|---------|
| `README.md` | Complete migration guide & best practices |
| `MIGRATION_STRUCTURE.md` | Detailed schema documentation & queries |
| `QUICK_REFERENCE.md` | This file - quick lookup guide |
| `01_allsetup.sql` | Original monolithic file (for reference) |

---

## ⚡ Quick Start

### Execute All Migrations (PostgreSQL)
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
    | psql -U postgres -d vision_publications
```

### Or Individually
```bash
psql -U postgres -d vision_publications -f migrations/001_users.sql
psql -U postgres -d vision_publications -f migrations/002_courses.sql
# ... continue for each file
```

---

## 📊 Table at a Glance

| Table | Type | Purpose | Primary Key | Indexed |
|-------|------|---------|-------------|---------|
| **users** | Core | User accounts | UUID | email, phone, role |
| **courses** | Reference | Academic programs | INT | name |
| **semesters** | Reference | Terms within courses | INT | course_id |
| **books** | Catalog | Book inventory | INT | isbn, category |
| **book_course_map** | Mapping | Books → Courses | INT | book_id, course_id |
| **user_addresses** | Reference | Shipping addresses | INT | user_id, pincode |
| **shopping_cart** | Transient | Active carts | INT | user_id, book_id |
| **orders** | Core | Purchases | INT | user_id, order_status |
| **order_items** | Detail | Order line items | INT | order_id |
| **order_status_history** | Audit | Status changes | INT | order_id |
| **reviews** | Social | Ratings/feedback | INT | book_id, user_id |
| **wishlist** | User | Bookmarks | INT | user_id |

---

## 🔗 Foreign Key Relationships

```
users (UUID) ────┬─→ user_addresses (user_id)
                 ├─→ shopping_cart (user_id)
                 ├─→ orders (user_id)
                 ├─→ reviews (user_id)
                 └─→ wishlist (user_id)

courses (INT) ───┬─→ semesters (course_id)
                 ├─→ book_course_map (course_id)
                 └─→ order_items (course_id)

books (INT) ─────┬─→ book_course_map (book_id)
                 ├─→ shopping_cart (book_id)
                 ├─→ order_items (book_id)
                 ├─→ reviews (book_id)
                 └─→ wishlist (book_id)

semesters (INT) ─┬─→ book_course_map (semester_id)
                 └─→ order_items (semester_id)

user_addresses (INT) → orders (address_id)

orders (INT) ────┬─→ order_items (order_id)
                 └─→ order_status_history (order_id)

order_items (INT) → reviews (order_item_id)
```

---

## 🔄 Data Workflow

### User Journey
```
REGISTER → Create user in users table
    ↓
BROWSE → Filter books by course/semester via book_course_map
    ↓
CART → Add items to shopping_cart
    ↓
CHECKOUT → Create order record → Move cart items to order_items
    ↓
PAY → Update order payment_status
    ↓
SHIP → Add tracking_id, update order_status → Log in order_status_history
    ↓
DELIVER → Set delivered_at timestamp
    ↓
REVIEW → Create reviews entry
```

### Key Snapshots
- **Order Item Pricing**: Snapshots stored (not linked to current book price)
- **Historical Orders**: Preserved forever for accounting
- **Status Audit Trail**: Complete immutable history

---

## 📈 Typical Data Volumes

| Table | Records | Growth | Retention |
|-------|---------|--------|-----------|
| users | 1000-10K | Steady | ♾️ Permanent |
| courses | 10-20 | Rare | ♾️ Permanent |
| semesters | 40-60 | Rare | ♾️ Permanent |
| books | 500-5000 | Weekly | ♾️ Permanent |
| book_course_map | 1K-10K | Monthly | ♾️ Permanent |
| user_addresses | 2K-10K | Daily | ♾️ Until user delete |
| shopping_cart | 100-500 | Hourly | ⏰ Session based |
| orders | +100/day | Daily | ♾️ Permanent |
| order_items | +200/day | Daily | ♾️ Permanent |
| order_status_history | +500/day | Daily | ♾️ Permanent |
| reviews | Variable | Daily | ♾️ Permanent |
| wishlist | 2K-10K | Daily | ⏰ Until removed |

---

## 🎯 Common Queries

### Get User's Cart Total
```sql
SELECT SUM(b.offer_price * sc.quantity) as cart_total
FROM shopping_cart sc
JOIN books b ON sc.book_id = b.id
WHERE sc.user_id = UUID;
```

### Find Orders by Status
```sql
SELECT * FROM orders WHERE order_status = 'shipped' AND delivered_at IS NULL;
```

### Books by Course/Semester
```sql
SELECT b.* FROM books b
JOIN book_course_map m ON b.id = m.book_id
WHERE m.course_id = 1 AND m.semester_id = 2;
```

### Average Book Rating
```sql
SELECT AVG(rating) FROM reviews WHERE book_id = 123;
```

### Order Timeline
```sql
SELECT * FROM order_status_history WHERE order_id = 456 ORDER BY changed_at;
```

---

## 🔧 Future Upgrades

### Add Publisher Field to Books
```sql
-- File: 004_books_v2.sql
ALTER TABLE books ADD COLUMN publisher VARCHAR(255);
CREATE INDEX idx_books_publisher ON books(publisher);
```

### Track Cart Abandonment
```sql
-- File: 007_shopping_cart_v2.sql
ALTER TABLE shopping_cart ADD COLUMN abandoned_at TIMESTAMP;
```

### Add Review Moderation
```sql
-- File: 011_reviews_v2.sql
ALTER TABLE reviews ADD COLUMN is_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE reviews ADD COLUMN approved_by VARCHAR(100);
```

---

## ✅ Verification Checklist

After migrations, verify:
- [ ] All 12 tables created successfully
- [ ] All foreign keys in place
- [ ] All indexes created
- [ ] Can insert sample data without errors
- [ ] Can query across tables with JOINs
- [ ] Can run provided SQL queries successfully

---

## 📞 Troubleshooting

### Problem: Foreign Key Constraint Error
**Solution**: Execute migrations in order. Dependencies:
1. users, courses, books (first)
2. semesters (after courses)
3. user_addresses (after users)
4. shopping_cart, wishlist (after users & books)
5. orders (after users & user_addresses)
6. order_items, order_status_history (after orders)
7. reviews (after users, books, order_items)

### Problem: Duplicate Index Error
**Solution**: Files use `CREATE INDEX IF NOT EXISTS` (PostgreSQL 9.1+)

### Problem: UUID Type Not Recognized
**Solution**: Enable PostgreSQL `uuid-ossp` extension:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 📚 Full Documentation Files

- **README.md** - Complete guide, best practices, customization
- **MIGRATION_STRUCTURE.md** - Detailed schema, field definitions, queries

---

## 🎉 You're All Set!

Your database is now:
✅ **Modular** - Each table in separate file  
✅ **Documented** - Comprehensive inline comments  
✅ **Scalable** - Easy to add v2, v3 migrations  
✅ **Maintainable** - Clear separation of concerns  
✅ **Auditable** - Complete history tracking  
✅ **Optimized** - Performance indexes included  

Happy building! 🚀
