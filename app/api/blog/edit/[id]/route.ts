import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import path from 'path';
import fs from 'fs/promises';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Fetch existing blog post by ID
    const existingResult = await query(
      'SELECT id, image_url, slug FROM blog_posts WHERE id = $1',
      [parseInt(id)]
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