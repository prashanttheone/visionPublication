import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

/**
 * GET /api/orders/cart
 * Fetch current user's shopping cart
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(`
      SELECT sc.*, b.name, b.author, b.actual_price, b.offer_price, b.image_url, b.sku, b.in_stock
      FROM shopping_cart sc
      JOIN books b ON sc.book_id = b.id
      WHERE sc.user_id = $1
      ORDER BY sc.added_at DESC
    `, [user.id]);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/orders/cart
 * Add or update item in cart
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { book_id, quantity } = await request.json();

    if (!book_id || !quantity || quantity < 1) {
      return NextResponse.json({ error: 'Invalid book_id or quantity' }, { status: 400 });
    }

    // Upsert logic
    await query(`
      INSERT INTO shopping_cart (user_id, book_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, book_id)
      DO UPDATE SET 
        quantity = shopping_cart.quantity + EXCLUDED.quantity,
        updated_at = CURRENT_TIMESTAMP
    `, [user.id, book_id, quantity]);

    return NextResponse.json({ success: true, message: 'Cart updated' });
  } catch (error) {
    console.error('Failed to update cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/orders/cart
 * Remove item or clear cart
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('book_id');

    if (bookId) {
      // Remove specific item
      await query('DELETE FROM shopping_cart WHERE user_id = $1 AND book_id = $2', [user.id, bookId]);
      return NextResponse.json({ success: true, message: 'Item removed from cart' });
    } else {
      // Clear entire cart
      await query('DELETE FROM shopping_cart WHERE user_id = $1', [user.id]);
      return NextResponse.json({ success: true, message: 'Cart cleared' });
    }
  } catch (error) {
    console.error('Failed to delete cart item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PATCH /api/orders/cart
 * Set absolute quantity for an item (used for +/- buttons in cart UI)
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { book_id, quantity } = await request.json();

    if (!book_id || quantity === undefined || quantity < 1) {
      return NextResponse.json({ error: 'Invalid book_id or quantity' }, { status: 400 });
    }

    await query(`
      UPDATE shopping_cart 
      SET quantity = $3, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND book_id = $2
    `, [user.id, book_id, quantity]);

    return NextResponse.json({ success: true, message: 'Quantity updated' });
  } catch (error) {
    console.error('Failed to patch cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
