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
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
} from '@ant-design/icons';
import { authUtils } from '@/lib/auth';

const { Title, Text, Link } = Typography;

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (values: any) => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone || null,
          password: values.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      authUtils.setAuthToken(data.token, data.user);
      setSuccess(true);

      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
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

      {/* Signup Form */}
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
        <div style={{ width: 380 }}>
          <Title level={3} style={{ textAlign: 'center' }}>
            Create Account
          </Title>
          <Text
            type="secondary"
            style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}
          >
            Join VisionPub today
          </Text>

          {error && (
            <Alert
              type="error"
              title={error}
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {success && (
            <Alert
              type="success"
              message="Account created successfully!"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form layout="vertical" onFinish={handleSignup}>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  name="firstName"
                  label="First Name"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="lastName"
                  label="Last Name"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, type: 'email' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="phone" label="Phone (optional)">
              <Input />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true },
                { min: 8, message: 'Minimum 8 characters' },
              ]}
            >
              <Input.Password
                iconRender={(v) =>
                  v ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={['password']}
              rules={[
                { required: true },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('Passwords do not match')
                    );
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="terms"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, v) =>
                    v
                      ? Promise.resolve()
                      : Promise.reject('Accept terms'),
                },
              ]}
            >
              <Checkbox>
                I agree to <Link href="/terms">Terms</Link> &{' '}
                <Link href="/privacy">Privacy</Link>
              </Checkbox>
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              Create Account
            </Button>
          </Form>

          <Divider>OR</Divider>

          <Button block onClick={() => alert('Google signup coming soon')}>
            🔐 Continue with Google
          </Button>

          <Text
            style={{
              display: 'block',
              marginTop: 16,
              textAlign: 'center',
            }}
          >
            Already have an account? <Link href="/login">Sign in</Link>
          </Text>
        </div>
      </Col>
    </Row>
  );
}
