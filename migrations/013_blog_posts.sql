/**
 * ============================================
 * BLOG_POSTS TABLE - Blog & Articles
 * ============================================
 * 
 * Purpose: Store blog posts, articles, and rich content created with editors
 * like React Quill. Content is stored as HTML to preserve formatting, styles,
 * and embedded media.
 * 
 * Key Fields:
 * - id: Serial primary key
 * - slug: URL-friendly identifier (unique, for SEO)
 * - title: Blog post title
 * - subtitle: Secondary title/tagline
 * - excerpt: Short summary for listings (plain text)
 * - content: Full HTML content from Quill editor
 * - author_id: Foreign key to users (optional)
 * - author_name: Author name (for guests or fallback)
 * - category: Blog category
 * - tags: JSON array of tags for filtering
 * - image_url: Featured image
 * - read_time: Estimated reading time in minutes
 * - is_published: Draft vs published status
 * - view_count: Analytics tracking
 * - like_count: Engagement metric
 * 
 * Dependencies: users (author_id - optional)
 * Referenced By: blog_comments, blog_ratings
 * 
 * Content Storage Strategy:
 * - Store HTML content from Quill editor in TEXT field
 * - Can include images, code blocks, formatting, links
 * - Use jsonb for tags (PostgreSQL) or JSON for MySQL
 * - Excerpt is plain text (no HTML)
 * 
 * Data Lifecycle:
 * - Content created in React Quill editor
 * - HTML is sent to API endpoint
 * - API saves to database
 * - Content retrieved and rendered in blog page
 * - Comments/ratings linked via foreign keys
 * 
 * Business Rules:
 * - slug must be unique (enables pretty URLs)
 * - title and content required
 * - is_published controls visibility
 * - created_by can track editor/admin
 * - published_at timestamps when status changes
 * 
 * Example Quill HTML Content:
 * {
 *   "ops": [
 *     { "insert": "Hello " },
 *     { "insert": "World", "attributes": { "bold": true } },
 *     { "insert": "\n" }
 *   ]
 * }
 * 
 * Or as HTML:
 * <p>Hello <strong>World</strong></p>
 */

CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    
    -- Post Identification
    slug VARCHAR(255) UNIQUE NOT NULL,     -- URL-friendly identifier
    title VARCHAR(500) NOT NULL,
    subtitle VARCHAR(500),
    
    -- Content
    excerpt TEXT,                           -- Plain text summary for listings
    content TEXT NOT NULL,                  -- HTML content from Quill editor
    
    -- Author Information
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(150) NOT NULL,      -- Fallback author name
    author_role VARCHAR(100),               -- e.g., "Chief Editor", "Writer"
    
    -- Classification
    category VARCHAR(100),
    tags JSONB DEFAULT '[]'::jsonb,        -- Array of tags: ["nursing", "technology"]
    
    -- Media
    image_url VARCHAR(500),                 -- Featured image URL
    
    -- Metadata
    read_time INT DEFAULT 5,                -- Estimated reading time in minutes
    
    -- Status & Visibility
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Engagement Metrics
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    
    -- Audit Information
    created_by VARCHAR(100),                -- Editor/Admin who created
    updated_by VARCHAR(100),                -- Last editor
    published_at TIMESTAMP NULL,            -- When was it published
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_is_published ON blog_posts(is_published);
CREATE INDEX idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_created_at ON blog_posts(created_at DESC);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_tags ON blog_posts USING GIN(tags);

-- GIN index for better tag search performance

/**
 * ============================================
 * BLOG_COMMENTS TABLE - Blog Comments/Discussion
 * ============================================
 * 
 * Purpose: Store reader comments on blog posts.
 * Supports nested comments (replies) and moderation.
 * 
 * Key Fields:
 * - blog_post_id: Which blog post
 * - user_id: Who commented
 * - parent_comment_id: For nested replies (optional)
 * - content: Comment text (plain text or simple HTML)
 * - is_approved: Moderation flag
 * 
 * Use Cases:
 * - Discussion threads on blog posts
 * - Reader feedback and questions
 * - Expert responses to comments
 * - Community engagement
 */

CREATE TABLE IF NOT EXISTS blog_comments (
    id SERIAL PRIMARY KEY,
    
    -- Foreign Keys
    blog_post_id INT NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    parent_comment_id INT REFERENCES blog_comments(id) ON DELETE CASCADE,
    
    -- Comment Information
    author_name VARCHAR(150) NOT NULL,
    author_email VARCHAR(150),
    content TEXT NOT NULL,
    
    -- Moderation
    is_approved BOOLEAN DEFAULT FALSE,
    is_spam BOOLEAN DEFAULT FALSE,
    
    -- Engagement
    like_count INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_blog_comments_blog_post_id ON blog_comments(blog_post_id);
CREATE INDEX idx_blog_comments_user_id ON blog_comments(user_id);
CREATE INDEX idx_blog_comments_parent_comment_id ON blog_comments(parent_comment_id);
CREATE INDEX idx_blog_comments_is_approved ON blog_comments(is_approved);
CREATE INDEX idx_blog_comments_created_at ON blog_comments(created_at DESC);

/**
 * ============================================
 * BLOG_RATINGS TABLE - Post Ratings
 * ============================================
 * 
 * Purpose: Store user ratings/reactions to blog posts.
 * Similar to reviews but specifically for posts.
 * Supports emoji reactions or numeric ratings.
 * 
 * Key Fields:
 * - blog_post_id: Which blog post
 * - user_id: Who rated
 * - rating: 1-5 stars or emoji
 * - UNIQUE(blog_post_id, user_id): One rating per user per post
 */

CREATE TABLE IF NOT EXISTS blog_ratings (
    id SERIAL PRIMARY KEY,
    
    -- Foreign Keys
    blog_post_id INT NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Rating Information
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE (blog_post_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_blog_ratings_blog_post_id ON blog_ratings(blog_post_id);
CREATE INDEX idx_blog_ratings_user_id ON blog_ratings(user_id);
CREATE INDEX idx_blog_ratings_rating ON blog_ratings(rating);

/**
 * ============================================
 * USEFUL QUERIES FOR BLOG OPERATIONS
 * ============================================
 */

-- Get published blog posts with comment count
-- SELECT 
--   bp.id, bp.slug, bp.title, bp.excerpt, bp.image_url,
--   bp.author_name, bp.published_at, bp.view_count,
--   COUNT(bc.id) as comment_count
-- FROM blog_posts bp
-- LEFT JOIN blog_comments bc ON bp.id = bc.blog_post_id AND bc.is_approved = TRUE
-- WHERE bp.is_published = TRUE
-- GROUP BY bp.id
-- ORDER BY bp.published_at DESC;

-- Get blog posts by category
-- SELECT * FROM blog_posts 
-- WHERE is_published = TRUE AND category = 'Education'
-- ORDER BY published_at DESC;

-- Search blogs by tag
-- SELECT * FROM blog_posts
-- WHERE is_published = TRUE AND tags @> '["nursing"]'::jsonb
-- ORDER BY published_at DESC;

-- Get average rating for a blog post
-- SELECT 
--   AVG(rating) as avg_rating, COUNT(*) as total_ratings
-- FROM blog_ratings
-- WHERE blog_post_id = 1;

-- Get trending blog posts (by views)
-- SELECT * FROM blog_posts
-- WHERE is_published = TRUE
-- ORDER BY view_count DESC LIMIT 10;
