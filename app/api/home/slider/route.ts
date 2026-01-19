import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";

// GET - Fetch all sliders or active sliders only
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    let sqlQuery = `
      SELECT id, title, description, image_url, link_url, display_order, is_active, created_at, updated_at
      FROM home_sliders
    `;

    if (activeOnly) {
      sqlQuery += " WHERE is_active = true";
    }

    sqlQuery += " ORDER BY display_order ASC, created_at ASC";

    const result = await query(sqlQuery);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching sliders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sliders" },
      { status: 500 }
    );
  }
}

// POST - Create a new slider
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, image_url, link_url, display_order, is_active } = body;

    // Validation
    if (!title || !image_url) {
      return NextResponse.json(
        { success: false, error: "Title and image URL are required" },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO home_sliders (title, description, image_url, link_url, display_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        title,
        description || null,
        image_url,
        link_url || null,
        display_order || 0,
        is_active !== undefined ? is_active : true,
      ]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: "Slider created successfully",
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating slider:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create slider" },
      { status: 500 }
    );
  }
}

// PUT - Update an existing slider
export async function PUT(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, title, description, image_url, link_url, display_order, is_active } = body;

    // Validation
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Slider ID is required" },
        { status: 400 }
      );
    }

    if (!title || !image_url) {
      return NextResponse.json(
        { success: false, error: "Title and image URL are required" },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE home_sliders
       SET title = $1, description = $2, image_url = $3, link_url = $4, 
           display_order = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [title, description || null, image_url, link_url || null, display_order || 0, is_active !== undefined ? is_active : true, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Slider not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: "Slider updated successfully",
    });
  } catch (error) {
    console.error("Error updating slider:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update slider" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a slider
export async function DELETE(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Slider ID is required" },
        { status: 400 }
      );
    }

    const result = await query(
      "DELETE FROM home_sliders WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Slider not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Slider deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting slider:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete slider" },
      { status: 500 }
    );
  }
}