import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';

type PeriodType = 'SEMESTER' | 'YEAR' | 'BOTH';

interface Course {
  id?: number;
  name: string;
  description: string;
  period_type?: PeriodType;
  total_years?: number;
  total_semesters?: number;
  is_active?: boolean;
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
  created_at?: string;
  updated_at?: string;
}

interface CreateCourseRequest {
  course: Course;
  academic_periods: AcademicPeriod[];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includePeriods = searchParams.get('includePeriods') !== 'false';
    const searchTerm = searchParams.get('search') || '';

    let coursesQuery = 'SELECT * FROM courses'
    const queryParams: any[] = [];

    if (searchTerm) {
      coursesQuery += ' WHERE name ILIKE $1 OR description ILIKE $1';
      queryParams.push(`%${searchTerm}%`);
    }

    coursesQuery += ' ORDER BY created_at DESC';

    const coursesResult = await query<Course>(coursesQuery, queryParams);
    const courses = coursesResult.rows;

    if (includePeriods && courses.length > 0) {
      const periodsResult = await query<AcademicPeriod>(
        `SELECT * FROM academic_periods 
         WHERE course_id = ANY($1) 
         ORDER BY course_id, period_number`,
        [courses.map(c => c.id)]
      );

      const periodsByCourse: { [key: number]: AcademicPeriod[] } = {};
      periodsResult.rows.forEach(period => {
        if (!periodsByCourse[period.course_id!]) {
          periodsByCourse[period.course_id!] = [];
        }
        periodsByCourse[period.course_id!].push(period);
      });

      const coursesWithPeriods = courses.map(course => ({
        ...course,
        academic_periods: periodsByCourse[course.id!] || []
      }));

      return NextResponse.json({
        success: true,
        data: coursesWithPeriods,
        count: courses.length
      });
    }

    return NextResponse.json({
      success: true,
      data: courses,
      count: courses.length
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch courses',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const client = await getClient();

  try {
    const body: CreateCourseRequest = await request.json();
    const { course, academic_periods } = body;

    if (!course?.name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Course name is required' },
        { status: 400 }
      );
    }

    if (!academic_periods?.length) {
      return NextResponse.json(
        { success: false, error: 'At least one academic period is required' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    const courseResult = await client.query(
      `
      INSERT INTO courses (name, description, created_at, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
      `,
      [course.name.trim(), course.description || '']
    );

    const newCourse = courseResult.rows[0];

    const periodResults = await Promise.all(
      academic_periods.map((period, index) =>
        client.query(
          `
          INSERT INTO academic_periods
            (course_id, period_number, description, period_type, label, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING *
          `,
          [
            newCourse.id,
            period.period_number || index + 1,
            period.description || '',
            period.period_type || 'SEMESTER',
            period.label || ''
          ]
        )
      )
    );

    await client.query('COMMIT');

    return NextResponse.json(
      {
        success: true,
        data: {
          course: newCourse,
          academic_periods: periodResults.map(r => r.rows[0])
        }
      },
      { status: 201 }
    );
  } catch (error) {
    await client.query('ROLLBACK');

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create course',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}