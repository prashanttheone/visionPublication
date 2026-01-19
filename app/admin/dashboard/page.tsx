'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/auth';
import {
  BookOutlined,
  ReadOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  FormOutlined,
  CloudOutlined,
  ShoppingOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';

interface AdminStats {
  totalBooks: number;
  totalCourses: number;
  totalBlogs: number;
  totalSliders: number;
  totalYoutubeVideos: number;
  totalEresources: number;
  totalHomeSliders: number;
  totalOrders: number;
  totalTeamMembers: number;
}

export default function Page() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    totalBooks: 0,
    totalCourses: 0,
    totalBlogs: 0,
    totalSliders: 0,
    totalYoutubeVideos: 0,
    totalEresources: 0,
    totalHomeSliders: 0,
    totalOrders: 0,
    totalTeamMembers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);

        const [booksRes, coursesRes, slidersRes, videosRes, eresourcesRes, homeSlidersRes, ordersRes, teamRes] =
          await Promise.all([
            authUtils.fetchWithAuth('/api/book'),
            authUtils.fetchWithAuth('/api/course'),
            authUtils.fetchWithAuth('/api/book/slider'),
            authUtils.fetchWithAuth('/api/youtube'),
            authUtils.fetchWithAuth('/api/eresource'),
            authUtils.fetchWithAuth('/api/home/slider'),
            authUtils.fetchWithAuth('/api/orders'),
            authUtils.fetchWithAuth('/api/team-members'),
          ]);

        const [booksData, coursesData, slidersData, videosData, eresourcesData, homeSlidersData, ordersData, teamData] =
          await Promise.all([
            booksRes.json(),
            coursesRes.json(),
            slidersRes.json(),
            videosRes.json(),
            eresourcesRes.json(),
            homeSlidersRes.json(),
            ordersRes.json(),
            teamRes.json(),
          ]);

        setStats({
          totalBooks: booksData.count || 0,
          totalCourses: coursesData.count || 0,
          totalBlogs: 0,
          totalSliders: slidersData.count || 0,
          totalYoutubeVideos: videosData.count || 0,
          totalEresources: eresourcesData.count || 0,
          totalHomeSliders: homeSlidersData.data?.length || 0,
          totalOrders: Array.isArray(ordersData) ? ordersData.length : 0,
          totalTeamMembers: teamData.data?.length || 0,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Dashboard</h1>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            onClick={() => router.push('/admin/books')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="Total Books"
              value={stats.totalBooks}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            onClick={() => router.push('/admin/course')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="Total Courses"
              value={stats.totalCourses}
              prefix={<ReadOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            onClick={() => router.push('/admin/home/slider')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="Home Sliders"
              value={stats.totalHomeSliders}
              prefix={<PictureOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            onClick={() => router.push('/admin/yt')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="YouTube Videos"
              value={stats.totalYoutubeVideos}
              prefix={<VideoCameraOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            onClick={() => router.push('/admin/orders')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="Total Orders"
              value={stats.totalOrders}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            onClick={() => router.push('/admin/blogs')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="Total Blogs"
              value={stats.totalBlogs}
              prefix={<FormOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            onClick={() => router.push('/admin/eresource')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="E-Resources"
              value={stats.totalEresources}
              prefix={<CloudOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable 
            onClick={() => router.push('/admin/team')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="Team Members"
              value={stats.totalTeamMembers}
              prefix={<UsergroupAddOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}