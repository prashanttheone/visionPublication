'use client';

import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Avatar, 
  Typography, 
  Descriptions, 
  Button, 
  Tag, 
  Space, 
  Divider,
  Skeleton,
  ConfigProvider,
  theme
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  IdcardOutlined, 
  LogoutOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import { authUtils } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

export default function UserProfile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = authUtils.getUser();
    if (userData) {
      setUser(userData);
    } else {
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  const handleLogout = async () => {
    await authUtils.logout();
  };

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <Skeleton avatar active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#3B82F6',
          borderRadius: 12,
        },
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
        <Card
          style={{ 
            background: 'rgba(30, 41, 59, 0.6)', 
            border: '1px solid rgba(100, 181, 246, 0.2)',
            borderRadius: '16px'
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#3B82F6' }} />
              <div>
                <Title level={2} style={{ margin: 0, color: 'white' }}>{user.full_name}</Title>
                <Tag color="blue">{user.role?.toUpperCase() || 'USER'}</Tag>
              </div>
            </div>

            <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

            <Descriptions 
              title={<span style={{ color: '#60A5FA' }}>Personal Information</span>} 
              column={1}
              labelStyle={{ color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}
              contentStyle={{ color: 'white' }}
            >
              <Descriptions.Item label={<span><MailOutlined /> Email</span>}>
                {user.email}
              </Descriptions.Item>
              <Descriptions.Item label={<span><IdcardOutlined /> User ID</span>}>
                <Text copyable style={{ color: 'white' }}>{user.id}</Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

            <Space size="middle">
              <Button 
                type="primary" 
                icon={<ShoppingOutlined />} 
                onClick={() => router.push('/books/order-history')}
                style={{ background: 'linear-gradient(to right, #3B82F6, #06B6D4)', border: 'none' }}
              >
                My Orders
              </Button>
              <Button 
                danger 
                icon={<LogoutOutlined />} 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Space>
          </Space>
        </Card>
      </div>
    </ConfigProvider>
  );
}
