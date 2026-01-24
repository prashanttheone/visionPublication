import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';

interface Course {
  id?: number;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

interface AcademicPeriod {
  id?: number;
  course_id?: number;
  period_number: number;
  period_type?: 'SEMESTER' | 'YEAR';
  label?: string;
  description: string;
}

interface UpdateCourseRequest {
  course: Course;
  academic_periods: AcademicPeriod[];
}

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

    const periodsResult = await query<AcademicPeriod>(
      'SELECT * FROM academic_periods WHERE course_id = $1 ORDER BY period_number',
      [courseId]
    );

    return NextResponse.json({
      success: true,
      data: {
        ...course,
        academic_periods: periodsResult.rows
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
    const { course, academic_periods } = body;

    if (!course.name || !course.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Course name is required' },
        { status: 400 }
      );
    }

    if (!academic_periods || academic_periods.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one academic period is required' },
        { status: 400 }
      );
    }

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

    await client.query('BEGIN');

    const courseResult = await client.query<Course>(
      `UPDATE courses 
       SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [course.name.trim(), course.description || '', courseId]
    );

    const updatedCourse = courseResult.rows[0];

    await client.query('DELETE FROM academic_periods WHERE course_id = $1', [courseId]);

    const periodInserts = academic_periods.map((period, index) =>
      client.query<AcademicPeriod>(
        `INSERT INTO academic_periods (course_id, period_number, description, period_type, label, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [courseId, period.period_number || index + 1, period.description || '', period.period_type || 'SEMESTER', period.label || '']
      )
    );

    const periodResults = await Promise.all(periodInserts);
    const newPeriods = periodResults.map(result => result.rows[0]);

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: 'Course updated successfully',
      data: {
        course: updatedCourse,
        academic_periods: newPeriods
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');

    console.error('Error updating course:', error);

    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { success: false, error: 'A course with this name already exists' },
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

    await query('DELETE FROM courses WHERE id = $1', [courseId]);

    return NextResponse.json({
      success: true,
      message: 'Course and associated periods deleted successfully',
      data: existingCourse.rows[0]
    });
  } catch (error) {
    console.error('Error deleting course:', error);

    if (error instanceof Error && error.message.includes('foreign key')) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete course: it is referenced by other records (books, orders, etc.)' },
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
