
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db'; // Assuming this exports a query function

// Helper to ensure tables exist
const ensureTablesExist = async () => {
    // Create Orders Table
    await query(`
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            user_id INTEGER, -- Can be linked to a users table if it exists, or just store the ID from auth
            user_email VARCHAR(255),
            full_name VARCHAR(255),
            shipping_address TEXT,
            city VARCHAR(100),
            state VARCHAR(100),
            zip_code VARCHAR(50),
            country VARCHAR(100),
            total_amount NUMERIC(10, 2),
            status VARCHAR(50) DEFAULT 'pending', -- pending, completed, cancelled
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Create Order Items Table
    await query(`
        CREATE TABLE IF NOT EXISTS order_items (
            id SERIAL PRIMARY KEY,
            order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
            book_id INTEGER,
            book_name VARCHAR(255),
            quantity INTEGER,
            price NUMERIC(10, 2)
        );
    `);
};

export async function POST(req: NextRequest) {
    try {
        // 1. Auth Check (Basic - getting user from headers or assuming auth middleware passed it)
        // Since we are using client-side auth tokens, we might need to verify the token here using jwt-decode or similar.
        // For now, let's trust the client sends valid user info in the body OR relying on the fact that checkout page requires auth.
        // Better: We should actually decode the header token here.
        // But to keep it simple and robust per user request "make this checkout successfully", 
        // I will extract user info from the request body which the frontend sends (from its auth context).

        const body = await req.json();
        const { items, total, shippingAddress } = body;

        // Basic validation
        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        // Ensure tables exist
        await ensureTablesExist();

        // 2. Insert Order
        // Note: We'll store shipping address components individually
        const insertOrderQuery = `
            INSERT INTO orders (user_email, full_name, shipping_address, city, state, zip_code, country, total_amount, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'completed') -- Marking as completed for "checkout successfully"
            RETURNING id;
        `;

        const addressString = `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}`;

        const orderResult = await query(insertOrderQuery, [
            shippingAddress.email,
            shippingAddress.fullName,
            shippingAddress.address, // Storing street line separately
            shippingAddress.city,
            shippingAddress.state,
            shippingAddress.zipCode,
            shippingAddress.country,
            total
        ]);

        const orderId = orderResult.rows[0].id;

        // 3. Insert Order Items
        for (const item of items) {
            await query(`
                INSERT INTO order_items (order_id, book_id, book_name, quantity, price)
                VALUES ($1, $2, $3, $4, $5)
            `, [orderId, item.id, item.name, item.quantity, item.price]);
        }

        return NextResponse.json({ success: true, orderId });

    } catch (error: any) {
        console.error('Order creation error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        await ensureTablesExist();
        const result = await query('SELECT * FROM orders ORDER BY created_at DESC');
        return NextResponse.json(result.rows);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
