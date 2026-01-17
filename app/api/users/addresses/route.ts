import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

/**
 * GET /api/users/addresses
 * Fetch saved addresses for the logged-in user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(`
      SELECT * FROM user_addresses 
      WHERE user_id = $1 
      ORDER BY is_default DESC, updated_at DESC
      LIMIT 3
    `, [user.id]);

    return NextResponse.json({
      success: true,
      addresses: result.rows
    });

  } catch (error) {
    console.error('Failed to fetch addresses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/users/addresses
 * Create or Update an address
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      id,
      fullName, 
      phone, 
      address, 
      locality, 
      city, 
      state, 
      zipCode,
      pincode, 
      country, 
      isDefault 
    } = body;

    const finalPincode = pincode || zipCode;

    // Validation & Fallback for required fields
    const finalLocality = locality || city || 'Default';

    if (isDefault) {
      // Unset previous default
      await query(`UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1`, [user.id]);
    }

    if (id) {
      // Update existing
      await query(`
        UPDATE user_addresses 
        SET full_name = $1, contact_no = $2, address_line_1 = $3, locality = $4, 
            city = $5, state = $6, pincode = $7, country = $8, is_default = $9, updated_at = CURRENT_TIMESTAMP
        WHERE id = $10 AND user_id = $11
      `, [fullName, phone, address, finalLocality, city, state, finalPincode, country || 'India', isDefault || false, id, user.id]);
      
      return NextResponse.json({ success: true, message: 'Address updated' });
    } else {
      // Create new
      const result = await query(`
        INSERT INTO user_addresses (
          user_id, full_name, contact_no, address_line_1, locality, city, state, pincode, country, is_default
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `, [
        user.id, fullName, phone || '0000000000', address, finalLocality, city, state, finalPincode, country || 'India', isDefault || false
      ]);

      return NextResponse.json({ success: true, id: result.rows[0].id });
    }

  } catch (error) {
    console.error('Failed to save address:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
