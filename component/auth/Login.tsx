'use client';

import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Checkbox,
  Divider,
} from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { authUtils } from '@/lib/auth';

const { Title, Text, Link } = Typography;

interface LoginModalProps {
  isModal?: boolean;
  onSuccess?: () => void;
}

export default function Login({ isModal = false, onSuccess }: LoginModalProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get('returnTo');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (values: any) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      authUtils.setAuthToken(data.token, data.user);
      window.dispatchEvent(new Event('auth-update'));

      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          if (data.user.role === 'admin') {
            router.push('/admin/dashboard');
          } else if (returnTo) {
            router.push(returnTo);
          } else {
            router.push('/books');
          }
        }, 100);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Modal version - simplified without image
  if (isModal) {
    return (
      <div style={{ width: '100%' }}>
        {error && (
          <Alert
            type="error"
            message={error}
            showIcon
            style={{ marginBottom: 16 }}
            closable
            onClose={() => setError(null)}
          />
        )}

        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
          >
            <Input placeholder="name@example.com" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              placeholder="Enter password"
              size="large"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>
              <Link href="/auth/reset-password">Forgot password?</Link>
            </div>
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
          >
            Sign In
          </Button>
        </Form>

        <Divider>OR</Divider>

        <div style={{ textAlign: 'center' }}>
          <Text>
            Don't have an account? <Link href="/signup">Create one</Link>
          </Text>
        </div>
      </div>
    );
  }

  // Full page version with image
  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Image (LG only) */}
      <div
        style={{
          flex: 1,
          backgroundImage: 'url(/login.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: window.innerWidth < 992 ? 'none' : 'block'
        }}
      />

      {/* Login Form */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div style={{ width: '100%', maxWidth: 380 }}>
          <Title level={3} style={{ textAlign: 'center' }}>
            Welcome Back To Vision Publication
          </Title>
          <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
            Sign in to continue
          </Text>

          {error && (
            <Alert
              type="error"
              message={error}
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form layout="vertical" onFinish={handleLogin}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, type: 'email' }]}
            >
              <Input placeholder="name@example.com" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true }]}
            >
              <Input.Password
                placeholder="Enter password"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>

                <Link href="/auth/reset-password">Forgot password?</Link>
              </div>
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              Sign In
            </Button>
          </Form>

          <Divider>OR</Divider>

          <Button block onClick={() => alert('Google OAuth coming soon')}>
            🔐 Continue with Google
          </Button>

          <Text style={{ display: 'block', marginTop: 16, textAlign: 'center' }}>
            Don't have an account? <Link href="/signup">Create one</Link>
          </Text>
        </div>
      </div>
    </div>
  );
}
