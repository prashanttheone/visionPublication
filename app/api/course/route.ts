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

interface CreateCourseRequest {
  course: Course;
  semesters: Semester[];
}

/**
 * GET - Fetch all courses
 * Query params:
 * - includeSemesters: boolean (default: true)
 * - search: string (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeSemesters = searchParams.get('includeSemesters') !== 'false';
    const searchTerm = searchParams.get('search') || '';

    // Build query for courses
    let coursesQuery = 'SELECT * FROM courses'
    const queryParams: any[] = [];

    if (searchTerm) {
      coursesQuery += ' WHERE name ILIKE $1 OR description ILIKE $1';
      queryParams.push(`%${searchTerm}%`);
    }

    coursesQuery += ' ORDER BY created_at DESC';

    const coursesResult = await query<Course>(coursesQuery, queryParams);
    const courses = coursesResult.rows;

    // If semesters should be included, fetch them for all courses
    if (includeSemesters && courses.length > 0) {
      const semestersResult = await query<Semester>(
        `SELECT * FROM semesters 
         WHERE course_id = ANY($1) 
         ORDER BY course_id, semester_number`,
        [courses.map(c => c.id)]
      );

      // Group semesters by course_id
      const semestersByCourse: { [key: number]: Semester[] } = {};
      semestersResult.rows.forEach(semester => {
        if (!semestersByCourse[semester.course_id!]) {
          semestersByCourse[semester.course_id!] = [];
        }
        semestersByCourse[semester.course_id!].push(semester);
      });

      // Attach semesters to courses
      const coursesWithSemesters = courses.map(course => ({
        ...course,
        semesters: semestersByCourse[course.id!] || []
      }));

      return NextResponse.json({
        success: true,
        data: coursesWithSemesters,
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

/**
 * POST - Create new course with semesters
 * Body: { course: Course, semesters: Semester[] }
 */
export async function POST(request: NextRequest) {
  const client = await getClient();

  try {
    const body: CreateCourseRequest = await request.json();
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

    // Validate semester numbers are sequential
    const semesterNumbers = semesters
      .map(s => s.semester_number)
      .sort((a, b) => a - b);
    
    for (let i = 0; i < semesterNumbers.length; i++) {
      if (semesterNumbers[i] !== i + 1) {
        return NextResponse.json(
          {
            success: false,
            error: 'Semester numbers must be sequential starting from 1'
          },
          { status: 400 }
        );
      }
    }

    // Start transaction
    await client.query('BEGIN');

    // Insert course
    const courseResult = await client.query<Course>(
      `INSERT INTO courses (name, description, created_at, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [course.name.trim(), course.description || '']
    );

    const newCourse = courseResult.rows[0];

    // Insert semesters
    const semesterInserts = semesters.map((semester, index) =>
      client.query<Semester>(
        `INSERT INTO semesters (course_id, semester_number, description, created_at, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [newCourse.id, semester.semester_number, semester.description]
      )
    );

    const semesterResults = await Promise.all(semesterInserts);
    const newSemesters = semesterResults.map(result => result.rows[0]);

    // Commit transaction
    await client.query('COMMIT');

    return NextResponse.json(
      {
        success: true,
        message: 'Course created successfully',
        data: {
          course: newCourse,
          semesters: newSemesters
        }
      },
      { status: 201 }
    );
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');

    console.error('Error creating course:', error);

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
        error: 'Failed to create course',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
