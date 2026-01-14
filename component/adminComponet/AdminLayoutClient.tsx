'use client';

import { useState } from 'react';
import { Layout, Menu, Typography, Avatar } from 'antd';
import {
  HomeOutlined,
  BookOutlined,
  ReadOutlined,
  VideoCameraOutlined,
  FormOutlined,
  CloudOutlined,
  PictureOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import type { MenuProps } from 'antd';

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
    key: '/admin/eresource',
    icon: <CloudOutlined />,
    label: 'E-Resources',
  },
  {
    key: '/admin/orders',
    icon: <ShoppingOutlined />,
    label: 'Orders',
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
    return [];
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
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
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            VisionPublication Admin
          </Title>
          <Avatar style={{ backgroundColor: '#87d068' }}>U</Avatar>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
            borderRadius: 8,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
