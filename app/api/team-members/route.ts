import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

// GET: Fetch all team members or get count
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('active');
    const countOnly = searchParams.get('count');
    
    if (countOnly) {
      // Return only count
      let countSql = `SELECT COUNT(*) as count FROM team_members`;
      let countParams: any[] = [];
      
      if (isActive === 'true') {
        countSql = `SELECT COUNT(*) as count FROM team_members WHERE is_active = $1`;
        countParams = [true];
      }

      const countResult = await query(countSql, countParams);
      const count = parseInt(countResult.rows[0].count);

      return Response.json({ 
        success: true, 
        count: count
      });
    } else {
      // Return all records
      let sql = `SELECT * FROM team_members ORDER BY display_order ASC, created_at DESC`;
      let params: any[] = [];
      
      if (isActive === 'true') {
        sql = `SELECT * FROM team_members WHERE is_active = $1 ORDER BY display_order ASC, created_at DESC`;
        params = [true];
      }

      const result = await query(sql, params);
      const members = result.rows;

      return Response.json({ 
        success: true, 
        data: members 
      });
    }
  } catch (error) {
    console.error('Error fetching team members:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch team members' 
    }, { status: 500 });
  }
}

// POST: Create a new team member
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return Response.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { name, role, team, image_url, bio, display_order = 0, is_active = true } = body;

    // Validate required fields
    if (!name || !role || !team || !image_url) {
      return Response.json({ 
        success: false, 
        error: 'Name, role, team, and image URL are required' 
      }, { status: 400 });
    }

    const insertSql = `
      INSERT INTO team_members (name, role, team, image_url, bio, display_order, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const insertParams = [name, role, team, image_url, bio || null, display_order, is_active];
    
    const result = await query(insertSql, insertParams);
    const newMember = result.rows[0];

    return Response.json({ 
      success: true, 
      data: newMember 
    });
  } catch (error) {
    console.error('Error creating team member:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to create team member' 
    }, { status: 500 });
  }
}

// PUT: Update a team member
export async function PUT(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return Response.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, role, team, image_url, bio, display_order, is_active } = body;

    // Validate required fields
    if (!id || !name || !role || !team || !image_url) {
      return Response.json({ 
        success: false, 
        error: 'ID, name, role, team, and image URL are required' 
      }, { status: 400 });
    }

    const updateSql = `
      UPDATE team_members 
      SET name = $2, role = $3, team = $4, image_url = $5, bio = $6, 
          display_order = $7, is_active = $8, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const updateParams = [id, name, role, team, image_url, bio || null, display_order, is_active];
    
    const result = await query(updateSql, updateParams);
    
    if (result.rowCount === 0) {
      return Response.json({ 
        success: false, 
        error: 'Team member not found' 
      }, { status: 404 });
    }
    
    const updatedMember = result.rows[0];

    return Response.json({ 
      success: true, 
      data: updatedMember 
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to update team member' 
    }, { status: 500 });
  }
}

// DELETE: Delete a team member
export async function DELETE(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return Response.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return Response.json({ 
        success: false, 
        error: 'ID is required' 
      }, { status: 400 });
    }

    const deleteSql = `DELETE FROM team_members WHERE id = $1 RETURNING *`;
    const deleteParams = [id];
    
    const result = await query(deleteSql, deleteParams);
    
    if (result.rowCount === 0) {
      return Response.json({ 
        success: false, 
        error: 'Team member not found' 
      }, { status: 404 });
    }
    
    return Response.json({ 
      success: true, 
      message: 'Team member deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to delete team member' 
    }, { status: 500 });
  }
}