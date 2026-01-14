-- Create YouTube Videos Table
CREATE TABLE IF NOT EXISTS youtube_videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    headline VARCHAR(500) NOT NULL,
    video_id VARCHAR(100) NOT NULL,
    thumbnail VARCHAR(500) NOT NULL,
    duration VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for active videos and display order
CREATE INDEX IF NOT EXISTS idx_youtube_videos_active ON youtube_videos(is_active);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_order ON youtube_videos(display_order);

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_youtube_videos_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_youtube_videos_timestamp ON youtube_videos;
CREATE TRIGGER trigger_update_youtube_videos_timestamp
BEFORE UPDATE ON youtube_videos
FOR EACH ROW
EXECUTE FUNCTION update_youtube_videos_timestamp();

