'use client';

import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Typography,
    DatePicker,
    Select,
    Row,
    Col,
    Statistic,
    Space,
    Tag,
    Button,
    message,
    Spin
} from 'antd';
import {
    EyeOutlined,
    UserOutlined,
    BookOutlined,
    FileTextOutlined,
    DownloadOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface ViewRecord {
    id: number;
    user_id: string;
    user_name: string;
    user_email: string;
    eresource_chapter_id: number;
    eresource_book_id: number;
    chapter_number: number;
    chapter_name: string;
    book_name: string;
    course_name: string;
    semester_name: string;
    viewed_at: string;
}

interface Statistics {
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

interface StatsData {
    views: ViewRecord[];
    statistics: Statistics;
    topResources: TopResource[];
}

export default function EresourceViewStats() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<StatsData | null>(null);
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
    const [selectedBook, setSelectedBook] = useState<number | null>(null);
    const [courses, setCourses] = useState<any[]>([]);
    const [books, setBooks] = useState<any[]>([]);

    const fetchCourses = async () => {
        try {
            const response = await fetch('/api/course');
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
            const response = await fetch('/api/eresource?includeChapters=false');
            const result = await response.json();
            if (result.success) {
                setBooks(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();

            if (dateRange) {
                params.append('startDate', dateRange[0].toISOString());
                params.append('endDate', dateRange[1].toISOString());
            }

            if (selectedCourse) {
                params.append('courseId', selectedCourse.toString());
            }

            if (selectedBook) {
                params.append('bookId', selectedBook.toString());
            }

            const response = await fetch(`/api/eresource/stats?${params.toString()}`);
            const result = await response.json();

            if (result.success) {
                setData(result.data);
            } else {
                message.error(result.error || 'Failed to fetch statistics');
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            message.error('Failed to fetch statistics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
        fetchBooks();
        fetchStats();
    }, []);

    useEffect(() => {
        fetchStats();
    }, [dateRange, selectedCourse, selectedBook]);

    const handleExport = () => {
        if (!data?.views) return;

        const csv = [
            ['Date', 'User Name', 'User Email', 'Book', 'Chapter', 'Course', 'Semester'],
            ...data.views.map(view => [
                dayjs(view.viewed_at).format('YYYY-MM-DD HH:mm:ss'),
                view.user_name,
                view.user_email,
                view.book_name,
                `${view.chapter_number}. ${view.chapter_name}`,
                view.course_name,
                view.semester_name
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eresource-views-${dayjs().format('YYYY-MM-DD')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        message.success('Exported successfully');
    };

    const columns: ColumnsType<ViewRecord> = [
        {
            title: 'Date & Time',
            dataIndex: 'viewed_at',
            key: 'viewed_at',
            width: 180,
            render: (date: string) => (
                <Text style={{ fontSize: '13px' }}>
                    {dayjs(date).format('MMM DD, YYYY HH:mm')}
                </Text>
            ),
            sorter: (a, b) => dayjs(a.viewed_at).unix() - dayjs(b.viewed_at).unix(),
            defaultSortOrder: 'descend'
        },
        {
            title: 'User',
            key: 'user',
            width: 200,
            render: (_, record) => (
                <div>
                    <Text strong style={{ fontSize: '13px', display: 'block' }}>
                        {record.user_name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.user_email}
                    </Text>
                </div>
            )
        },
        {
            title: 'Book',
            dataIndex: 'book_name',
            key: 'book_name',
            width: 250,
            render: (text: string) => (
                <Text style={{ fontSize: '13px' }}>{text}</Text>
            )
        },
        {
            title: 'Chapter',
            key: 'chapter',
            width: 250,
            render: (_, record) => (
                <Text style={{ fontSize: '13px' }}>
                    {record.chapter_number}. {record.chapter_name}
                </Text>
            )
        },
        {
            title: 'Course',
            dataIndex: 'course_name',
            key: 'course_name',
            width: 150,
            render: (text: string) => (
                <Tag color="blue" style={{ fontSize: '12px' }}>{text}</Tag>
            )
        },
        {
            title: 'Semester',
            dataIndex: 'semester_name',
            key: 'semester_name',
            width: 120,
            render: (text: string) => (
                <Tag color="green" style={{ fontSize: '12px' }}>{text}</Tag>
            )
        }
    ];

    const topResourceColumns: ColumnsType<TopResource> = [
        {
            title: 'Rank',
            key: 'rank',
            width: 60,
            render: (_, __, index) => (
                <Text strong style={{ fontSize: '14px' }}>#{index + 1}</Text>
            )
        },
        {
            title: 'Book Name',
            dataIndex: 'book_name',
            key: 'book_name',
            render: (text: string) => (
                <Text style={{ fontSize: '13px' }}>{text}</Text>
            )
        },
        {
            title: 'Course',
            dataIndex: 'course_name',
            key: 'course_name',
            render: (text: string) => (
                <Tag color="blue" style={{ fontSize: '12px' }}>{text}</Tag>
            )
        },
        {
            title: 'Total Views',
            dataIndex: 'view_count',
            key: 'view_count',
            width: 120,
            render: (count: string) => (
                <Text strong style={{ fontSize: '13px', color: '#1890ff' }}>{count}</Text>
            )
        },
        {
            title: 'Unique Viewers',
            dataIndex: 'unique_viewers',
            key: 'unique_viewers',
            width: 140,
            render: (count: string) => (
                <Text style={{ fontSize: '13px' }}>{count}</Text>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
                <Title level={2} style={{ marginBottom: '8px' }}>
                    <EyeOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
                    E-Resource View Analytics
                </Title>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                    Track and analyze e-resource usage across all courses and users
                </Text>
            </div>

            {/* Filters */}
            <Card style={{ marginBottom: '24px' }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>
                            Date Range
                        </Text>
                        <RangePicker
                            style={{ width: '100%' }}
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
                            format="YYYY-MM-DD"
                        />
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>
                            Course
                        </Text>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="All Courses"
                            allowClear
                            value={selectedCourse}
                            onChange={setSelectedCourse}
                        >
                            {courses.map(course => (
                                <Select.Option key={course.id} value={course.id}>
                                    {course.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>
                            Book
                        </Text>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="All Books"
                            allowClear
                            value={selectedBook}
                            onChange={setSelectedBook}
                        >
                            {books.map(book => (
                                <Select.Option key={book.id} value={book.id}>
                                    {book.book_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>
                            Actions
                        </Text>
                        <Space>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={fetchStats}
                                loading={loading}
                            >
                                Refresh
                            </Button>
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                onClick={handleExport}
                                disabled={!data?.views || data.views.length === 0}
                            >
                                Export CSV
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Statistics Cards */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <Spin size="large" />
                </div>
            ) : data ? (
                <>
                    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                        <Col xs={12} sm={6}>
                            <Card>
                                <Statistic
                                    title="Total Views"
                                    value={data.statistics.total_views}
                                    prefix={<EyeOutlined />}
                                    valueStyle={{ color: '#1890ff', fontSize: '28px' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Card>
                                <Statistic
                                    title="Unique Users"
                                    value={data.statistics.unique_users}
                                    prefix={<UserOutlined />}
                                    valueStyle={{ color: '#52c41a', fontSize: '28px' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Card>
                                <Statistic
                                    title="Unique Books"
                                    value={data.statistics.unique_books}
                                    prefix={<BookOutlined />}
                                    valueStyle={{ color: '#faad14', fontSize: '28px' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Card>
                                <Statistic
                                    title="Unique Chapters"
                                    value={data.statistics.unique_chapters}
                                    prefix={<FileTextOutlined />}
                                    valueStyle={{ color: '#722ed1', fontSize: '28px' }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Top Resources */}
                    <Card
                        title={
                            <Space>
                                <BookOutlined style={{ color: '#1890ff' }} />
                                <Text strong>Top 10 Most Viewed Resources</Text>
                            </Space>
                        }
                        style={{ marginBottom: '24px' }}
                    >
                        <Table
                            columns={topResourceColumns}
                            dataSource={data.topResources}
                            rowKey="book_id"
                            pagination={false}
                            size="small"
                        />
                    </Card>

                    {/* Detailed View Logs */}
                    <Card
                        title={
                            <Space>
                                <EyeOutlined style={{ color: '#1890ff' }} />
                                <Text strong>Recent View Activity</Text>
                                <Tag color="blue">{data.views.length} records</Tag>
                            </Space>
                        }
                    >
                        <Table
                            columns={columns}
                            dataSource={data.views}
                            rowKey="id"
                            pagination={{
                                pageSize: 20,
                                showSizeChanger: true,
                                showTotal: (total) => `Total ${total} views`
                            }}
                            scroll={{ x: 1200 }}
                            size="small"
                        />
                    </Card>
                </>
            ) : null}
        </div>
    );
}
