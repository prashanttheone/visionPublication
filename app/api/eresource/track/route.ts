import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-server';

/**
 * POST - Track e-resource chapter view
 * Body: { chapterId: number, bookId: number }
 * Requires: Authentication (JWT)
 */
export async function POST(request: NextRequest) {
    try {
        // Verify user authentication
        const authResult = await verifyAuth(request);

        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { chapterId, bookId } = body;

        // Validation
        if (!chapterId || !bookId) {
            return NextResponse.json(
                { success: false, error: 'Chapter ID and Book ID are required' },
                { status: 400 }
            );
        }

        // Verify chapter exists and belongs to the book
        const chapterCheck = await query(
            `SELECT ec.id, ec.eresource_book_id 
       FROM eresource_chapters ec
       WHERE ec.id = $1 AND ec.eresource_book_id = $2`,
            [chapterId, bookId]
        );

        if (chapterCheck.rows.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid chapter or book ID' },
                { status: 404 }
            );
        }

        // Insert view record
        await query(
            `INSERT INTO eresource_views (user_id, eresource_chapter_id, eresource_book_id, viewed_at, created_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [authResult.user.id, chapterId, bookId]
        );

        return NextResponse.json({
            success: true,
            message: 'View tracked successfully'
        });
    } catch (error) {
        console.error('Error tracking e-resource view:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to track view',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
