'use client';

export const dynamic = 'force-dynamic';

import dynamicImport from 'next/dynamic';

const AdminOrderManagement = dynamicImport(
  () => import('@/component/adminComponet/orderMangement/order'),
  { ssr: false }
);

export default function AdminOrdersPage() {
    return (
        <AdminOrderManagement />
    );
}
