import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { authUtils } from '@/lib/auth';

// GET: Fetch all gallery images
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('active');
    
    let sql = `SELECT * FROM gallery_images ORDER BY display_order ASC, created_at DESC`;
    let params: any[] = [];
    
    if (isActive === 'true') {
      sql = `SELECT * FROM gallery_images WHERE is_active = $1 ORDER BY display_order ASC, created_at DESC`;
      params = [true];
    }

    const result = await query(sql, params);
    const images = result.rows;

    return Response.json({ 
      success: true, 
      data: images 
    });
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch gallery images' 
    }, { status: 500 });
  }
}

// POST: Create a new gallery image
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    if (!authUtils.isAdmin()) {
      return Response.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, image_url, alt_text, display_order = 0, is_active = true } = body;

    // Validate required fields
    if (!title || !image_url) {
      return Response.json({ 
        success: false, 
        error: 'Title and image URL are required' 
      }, { status: 400 });
    }

    const insertSql = `
      INSERT INTO gallery_images (title, description, image_url, alt_text, display_order, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const insertParams = [title, description || null, image_url, alt_text || null, display_order, is_active];
    
    const result = await query(insertSql, insertParams);
    const newImage = result.rows[0];

    return Response.json({ 
      success: true, 
      data: newImage 
    });
  } catch (error) {
    console.error('Error creating gallery image:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to create gallery image' 
    }, { status: 500 });
  }
}

// PUT: Update a gallery image
export async function PUT(request: NextRequest) {
  try {
    // Check if user is admin
    if (!authUtils.isAdmin()) {
      return Response.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, description, image_url, alt_text, display_order, is_active } = body;

    // Validate required fields
    if (!id || !title || !image_url) {
      return Response.json({ 
        success: false, 
        error: 'ID, title, and image URL are required' 
      }, { status: 400 });
    }

    const updateSql = `
      UPDATE gallery_images 
      SET title = $2, description = $3, image_url = $4, alt_text = $5, 
          display_order = $6, is_active = $7, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const updateParams = [id, title, description || null, image_url, alt_text || null, display_order, is_active];
    
    const result = await query(updateSql, updateParams);
    
    if (result.rowCount === 0) {
      return Response.json({ 
        success: false, 
        error: 'Gallery image not found' 
      }, { status: 404 });
    }
    
    const updatedImage = result.rows[0];

    return Response.json({ 
      success: true, 
      data: updatedImage 
    });
  } catch (error) {
    console.error('Error updating gallery image:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to update gallery image' 
    }, { status: 500 });
  }
}

// DELETE: Delete a gallery image
export async function DELETE(request: NextRequest) {
  try {
    // Check if user is admin
    if (!authUtils.isAdmin()) {
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

    const deleteSql = `DELETE FROM gallery_images WHERE id = $1 RETURNING *`;
    const deleteParams = [id];
    
    const result = await query(deleteSql, deleteParams);
    
    if (result.rowCount === 0) {
      return Response.json({ 
        success: false, 
        error: 'Gallery image not found' 
      }, { status: 404 });
    }
    
    return Response.json({ 
      success: true, 
      message: 'Gallery image deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to delete gallery image' 
    }, { status: 500 });
  }
}