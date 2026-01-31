'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Select, 
  Space, 
  Typography, 
  Card, 
  Tag, 
  Modal, 
  Form, 
  message, 
  Popconfirm, 
  Empty, 
  Divider,
  Breadcrumb,
  Row,
  Col,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  BookOutlined, 
  FileTextOutlined, 
  LinkOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  UploadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Course {
  id: number;
  name: string;
  description: string;
}

interface AcademicPeriod {
  id: number;
  course_id: number;
  period_number: number;
  description: string;
  label?: string;
}

interface EResourceChapter {
  id?: number;
  eresource_book_id?: number;
  chapter_number: number;
  chapter_name: string;
  doc_link?: string;
  file_key?: string; // For local file storage
}

interface EResourceBook {
  id?: number;
  course_id: number;
  academic_period_id: number;
  book_name: string;
  description?: string;
  course_name?: string;
  semester_name?: string;
  period_label?: string;
  chapters?: EResourceChapter[];
}

export default function ManageEresources() {
  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [eresources, setEresources] = useState<EResourceBook[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const [activeView, setActiveView] = useState<'list' | 'form'>('list');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  
  const [form] = Form.useForm();
  
    // Handle file upload for chapters
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, fieldName: number) => {
      const file = event.target.files?.[0];
      if (!file) return;
      
      // Check file size (limit: 2GB for local storage)
      const MAX_SIZE = 2 * 1024 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        message.error('File size exceeds the 2GB limit.');
        return;
      }
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'application/epub+zip',
        'application/octet-stream'
      ];
      
      if (!allowedTypes.includes(file.type) && !file.name.endsWith('.pdf')) {
        message.error('File type not allowed. Please upload PDF, DOC, PPT, XLS, TXT, or EPUB files.');
        return;
      }
      
      setIsLoading(true);
      const hide = message.loading('Uploading file to server...', 0);
      
      try {
        // Create FormData to send file to local upload API
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'eresources');
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }
        
        const result = await response.json();
        
        // Update form field with the local URL
        form.setFieldValue(['chapters', fieldName, 'doc_link'], result.url);
        
        message.success('File uploaded successfully!');
      } catch (error) {
        console.error('Upload error:', error);
        message.error('File upload failed: ' + (error as Error).message);
      } finally {
        hide();
        setIsLoading(false);
      }
    };

  // Fetch courses and academic periods
  const fetchCoursesAndPeriods = useCallback(async () => {
    try {
      const response = await fetch('/api/course?includePeriods=true');
      const result = await response.json();
      if (result.success) {
        setCourses(result.data || []);
        const allPeriods: AcademicPeriod[] = [];
        result.data?.forEach((course: any) => {
          if (course.academic_periods) {
            allPeriods.push(...course.academic_periods);
          }
        });
        setAcademicPeriods(allPeriods);
        
        if (result.data && result.data.length > 0 && !selectedCourseId) {
          setSelectedCourseId(result.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      message.error('Failed to fetch courses');
    }
  }, [selectedCourseId]);

  // Fetch e-resources
  const fetchEresources = useCallback(async () => {
    try {
      const response = await fetch('/api/eresource?includeChapters=true');
      const result = await response.json();
      if (result.success) {
        setEresources(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching e-resources:', error);
      message.error('Failed to fetch e-resources');
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsInitialLoading(true);
      await Promise.all([fetchCoursesAndPeriods(), fetchEresources()]);
      setIsInitialLoading(false);
    };
    init();
  }, []);

  // Filter periods and books
  const currentPeriods = selectedCourseId ? academicPeriods.filter(p => p.course_id === selectedCourseId) : [];

  // Reset form
  const handleResetForm = useCallback(() => {
    form.resetFields();
    form.setFieldsValue({
      chapters: [{ chapter_number: 1, chapter_name: 'Chapter 1', doc_link: '' }]
    });
    setIsEditing(false);
    setEditingId(null);
  }, [form]);

  // Open form
  const handleOpenNew = useCallback(() => {
    handleResetForm();
    if (selectedCourseId) {
      const firstPeriod = academicPeriods.find(p => p.course_id === selectedCourseId);
      form.setFieldsValue({ 
        course_id: selectedCourseId,
        academic_period_id: firstPeriod?.id
      });
    }
    setActiveView('form');
  }, [form, selectedCourseId, academicPeriods, handleResetForm]);

  // Handle Edit
  const handleEdit = (record: EResourceBook) => {
    setEditingId(record.id!);
    setIsEditing(true);
    form.setFieldsValue({
      course_id: record.course_id,
      academic_period_id: record.academic_period_id,
      book_name: record.book_name,
      description: record.description,
      chapters: record.chapters?.length ? record.chapters : [{ chapter_number: 1, chapter_name: 'Chapter 1', doc_link: '' }]
    });
    setActiveView('form');
  };

  // Handle Submit
  const onFinish = async (values: any) => {
    setIsLoading(true);
    try {
      const endpoint = isEditing ? `/api/eresource/${editingId}` : '/api/eresource';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book: {
            course_id: values.course_id,
            academic_period_id: values.academic_period_id,
            book_name: values.book_name,
            description: values.description
          },
          chapters: values.chapters
        })
      });
      
      const result = await response.json();
      if (result.success) {
        message.success(`E-resource ${isEditing ? 'updated' : 'created'} successfully`);
        await fetchEresources();
        setActiveView('list');
        handleResetForm();
      } else {
        message.error(result.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Submit error:', error);
      message.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/eresource/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        message.success('E-resource deleted successfully');
        await fetchEresources();
      } else {
        message.error(result.error || 'Failed to delete');
      }
    } catch (error) {
      message.error('An error occurred during deletion');
    }
  };

  // Table Columns
  const columns = [
    {
      title: 'Book Name',
      dataIndex: 'book_name',
      key: 'book_name',
      render: (text: string, record: EResourceBook) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: '16px' }}>{text}</Text>
          {record.description && <Text type="secondary" style={{ fontSize: '14px' }}>{record.description}</Text>}
        </Space>
      )
    },
    {
      title: 'Period',
      key: 'period',
      render: (_: any, record: EResourceBook) => (
        <Tag color="purple">{record.period_label || record.semester_name || 'N/A'}</Tag>
      )
    },
    {
      title: 'Chapters',
      key: 'chapters_count',
      render: (_: any, record: EResourceBook) => (
        <Tag icon={<FileTextOutlined />} color="blue">
          {record.chapters?.length || 0} Chapters
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: EResourceBook) => (
        <Space>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined style={{ color: '#1890ff' }} />} 
              onClick={() => handleEdit(record)} 
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this e-resource?"
            onConfirm={() => handleDelete(record.id!)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="text" icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Nested Chapter Table
  const expandedRowRender = (record: EResourceBook) => {
    const chapterColumns = [
      { title: '#', dataIndex: 'chapter_number', key: 'chapter_number', width: 60 },
      { title: 'Chapter Name', dataIndex: 'chapter_name', key: 'chapter_name' },
      { 
        title: 'Link', 
        dataIndex: 'doc_link', 
        key: 'doc_link',
        render: (link: string) => link ? (
          <Button type="link" href={link} target="_blank" icon={<LinkOutlined />}>
            View Doc
          </Button>
        ) : <Tag>No Link</Tag>
      }
    ];

    return (
      <Table 
        columns={chapterColumns} 
        dataSource={record.chapters} 
        pagination={false} 
        size="small" 
        rowKey="id"
        className="nested-chapter-table"
      />
    );
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header Area */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Title level={2} style={{ margin: 0 }}>📚 E-Resources Management</Title>
          <Text type="secondary">Manage digital study materials, books, and chapter links</Text>
        </div>
        {activeView === 'list' && (
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleOpenNew}>
            Add E-Resource
          </Button>
        )}
      </div>

      {activeView === 'list' ? (
        <div className="space-y-6">
          {/* Course Tabs / Selection */}
          <div className="flex gap-2 flex-wrap bg-[#1d1d1d] p-3 rounded-lg border border-[#303030]">
            {courses.map(course => (
              <Button
                key={course.id}
                type={selectedCourseId === course.id ? 'primary' : 'default'}
                onClick={() => setSelectedCourseId(course.id)}
                shape="round"
              >
                {course.name}
              </Button>
            ))}
          </div>

          {/* Main Content */}
          {isInitialLoading ? (
            <Card loading={true} />
          ) : (
            <div className="space-y-8">
              {currentPeriods.length > 0 ? (
                currentPeriods.map(period => {
                  const periodBooks = eresources.filter(e => e.academic_period_id === period.id);
                  return (
                    <Card 
                      key={period.id} 
                      title={
                        <Space>
                          <BookOutlined style={{ color: '#722ed1' }} />
                          <span>{period.label} <Text type="secondary">({period.description})</Text></span>
                        </Space>
                      }
                        styles={{ header: { backgroundColor: '#1d1d1d' } }}
                      className="shadow-sm overflow-hidden"
                    >
                      <Table
                        columns={columns}
                        dataSource={periodBooks}
                        rowKey="id"
                        pagination={false}
                        expandable={{
                          expandedRowRender,
                          expandedRowKeys,
                          onExpand: (expanded, record) => {
                            setExpandedRowKeys(expanded ? [...expandedRowKeys, record.id!] : expandedRowKeys.filter(k => k !== record.id));
                          },
                          columnTitle: 'Chapters'
                        }}
                        locale={{ emptyText: <Empty description="No e-resources for this period" /> }}
                      />
                    </Card>
                  );
                })
              ) : (
                <Empty description="No periods found for this course" />
              )}
            </div>
          )}
        </div>
      ) : (
        /* Form View */
        <Card 
          className="shadow-lg max-w-4xl mx-auto"
          title={
            <Space>
              <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => setActiveView('list')} />
              <span>{isEditing ? '✏️ Edit E-Resource' : '➕ Add New E-Resource'}</span>
            </Space>
          }
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              chapters: [{ chapter_number: 1, chapter_name: 'Chapter 1', doc_link: '' }]
            }}
          >
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item 
                  name="course_id" 
                  label="Course" 
                  rules={[{ required: true, message: 'Please select a course' }]}
                >
                  <Select 
                    placeholder="Select Course" 
                    onChange={(val) => {
                      const firstPeriod = academicPeriods.find(p => p.course_id === val);
                      form.setFieldValue('academic_period_id', firstPeriod?.id);
                    }}
                  >
                    {courses.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="academic_period_id" 
                  label="Academic Period" 
                  rules={[{ required: true, message: 'Please select a period' }]}
                >
                  <Select placeholder="Select Period">
                    {academicPeriods
                      .filter(p => p.course_id === form.getFieldValue('course_id'))
                      .map(p => <Select.Option key={p.id} value={p.id}>{p.label} ({p.description})</Select.Option>)
                    }
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item 
              name="book_name" 
              label="Book Name" 
              rules={[{ required: true, message: 'Please enter book name' }]}
            >
              <Input placeholder="e.g., Anatomy Textbook, Nursing Fundamentals" size="large" />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <TextArea rows={3} placeholder="Optional description for this e-resource book" />
            </Form.Item>

            <Divider><FileTextOutlined /> Chapters & Links</Divider>

            <Form.List name="chapters">
              {(fields, { add, remove }) => (
                <div className="space-y-4">
                    {fields.map(({ key, name, ...restField }) => (
                      <Card key={key} size="small" className="bg-[#1d1d1d] border-[#303030]">
                      <Row gutter={12} align="middle">
                        <Col span={3}>
                          <Form.Item
                            {...restField}
                            name={[name, 'chapter_number']}
                            label="No."
                            rules={[{ required: true }]}
                          >
                            <Input type="number" min={1} />
                          </Form.Item>
                        </Col>
                        <Col span={9}>
                          <Form.Item
                            {...restField}
                            name={[name, 'chapter_name']}
                            label="Chapter Name"
                            rules={[{ required: true, message: 'Missing name' }]}
                          >
                            <Input placeholder="Chapter Name" />
                          </Form.Item>
                        </Col>
                          <Col span={10}>
                            <Form.Item
                              {...restField}
                              name={[name, 'doc_link']}
                              label="Document URL / Path"
                            >
                              <Input placeholder="/assets/eresources/..." prefix={<LinkOutlined />} />
                            </Form.Item>
                          </Col>
                          <Col span={2}>
                            <Form.Item label="Upload">
                              <Button 
                                icon={<UploadOutlined />} 
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.epub';
                                  input.onchange = (e) => handleFileUpload(e as unknown as React.ChangeEvent<HTMLInputElement>, name);
                                  input.click();
                                }}
                                className="w-full"
                              />
                            </Form.Item>
                          </Col>
                        <Col span={2}>
                          <Button 
                            danger 
                            type="text" 
                            icon={<DeleteOutlined />} 
                            onClick={() => remove(name)}
                            className="mt-6"
                          />
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Button type="dashed" onClick={() => add({ chapter_number: fields.length + 1, chapter_name: `Chapter ${fields.length + 1}` })} block icon={<PlusOutlined />}>
                    Add Chapter
                  </Button>
                </div>
              )}
            </Form.List>

            <div className="mt-8 flex justify-end gap-3">
              <Button onClick={() => setActiveView('list')} size="large">Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isLoading} size="large">
                {isEditing ? 'Save Changes' : 'Create E-Resource'}
              </Button>
            </div>
          </Form>
        </Card>
      )}

        <style jsx global>{`
          .nested-chapter-table .ant-table-thead > tr > th {
            background-color: #262626 !important;
          }
          .ant-table-expanded-row > .ant-table-cell {
            background-color: #141414 !important;
          }
        `}</style>
    </div>
  );
}
