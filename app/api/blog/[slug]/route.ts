import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import path from 'path';
import fs from 'fs/promises';

// Get blog post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Fetch blog post from database
    const result = await query(
      `SELECT id, slug, title, subtitle, excerpt, content, 
              author_name as "authorName", author_role as "authorRole", 
              category, tags, image_url as "imageUrl", read_time as "readTime", 
              is_published as "isPublished", is_featured as "isFeatured", 
              view_count as "viewCount", like_count as "likeCount", 
              comment_count as "commentCount", created_at as "createdAt", 
              updated_at as "updatedAt", published_at as "publishedAt"
       FROM blog_posts 
       WHERE slug = $1 AND is_published = true`,
      [slug]
    );

    if (result.rows.length === 0) {
      return Response.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    const blogPost = result.rows[0];

    // Increment view count
    await query(
      'UPDATE blog_posts SET view_count = view_count + 1 WHERE id = $1',
      [blogPost.id]
    );

    return Response.json({
      success: true,
      post: { ...blogPost, viewCount: blogPost.viewCount + 1 }
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// Update blog post by slug
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();

    // Find existing blog post by slug (exact match)
    const existingResult = await query(
      'SELECT id, image_url, slug FROM blog_posts WHERE slug = $1',
      [slug]
    );

    if (existingResult.rows.length === 0) {
      return Response.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    const existingPost = existingResult.rows[0];

    // Check if slug is changing and if new slug already exists
    let finalSlug = existingPost.slug;
    if (body.slug && body.slug !== existingPost.slug) {
      const slugCheck = await query(
        'SELECT slug FROM blog_posts WHERE slug = $1 AND id != $2',
        [body.slug, existingPost.id]
      );
      
      if (slugCheck.rows.length > 0) {
        return Response.json(
          { success: false, error: 'A blog post with this slug already exists' },
          { status: 400 }
        );
      }
      finalSlug = body.slug;
    }

    // Sanitize content and calculate read time
    const { sanitizeHtml, calculateReadTime } = await import('@/types/blog');
    const sanitizedContent = sanitizeHtml(body.content);
    const readTime = calculateReadTime(sanitizedContent);

    // Update blog post
    const updateResult = await query(
      `UPDATE blog_posts 
       SET slug = $1, title = $2, subtitle = $3, excerpt = $4, content = $5, 
           author_name = $6, author_role = $7, category = $8, tags = $9, 
           image_url = $10, read_time = $11, is_published = $12, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $13
       RETURNING id, slug, title, updated_at`,
      [
        finalSlug,
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
        body.isPublished || false,
        existingPost.id
      ]
    );

    // If image_url changed and old image was local, delete old image files
    if (existingPost.image_url && existingPost.image_url.startsWith('/assets/blogs/') && 
        body.imageUrl && body.imageUrl !== existingPost.image_url) {
      try {
        const oldImagePath = path.join(process.cwd(), 'public', existingPost.image_url);
        await fs.access(oldImagePath);
        await fs.unlink(oldImagePath);
      } catch (unlinkErr) {
        console.warn('Could not delete old blog image:', unlinkErr);
      }
    }

    return Response.json({
      success: true,
      message: 'Blog post updated successfully',
      post: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    return Response.json(
      { success: false, error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// Delete blog post by slug
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Fetch blog post to get image path before deletion
    const result = await query(
      'SELECT id, image_url FROM blog_posts WHERE slug = $1',
      [slug]
    );

    if (result.rows.length === 0) {
      return Response.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    const blogPost = result.rows[0];

    // Delete blog post from database
    await query('DELETE FROM blog_posts WHERE id = $1', [blogPost.id]);

    // Delete associated blog images if they exist locally
    if (blogPost.image_url && blogPost.image_url.startsWith('/assets/blogs/')) {
      try {
        const imagePath = path.join(process.cwd(), 'public', blogPost.image_url);
        await fs.access(imagePath);
        await fs.unlink(imagePath);
      } catch (unlinkErr) {
        console.warn('Could not delete blog image:', unlinkErr);
      }
    }

    // Also try to delete the entire blog folder if it exists
    const blogFolder = path.join(process.cwd(), 'public', 'assets', 'blogs', blogPost.id.toString());
    try {
      await fs.access(blogFolder);
      await fs.rm(blogFolder, { recursive: true, force: true });
    } catch (rmErr) {
      console.warn('Could not delete blog folder:', rmErr);
    }

    return Response.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return Response.json(
      { success: false, error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}