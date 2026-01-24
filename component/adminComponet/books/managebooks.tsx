'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Form,
  InputNumber,
  Select,
  Switch,
  Space,
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Modal,
  message,
  Spin,
  Alert,
  Divider,
  Checkbox,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { authUtils } from '@/lib/auth';
import CloudinaryImageUpload from '@/component/imageUpload/CloudinaryImageUpload';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Book {
  id?: number;
  name: string;
  author: string;
  isbn: string;
  edition: string;
  description: string;
  image_url: string;
  actual_price: number;
  offer_price: number;
  stock_quantity: number;
  in_stock: boolean;
  rating: number;
  reviews_count: number;
  category: string;
  created_at?: string;
  updated_at?: string;
  courseMappings?: BookCourseMap[];
}

interface Course {
  id: number;
  name: string;
  description: string;
  academic_periods?: AcademicPeriod[];
}

interface AcademicPeriod {
  id: number;
  course_id: number;
  period_number: number;
  period_type: 'SEMESTER' | 'YEAR';
  label: string;
  description: string;
}

interface BookCourseMap {
  id?: number;
  book_id?: number;
  course_id: number;
  academic_period_id: number;
  is_required: boolean;
  course_name?: string;
  period_label?: string;
  period_type?: string;
}

const initialFormState: Book = {
  name: '', author: '', isbn: '', edition: '', description: '', image_url: '',
  actual_price: 0, offer_price: 0, stock_quantity: 0, in_stock: true,
  rating: 0, reviews_count: 0, category: ''
};

