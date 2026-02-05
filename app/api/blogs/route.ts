import { NextRequest } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category') || undefined;
    const isPublished = searchParams.get('published') ? searchParams.get('published') === 'true' : true;
    const isFeatured = searchParams.get('featured');
    const searchTerm = searchParams.get('search') || undefined;

    // Build the WHERE clause dynamically
    let whereClause = 'WHERE is_published = $3';
    const queryParams: (number | boolean | string)[] = [limit, offset, isPublished];
    let paramIndex = 4;

    if (category) {
      whereClause += ` AND category = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }

    if (isFeatured !== null && isFeatured !== undefined) {
      whereClause += ` AND is_featured = $${paramIndex}`;
      queryParams.push(isFeatured === 'true');
      paramIndex++;
    }

    if (searchTerm) {
      whereClause += ` AND (title ILIKE $${paramIndex} OR excerpt ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`;
      queryParams.push(`%${searchTerm}%`);
      paramIndex++;
    }

    // First get the total count
    const countQuery = `SELECT COUNT(*) as total_count FROM blog_posts ${whereClause.replace('ORDER BY created_at DESC LIMIT $1 OFFSET $2', '')}`;
    const countResult = await query(countQuery, queryParams.slice(2)); // Skip limit and offset for count
    const totalCount = parseInt(countResult.rows[0].total_count);

    // Then get the paginated results
    const queryText = `
      SELECT id, slug, title, subtitle, excerpt, content, 
             author_name as "authorName", author_role as "authorRole", 
             category, tags, image_url as "imageUrl", read_time as "readTime", 
             is_published as "isPublished", is_featured as "isFeatured", 
             view_count as "viewCount", like_count as "likeCount", 
             comment_count as "commentCount", created_at as "createdAt", 
             updated_at as "updatedAt", published_at as "publishedAt"
      FROM blog_posts
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await query(queryText, [limit, offset, ...queryParams.slice(2)]);

    return Response.json({
      success: true,
      posts: result.rows,
      total: totalCount,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch blog posts' 
    }, { status: 500 });
  }
}