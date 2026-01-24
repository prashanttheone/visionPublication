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
  Select,
  InputNumber,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  BookOutlined,
  ExclamationCircleOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { confirm } = Modal;

type PeriodType = 'SEMESTER' | 'YEAR' | 'BOTH';

interface Course {
  id?: number;
  name: string;
  description: string;
  period_type?: PeriodType;
  total_years?: number;
  total_semesters?: number;
  is_active?: boolean;
}

interface AcademicPeriod {
  id?: number;
  course_id?: number;
  period_number: number;
  period_type?: 'SEMESTER' | 'YEAR';
  label?: string;
  description: string;
}

const DEFAULT_COURSES = [
  { name: 'BSC Nursing', description: 'Bachelor of Science in Nursing - 4 Year Program', period_type: 'SEMESTER' as PeriodType, total_semesters: 8 },
  { name: 'GNM', description: 'General Nursing and Midwifery - 3 Year Program', period_type: 'YEAR' as PeriodType, total_years: 3 },
  { name: 'Post Basic BSC Nursing', description: 'Post Basic BSC Nursing - 2 Year Program', period_type: 'YEAR' as PeriodType, total_years: 2 },
];

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
    Card: { colorBgContainer: '#262626', colorBorder: '#434343' },
    Button: { colorBgContainer: '#262626', colorBorder: '#434343' },
    Input: { colorBgContainer: '#262626', colorBorder: '#434343', colorText: 'rgba(255, 255, 255, 0.85)', colorTextPlaceholder: 'rgba(255, 255, 255, 0.45)' },
    Table: { colorBgContainer: '#262626', colorBorder: '#434343', headerBg: '#1d1d1d', rowHoverBg: '#303030' },
  },
};

