-- Create YouTube Playlists Table
CREATE TABLE IF NOT EXISTS youtube_playlists (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    thumbnail VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL,
    video_count INT DEFAULT 0,
    total_duration VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update YouTube Videos Table to support playlists
ALTER TABLE youtube_videos ADD COLUMN IF NOT EXISTS playlist_id INT REFERENCES youtube_playlists(id) ON DELETE CASCADE;
ALTER TABLE youtube_videos ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE youtube_videos ADD COLUMN IF NOT EXISTS video_order INT DEFAULT 0;

-- Create trigger to auto-update updated_at for playlists
CREATE OR REPLACE FUNCTION update_youtube_playlists_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_youtube_playlists_timestamp ON youtube_playlists;
CREATE TRIGGER trigger_update_youtube_playlists_timestamp
BEFORE UPDATE ON youtube_playlists
FOR EACH ROW
EXECUTE FUNCTION update_youtube_playlists_timestamp();

-- Create function to auto-update video count in playlist
CREATE OR REPLACE FUNCTION update_playlist_video_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE youtube_playlists 
        SET video_count = (
            SELECT COUNT(*) 
            FROM youtube_videos 
            WHERE playlist_id = NEW.playlist_id
        )
        WHERE id = NEW.playlist_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE youtube_playlists 
        SET video_count = (
            SELECT COUNT(*) 
            FROM youtube_videos 
            WHERE playlist_id = OLD.playlist_id
        )
        WHERE id = OLD.playlist_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_playlist_video_count ON youtube_videos;
CREATE TRIGGER trigger_update_playlist_video_count
AFTER INSERT OR UPDATE OR DELETE ON youtube_videos
FOR EACH ROW
EXECUTE FUNCTION update_playlist_video_count();
