import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { generateSlug, calculateReadTime, sanitizeHtml } from '@/types/blog';

// Create the blogs directory in public if it doesn't exist
import fs from 'fs';
import path from 'path';
const BLOGS_DIR = path.join(process.cwd(), 'public', 'assets', 'blogs');

if (!fs.existsSync(BLOGS_DIR)) {
  fs.mkdirSync(BLOGS_DIR, { recursive: true });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category') || undefined;
    const isPublished = searchParams.get('published') ? searchParams.get('published') === 'true' : true;

    // First get the total count
    const countQuery = `
      SELECT COUNT(*) as total_count
      FROM blog_posts
      WHERE ($1 IS NULL OR category = $1)
      AND ($2 IS NULL OR is_published = $2)
    `;
    
    const countResult = await query(countQuery, [category, isPublished]);
    const totalCount = parseInt(countResult.rows[0].total_count);
    
    // Then get the paginated results
    let queryText = `
      SELECT id, slug, title, subtitle, excerpt, content, 
             author_name as "authorName", author_role as "authorRole", 
             category, tags, image_url as "imageUrl", read_time as "readTime", 
             is_published as "isPublished", is_featured as "isFeatured", 
             view_count as "viewCount", like_count as "likeCount", 
             comment_count as "commentCount", created_at as "createdAt", 
             updated_at as "updatedAt", published_at as "publishedAt"
      FROM blog_posts
      WHERE ($1 IS NULL OR category = $1)
      AND ($2 IS NULL OR is_published = $2)
      ORDER BY created_at DESC
      LIMIT $3 OFFSET $4
    `;
    
    const result = await query(queryText, [category, isPublished, limit, offset]);

    return Response.json({
      success: true,
      posts: result.rows,
      total: totalCount
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch blog posts' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.content || !body.excerpt) {
      return Response.json({ 
        success: false, 
        error: 'Title, content, and excerpt are required' 
      }, { status: 400 });
    }

    // Sanitize content
    const sanitizedContent = sanitizeHtml(body.content);
    
    // Calculate read time
    const readTime = calculateReadTime(sanitizedContent);
    
    // Generate slug if not provided
    const slug = body.slug || generateSlug(body.title);
    
    // Check if slug already exists
    const existingSlugCheck = await query(
      'SELECT slug FROM blog_posts WHERE slug = $1',
      [slug]
    );
    
    if (existingSlugCheck.rows.length > 0) {
      return Response.json({ 
        success: false, 
        error: 'A blog post with this slug already exists' 
      }, { status: 400 });
    }

    // Insert new blog post
    const insertResult = await query(`
      INSERT INTO blog_posts 
      (slug, title, subtitle, excerpt, content, author_name, author_role, 
       category, tags, image_url, read_time, is_published)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, slug, title, created_at
    `, [
      slug,
      body.title,
      body.subtitle || null,
      body.excerpt,
      sanitizedContent,
      body.authorName || 'Anonymous',
      body.authorRole || null,
      body.category || 'General',
      body.tags ? JSON.stringify(body.tags) : '[]',
      body.imageUrl || null,
      readTime,
      body.isPublished || false
    ]);

    return Response.json({
      success: true,
      message: 'Blog post created successfully',
      post: insertResult.rows[0]
    });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to create blog post' 
    }, { status: 500 });
  }
}