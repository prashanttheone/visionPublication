-- E-Resource View Tracking
-- This migration adds tracking for user views of e-resource chapters

CREATE TABLE IF NOT EXISTS eresource_views (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    eresource_chapter_id INT NOT NULL REFERENCES eresource_chapters(id) ON DELETE CASCADE,
    eresource_book_id INT NOT NULL REFERENCES eresource_books(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_eresource_views_user_id ON eresource_views(user_id);
CREATE INDEX IF NOT EXISTS idx_eresource_views_chapter_id ON eresource_views(eresource_chapter_id);
CREATE INDEX IF NOT EXISTS idx_eresource_views_book_id ON eresource_views(eresource_book_id);
CREATE INDEX IF NOT EXISTS idx_eresource_views_viewed_at ON eresource_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_eresource_views_user_chapter ON eresource_views(user_id, eresource_chapter_id);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_eresource_views_book_user_date ON eresource_views(eresource_book_id, user_id, viewed_at DESC);
