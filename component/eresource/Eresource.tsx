'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Typography,
  Input,
  Select,
  Button,
  Card,
  Badge,
  Row,
  Col,
  Space,
  Modal,
  Empty,
  Divider,
  Tag,
  Tooltip
} from 'antd';
import {
  SearchOutlined,
  BookOutlined,
  FileTextOutlined,
  EyeOutlined,
  CaretRightOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  LinkOutlined
} from '@ant-design/icons';
import DocumentViewer from './DocumentViewer';

const { Title, Text, Paragraph } = Typography;

interface Course {
  id: number;
  name: string;
  description?: string;
  academic_periods?: AcademicPeriod[];
}

interface AcademicPeriod {
  id: number;
  course_id: number;
  period_number: number;
  description: string;
  label?: string;
  period_type?: 'SEMESTER' | 'YEAR';
}

interface EResourceChapter {
  id: number;
  eresource_book_id: number;
  chapter_number: number;
  chapter_name: string;
  doc_link?: string;
}

interface EResourceBook {
  id: number;
  course_id: number;
  academic_period_id: number;
  semester_id?: number;
  book_name: string;
  description?: string;
  course_name: string;
  semester_name: string;
  chapters: EResourceChapter[];
}

export default function Eresource() {
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [eresources, setEresources] = useState<EResourceBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
  const [expandedBookId, setExpandedBookId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'chapters'>('name');
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState('');

  // Fetch courses and periods
  const fetchCourses = useCallback(async () => {
    try {
      const response = await fetch('/api/course?includePeriods=true');
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
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchCourses(), fetchEresources()]);
      setIsLoading(false);
    };
    init();
  }, [fetchCourses, fetchEresources]);

  // Get periods for selected course
  const availablePeriods = useMemo(() => {
    if (!selectedCourseId) return [];
    return academicPeriods.filter(p => p.course_id === selectedCourseId);
  }, [selectedCourseId, academicPeriods]);

  // Filter e-resources
  const filteredEresources = useMemo(() => {
    let filtered = [...eresources];

    if (selectedCourseId) {
      filtered = filtered.filter(e => e.course_id === selectedCourseId);
    }

    if (selectedPeriodId) {
      filtered = filtered.filter(e => (e.academic_period_id || e.semester_id) === selectedPeriodId);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        e =>
          e.book_name.toLowerCase().includes(search) ||
          e.course_name.toLowerCase().includes(search) ||
          e.semester_name.toLowerCase().includes(search) ||
          e.chapters.some(ch => ch.chapter_name.toLowerCase().includes(search))
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.book_name.localeCompare(b.book_name);
      } else {
        return b.chapters.length - a.chapters.length;
      }
    });

    return filtered;
  }, [eresources, selectedCourseId, selectedPeriodId, searchTerm, sortBy]);

  const handleViewDoc = (url: string) => {
    if (url) {
      setCurrentPdfUrl(url);
      setPdfModalVisible(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#001529] py-16 px-4 sm:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge
            count="E-RESOURCES"
            style={{ backgroundColor: '#1890ff', color: '#fff', fontSize: '13px', padding: '0 16px', height: '28px', lineHeight: '28px', borderRadius: '14px', fontWeight: 600, letterSpacing: '0.5px' }}
          />
          <Title className="!text-white !text-5xl md:!text-6xl !font-black !mt-6 !mb-4" style={{ letterSpacing: '-0.02em' }}>
            Digital Study <span style={{ color: '#1890ff' }}>Resources</span>
          </Title>
          <Paragraph className="!text-gray-400 !text-lg !max-w-2xl !mx-auto" style={{ lineHeight: '1.8', fontSize: '17px' }}>
            Access comprehensive e-books and chapter resources for all nursing courses.
            Select your course to get started.
          </Paragraph>
        </div>

        {/* Filters Card */}
        <Card className="!bg-[#0a0a0a] !border-[#1f1f1f] !mb-10 !rounded-2xl shadow-2xl" styles={{ body: { padding: '28px' } }}>
          <Row gutter={[20, 20]} align="bottom">
            <Col xs={24} md={8}>
              <Text className="!text-gray-400 !text-xs !font-bold !uppercase !mb-3 !block" style={{ letterSpacing: '1.2px', fontSize: '11px' }}>
                Select Course
              </Text>
              <Select
                placeholder="All Courses"
                className="w-full !h-12 custom-select"
                onChange={(val) => {
                  setSelectedCourseId(val);
                  setSelectedPeriodId(null);
                }}
                value={selectedCourseId}
                allowClear
              >
                {courses.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
              </Select>
            </Col>
            <Col xs={24} md={8}>
              <Text className="!text-gray-400 !text-xs !font-bold !uppercase !mb-3 !block" style={{ letterSpacing: '1.2px', fontSize: '11px' }}>
                Year / Semester
              </Text>
              <Select
                placeholder="All Periods"
                className="w-full !h-12 custom-select"
                disabled={!selectedCourseId || availablePeriods.length === 0}
                onChange={setSelectedPeriodId}
                value={selectedPeriodId}
                allowClear
              >
                {availablePeriods.map(p => (
                  <Select.Option key={p.id} value={p.id}>{p.label} ({p.description})</Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} md={8}>
              <Text className="!text-gray-400 !text-xs !font-bold !uppercase !mb-3 !block" style={{ letterSpacing: '1.2px', fontSize: '11px' }}>
                Sort By
              </Text>
              <Select
                className="w-full !h-12 custom-select"
                onChange={setSortBy}
                value={sortBy}
              >
                <Select.Option value="name">Book Name (A-Z)</Select.Option>
                <Select.Option value="chapters">Most Chapters</Select.Option>
              </Select>
            </Col>
            <Col span={24}>
              <Input
                placeholder="Search for books, topics, or chapters..."
                prefix={<SearchOutlined className="text-gray-500 mr-2" style={{ fontSize: '16px' }} />}
                className="!h-14 !bg-[#141414] !border-[#1f1f1f] !text-white !rounded-xl custom-input"
                style={{ fontSize: '15px' }}
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
              />
            </Col>
          </Row>
        </Card>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-8">
          <Text className="!text-gray-500" style={{ fontSize: '15px', fontWeight: 500 }}>
            Showing <span className="text-[#1890ff] font-bold" style={{ fontSize: '16px' }}>{filteredEresources.length}</span> study resources
          </Text>
        </div>

        {/* E-Resources Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Card key={i} loading className="!bg-[#0a0a0a] !border-[#1f1f1f] !h-64 !rounded-2xl" />)}
          </div>
        ) : filteredEresources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEresources.map((book) => (
              <Card
                key={book.id}
                className="!bg-[#0a0a0a] !border-[#1f1f1f] !rounded-2xl !overflow-hidden hover:!border-[#1890ff]/50 transition-all duration-300 group shadow-xl"
                styles={{ body: { padding: '28px' } }}
              >
                <div className="flex items-start gap-5 mb-7">
                  <div className="bg-[#1890ff]/10 p-4 rounded-xl group-hover:bg-[#1890ff]/20 transition-colors">
                    <BookOutlined className="text-[#1890ff]" style={{ fontSize: '28px' }} />
                  </div>
                  <div className="flex-1">
                    <Title level={4} className="!text-white !m-0 !mb-2 !line-clamp-2" style={{ fontSize: '19px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                      {book.book_name}
                    </Title>
                    <Text className="!text-gray-500 !uppercase !font-bold" style={{ fontSize: '11px', letterSpacing: '1.2px' }}>
                      {book.course_name} • {book.semester_name}
                    </Text>
                  </div>
                </div>

                <Paragraph className="!text-gray-400 !mb-7 !line-clamp-2" style={{ fontSize: '15px', lineHeight: '1.75' }}>
                  {book.description || "Comprehensive study materials for this subject."}
                </Paragraph>

                <Divider className="!border-[#1f1f1f] !my-6" />

                <div className="space-y-5">
                  <div
                    className="flex justify-between items-center cursor-pointer group/toggle pb-1"
                    onClick={() => setExpandedBookId(expandedBookId === book.id ? null : book.id)}
                  >
                    <Text className="!text-gray-400 !font-bold !uppercase flex items-center gap-2.5" style={{ fontSize: '12px', letterSpacing: '1.3px' }}>
                      <FileTextOutlined style={{ fontSize: '14px' }} /> {book.chapters.length} Chapters
                    </Text>
                    <Text className="!text-[#1890ff] !font-bold" style={{ fontSize: '13px', letterSpacing: '0.4px' }}>
                      {expandedBookId === book.id ? 'Show Less' : 'Show All'}
                    </Text>
                  </div>

                  <div className={`space-y-3 transition-all duration-300 ${expandedBookId === book.id ? 'max-h-[500px] overflow-y-auto pr-2' : 'max-h-[140px] overflow-hidden'}`}>
                    {book.chapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className="flex justify-between items-center p-4 rounded-xl bg-[#141414] hover:bg-[#1a1a1a] transition-all border border-transparent hover:border-[#1890ff]/30"
                      >
                        <Space className="overflow-hidden flex-1 mr-4" size={12}>
                          <Text className="!text-[#1890ff] !font-bold" style={{ fontSize: '13px', minWidth: '32px' }}>
                            {chapter.chapter_number.toString().padStart(2, '0')}
                          </Text>
                          <Text className="!text-gray-300 !line-clamp-1" style={{ fontSize: '15px', fontWeight: 500 }}>
                            {chapter.chapter_name}
                          </Text>
                        </Space>
                        {chapter.doc_link ? (
                          <Tooltip title="View Document">
                            <Button
                              type="primary"
                              size="middle"
                              icon={<EyeOutlined style={{ fontSize: '14px' }} />}
                              className="!rounded-lg !bg-[#1890ff] hover:!bg-[#40a9ff] !border-none !h-9 !px-5 !flex !items-center !gap-1.5 !my-1.5"
                              style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px' }}
                              onClick={() => handleViewDoc(chapter.doc_link!)}
                            >
                              VIEW
                            </Button>
                          </Tooltip>
                        ) : (
                          <Tag className="!bg-[#1a1a1a] !text-gray-600 !border-none !m-0" style={{ fontSize: '11px', padding: '4px 10px' }}>NO LINK</Tag>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<Text className="text-gray-500">No resources found matching your criteria</Text>}
            className="!py-20"
          />
        )}
      </div>

      {/* Document Viewer Modal */}
      <Modal
        open={pdfModalVisible}
        onCancel={() => setPdfModalVisible(false)}
        footer={null}
        width="95vw"
        centered
        destroyOnClose
        className="document-viewer-modal"
        styles={{
          mask: { backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.8)' },
          header: { backgroundColor: '#000', borderBottom: '1px solid #1f1f1f', padding: '16px 24px' },
          body: { padding: 0 }
        }}
        title={
          <div className="flex items-center gap-3">
            <div className="bg-[#1890ff]/20 p-2.5 rounded-lg">
              <FileTextOutlined className="text-[#1890ff]" style={{ fontSize: '18px' }} />
            </div>
            <Text className="!text-white !font-bold" style={{ fontSize: '18px', letterSpacing: '-0.01em' }}>Document Viewer</Text>
          </div>
        }
      >
        <div style={{ height: '85vh', position: 'relative' }}>
          {currentPdfUrl && (
            <DocumentViewer url={currentPdfUrl} />
          )}
        </div>
      </Modal>

      <style jsx global>{`
        .custom-select .ant-select-selector {
          background-color: #141414 !important;
          border-color: #1f1f1f !important;
          color: white !important;
          border-radius: 12px !important;
        }
        .custom-select .ant-select-arrow {
          color: #1890ff !important;
        }
        .custom-input {
          box-shadow: none !important;
        }
        .custom-input:focus, .custom-input:hover {
          border-color: #1890ff !important;
        }
        .ant-select-dropdown {
          background-color: #0a0a0a !important;
          border: 1px solid #1f1f1f !important;
          border-radius: 12px !important;
        }
        .ant-select-item {
          color: #a6a6a6 !important;
        }
        .ant-select-item-option-selected {
          background-color: #1890ff !important;
          color: white !important;
        }
        .ant-select-item-option-active {
          background-color: #1a1a1a !important;
          color: white !important;
        }
        .document-viewer-modal .ant-modal-close {
          color: #fff !important;
          top: 18px !important;
        }
          .document-viewer-modal .ant-modal-close:hover {
            background-color: rgba(255,255,255,0.1) !important;
          }
          .document-viewer-modal .ant-modal-content {
            background-color: #000 !important;
            border: 1px solid #1f1f1f !important;
            padding: 0 !important;
            border-radius: 16px !important;
            overflow: hidden !important;
          }
        `}</style>
    </div>
  );
}
