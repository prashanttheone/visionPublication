'use client';

import { Suspense } from 'react';
import Login from "@/component/auth/Login";

function LoginContent() {
  return <Login />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
