'use client';

import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Space,
  Card,
  Row,
  Col,
  Tag,
  Button,
  Divider,
  Checkbox,
  Alert,
  Typography
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import CloudinaryImageUpload from '@/component/imageUpload/CloudinaryImageUpload';
import { Book, Course, AcademicPeriod, BookCourseMap } from './types';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface BookFormProps {
  form: any;
  courses: Course[];
  academicPeriods: AcademicPeriod[];
  editingId: number | null;
  uploadedImageUrl: string;
  setUploadedImageUrl: (url: string) => void;
  courseMapping: BookCourseMap[];
  setCourseMapping: (mapping: BookCourseMap[]) => void;
  onSubmit: (values: Book) => void;
  onCancel: () => void;
  isLoading: boolean;
  getPeriodsForCourse: (courseId: number) => AcademicPeriod[];
  getDefaultCourseMapping: () => BookCourseMap[];
}

export function BookForm({
  form,
  courses,
  academicPeriods,
  editingId,
  uploadedImageUrl,
  setUploadedImageUrl,
  courseMapping,
  setCourseMapping,
  onSubmit,
  onCancel,
  isLoading,
  getPeriodsForCourse,
  getDefaultCourseMapping,
}: BookFormProps) {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
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
                      {period.period_type && (
                        <Tag style={{ marginLeft: 8 }} color={period.period_type === 'YEAR' ? 'blue' : 'green'}>
                          {period.period_type}
                        </Tag>
                      )}
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
                    onClick={() => setCourseMapping(courseMapping.filter((_, i) => i !== index))}
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
            setCourseMapping([...courseMapping, defaultMapping[0]]);
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
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {editingId ? 'Update Book' : 'Create Book'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
