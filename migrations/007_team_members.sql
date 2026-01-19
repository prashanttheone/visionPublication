-- Create team_members table
CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    team VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    bio TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample team members data
INSERT INTO team_members (name, role, team, image_url, bio, display_order, is_active) VALUES
('Dr. Sharma', 'Editor-in-Chief', 'Editorial Team', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', '20+ years in medical publishing', 1, true),
('Priya Verma', 'Senior Editor', 'Editorial Team', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', 'Expert in health sciences content', 2, true),
('Rajesh Design', 'Creative Director', 'Design Team', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop', 'Award-winning publication design', 3, true),
('Sarah Khan', 'Lead Designer', 'Design Team', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop', 'Specializes in educational materials', 4, true),
('Amit Patel', 'Operations Manager', 'Publishing & Operations', 'https://images.unsplash.com/photo-1507527173202-83c92705a63b?w=400&h=400&fit=crop', 'Streamlining publishing workflows', 5, true),
('Lisa Anderson', 'Publishing Director', 'Publishing & Operations', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop', 'Leading digital transformation', 6, true),
('Dr. Vikram Singh', 'Chief Executive Officer', 'Leadership', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop', 'Visionary leader in healthcare publishing', 7, true),
('Neha Gupta', 'Chief Operating Officer', 'Leadership', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', 'Building scalable publishing solutions', 8, true);
