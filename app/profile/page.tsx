'use client';

import ShopLayout from '@/component/shopLayout';
import UserProfile from '@/component/user/profile/UserProfile';

export default function ProfilePage() {
  return (
    <ShopLayout>
      <div style={{ padding: '40px 0' }}>
        <UserProfile />
      </div>
    </ShopLayout>
  );
}
