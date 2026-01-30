'use client';

import { Row, Col, Input, Select, Button, Space, Tag } from 'antd';
import { SearchOutlined, PlusOutlined, ClearOutlined } from '@ant-design/icons';
import { Course, AcademicPeriod } from './types';

const { Option } = Select;

interface BookFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterCourse: number | null;
  setFilterCourse: (id: number | null) => void;
  filterPeriod: number | null;
  setFilterPeriod: (id: number | null) => void;
  courses: Course[];
  getPeriodsForCourse: (courseId: number) => AcademicPeriod[];
  onAddBook: () => void;
}

export function BookFilters({
  searchTerm,
  setSearchTerm,
  filterCourse,
  setFilterCourse,
  filterPeriod,
  setFilterPeriod,
  courses,
  getPeriodsForCourse,
  onAddBook,
}: BookFiltersProps) {
  const selectedCourse = courses.find(c => c.id === filterCourse);
  const periods = filterCourse ? getPeriodsForCourse(filterCourse) : [];
  
  // Determine if the selected course uses years or semesters
  const isYearly = periods.some(p => p.period_type === 'YEAR');
  const periodLabel = isYearly ? 'Year' : 'Semester';

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCourse(null);
    setFilterPeriod(null);
  };

  return (
    <Row gutter={[16, 16]} align="middle">
      <Col xs={24} sm={12} md={8}>
        <Input
          placeholder="Search by name, author, or ISBN..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />
      </Col>
      <Col xs={24} sm={12} md={5}>
        <Select
          placeholder="Filter by Course (ANM, GNM, etc.)"
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
      <Col xs={24} sm={12} md={5}>
        <Select
          placeholder={`Filter by ${periodLabel}`}
          style={{ width: '100%' }}
          value={filterPeriod}
          onChange={setFilterPeriod}
          allowClear
          disabled={!filterCourse}
        >
          {periods.map(period => (
            <Option key={period.id} value={period.id}>
              {period.label || `${period.period_type} ${period.period_number}`}
              <Tag style={{ marginLeft: 8 }} color={period.period_type === 'YEAR' ? 'blue' : 'green'}>
                {period.period_type}
              </Tag>
            </Option>
          ))}
        </Select>
      </Col>
      <Col xs={24} sm={24} md={6}>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          {(searchTerm || filterCourse || filterPeriod) && (
            <Button 
              icon={<ClearOutlined />} 
              onClick={clearFilters}
              title="Clear all filters"
            />
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAddBook}
          >
            Add Book
          </Button>
        </Space>
      </Col>
    </Row>
  );
}
