/**
 * ============================================
 * INDIVIDUAL COURSE API ROUTES
 * ============================================
 * 
 * Endpoints:
 * - GET    /api/course/[id]     - Get single course with semesters
 * - PUT    /api/course/[id]     - Update course and semesters
 * - DELETE /api/course/[id]     - Delete course (cascades to semesters)
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';

// Types
interface Course {
  id?: number;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

interface Semester {
  id?: number;
  course_id?: number;
  semester_number: number;
  description: string;
  created_at?: string;
  updated_at?: string;
}

interface UpdateCourseRequest {
  course: Course;
  semesters: Semester[];
}

/**
 * GET - Fetch single course by ID with semesters
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const courseId = parseInt(id);

    if (isNaN(courseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    // Fetch course
    const courseResult = await query<Course>(
      'SELECT * FROM courses WHERE id = $1',
      [courseId]
    );

    if (courseResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    const course = courseResult.rows[0];

    // Fetch semesters
    const semestersResult = await query<Semester>(
      'SELECT * FROM semesters WHERE course_id = $1 ORDER BY semester_number',
      [courseId]
    );

    return NextResponse.json({
      success: true,
      data: {
        ...course,
        semesters: semestersResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch course',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update course and semesters
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await getClient();

  try {
    const { id } = await params;
    const courseId = parseInt(id);

    if (isNaN(courseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    const body: UpdateCourseRequest = await request.json();
    const { course, semesters } = body;

    // Validation
    if (!course.name || !course.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Course name is required' },
        { status: 400 }
      );
    }

    if (!semesters || semesters.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one semester is required' },
        { status: 400 }
      );
    }

    // Check if course exists
    const existingCourse = await client.query(
      'SELECT id FROM courses WHERE id = $1',
      [courseId]
    );

    if (existingCourse.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Start transaction
    await client.query('BEGIN');

    // Update course
    const courseResult = await client.query<Course>(
      `UPDATE courses 
       SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [course.name.trim(), course.description || '', courseId]
    );

    const updatedCourse = courseResult.rows[0];

    // Delete existing semesters
    await client.query(
      'DELETE FROM semesters WHERE course_id = $1',
      [courseId]
    );

    // Insert new semesters
    const semesterInserts = semesters.map((semester) =>
      client.query<Semester>(
        `INSERT INTO semesters (course_id, semester_number, description, created_at, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [courseId, semester.semester_number, semester.description]
      )
    );

    const semesterResults = await Promise.all(semesterInserts);
    const newSemesters = semesterResults.map((result) => result.rows[0]);

    // Commit transaction
    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: 'Course updated successfully',
      data: {
        course: updatedCourse,
        semesters: newSemesters
      }
    });
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');

    console.error('Error updating course:', error);

    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        {
          success: false,
          error: 'A course with this name already exists'
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update course',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

/**
 * DELETE - Delete course (cascades to semesters)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const courseId = parseInt(id);

    if (isNaN(courseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    // Check if course exists
    const existingCourse = await query(
      'SELECT id, name FROM courses WHERE id = $1',
      [courseId]
    );

    if (existingCourse.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Delete course (semesters will be cascade deleted)
    await query('DELETE FROM courses WHERE id = $1', [courseId]);

    return NextResponse.json({
      success: true,
      message: 'Course and associated semesters deleted successfully',
      data: existingCourse.rows[0]
    });
  } catch (error) {
    console.error('Error deleting course:', error);

    // Check for foreign key constraint violation
    if (error instanceof Error && error.message.includes('foreign key')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete course: it is referenced by other records (books, orders, etc.)'
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete course',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
