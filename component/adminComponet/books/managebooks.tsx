'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Card,
  Typography,
  Space,
  Modal,
  message,
  Spin,
  Alert,
  Form,
} from 'antd';
import { authUtils } from '@/lib/auth';
import { Book, Course, AcademicPeriod, BookCourseMap } from './feat/types';
import { BookTable } from './feat/BookTable';
import { BookForm } from './feat/BookForm';
import { BookFilters } from './feat/BookFilters';

const { Title, Text } = Typography;

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

  const fetchBooks = useCallback(async () => {
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
        setConnectionError(null);
      } else {
        setConnectionError('Failed to fetch books: ' + booksResult.error);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      setConnectionError('Error loading data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      const isHealthy = await checkHealth();
      if (!isHealthy) {
        setIsInitialLoading(false);
        return;
      }
      await Promise.all([fetchCoursesAndPeriods(), fetchBooks()]);
      setIsInitialLoading(false);
    };
    initializeData();
  }, [checkHealth, fetchCoursesAndPeriods, fetchBooks]);

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
        message.success(`Book ${editingId ? 'updated' : 'created'} successfully!`);
        await fetchBooks();
        handleCancel();
      } else {
        message.error(result.error || 'Operation failed');
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  }, [editingId, courseMapping, uploadedImageUrl, handleCancel, fetchBooks]);

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
            await fetchBooks();
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
  }, [fetchBooks]);

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
              <BookFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterCourse={filterCourse}
                setFilterCourse={setFilterCourse}
                filterPeriod={filterPeriod}
                setFilterPeriod={setFilterPeriod}
                courses={courses}
                getPeriodsForCourse={getPeriodsForCourse}
                onAddBook={() => showModal()}
              />

              <BookTable
                books={filteredBooks}
                courses={courses}
                isLoading={isLoading}
                onEdit={showModal}
                onDelete={handleDelete}
                calculateDiscount={calculateDiscount}
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
        <BookForm
          form={form}
          courses={courses}
          academicPeriods={academicPeriods}
          editingId={editingId}
          uploadedImageUrl={uploadedImageUrl}
          setUploadedImageUrl={setUploadedImageUrl}
          courseMapping={courseMapping}
          setCourseMapping={setCourseMapping}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          getPeriodsForCourse={getPeriodsForCourse}
          getDefaultCourseMapping={getDefaultCourseMapping}
        />
      </Modal>
    </div>
  );
}
