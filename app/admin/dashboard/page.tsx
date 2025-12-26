'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import {
  BookOutlined,
  ReadOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  FormOutlined,
  CloudOutlined,
} from '@ant-design/icons';

interface AdminStats {
  totalBooks: number;
  totalCourses: number;
  totalBlogs: number;
  totalSliders: number;
  totalYoutubeVideos: number;
  totalEresources: number;
  totalHomeSliders: number;
}

export default function Page() {
  const [stats, setStats] = useState<AdminStats>({
    totalBooks: 0,
    totalCourses: 0,
    totalBlogs: 0,
    totalSliders: 0,
    totalYoutubeVideos: 0,
    totalEresources: 0,
    totalHomeSliders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);

        const [booksRes, coursesRes, slidersRes, videosRes, eresourcesRes, homeSlidersRes] =
          await Promise.all([
            fetch('/api/book'),
            fetch('/api/course'),
            fetch('/api/book/slider'),
            fetch('/api/youtube'),
            fetch('/api/eresource'),
            fetch('/api/home/slider'),
          ]);

        const [booksData, coursesData, slidersData, videosData, eresourcesData, homeSlidersData] =
          await Promise.all([
            booksRes.json(),
            coursesRes.json(),
            slidersRes.json(),
            videosRes.json(),
            eresourcesRes.json(),
            homeSlidersRes.json(),
          ]);

        setStats({
          totalBooks: booksData.count || 0,
          totalCourses: coursesData.count || 0,
          totalBlogs: 0,
          totalSliders: slidersData.count || 0,
          totalYoutubeVideos: videosData.count || 0,
          totalEresources: eresourcesData.count || 0,
          totalHomeSliders: homeSlidersData.data?.length || 0,
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
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Books"
              value={stats.totalBooks}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Courses"
              value={stats.totalCourses}
              prefix={<ReadOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Home Sliders"
              value={stats.totalHomeSliders}
              prefix={<PictureOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="YouTube Videos"
              value={stats.totalYoutubeVideos}
              prefix={<VideoCameraOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Blogs"
              value={stats.totalBlogs}
              prefix={<FormOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="E-Resources"
              value={stats.totalEresources}
              prefix={<CloudOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