export default function ManageCourse() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [view, setView] = useState<'list' | 'form' | 'periods'>('list');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [search, setSearch] = useState('');

  const [selectedPeriodType, setSelectedPeriodType] = useState<PeriodType>('SEMESTER');
  const [totalYears, setTotalYears] = useState<number>(1);
  const [totalSemesters, setTotalSemesters] = useState<number>(2);
  const [periodsForCourse, setPeriodsForCourse] = useState<AcademicPeriod[]>([]);

  const [form] = Form.useForm<Course>();

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/course?includePeriods=true');
      const data = await res.json();
      if (data.success) {
        setCourses(data.data || []);
        const all: AcademicPeriod[] = [];
        data.data?.forEach((c: any) => c.academic_periods && all.push(...c.academic_periods));
        setAcademicPeriods(all);
      } else {
        message.error(data.error || 'Failed to load courses');
      }
    } catch (error) {
      message.error('Error loading courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const getCoursePeriods = useCallback(
    (courseId?: number) => academicPeriods.filter((p) => p.course_id === courseId),
    [academicPeriods]
  );

  const filteredCourses = useMemo(
    () => courses.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    ),
    [courses, search]
  );

  const getOrdinal = (n: number): string => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const generatePeriods = useCallback((periodType: PeriodType, years: number, semesters: number) => {
    const periods: AcademicPeriod[] = [];

    if (periodType === 'YEAR' || periodType === 'BOTH') {
      for (let i = 1; i <= years; i++) {
        periods.push({
          period_number: i,
          period_type: 'YEAR',
          label: `Year ${i}`,
          description: `${getOrdinal(i)} Year`,
        });
      }
    }

    if (periodType === 'SEMESTER' || periodType === 'BOTH') {
      for (let i = 1; i <= semesters; i++) {
        const year = Math.ceil(i / 2);
        const semInYear = i % 2 === 0 ? '2nd' : '1st';
        periods.push({
          period_number: periodType === 'BOTH' ? years + i : i,
          period_type: 'SEMESTER',
          label: `Semester ${i}`,
          description: `${getOrdinal(year)} Year ${semInYear} Semester`,
        });
      }
    }

    return periods;
  }, []);

  const handlePeriodTypeChange = useCallback((type: PeriodType) => {
    setSelectedPeriodType(type);
    setPeriodsForCourse(generatePeriods(type, totalYears, totalSemesters));
  }, [generatePeriods, totalYears, totalSemesters]);

  const handleYearsChange = useCallback((value: number | null) => {
    const years = value || 1;
    setTotalYears(years);
    setPeriodsForCourse(generatePeriods(selectedPeriodType, years, totalSemesters));
  }, [generatePeriods, selectedPeriodType, totalSemesters]);

  const handleSemestersChange = useCallback((value: number | null) => {
    const semesters = value || 1;
    setTotalSemesters(semesters);
    setPeriodsForCourse(generatePeriods(selectedPeriodType, totalYears, semesters));
  }, [generatePeriods, selectedPeriodType, totalYears]);

  const handlePeriodChange = useCallback((index: number, field: keyof AcademicPeriod, value: any) => {
    setPeriodsForCourse(prev => {
      const newPeriods = [...prev];
      newPeriods[index] = { ...newPeriods[index], [field]: value };
      return newPeriods;
    });
  }, []);

  const removePeriod = useCallback((index: number) => {
    setPeriodsForCourse(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addPeriod = useCallback((type: 'YEAR' | 'SEMESTER') => {
    const existingOfType = periodsForCourse.filter(p => p.period_type === type);
    const nextNum = existingOfType.length + 1;
    setPeriodsForCourse(prev => [...prev, {
      period_number: prev.length + 1,
      period_type: type,
      label: type === 'YEAR' ? `Year ${nextNum}` : `Semester ${nextNum}`,
      description: '',
    }]);
  }, [periodsForCourse]);

  const handleSubmit = async (values: Course) => {
    try {
      if (periodsForCourse.length === 0) {
        message.error('Please add at least one period (year or semester)');
        return;
      }

      setSubmitting(true);
      const url = editingCourse ? `/api/course/${editingCourse.id}` : '/api/course';
      const method = editingCourse ? 'PUT' : 'POST';

      const yearsCount = periodsForCourse.filter(p => p.period_type === 'YEAR').length;
      const semestersCount = periodsForCourse.filter(p => p.period_type === 'SEMESTER').length;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course: {
            ...values,
            period_type: selectedPeriodType,
            total_years: yearsCount,
            total_semesters: semestersCount,
          },
          academic_periods: periodsForCourse,
        }),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.error || 'Operation failed');

      if (editingCourse) {
        setCourses(prev => prev.map(c => c.id === editingCourse.id ? { ...c, ...values } : c));
        setAcademicPeriods(prev => {
          const filtered = prev.filter(p => p.course_id !== editingCourse.id);
          return [...filtered, ...data.data.academic_periods];
        });
        message.success(`Course "${values.name}" updated successfully`);
      } else {
        setCourses(prev => [...prev, { ...data.data.course, ...values }]);
        setAcademicPeriods(prev => [...prev, ...data.data.academic_periods]);
        message.success(`Course "${values.name}" created successfully`);
      }

      form.resetFields();
      setSelectedPeriodType('SEMESTER');
      setTotalYears(1);
      setTotalSemesters(2);
      setPeriodsForCourse([]);
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
        setAcademicPeriods(prev => prev.filter(p => p.course_id !== id));
        if (view === 'periods' && selectedCourse?.id === id) {
          setView('list');
          setSelectedCourse(null);
        }
      } else {
        message.error(data.error || 'Failed to delete course');
      }
    } catch {
      message.error('Error deleting course');
    }
  };

  const handleEditCourse = useCallback((course: Course) => {
    setEditingCourse(course);
    form.setFieldsValue(course);
    
    const existingPeriods = academicPeriods.filter(p => p.course_id === course.id);
    setPeriodsForCourse(existingPeriods);

    const hasYears = existingPeriods.some(p => p.period_type === 'YEAR');
    const hasSemesters = existingPeriods.some(p => p.period_type === 'SEMESTER');
    
    if (hasYears && hasSemesters) {
      setSelectedPeriodType('BOTH');
    } else if (hasYears) {
      setSelectedPeriodType('YEAR');
    } else {
      setSelectedPeriodType('SEMESTER');
    }

    setTotalYears(existingPeriods.filter(p => p.period_type === 'YEAR').length || 1);
    setTotalSemesters(existingPeriods.filter(p => p.period_type === 'SEMESTER').length || 2);

    setView('form');
  }, [academicPeriods, form]);

  const Header = ({ title, onBack, extra }: { title: string; onBack?: () => void; extra?: React.ReactNode }) => (
    <div style={{ marginBottom: 24 }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space>
          {onBack && <Button icon={<ArrowLeftOutlined />} onClick={onBack}>Back</Button>}
          <Title level={3} style={{ margin: 0, flex: 1 }}>{title}</Title>
          {extra}
        </Space>
      </Space>
    </div>
  );

  const getPeriodLabel = (course: Course) => {
    const periods = getCoursePeriods(course.id);
    const years = periods.filter(p => p.period_type === 'YEAR').length;
    const semesters = periods.filter(p => p.period_type === 'SEMESTER').length;
    
    const parts = [];
    if (years > 0) parts.push(`${years} Year${years > 1 ? 's' : ''}`);
    if (semesters > 0) parts.push(`${semesters} Sem${semesters > 1 ? 's' : ''}`);
    return parts.join(' & ') || 'No periods';
  };

  const CourseGrid = () => (
    <Row gutter={[16, 16]}>
      {filteredCourses.map((course) => (
        <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
          <Card
            title={course.name}
            loading={loading}
            extra={<BookOutlined />}
            actions={[
              <Button
                key="periods"
                type="link"
                size="small"
                onClick={() => { setSelectedCourse(course); setView('periods'); }}
              >
                View Periods
              </Button>,
              <Button
                key="edit"
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditCourse(course)}
              >
                Edit
              </Button>,
              <Button
                key="delete"
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
            <Tag color="blue">{getPeriodLabel(course)}</Tag>
          </Card>
        </Col>
      ))}
    </Row>
  );

  if (view === 'list') {
    return (
      <ConfigProvider theme={darkTheme}>
        <div style={{ padding: 24, minHeight: '100vh', backgroundColor: '#000000' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Header
              title="Course Management"
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingCourse(null);
                    form.resetFields();
                    setSelectedPeriodType('SEMESTER');
                    setTotalYears(1);
                    setTotalSemesters(2);
                    setPeriodsForCourse([]);
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
              <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>
            ) : filteredCourses.length > 0 ? (
              <CourseGrid />
            ) : (
              <Card>
                <Text type="secondary">
                  {search ? `No courses found matching "${search}"` : 'No courses available. Add your first course to get started.'}
                </Text>
              </Card>
            )}
          </Space>
        </div>
      </ConfigProvider>
    );
  }

  if (view === 'periods' && selectedCourse) {
    const periods = getCoursePeriods(selectedCourse.id);
    const yearPeriods = periods.filter(p => p.period_type === 'YEAR');
    const semesterPeriods = periods.filter(p => p.period_type === 'SEMESTER');

    return (
      <ConfigProvider theme={darkTheme}>
        <div style={{ padding: 24, minHeight: '100vh', backgroundColor: '#000000' }}>
          <Header title={`${selectedCourse.name} - Academic Periods`} onBack={() => setView('list')} />

          {yearPeriods.length > 0 && (
            <Card title="Years" style={{ marginBottom: 16 }}>
              <Table
                pagination={false}
                dataSource={yearPeriods.map(p => ({ key: p.id, ...p }))}
                columns={[
                  { title: 'Year', dataIndex: 'label', width: 150 },
                  { title: 'Description', dataIndex: 'description', render: (text: string) => text || <Text type="secondary">No description</Text> },
                ]}
              />
            </Card>
          )}

          {semesterPeriods.length > 0 && (
            <Card title="Semesters">
              <Table
                pagination={false}
                dataSource={semesterPeriods.map(p => ({ key: p.id, ...p }))}
                columns={[
                  { title: 'Semester', dataIndex: 'label', width: 150 },
                  { title: 'Description', dataIndex: 'description', render: (text: string) => text || <Text type="secondary">No description</Text> },
                ]}
              />
            </Card>
          )}

          {yearPeriods.length === 0 && semesterPeriods.length === 0 && (
            <Card><Text type="secondary">No periods found for this course</Text></Card>
          )}
        </div>
      </ConfigProvider>
    );
  }

  const PeriodManagement = () => {
    const yearPeriods = periodsForCourse.filter(p => p.period_type === 'YEAR');
    const semesterPeriods = periodsForCourse.filter(p => p.period_type === 'SEMESTER');

    return (
      <div style={{ marginTop: 24 }}>
        <Divider>Academic Periods</Divider>

        {(selectedPeriodType === 'YEAR' || selectedPeriodType === 'BOTH') && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Space style={{ marginBottom: 12 }}>
                <Text strong>Years</Text>
                <Button size="small" icon={<PlusOutlined />} onClick={() => addPeriod('YEAR')}>Add Year</Button>
              </Space>
              {yearPeriods.map((period, idx) => {
                const globalIdx = periodsForCourse.findIndex(p => p === period);
                return (
                  <Card size="small" key={globalIdx} style={{ marginBottom: 8 }}>
                    <Row gutter={16} align="middle">
                      <Col span={5}>
                        <Input
                          value={period.label}
                          onChange={(e) => handlePeriodChange(globalIdx, 'label', e.target.value)}
                          placeholder="Year 1"
                        />
                      </Col>
                      <Col span={16}>
                        <Input
                          value={period.description}
                          onChange={(e) => handlePeriodChange(globalIdx, 'description', e.target.value)}
                          placeholder="Description"
                        />
                      </Col>
                      <Col span={3}>
                        <Button icon={<MinusCircleOutlined />} danger size="small" onClick={() => removePeriod(globalIdx)} />
                      </Col>
                    </Row>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {(selectedPeriodType === 'SEMESTER' || selectedPeriodType === 'BOTH') && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Space style={{ marginBottom: 12 }}>
                <Text strong>Semesters</Text>
                <Button size="small" icon={<PlusOutlined />} onClick={() => addPeriod('SEMESTER')}>Add Semester</Button>
              </Space>
              {semesterPeriods.map((period, idx) => {
                const globalIdx = periodsForCourse.findIndex(p => p === period);
                return (
                  <Card size="small" key={globalIdx} style={{ marginBottom: 8 }}>
                    <Row gutter={16} align="middle">
                      <Col span={5}>
                        <Input
                          value={period.label}
                          onChange={(e) => handlePeriodChange(globalIdx, 'label', e.target.value)}
                          placeholder="Semester 1"
                        />
                      </Col>
                      <Col span={16}>
                        <Input
                          value={period.description}
                          onChange={(e) => handlePeriodChange(globalIdx, 'description', e.target.value)}
                          placeholder="Description"
                        />
                      </Col>
                      <Col span={3}>
                        <Button icon={<MinusCircleOutlined />} danger size="small" onClick={() => removePeriod(globalIdx)} />
                      </Col>
                    </Row>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {periodsForCourse.length > 0 && (
          <Card size="small" style={{ backgroundColor: '#1d3557', border: 'none' }}>
            <Text strong style={{ color: '#a8dadc' }}>
              Total: {yearPeriods.length > 0 ? `${yearPeriods.length} Year${yearPeriods.length > 1 ? 's' : ''}` : ''}
              {yearPeriods.length > 0 && semesterPeriods.length > 0 ? ' & ' : ''}
              {semesterPeriods.length > 0 ? `${semesterPeriods.length} Semester${semesterPeriods.length > 1 ? 's' : ''}` : ''}
            </Text>
          </Card>
        )}
      </div>
    );
  };

  return (
    <ConfigProvider theme={darkTheme}>
      <div style={{ padding: 24, minHeight: '100vh', backgroundColor: '#000000' }}>
        <Header title={editingCourse ? 'Edit Course' : 'Add New Course'} onBack={() => setView('list')} />

        <Card style={{ maxWidth: 800 }}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="name"
              label="Course Name"
              rules={[{ required: true, message: 'Please enter course name' }]}
            >
              <Input placeholder="e.g., BSC Nursing, GNM, Post Basic BSC Nursing" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <Input.TextArea rows={3} placeholder="Enter course description" />
            </Form.Item>

            <Form.Item label="Period Type">
              <Select
                value={selectedPeriodType}
                onChange={handlePeriodTypeChange}
                options={[
                  { value: 'SEMESTER', label: 'Semesters Only' },
                  { value: 'YEAR', label: 'Years Only' },
                  { value: 'BOTH', label: 'Both Years & Semesters' },
                ]}
              />
            </Form.Item>

            <Row gutter={16}>
              {(selectedPeriodType === 'YEAR' || selectedPeriodType === 'BOTH') && (
                <Col span={12}>
                  <Form.Item label="Number of Years">
                    <InputNumber min={1} max={10} value={totalYears} onChange={handleYearsChange} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              )}
              {(selectedPeriodType === 'SEMESTER' || selectedPeriodType === 'BOTH') && (
                <Col span={12}>
                  <Form.Item label="Number of Semesters">
                    <InputNumber min={1} max={16} value={totalSemesters} onChange={handleSemestersChange} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              )}
            </Row>

            <Button
              type="dashed"
              block
              style={{ marginBottom: 16 }}
              onClick={() => setPeriodsForCourse(generatePeriods(selectedPeriodType, totalYears, totalSemesters))}
            >
              Generate Periods
            </Button>

            <PeriodManagement />

            <Divider />

            <Space>
              <Button onClick={() => { setView('list'); setPeriodsForCourse([]); }}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submitting} disabled={periodsForCourse.length === 0}>
                {editingCourse ? 'Update Course' : 'Create Course'}
              </Button>
            </Space>
          </Form>
        </Card>
      </div>
    </ConfigProvider>
  );
}
