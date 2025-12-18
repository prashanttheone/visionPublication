export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ManageEresources from '@/component/adminComponet/eresources/ManageEresources';

export default async function EresourcePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token');

//   if (!token) {
//     redirect('/login');
//   }

  return <ManageEresources />;
}
