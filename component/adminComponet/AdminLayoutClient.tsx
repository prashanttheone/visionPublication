'use client';

import { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Avatar, ConfigProvider, theme, Dropdown, Button } from 'antd';
import {
  HomeOutlined,
  BookOutlined,
  ReadOutlined,
  VideoCameraOutlined,
  FormOutlined,
  CloudOutlined,
  PictureOutlined,
  ShoppingOutlined,
  UsergroupAddOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import type { MenuProps } from 'antd';
import { useAuth } from '@/context/AuthProvider';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

const menuItems: MenuItem[] = [
  {
    key: '/admin/dashboard',
    icon: <HomeOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/admin/home/slider',
    icon: <PictureOutlined />,
    label: 'Home Slider',
  },
  {
    key: 'books',
    icon: <BookOutlined />,
    label: 'Books Management',
    children: [
      {
        key: '/admin/books',
        label: 'All Books',
      },
      {
        key: '/admin/books/slider',
        label: 'Book Sliders',
      },
    ],
  },
  {
    key: '/admin/course',
    icon: <ReadOutlined />,
    label: 'Courses',
  },
  {
    key: '/admin/blogs',
    icon: <FormOutlined />,
    label: 'Blogs',
  },
  {
    key: '/admin/yt',
    icon: <VideoCameraOutlined />,
    label: 'YouTube Videos',
  },
  {
    key: '/admin/enquiryforms',
    icon: <FormOutlined />,
    label: 'Enquiry Forms',
  },
  {
    key: 'eresources',
    icon: <CloudOutlined />,
    label: 'E-Resources',
    children: [
      {
        key: '/admin/eresource',
        label: 'All E-Resources',
      },
      {
        key: '/admin/eresource/stats',
        label: 'E-Resource Stats',
      },
    ],
  },
  {
    key: '/admin/orders',
    icon: <ShoppingOutlined />,
    label: 'Orders',
  },
  {
    key: '/admin/gallery',
    icon: <PictureOutlined />,
    label: 'Gallery',
  },
  {
    key: '/admin/team',
    icon: <UsergroupAddOutlined />,
    label: 'Team Members',
  },
  {
    key: '',
    icon: <UsergroupAddOutlined />,
    label: 'Team Members',
  },
];

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    signOut();
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontWeight: 600, color: '#fff' }}>{user?.full_name || 'Admin'}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{user?.email || ''}</div>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
      danger: true,
    },
  ];

  // Load Cloudinary widget script
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if script already exists
      if (!document.getElementById('cloudinary-widget-script')) {
        const script = document.createElement('script');
        script.id = 'cloudinary-widget-script';
        script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
        script.async = true;

        script.onload = () => {
          console.log('Cloudinary widget script loaded successfully');
        };

        script.onerror = () => {
          console.error('Failed to load Cloudinary widget script');
          // Retry after 2 seconds
          setTimeout(() => {
            if (document.getElementById('cloudinary-widget-script')) {
              document.getElementById('cloudinary-widget-script')?.remove();
            }
            const retryScript = document.createElement('script');
            retryScript.id = 'cloudinary-widget-script-retry';
            retryScript.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
            retryScript.async = true;
            document.head.appendChild(retryScript);
          }, 2000);
        };

        document.head.appendChild(script);
      }
    }
  }, []);

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    router.push(e.key);
  };

  const getSelectedKeys = () => {
    if (pathname === '/admin' || pathname === '/admin/dashboard') {
      return ['/admin/dashboard'];
    }
    return [pathname];
  };

  const getOpenKeys = () => {
    if (pathname.startsWith('/admin/books')) {
      return ['books'];
    }
    if (pathname.startsWith('/admin/eresource')) {
      return ['eresources'];
    }
    return [];
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          colorBgContainer: '#141414',
          colorBgLayout: '#000000',
        },
      }}
    >
      <Layout style={{ minHeight: '100vh', background: '#000' }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 1000,
            background: '#001529',
          }}
          theme="dark"
        >
          <div
            style={{
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            {!collapsed ? (
              <Title level={4} style={{ color: '#fff', margin: 0 }}>
                Admin Panel
              </Title>
            ) : (
              <Avatar style={{ backgroundColor: '#1890ff' }}>A</Avatar>
            )}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={getSelectedKeys()}
            defaultOpenKeys={getOpenKeys()}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </Sider>
        <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s', background: '#000' }}>
          <Header
            style={{
              padding: '0 24px',
              background: '#141414',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #303030',
            }}
          >
            <Title level={4} style={{ margin: 0, color: '#fff' }}>
              VisionPublication Admin
            </Title>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <Avatar
                style={{ backgroundColor: '#87d068', cursor: 'pointer' }}
                icon={<UserOutlined />}
              >
                {user?.full_name?.charAt(0)?.toUpperCase() || 'A'}
              </Avatar>
            </Dropdown>
          </Header>
          <Content
            style={{
              margin: '24px 16px',
              padding: 24,
              minHeight: 280,
              background: '#141414',
              borderRadius: 8,
              border: '1px solid #303030',
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