export default function ManageBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState<number | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<number | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [courseMapping, setCourseMapping] = useState<BookCourseMap[]>([]);
  const [form] = Form.useForm();

  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await authUtils.fetchWithAuth('/api/health');
      const result = await response.json();
      if (result.success) {
        setConnectionError(null);
        return true;
      } else {
        setConnectionError('Database connection failed: ' + result.message);
        return false;
      }
    } catch (error) {
      setConnectionError('Failed to check database connection: ' + (error instanceof Error ? error.message : 'Unknown error'));
      return false;
    }
  }, []);

  const fetchCoursesAndPeriods = useCallback(async () => {
    try {
      const response = await authUtils.fetchWithAuth('/api/course?includePeriods=true');
      const result = await response.json();
      if (result.success) {
        setCourses(result.data || []);
        const allPeriods: AcademicPeriod[] = [];
        result.data?.forEach((course: Course) => {
          if (course.academic_periods) {
            allPeriods.push(...course.academic_periods);
          }
        });
        setAcademicPeriods(allPeriods);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      const isHealthy = await checkHealth();
      if (!isHealthy) {
        setIsInitialLoading(false);
        return;
      }
      try {
        await fetchCoursesAndPeriods();
        const booksResponse = await authUtils.fetchWithAuth('/api/book?includeMappings=true');
        const booksResult = await booksResponse.json();
        if (booksResult.success) {
          const booksWithParsedRatings = booksResult.data.map((book: Book) => ({
            ...book,
            rating: typeof book.rating === 'string' ? parseFloat(book.rating) : (book.rating || 0),
            actual_price: typeof book.actual_price === 'string' ? parseFloat(book.actual_price) : book.actual_price,
            offer_price: typeof book.offer_price === 'string' ? parseFloat(book.offer_price) : book.offer_price,
          }));
          setBooks(booksWithParsedRatings || []);
          setConnectionError(null);
        } else {
          setConnectionError('Failed to fetch books: ' + booksResult.error);
        }
      } catch (error) {
        console.error('Error initializing:', error);
        setConnectionError('Error loading data: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setIsInitialLoading(false);
      }
    };
    initializeData();
  }, []);

  const calculateDiscount = useCallback((actual: number, offer: number) => {
    if (actual <= 0) return 0;
    return Math.round(((actual - offer) / actual) * 100);
  }, []);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      
      if (filterCourse !== null) {
        const hasCourseMapping = book.courseMappings?.some(
          mapping => mapping.course_id === filterCourse
        );
        if (!hasCourseMapping) return false;
      }
      
      if (filterPeriod !== null && filterCourse !== null) {
        const hasPeriodMapping = book.courseMappings?.some(
          mapping => mapping.course_id === filterCourse && mapping.academic_period_id === filterPeriod
        );
        if (!hasPeriodMapping) return false;
      }
      
      return true;
    });
  }, [books, searchTerm, filterCourse, filterPeriod]);

  const getPeriodsForCourse = useCallback((courseId: number) => {
    return academicPeriods.filter(p => p.course_id === courseId);
  }, [academicPeriods]);

  const getDefaultCourseMapping = useCallback((): BookCourseMap[] => {
    if (courses.length === 0) return [];
    const firstCourse = courses[0];
    const coursePeriods = getPeriodsForCourse(firstCourse.id);
    if (coursePeriods.length === 0) return [];
    return [{
      course_id: firstCourse.id,
      academic_period_id: coursePeriods[0].id,
      is_required: true
    }];
  }, [courses, getPeriodsForCourse]);

  const showModal = useCallback((book?: Book) => {
    if (book) {
      form.setFieldsValue(book);
      setEditingId(book.id!);
      setUploadedImageUrl(book.image_url || '');
      if (book.courseMappings && book.courseMappings.length > 0) {
        setCourseMapping(book.courseMappings.map(m => ({
          course_id: m.course_id,
          academic_period_id: m.academic_period_id,
          is_required: m.is_required
        })));
      } else {
        setCourseMapping(getDefaultCourseMapping());
      }
    } else {
      form.resetFields();
      form.setFieldsValue(initialFormState);
      setEditingId(null);
      setUploadedImageUrl('');
      setCourseMapping(getDefaultCourseMapping());
    }
    setIsModalOpen(true);
  }, [form, getDefaultCourseMapping]);

  const handleCancel = useCallback(() => {
    form.resetFields();
    setUploadedImageUrl('');
    setCourseMapping(getDefaultCourseMapping());
    setEditingId(null);
    setIsModalOpen(false);
  }, [form, getDefaultCourseMapping]);

  const refetchBooks = useCallback(async () => {
    try {
      const booksResponse = await authUtils.fetchWithAuth('/api/book?includeMappings=true');
      const booksResult = await booksResponse.json();
      if (booksResult.success) {
        const booksWithParsedRatings = booksResult.data.map((book: Book) => ({
          ...book,
          rating: typeof book.rating === 'string' ? parseFloat(book.rating) : (book.rating || 0),
          actual_price: typeof book.actual_price === 'string' ? parseFloat(book.actual_price) : book.actual_price,
          offer_price: typeof book.offer_price === 'string' ? parseFloat(book.offer_price) : book.offer_price,
        }));
        setBooks(booksWithParsedRatings || []);
      }
    } catch (error) {
      console.error('Error refetching books:', error);
    }
  }, []);

  const handleSubmit = useCallback(async (values: Book) => {
    if (values.offer_price > values.actual_price) {
      message.error('Offer price cannot be greater than actual price');
      return;
    }
    setIsLoading(true);
    try {
      const bookData = {
        ...values,
        image_url: uploadedImageUrl || values.image_url || ''
      };
      
      const url = editingId ? `/api/book/${editingId}` : '/api/book';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await authUtils.fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book: bookData, courseMappings: courseMapping })
      });
      
      const result = await response.json();
      if (result.success) {
        if (editingId) {
          message.success('Book updated successfully!');
        } else {
          message.success('Book created successfully!');
        }
        await refetchBooks();
        handleCancel();
      } else {
        message.error(result.error || 'Operation failed');
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  }, [editingId, courseMapping, uploadedImageUrl, handleCancel, refetchBooks]);

  const handleDelete = useCallback(async (id: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this book?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        setIsLoading(true);
        try {
          const response = await authUtils.fetchWithAuth(`/api/book/${id}`, { method: 'DELETE' });
          const result = await response.json();
          if (result.success) {
            message.success('Book deleted successfully!');
            await refetchBooks();
          } else {
            message.error(result.error || 'Failed to delete book');
          }
        } catch (error) {
          message.error(error instanceof Error ? error.message : 'Failed to delete book');
        } finally {
          setIsLoading(false);
        }
      }
    });
  }, [refetchBooks]);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Book, b: Book) => a.name.localeCompare(b.name),
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      sorter: (a: Book, b: Book) => a.author.localeCompare(b.author),
    },
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="blue">{category || 'N/A'}</Tag>
      ),
    },
    {
      title: 'Course/Period',
      key: 'coursePeriod',
      render: (_: any, record: Book) => {
        if (!record.courseMappings || record.courseMappings.length === 0) {
          return <Tag color="default">Not mapped</Tag>;
        }
        return (
          <Space direction="vertical" size="small">
            {record.courseMappings.slice(0, 2).map((m, idx) => (
              <Tag key={idx} color="purple">
                {m.course_name || courses.find(c => c.id === m.course_id)?.name || 'Unknown'} - {m.period_label || 'Unknown Period'}
              </Tag>
            ))}
            {record.courseMappings.length > 2 && (
              <Tag color="default">+{record.courseMappings.length - 2} more</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Actual Price',
      dataIndex: 'actual_price',
      key: 'actual_price',
      align: 'right' as const,
      render: (price: number) => `₹${price}`,
      sorter: (a: Book, b: Book) => a.actual_price - b.actual_price,
    },
    {
      title: 'Offer Price',
      dataIndex: 'offer_price',
      key: 'offer_price',
      align: 'right' as const,
      render: (price: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          ₹{price}
        </Text>
      ),
      sorter: (a: Book, b: Book) => a.offer_price - b.offer_price,
    },
    {
      title: 'Discount',
      key: 'discount',
      align: 'right' as const,
      render: (_: any, record: Book) => (
        <Tag color="green">{calculateDiscount(record.actual_price, record.offer_price)}%</Tag>
      ),
    },
    {
      title: 'Stock',
      dataIndex: 'stock_quantity',
      key: 'stock_quantity',
      align: 'right' as const,
      render: (stock: number) => (
        <Tag color={stock > 0 ? 'green' : 'red'}>{stock}</Tag>
      ),
      sorter: (a: Book, b: Book) => a.stock_quantity - b.stock_quantity,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Book) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id!)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%', display: 'flex' }}>
          <div>
            <Title level={3}>Books Management</Title>
            <Text type="secondary">Manage your book catalog with course mappings</Text>
          </div>

          {connectionError && (
            <Alert
              message="Connection Error"
              description={connectionError}
              type="error"
              showIcon
              closable
            />
          )}

          {isInitialLoading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Input
                    placeholder="Search by name, author, or ISBN..."
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    allowClear
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Select
                    placeholder="Filter by Course"
                    style={{ width: '100%' }}
                    value={filterCourse}
                    onChange={(value) => {
                      setFilterCourse(value);
                      setFilterPeriod(null);
                    }}
                    allowClear
                  >
                    {courses.map(course => (
                      <Option key={course.id} value={course.id}>
                        {course.name}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Select
                    placeholder="Filter by Year/Semester"
                    style={{ width: '100%' }}
                    value={filterPeriod}
                    onChange={setFilterPeriod}
                    allowClear
                    disabled={!filterCourse}
                  >
                    {filterCourse && getPeriodsForCourse(filterCourse).map(period => (
                      <Option key={period.id} value={period.id}>
                        {period.label || `${period.period_type} ${period.period_number}`}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => showModal()}
                    block
                  >
                    Add Book
                  </Button>
                </Col>
              </Row>

              <Table
                columns={columns}
                dataSource={filteredBooks}
                rowKey="id"
                loading={isLoading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} books`,
                }}
                scroll={{ x: 1200 }}
              />
            </>
          )}
        </Space>
      </Card>

      <Modal
        title={editingId ? 'Edit Book' : 'Add New Book'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={initialFormState}
        >
          <Divider><strong>Basic Information</strong></Divider>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Book Name"
                name="name"
                rules={[{ required: true, message: 'Please enter book name' }]}
              >
                <Input placeholder="Enter book title" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Author"
                name="author"
                rules={[{ required: true, message: 'Please enter author name' }]}
              >
                <Input placeholder="Enter author name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="ISBN"
                name="isbn"
                rules={[{ required: true, message: 'Please enter ISBN' }]}
              >
                <Input placeholder="978-0-12-345678-1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Edition" name="edition">
                <Input placeholder="3rd Edition" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Category" name="category">
                <Select placeholder="Select category">
                  {['Nursing', 'Medical', 'Surgery', 'Pediatrics', 'Pharmacology', 'Anatomy', 'Physiology', 'Pathology'].map(cat => (
                    <Option key={cat} value={cat}>{cat}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider><strong>Description</strong></Divider>
          <Form.Item label="Description" name="description">
            <TextArea rows={4} placeholder="Enter book description" />
          </Form.Item>

          <Divider><strong>Pricing</strong></Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Actual Price"
                name="actual_price"
                rules={[{ required: true, message: 'Please enter actual price' }]}
              >
                <InputNumber
                  placeholder="599"
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  prefix="₹"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Offer Price"
                name="offer_price"
                rules={[{ required: true, message: 'Please enter offer price' }]}
              >
                <InputNumber
                  placeholder="450"
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  prefix="₹"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider><strong>Stock & Ratings</strong></Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Stock Quantity" name="stock_quantity">
                <InputNumber placeholder="0" style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Rating (0-5)" name="rating">
                <InputNumber
                  placeholder="4.5"
                  style={{ width: '100%' }}
                  min={0}
                  max={5}
                  step={0.1}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Reviews Count" name="reviews_count">
                <InputNumber placeholder="0" style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="In Stock" name="in_stock" valuePropName="checked">
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
          </Row>

          <Divider><strong>Book Cover Image</strong></Divider>
          <CloudinaryImageUpload onImageSelect={setUploadedImageUrl} />
          {uploadedImageUrl && (
            <Alert
              message="Image uploaded successfully"
              description={uploadedImageUrl.substring(0, 60) + '...'}
              type="success"
              style={{ marginTop: 16 }}
              showIcon
            />
          )}

          <Divider><strong>Course & Period Mapping</strong></Divider>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Map this book to courses and their academic periods (years/semesters).
          </Text>
          {courseMapping.map((mapping, index) => (
            <Card key={index} size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={10}>
                  <Form.Item label="Course">
                    <Select
                      value={mapping.course_id}
                      onChange={(courseId) => {
                        const newMappings = [...courseMapping];
                        newMappings[index].course_id = courseId;
                        const coursePeriods = getPeriodsForCourse(courseId);
                        if (coursePeriods.length > 0) {
                          newMappings[index].academic_period_id = coursePeriods[0].id;
                        }
                        setCourseMapping(newMappings);
                      }}
                    >
                      {courses.map(course => (
                        <Option key={course.id} value={course.id}>
                          {course.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item label="Year/Semester">
                    <Select
                      value={mapping.academic_period_id}
                      onChange={(periodId) => {
                        const newMappings = [...courseMapping];
                        newMappings[index].academic_period_id = periodId;
                        setCourseMapping(newMappings);
                      }}
                    >
                      {getPeriodsForCourse(mapping.course_id).map(period => (
                        <Option key={period.id} value={period.id}>
                          {period.label || `${period.period_type} ${period.period_number}`}
                          {period.period_type && <Tag style={{ marginLeft: 8 }} color={period.period_type === 'YEAR' ? 'blue' : 'green'}>{period.period_type}</Tag>}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={4} style={{ display: 'flex', alignItems: 'center' }}>
                  <Space direction="vertical">
                    <Checkbox
                      checked={mapping.is_required}
                      onChange={(e) => {
                        const newMappings = [...courseMapping];
                        newMappings[index].is_required = e.target.checked;
                        setCourseMapping(newMappings);
                      }}
                    >
                      Required
                    </Checkbox>
                    {courseMapping.length > 1 && (
                      <Button
                        size="small"
                        danger
                        onClick={() => setCourseMapping(prev => prev.filter((_, i) => i !== index))}
                      >
                        Remove
                      </Button>
                    )}
                  </Space>
                </Col>
              </Row>
            </Card>
          ))}
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => {
              const defaultMapping = getDefaultCourseMapping();
              if (defaultMapping.length > 0) {
                setCourseMapping(prev => [...prev, defaultMapping[0]]);
              }
            }}
            block
            disabled={courses.length === 0}
          >
            Add Another Course Mapping
          </Button>

          <Divider />
          <Form.Item>
            <Space style={{ float: 'right' }}>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                {editingId ? 'Update Book' : 'Create Book'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
