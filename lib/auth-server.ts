import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Validates the JWT token from the Authorization header and returns the user payload
 */
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    console.error('Auth check failed:', error);
    return null;
  }
}
