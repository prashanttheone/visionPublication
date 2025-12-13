import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify JWT token on the server side (Node.js runtime)
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken')?.value;

    if (!authToken) {
      redirect('/login');
    }

    // Verify JWT with signature
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(authToken, secret) as any;

    // Check if user has admin role
    if (decoded.role !== 'admin') {
      redirect('/');
    }

    // Token is valid and user is admin - render admin pages
    return <>{children}</>;
  } catch (error) {
    console.error('Admin access denied:', error);
    redirect('/login');
  }
}
