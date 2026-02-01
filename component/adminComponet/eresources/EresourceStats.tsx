'use client';

import { useState, useEffect } from 'react';
import {
    Card,
    Table,
    DatePicker,
    Select,
    Row,
    Col,
    Statistic,
    Typography,
    Space,
    Spin,
    message,
} from 'antd';
import {
    EyeOutlined,
    UserOutlined,
    BookOutlined,
    FileTextOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { authUtils } from '@/lib/auth';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface EResourceStats {
    total_views: string;
    unique_users: string;
    unique_chapters: string;
    unique_books: string;
}

interface TopResource {
    book_id: number;
    book_name: string;
    course_name: string;
    semester_name: string;
    view_count: string;
    unique_viewers: string;
}

interface ViewRecord {
    id: number;
    user_name: string;
    user_email: string;
    book_name: string;
    chapter_number: number;
    chapter_name: string;
    course_name: string;
    semester_name: string;
    viewed_at: string;
}

interface Course {
    id: number;
    name: string;
}

interface EResourceBook {
    id: number;
    book_name: string;
}

export default function EresourceStats() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<EResourceStats | null>(null);
    const [topResources, setTopResources] = useState<TopResource[]>([]);
    const [recentViews, setRecentViews] = useState<ViewRecord[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [books, setBooks] = useState<EResourceBook[]>([]);

    // Filters
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
    const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
    const [selectedBook, setSelectedBook] = useState<number | null>(null);

    useEffect(() => {
        fetchCourses();
        fetchBooks();
    }, []);

    useEffect(() => {
        fetchStats();
    }, [dateRange, selectedCourse, selectedBook]);

    const fetchCourses = async () => {
        try {
            const response = await authUtils.fetchWithAuth('/api/course');
            const result = await response.json();
            if (result.success) {
                setCourses(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchBooks = async () => {
        try {
            const response = await authUtils.fetchWithAuth('/api/eresource');
            const result = await response.json();
            if (result.success) {
                setBooks(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    };

    const fetchStats = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            if (dateRange[0]) {
                params.append('startDate', dateRange[0].toISOString());
            }
            if (dateRange[1]) {
                params.append('endDate', dateRange[1].toISOString());
            }
            if (selectedCourse) {
                params.append('courseId', selectedCourse.toString());
            }
            if (selectedBook) {
                params.append('bookId', selectedBook.toString());
            }

            const response = await authUtils.fetchWithAuth(`/api/eresource/stats?${params.toString()}`);
            const result = await response.json();

            if (result.success) {
                setStats(result.data.statistics);
                setTopResources(result.data.topResources || []);
                setRecentViews(result.data.views || []);
            } else {
                message.error(result.error || 'Failed to fetch statistics');
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            message.error('Error loading statistics');
        } finally {
            setLoading(false);
        }
    };

    const topResourcesColumns: ColumnsType<TopResource> = [
        {
            title: 'Rank',
            key: 'rank',
            width: 70,
            render: (_, __, index) => (
                <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                    #{index + 1}
                </Text>
            ),
        },
        {
            title: 'Book Name',
            dataIndex: 'book_name',
            key: 'book_name',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Course',
            dataIndex: 'course_name',
            key: 'course_name',
        },
        {
            title: 'Semester',
            dataIndex: 'semester_name',
            key: 'semester_name',
        },
        {
            title: 'Total Views',
            dataIndex: 'view_count',
            key: 'view_count',
            align: 'center',
            render: (count) => (
                <Text strong style={{ color: '#52c41a' }}>
                    {count}
                </Text>
            ),
        },
        {
            title: 'Unique Viewers',
            dataIndex: 'unique_viewers',
            key: 'unique_viewers',
            align: 'center',
            render: (count) => (
                <Text strong style={{ color: '#1890ff' }}>
                    {count}
                </Text>
            ),
        },
    ];

    const recentViewsColumns: ColumnsType<ViewRecord> = [
        {
            title: 'User',
            key: 'user',
            render: (_, record) => (
                <div>
                    <div><Text strong>{record.user_name}</Text></div>
                    <div><Text type="secondary" style={{ fontSize: '12px' }}>{record.user_email}</Text></div>
                </div>
            ),
        },
        {
            title: 'Book',
            dataIndex: 'book_name',
            key: 'book_name',
        },
        {
            title: 'Chapter',
            key: 'chapter',
            render: (_, record) => (
                <Text>
                    Ch. {record.chapter_number}: {record.chapter_name}
                </Text>
            ),
        },
        {
            title: 'Course',
            dataIndex: 'course_name',
            key: 'course_name',
        },
        {
            title: 'Viewed At',
            dataIndex: 'viewed_at',
            key: 'viewed_at',
            render: (date) => dayjs(date).format('MMM D, YYYY h:mm A'),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2} style={{ marginBottom: '24px', color: '#fff' }}>
                E-Resource Statistics
            </Title>

            {/* Filters */}
            <Card
                style={{
                    marginBottom: '24px',
                    background: '#1a1a1a',
                    borderColor: '#303030',
                }}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                        <Text style={{ display: 'block', marginBottom: '8px', color: '#fff' }}>
                            Date Range
                        </Text>
                        <RangePicker
                            style={{ width: '100%' }}
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null])}
                            format="YYYY-MM-DD"
                        />
                    </Col>
                    <Col xs={24} md={8}>
                        <Text style={{ display: 'block', marginBottom: '8px', color: '#fff' }}>
                            Course
                        </Text>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="All Courses"
                            allowClear
                            value={selectedCourse}
                            onChange={setSelectedCourse}
                        >
                            {courses.map((course) => (
                                <Select.Option key={course.id} value={course.id}>
                                    {course.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} md={8}>
                        <Text style={{ display: 'block', marginBottom: '8px', color: '#fff' }}>
                            Book
                        </Text>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="All Books"
                            allowClear
                            value={selectedBook}
                            onChange={setSelectedBook}
                        >
                            {books.map((book) => (
                                <Select.Option key={book.id} value={book.id}>
                                    {book.book_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
            </Card>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    {/* Statistics Cards */}
                    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                        <Col xs={24} sm={12} lg={6}>
                            <Card
                                style={{
                                    background: 'linear-gradient(135deg, rgba(24, 144, 255, 0.2) 0%, rgba(24, 144, 255, 0.05) 100%)',
                                    borderColor: '#1890ff',
                                }}
                            >
                                <Statistic
                                    title={<Text style={{ color: '#fff' }}>Total Views</Text>}
                                    value={stats?.total_views || 0}
                                    prefix={<EyeOutlined style={{ color: '#1890ff' }} />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card
                                style={{
                                    background: 'linear-gradient(135deg, rgba(82, 196, 26, 0.2) 0%, rgba(82, 196, 26, 0.05) 100%)',
                                    borderColor: '#52c41a',
                                }}
                            >
                                <Statistic
                                    title={<Text style={{ color: '#fff' }}>Unique Users</Text>}
                                    value={stats?.unique_users || 0}
                                    prefix={<UserOutlined style={{ color: '#52c41a' }} />}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card
                                style={{
                                    background: 'linear-gradient(135deg, rgba(250, 173, 20, 0.2) 0%, rgba(250, 173, 20, 0.05) 100%)',
                                    borderColor: '#faad14',
                                }}
                            >
                                <Statistic
                                    title={<Text style={{ color: '#fff' }}>Unique Books</Text>}
                                    value={stats?.unique_books || 0}
                                    prefix={<BookOutlined style={{ color: '#faad14' }} />}
                                    valueStyle={{ color: '#faad14' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card
                                style={{
                                    background: 'linear-gradient(135deg, rgba(114, 46, 209, 0.2) 0%, rgba(114, 46, 209, 0.05) 100%)',
                                    borderColor: '#722ed1',
                                }}
                            >
                                <Statistic
                                    title={<Text style={{ color: '#fff' }}>Unique Chapters</Text>}
                                    value={stats?.unique_chapters || 0}
                                    prefix={<FileTextOutlined style={{ color: '#722ed1' }} />}
                                    valueStyle={{ color: '#722ed1' }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Top Resources Table */}
                    <Card
                        title={
                            <Text strong style={{ fontSize: '18px', color: '#fff' }}>
                                Top 10 Most Viewed Resources
                            </Text>
                        }
                        style={{
                            marginBottom: '24px',
                            background: '#1a1a1a',
                            borderColor: '#303030',
                        }}
                    >
                        <Table
                            columns={topResourcesColumns}
                            dataSource={topResources}
                            rowKey="book_id"
                            pagination={false}
                            style={{ background: '#1a1a1a' }}
                        />
                    </Card>

                    {/* Recent Views Table */}
                    <Card
                        title={
                            <Text strong style={{ fontSize: '18px', color: '#fff' }}>
                                Recent Views (Last 1000)
                            </Text>
                        }
                        style={{
                            background: '#1a1a1a',
                            borderColor: '#303030',
                        }}
                    >
                        <Table
                            columns={recentViewsColumns}
                            dataSource={recentViews}
                            rowKey="id"
                            pagination={{
                                pageSize: 20,
                                showSizeChanger: true,
                                showTotal: (total) => `Total ${total} views`,
                            }}
                            style={{ background: '#1a1a1a' }}
                        />
                    </Card>
                </>
            )}
        </div>
    );
}
