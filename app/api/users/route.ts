
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        // Determine sort order (optional, default to newest first)
        // In a real app, you might add pagination here
        const result = await query(
            `SELECT id, full_name, email, phone, role, is_active, created_at 
       FROM users 
       ORDER BY created_at DESC`,
            []
        );

        return NextResponse.json({
            success: true,
            users: result.rows,
            count: result.rowCount
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
