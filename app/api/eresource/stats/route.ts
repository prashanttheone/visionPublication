import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-server';

/**
 * GET - Fetch e-resource view statistics
 * Query params:
 * - startDate: ISO date string (optional)
 * - endDate: ISO date string (optional)
 * - courseId: number (optional)
 * - bookId: number (optional)
 * - userId: UUID (optional)
 * Requires: Admin authentication
 */
export async function GET(request: NextRequest) {
    try {
        // Verify admin authentication
        const authResult = await verifyAuth(request);

        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        if (authResult.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const courseId = searchParams.get('courseId');
        const bookId = searchParams.get('bookId');
        const userId = searchParams.get('userId');

        // Build query for view statistics
        let statsQuery = `
      SELECT 
        ev.id,
        ev.user_id,
        ev.eresource_chapter_id,
        ev.eresource_book_id,
        ev.viewed_at,
        u.full_name as user_name,
        u.email as user_email,
        ec.chapter_number,
        ec.chapter_name,
        eb.book_name,
        c.name as course_name,
        ap.description as semester_name
      FROM eresource_views ev
      JOIN users u ON ev.user_id = u.id
      JOIN eresource_chapters ec ON ev.eresource_chapter_id = ec.id
      JOIN eresource_books eb ON ev.eresource_book_id = eb.id
      JOIN courses c ON eb.course_id = c.id
      JOIN academic_periods ap ON eb.academic_period_id = ap.id
      WHERE 1=1
    `;

        const queryParams: any[] = [];
        let paramIndex = 1;

        if (startDate) {
            statsQuery += ` AND ev.viewed_at >= $${paramIndex}`;
            queryParams.push(startDate);
            paramIndex++;
        }

        if (endDate) {
            statsQuery += ` AND ev.viewed_at <= $${paramIndex}`;
            queryParams.push(endDate);
            paramIndex++;
        }

        if (courseId) {
            statsQuery += ` AND eb.course_id = $${paramIndex}`;
            queryParams.push(parseInt(courseId));
            paramIndex++;
        }

        if (bookId) {
            statsQuery += ` AND ev.eresource_book_id = $${paramIndex}`;
            queryParams.push(parseInt(bookId));
            paramIndex++;
        }

        if (userId) {
            statsQuery += ` AND ev.user_id = $${paramIndex}`;
            queryParams.push(userId);
            paramIndex++;
        }

        statsQuery += ' ORDER BY ev.viewed_at DESC LIMIT 1000';

        const viewsResult = await query(statsQuery, queryParams);

        // Get aggregated statistics
        let aggregateQuery = `
      SELECT 
        COUNT(*) as total_views,
        COUNT(DISTINCT ev.user_id) as unique_users,
        COUNT(DISTINCT ev.eresource_chapter_id) as unique_chapters,
        COUNT(DISTINCT ev.eresource_book_id) as unique_books
      FROM eresource_views ev
      JOIN eresource_books eb ON ev.eresource_book_id = eb.id
      WHERE 1=1
    `;

        const aggregateParams: any[] = [];
        let aggParamIndex = 1;

        if (startDate) {
            aggregateQuery += ` AND ev.viewed_at >= $${aggParamIndex}`;
            aggregateParams.push(startDate);
            aggParamIndex++;
        }

        if (endDate) {
            aggregateQuery += ` AND ev.viewed_at <= $${aggParamIndex}`;
            aggregateParams.push(endDate);
            aggParamIndex++;
        }

        if (courseId) {
            aggregateQuery += ` AND eb.course_id = $${aggParamIndex}`;
            aggregateParams.push(parseInt(courseId));
            aggParamIndex++;
        }

        if (bookId) {
            aggregateQuery += ` AND ev.eresource_book_id = $${aggParamIndex}`;
            aggregateParams.push(parseInt(bookId));
            aggParamIndex++;
        }

        if (userId) {
            aggregateQuery += ` AND ev.user_id = $${aggParamIndex}`;
            aggregateParams.push(userId);
            aggParamIndex++;
        }

        const aggregateResult = await query(aggregateQuery, aggregateParams);

        // Get top viewed resources
        let topResourcesQuery = `
      SELECT 
        eb.id as book_id,
        eb.book_name,
        c.name as course_name,
        ap.description as semester_name,
        COUNT(*) as view_count,
        COUNT(DISTINCT ev.user_id) as unique_viewers
      FROM eresource_views ev
      JOIN eresource_books eb ON ev.eresource_book_id = eb.id
      JOIN courses c ON eb.course_id = c.id
      JOIN academic_periods ap ON eb.academic_period_id = ap.id
      WHERE 1=1
    `;

        const topResourcesParams: any[] = [];
        let topParamIndex = 1;

        if (startDate) {
            topResourcesQuery += ` AND ev.viewed_at >= $${topParamIndex}`;
            topResourcesParams.push(startDate);
            topParamIndex++;
        }

        if (endDate) {
            topResourcesQuery += ` AND ev.viewed_at <= $${topParamIndex}`;
            topResourcesParams.push(endDate);
            topParamIndex++;
        }

        if (courseId) {
            topResourcesQuery += ` AND eb.course_id = $${topParamIndex}`;
            topResourcesParams.push(parseInt(courseId));
            topParamIndex++;
        }

        topResourcesQuery += `
      GROUP BY eb.id, eb.book_name, c.name, ap.description
      ORDER BY view_count DESC
      LIMIT 10
    `;

        const topResourcesResult = await query(topResourcesQuery, topResourcesParams);

        return NextResponse.json({
            success: true,
            data: {
                views: viewsResult.rows,
                statistics: aggregateResult.rows[0],
                topResources: topResourcesResult.rows
            }
        });
    } catch (error) {
        console.error('Error fetching e-resource statistics:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch statistics',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
