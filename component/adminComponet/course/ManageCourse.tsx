'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  ConfigProvider,
  Card,
  Input,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Table,
  Tag,
  Divider,
  Form,
  message,
  Modal,
  Spin,
  theme,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  BookOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { confirm } = Modal;
const { useToken } = theme;

/* ===================== TYPES ===================== */
interface Course {
  id?: number;
  name: string;
  description: string;
}

interface Semester {
  id?: number;
  course_id?: number;
  semester_number: number;
  description: string;
}

/* ===================== DARK THEME CONFIG ===================== */
const darkTheme = {
  token: {
    colorBgBase: '#1a1a1a',
    colorBgContainer: '#262626',
    colorBgElevated: '#262626',
    colorBgSpotlight: '#262626',
    colorBgLayout: '#000000',
    colorText: 'rgba(255, 255, 255, 0.85)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
    colorTextTertiary: 'rgba(255, 255, 255, 0.45)',
    colorBorder: '#434343',
    colorBorderSecondary: '#303030',
    colorPrimary: '#177ddc',
    colorPrimaryHover: '#3c9be8',
    colorSuccess: '#49aa19',
    colorWarning: '#d89614',
    colorError: '#dc4446',
    colorInfo: '#177ddc',
  },
  components: {
    Card: {
      colorBgContainer: '#262626',
      colorBorder: '#434343',
    },
    Button: {
      colorBgContainer: '#262626',
      colorBorder: '#434343',
    },
    Input: {
      colorBgContainer: '#262626',
      colorBorder: '#434343',
      colorText: 'rgba(255, 255, 255, 0.85)',
      colorTextPlaceholder: 'rgba(255, 255, 255, 0.45)',
    },
    Table: {
      colorBgContainer: '#262626',
      colorBorder: '#434343',
      headerBg: '#1d1d1d',
      rowHoverBg: '#303030',
    },
  },
};

