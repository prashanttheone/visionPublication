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
  Row,
  Col,
} from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { authUtils } from '@/lib/auth';

const { Title, Text, Link } = Typography;

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

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

      setTimeout(() => {
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (returnTo) {
          router.push(returnTo);
        } else {
          router.push('/books');
        }
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row style={{ minHeight: '100vh' }}>
      {/* Left Image (LG only) */}
      <Col
        lg={12}
        md={0}
        sm={0}
        xs={0}
        style={{
          backgroundImage: 'url(/group.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Login Form */}
      <Col
        lg={12}
        md={24}
        sm={24}
        xs={24}
        style={{
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
              title={error}
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
            Don’t have an account? <Link href="/signup">Create one</Link>
          </Text>
        </div>
      </Col>
    </Row>
  );
}
