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
}

interface Semester {
  id: number;
  course_id: number;
  semester_number: number;
  description: string;
}

interface BookCourseMap {
  id?: number;
  book_id?: number;
  course_id: number;
  semester_id: number;
  is_required: boolean;
  is_recommended: boolean;
}

const initialFormState: Book = {
  name: '', author: '', isbn: '', edition: '', description: '', image_url: '',
  actual_price: 0, offer_price: 0, stock_quantity: 0, in_stock: true,
  rating: 0, reviews_count: 0, category: ''
};

export default function ManageBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState<number | null>(null);
  const [filterSemester, setFilterSemester] = useState<number | null>(null);
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

  const fetchCoursesAndSemesters = useCallback(async () => {
    try {
      const response = await authUtils.fetchWithAuth('/api/course?includeSemesters=true');
      const result = await response.json();
      if (result.success) {
        setCourses(result.data || []);
        const allSems: Semester[] = [];
        result.data?.forEach((course: any) => {
          if (course.semesters) {
            allSems.push(...course.semesters);
          }
        });
        setSemesters(allSems);
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
        await fetchCoursesAndSemesters();
        // Fetch books with course mappings
        const booksResponse = await authUtils.fetchWithAuth('/api/book?includeMappings=true');
        const booksResult = await booksResponse.json();
        if (booksResult.success) {
          // Ensure rating is a number
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

  // Initialize courseMapping when courses and semesters are loaded
  useEffect(() => {
    if (courses.length > 0 && semesters.length > 0 && courseMapping.length === 0) {
      const firstCourse = courses[0];
      const courseSems = semesters.filter(s => s.course_id === firstCourse.id);
      if (courseSems.length > 0) {
        setCourseMapping([{
          course_id: firstCourse.id,
          semester_id: courseSems[0].id,
          is_required: true,
          is_recommended: false
        }]);
      }
    }
  }, [courses, semesters, courseMapping.length]);

  const calculateDiscount = useCallback((actual: number, offer: number) => {
    if (actual <= 0) return 0;
    return Math.round(((actual - offer) / actual) * 100);
  }, []);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      // Search filter
      const matchesSearch = book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      
      // Course filter
      if (filterCourse !== null) {
        const hasCourseMapping = book.courseMappings?.some(
          mapping => mapping.course_id === filterCourse
        );
        if (!hasCourseMapping) return false;
      }
      
      // Semester filter (only applies if course is selected)
      if (filterSemester !== null && filterCourse !== null) {
        const hasSemesterMapping = book.courseMappings?.some(
          mapping => mapping.course_id === filterCourse && mapping.semester_id === filterSemester
        );
        if (!hasSemesterMapping) return false;
      }
      
      return true;
    });
  }, [books, searchTerm, filterCourse, filterSemester]);

  const getDefaultCourseMapping = useCallback((): BookCourseMap[] => {
    if (courses.length === 0) return [];
    const firstCourse = courses[0];
    const courseSemesters = semesters.filter(s => s.course_id === firstCourse.id);
    if (courseSemesters.length === 0) return [];
    return [{
      course_id: firstCourse.id,
      semester_id: courseSemesters[0].id,
      is_required: true,
      is_recommended: false
    }];
  }, [courses, semesters]);

  const showModal = useCallback((book?: Book) => {
    if (book) {
      form.setFieldsValue(book);
      setEditingId(book.id!);
    } else {
      form.resetFields();
      form.setFieldsValue(initialFormState);
      setEditingId(null);
    }
    setUploadedImageUrl('');
    setCourseMapping(getDefaultCourseMapping());
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
        // Ensure rating is a number
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
        await refetchBooks(); // Refetch to get updated mappings
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
            await refetchBooks(); // Refetch to update list
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

  const getSemestersForCourse = useCallback((courseId: number) => {
    return semesters.filter(s => s.course_id === courseId);
  }, [semesters]);

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
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number, record: Book) => {
        const validRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0;
        return `⭐ ${validRating.toFixed(1)}`;
      },
      sorter: (a: Book, b: Book) => (a.rating || 0) - (b.rating || 0),
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
        <Space orientation="vertical" size="large" style={{ width: '100%', display: 'flex' }}>
          <div>
            <Title level={3}>📚 Books Management</Title>
            <Text type="secondary">Manage your book catalog with complete CRUD operations</Text>
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
                      setFilterSemester(null); // Reset semester when course changes
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
                    placeholder="Filter by Semester"
                    style={{ width: '100%' }}
                    value={filterSemester}
                    onChange={setFilterSemester}
                    allowClear
                    disabled={!filterCourse}
                  >
                    {filterCourse && getSemestersForCourse(filterCourse).map(semester => (
                      <Option key={semester.id} value={semester.id}>
                        {semester.description || `Semester ${semester.semester_number}`}
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
        title={editingId ? '✏️ Edit Book' : '➕ Add New Book'}
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
          <Divider><strong>📖 Basic Information</strong></Divider>
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

          <Divider><strong>📝 Description</strong></Divider>
          <Form.Item label="Description" name="description">
            <TextArea rows={4} placeholder="Enter book description" />
          </Form.Item>

          <Divider><strong>💰 Pricing</strong></Divider>
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

          <Divider><strong>📊 Stock & Ratings</strong></Divider>
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

          <Divider><strong>🖼️ Book Cover Image</strong></Divider>
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

          <Divider><strong>🎓 Course Mapping</strong></Divider>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Map this book to academic courses, semesters, and specify if it's required or recommended.
          </Text>
          {courseMapping.map((mapping, index) => (
            <Card key={index} size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Course">
                    <Select
                      value={mapping.course_id}
                      onChange={(courseId) => {
                        const newMappings = [...courseMapping];
                        newMappings[index].course_id = courseId;
                        const courseSems = semesters.filter(s => s.course_id === courseId);
                        if (courseSems.length > 0) {
                          newMappings[index].semester_id = courseSems[0].id;
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
                <Col span={12}>
                  <Form.Item label="Semester">
                    <Select
                      value={mapping.semester_id}
                      onChange={(semesterId) => {
                        const newMappings = [...courseMapping];
                        newMappings[index].semester_id = semesterId;
                        setCourseMapping(newMappings);
                      }}
                    >
                      {getSemestersForCourse(mapping.course_id).map(semester => (
                        <Option key={semester.id} value={semester.id}>
                          {semester.description || `Semester ${semester.semester_number}`}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Space>
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
                    <Checkbox
                      checked={mapping.is_recommended}
                      onChange={(e) => {
                        const newMappings = [...courseMapping];
                        newMappings[index].is_recommended = e.target.checked;
                        setCourseMapping(newMappings);
                      }}
                    >
                      Recommended
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