/* ===================== MAIN ===================== */
export default function ManageCourse() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [view, setView] = useState<'list' | 'form' | 'semester'>('list');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [search, setSearch] = useState('');

  // Semester management state
  const [semestersForCourse, setSemestersForCourse] = useState<Semester[]>([
    { semester_number: 1, description: '1st Year 1st Semester' },
    { semester_number: 2, description: '1st Year 2nd Semester' }
  ]);

  const [form] = Form.useForm<Course>();

  /* ===================== FETCH ===================== */
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/course?includeSemesters=true');
      const data = await res.json();
      if (data.success) {
        setCourses(data.data || []);
        const all: Semester[] = [];
        data.data?.forEach((c: any) => c.semesters && all.push(...c.semesters));
        setSemesters(all);
      } else {
        message.error(data.error || 'Failed to load courses');
      }
    } catch (error) {
      message.error('Error loading courses');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  /* ===================== HELPERS ===================== */
  const getCourseSemesters = useCallback(
    (courseId?: number) =>
      semesters.filter((s) => s.course_id === courseId),
    [semesters]
  );

  const filteredCourses = useMemo(
    () =>
      courses.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.description.toLowerCase().includes(search.toLowerCase())
      ),
    [courses, search]
  );

  /* ===================== SEMESTER HELPERS ===================== */
  const getOrdinal = (n: number): string => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const handleSemesterChange = useCallback((index: number, field: keyof Semester, value: any) => {
    setSemestersForCourse(prev => {
      const newSemesters = [...prev];
      newSemesters[index] = { ...newSemesters[index], [field]: value };
      return newSemesters;
    });
  }, []);

  const handleAddSemester = useCallback(() => {
    const nextSemesterNumber = semestersForCourse.length + 1;
    const year = Math.ceil(nextSemesterNumber / 2);
    const semInYear = nextSemesterNumber % 2 === 0 ? '2nd' : '1st';
    
    setSemestersForCourse(prev => [
      ...prev,
      {
        semester_number: nextSemesterNumber,
        description: `${getOrdinal(year)} Year ${semInYear} Semester`
      }
    ]);
  }, [semestersForCourse]);

  const handleRemoveSemester = useCallback((index: number) => {
    if (semestersForCourse.length <= 1) {
      message.warning('A course must have at least one semester');
      return;
    }
    setSemestersForCourse(prev => prev.filter((_, i) => i !== index));
  }, [semestersForCourse]);

  const generateSemesterTemplate = useCallback((years: number) => {
    const newSemesters: Semester[] = [];
    for (let year = 1; year <= years; year++) {
      for (let sem = 1; sem <= 2; sem++) {
        const semesterNumber = (year - 1) * 2 + sem;
        const semInYear = sem === 1 ? '1st' : '2nd';
        newSemesters.push({
          semester_number: semesterNumber,
          description: `${getOrdinal(year)} Year ${semInYear} Semester`
        });
      }
    }
    setSemestersForCourse(newSemesters);
  }, []);

  /* ===================== API ===================== */
  const handleSubmit = async (values: Course) => {
    try {
      // Validate semester data
      if (semestersForCourse.length === 0) {
        message.error('Please add at least one semester');
        return;
      }

      // Validate semester numbers are sequential
      const semesterNumbers = semestersForCourse.map(s => s.semester_number).sort((a, b) => a - b);
      for (let i = 0; i < semesterNumbers.length; i++) {
        if (semesterNumbers[i] !== i + 1) {
          message.error('Semester numbers must be sequential starting from 1');
          return;
        }
      }

      setSubmitting(true);
      const url = editingCourse ? `/api/course/${editingCourse.id}` : '/api/course';
      const method = editingCourse ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course: values, semesters: semestersForCourse }),
      });

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Operation failed');
      }

      // Update local state
      if (editingCourse) {
        setCourses(prev => prev.map(c => 
          c.id === editingCourse.id ? { ...c, ...values } : c
        ));
        // Update semesters
        setSemesters(prev => {
          const filtered = prev.filter(s => s.course_id !== editingCourse.id);
          return [...filtered, ...data.data.semesters];
        });
        message.success(`Course "${values.name}" updated successfully with ${data.data.semesters.length} semesters`);
      } else {
        setCourses(prev => [...prev, { ...data.data.course, ...values }]);
        setSemesters(prev => [...prev, ...data.data.semesters]);
        message.success(`Course "${values.name}" created successfully with ${data.data.semesters.length} semesters`);
      }

      // Reset and return to list
      form.resetFields();
      setSemestersForCourse([
        { semester_number: 1, description: '1st Year 1st Semester' },
        { semester_number: 2, description: '1st Year 2nd Semester' }
      ]);
      setView('list');
      setEditingCourse(null);
      
    } catch (error: any) {
      message.error(error.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id?: number, courseName?: string) => {
    if (!id) return;
    
    try {
      const res = await fetch(`/api/course/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        message.success(`Course "${courseName}" deleted successfully`);
        setCourses(prev => prev.filter(c => c.id !== id));
        setSemesters(prev => prev.filter(s => s.course_id !== id));
        if (view === 'semester' && selectedCourse?.id === id) {
          setView('list');
          setSelectedCourse(null);
        }
      } else {
        message.error(data.error || 'Failed to delete course');
      }
    } catch (error) {
      message.error('Error deleting course');
    }
  };

  /* ===================== EDIT HANDLERS ===================== */
  const handleEditCourse = useCallback((course: Course) => {
    setEditingCourse(course);
    form.setFieldsValue(course);
    
    // Load existing semesters for this course
    const existingSemesters = semesters.filter(s => s.course_id === course.id);
    if (existingSemesters.length > 0) {
      setSemestersForCourse(existingSemesters);
    } else {
      setSemestersForCourse([
        { semester_number: 1, description: '1st Year 1st Semester' },
        { semester_number: 2, description: '1st Year 2nd Semester' }
      ]);
    }
    
    setView('form');
  }, [semesters, form]);

  /* ===================== REUSABLE COMPONENTS ===================== */
  const Header = ({ 
    title, 
    onBack,
    extra 
  }: { 
    title: string; 
    onBack?: () => void;
    extra?: React.ReactNode;
  }) => (
    <div style={{ marginBottom: 24 }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space>
          {onBack && (
            <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
              Back
            </Button>
          )}
          <Title level={3} style={{ margin: 0, flex: 1 }}>{title}</Title>
          {extra}
        </Space>
      </Space>
    </div>
  );

  const CourseGrid = () => (
    <Row gutter={[16, 16]}>
      {filteredCourses.map((course) => {
        const sem = getCourseSemesters(course.id);
        return (
          <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
            <Card
              title={course.name}
              loading={loading}
              extra={<BookOutlined />}
              actions={[
                <Button 
                  type="link" 
                  size="small"
                  onClick={() => {
                    setSelectedCourse(course);
                    setView('semester');
                  }}
                >
                  Semesters
                </Button>,
                <Button 
                  type="link" 
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEditCourse(course)}
                >
                  Edit
                </Button>,
                <Button 
                  type="link" 
                  size="small"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => confirm({
                    title: 'Delete Course',
                    icon: <ExclamationCircleOutlined />,
                    content: `Are you sure you want to delete "${course.name}"?`,
                    okText: 'Delete',
                    okType: 'danger',
                    onOk: () => handleDelete(course.id, course.name),
                  })}
                >
                  Delete
                </Button>,
              ]}
            >
              <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                {course.description}
              </Text>
              <Divider style={{ margin: '12px 0' }} />
              <Space>
                <Tag color="blue">{sem.length} Semesters</Tag>
                <Tag color="purple">{Math.ceil(sem.length / 2)} Years</Tag>
              </Space>
            </Card>
          </Col>
        );
      })}
    </Row>
  );

  /* ===================== LIST VIEW ===================== */
  if (view === 'list') {
    return (
      <ConfigProvider theme={darkTheme}>
        <div style={{ padding: 24, minHeight: '100vh', backgroundColor: '#000000' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Header 
              title="🎓 Course Management" 
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingCourse(null);
                    form.resetFields();
                    setView('form');
                  }}
                >
                  Add New Course
                </Button>
              }
            />

            <Space wrap>
              <Input.Search
                placeholder="Search courses by name or description"
                allowClear
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 300 }}
              />
            </Space>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 48 }}>
                <Spin size="large" />
              </div>
            ) : filteredCourses.length > 0 ? (
              <CourseGrid />
            ) : (
              <Card>
                <Text type="secondary">
                  {search 
                    ? `No courses found matching "${search}"` 
                    : 'No courses available. Add your first course to get started.'
                  }
                </Text>
              </Card>
            )}
          </Space>
        </div>
      </ConfigProvider>
    );
  }

  /* ===================== SEMESTER VIEW ===================== */
  if (view === 'semester' && selectedCourse) {
    const semesterData = getCourseSemesters(selectedCourse.id).map((s) => ({
      key: s.id,
      semester: s.semester_number,
      description: s.description,
    }));

    return (
      <ConfigProvider theme={darkTheme}>
        <div style={{ padding: 24, minHeight: '100vh', backgroundColor: '#000000' }}>
          <Header 
            title={`📚 ${selectedCourse.name} - Semesters`} 
            onBack={() => setView('list')} 
          />

          <Card>
            <Table
              pagination={false}
              dataSource={semesterData}
              columns={[
                { 
                  title: 'Semester', 
                  dataIndex: 'semester',
                  sorter: (a, b) => a.semester - b.semester,
                  width: 120,
                },
                { 
                  title: 'Description', 
                  dataIndex: 'description',
                  render: (text: string) => text || <Text type="secondary">No description</Text>
                },
              ]}
              locale={{
                emptyText: 'No semesters found for this course'
              }}
            />
          </Card>
        </div>
      </ConfigProvider>
    );
  }

  /* ===================== SEMESTER MANAGEMENT UI ===================== */
  const SemesterManagement = () => (
    <div style={{ marginTop: 24 }}>
      <Divider>📅 Years & Semesters</Divider>
      
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Add semesters/years for this course. Use quick templates or customize manually.
      </Text>

      {/* Quick Templates */}
      <Space wrap style={{ marginBottom: 16 }}>
        <Button size="small" onClick={() => generateSemesterTemplate(1)}>
          1 Year (2 Sem)
        </Button>
        <Button size="small" onClick={() => generateSemesterTemplate(2)}>
          2 Years (4 Sem)
        </Button>
        <Button size="small" onClick={() => generateSemesterTemplate(3)}>
          3 Years (6 Sem)
        </Button>
        <Button size="small" onClick={() => generateSemesterTemplate(4)}>
          4 Years (8 Sem)
        </Button>
      </Space>

      {/* Semester List */}
      <div style={{ marginBottom: 16 }}>
        {semestersForCourse.map((semester, index) => (
          <Card 
            size="small" 
            key={index} 
            style={{ marginBottom: 8 }}
            actions={[
              <Button 
                type="text" 
                icon={<DeleteOutlined />} 
                danger 
                size="small"
                onClick={() => handleRemoveSemester(index)}
              />
            ]}
          >
            <Row gutter={16} align="middle">
              <Col span={6}>
                <Form.Item 
                  label="Sem #" 
                  style={{ marginBottom: 0 }}
                  initialValue={semester.semester_number}
                >
                  <Input
                    type="number"
                    min={1}
                    value={semester.semester_number}
                    onChange={(e) => handleSemesterChange(index, 'semester_number', parseInt(e.target.value) || 1)}
                  />
                </Form.Item>
              </Col>
              <Col span={18}>
                <Form.Item 
                  label="Description" 
                  style={{ marginBottom: 0 }}
                  initialValue={semester.description}
                >
                  <Input
                    value={semester.description}
                    onChange={(e) => handleSemesterChange(index, 'description', e.target.value)}
                    placeholder="e.g., 1st Year 1st Semester"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        ))}
      </div>

      <Button 
        type="dashed" 
        onClick={handleAddSemester}
        icon={<PlusOutlined />}
        style={{ width: '100%', marginBottom: 16 }}
      >
        Add Semester
      </Button>

      {/* Summary */}
      <Card size="small" style={{ backgroundColor: '#f0f5ff' }}>
        <Text strong>
          📊 Total: {semestersForCourse.length} semesters ({Math.ceil(semestersForCourse.length / 2)} years)
        </Text>
      </Card>
    </div>
  );

  /* ===================== FORM VIEW ===================== */
  return (
    <ConfigProvider theme={darkTheme}>
      <div style={{ padding: 24, minHeight: '100vh', backgroundColor: '#000000' }}>
        <Header 
          title={editingCourse ? '✏️ Edit Course' : '➕ Add New Course'} 
          onBack={() => setView('list')} 
        />

        <Card style={{ maxWidth: 700 }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="Course Name"
              rules={[{ required: true, message: 'Please enter course name' }]}
            >
              <Input placeholder="Enter course name" />
            </Form.Item>

            <Form.Item 
              name="description" 
              label="Description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <Input.TextArea 
                rows={3} 
                placeholder="Enter course description" 
              />
            </Form.Item>

            <SemesterManagement />

            <Divider />

            <Space>
              <Button onClick={() => {
                setView('list');
                setSemestersForCourse([
                  { semester_number: 1, description: '1st Year 1st Semester' },
                  { semester_number: 2, description: '1st Year 2nd Semester' }
                ]);
              }}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
              >
                {editingCourse ? 'Update Course' : 'Create Course'}
              </Button>
            </Space>
          </Form>
        </Card>
      </div>
    </ConfigProvider>
  );
}