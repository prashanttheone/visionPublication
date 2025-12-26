-- Sample data for YouTube Playlists and Videos
-- Run this after running the 019_youtube_playlists.sql migration

-- Insert sample playlists
INSERT INTO youtube_playlists (title, description, thumbnail, category, total_duration, display_order, is_active) VALUES
('Obstetrics and Midwifery Nursing', 'Comprehensive guide to obstetrics and midwifery nursing practices covering prenatal care, labor management, and postpartum care.', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400', 'Clinical Nursing', '12h 30m', 1, true),
('Psychology in Healthcare', 'Understanding patient psychology and mental health in medical settings, therapeutic communication, and psychological assessment.', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400', 'Mental Health', '8h 15m', 2, true),
('Community Health Nursing', 'Public health nursing and community care strategies', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400', 'Public Health', '15h 45m', 3, true),
('Fundamental of Nursing', 'Core nursing principles and basic patient care techniques', 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400', 'Basics', '14h 20m', 4, true),
('Pathology & Genetics', 'Disease mechanisms and genetic factors in healthcare', 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400', 'Medical Science', '5h 45m', 5, true),
('Medical Surgical Nursing', 'Surgical procedures and perioperative nursing care', 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400', 'Surgical', '22h 30m', 6, true);

-- Insert sample videos for playlist 1 (Obstetrics and Midwifery Nursing)
INSERT INTO youtube_videos (title, headline, description, video_id, thumbnail, duration, playlist_id, video_order, is_active) VALUES
('Introduction to Obstetric Nursing', 'Overview of obstetric nursing fundamentals', 'Overview of obstetric nursing fundamentals and patient care principles', 'dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400', '12:45', 1, 1, true),
('Prenatal Care and Assessment', 'Complete guide to prenatal assessments', 'Complete guide to prenatal assessments and monitoring techniques', 'dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400', '18:30', 1, 2, true),
('Labor and Delivery Management', 'Best practices for managing labor stages', 'Best practices for managing labor stages and delivery procedures', 'dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400', '25:15', 1, 3, true),
('Postpartum Care Essentials', 'Essential postpartum care', 'Essential postpartum care and recovery monitoring', 'dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400', '15:20', 1, 4, true),
('High-Risk Pregnancy Management', 'Managing high-risk pregnancies', 'Managing high-risk pregnancies and complications', 'dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400', '22:10', 1, 5, true);

-- Insert sample videos for playlist 2 (Psychology in Healthcare)
INSERT INTO youtube_videos (title, headline, description, video_id, thumbnail, duration, playlist_id, video_order, is_active) VALUES
('Introduction to Healthcare Psychology', 'Basic concepts of psychology', 'Basic concepts of psychology in medical environments', 'dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400', '14:25', 2, 1, true),
('Patient Communication Techniques', 'Effective communication strategies', 'Effective communication strategies for patient care', 'dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400', '16:40', 2, 2, true),
('Mental Health Assessment', 'Tools and methods for evaluation', 'Tools and methods for mental health evaluation', 'dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400', '20:15', 2, 3, true);
