'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Typography,
  Card,
  Tag,
  Modal,
  Form,
  message,
  Popconfirm,
  Row,
  Col,
  Switch,
  Image,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PictureOutlined,
  LinkOutlined,
  OrderedListOutlined
} from '@ant-design/icons';
import { authUtils } from '@/lib/auth';
import CloudinaryImageUpload from '@/component/imageUpload/CloudinaryImageUpload';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface HomeSlider {
  id: number;
  title: string;
  description: string;
  image_url: string;
  link_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function HomeSlider() {
  const [sliders, setSliders] = useState<HomeSlider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [form] = Form.useForm();

  const fetchSliders = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = authUtils.getToken();
      const response = await fetch('/api/home/slider', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      const data = await response.json();

      if (data.success) {
        setSliders(data.data || []);
      } else {
        message.error('Failed to fetch sliders');
      }
    } catch (err) {
      console.error('Error fetching sliders:', err);
      message.error('Error loading sliders');
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSliders();
  }, [fetchSliders]);

  const handleOpenModal = (slider?: HomeSlider) => {
    if (slider) {
      setEditingId(slider.id);
      setUploadedImageUrl(slider.image_url);
      form.setFieldsValue({
        ...slider,
        display_order: slider.display_order
      });
    } else {
      setEditingId(null);
      setUploadedImageUrl('');
      form.resetFields();
      form.setFieldsValue({ is_active: true, display_order: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (values: any) => {
    const finalImageUrl = uploadedImageUrl || values.image_url;

    if (!finalImageUrl) {
      message.warning('Please upload or provide an image URL');
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        title: values.title,
        description: values.description || null,
        image_url: finalImageUrl,
        link_url: values.link_url || null,
        display_order: values.display_order || 0,
        is_active: values.is_active,
      };

      const token = authUtils.getToken();
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...payload, id: editingId } : payload;

      const response = await fetch('/api/home/slider', {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (result.success) {
        message.success(`Slider ${editingId ? 'updated' : 'created'} successfully`);
        fetchSliders();
        setIsModalOpen(false);
      } else {
        message.error(result.error || 'Operation failed');
      }
    } catch (err) {
      console.error('Error saving slider:', err);
      message.error('Error saving slider');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = authUtils.getToken();
      const response = await fetch(`/api/home/slider?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const result = await response.json();
      if (result.success) {
        setSliders((prev) => prev.filter((s) => s.id !== id));
        message.success('Slider deleted successfully');
      } else {
        message.error(result.error || 'Failed to delete slider');
      }
    } catch (err) {
      console.error('Error deleting slider:', err);
      message.error('Error deleting slider');
    }
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 100,
      render: (url: string) => (
        <Image
          src={url}
          alt="slider"
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: '4px' }}
          fallback="https://via.placeholder.com/60"
        />
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: HomeSlider) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          {record.description && <Text type="secondary" size="small">{record.description}</Text>}
        </Space>
      ),
    },
    {
      title: 'Link',
      dataIndex: 'link_url',
      key: 'link_url',
      render: (link: string) => link ? (
        <Tag icon={<LinkOutlined />} color="blue">{link}</Tag>
      ) : '-',
    },
    {
      title: 'Order',
      dataIndex: 'display_order',
      key: 'display_order',
      sorter: (a: HomeSlider, b: HomeSlider) => a.display_order - b.display_order,
      render: (order: number) => <Tag icon={<OrderedListOutlined />}>{order}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'gray'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: HomeSlider) => (
        <Space>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined style={{ color: '#1890ff' }} />} 
              onClick={() => handleOpenModal(record)} 
            />
          </Tooltip>
          <Popconfirm
            title="Delete this slider?"
            description="Are you sure you want to delete this slider?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="text" icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} style={{ margin: 0 }}>🎆 Home Sliders Management</Title>
          <Text type="secondary">Manage the carousel images on your homepage</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={() => handleOpenModal()}
        >
          Add Slider
        </Button>
      </div>

      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={sliders}
          rowKey="id"
          loading={isLoading || isInitialLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingId ? '✏️ Edit Slider' : '➕ Add New Slider'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ is_active: true, display_order: 0 }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="title"
                label="Slider Title"
                rules={[{ required: true, message: 'Please enter a title' }]}
              >
                <Input placeholder="e.g., Welcome to Vision Publication" size="large" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="link_url"
                label="Link URL (Optional)"
              >
                <Input placeholder="e.g., /books or https://example.com" prefix={<LinkOutlined />} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Description (Optional)"
              >
                <TextArea rows={3} placeholder="Add a short description for the slider" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="display_order"
                label="Display Order"
              >
                <Input type="number" placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="is_active"
                label="Active Status"
                valuePropName="checked"
              >
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Slider Image">
                <CloudinaryImageUpload 
                  onImageSelect={(url) => {
                    setUploadedImageUrl(url);
                    form.setFieldsValue({ image_url: url });
                  }} 
                />
                {uploadedImageUrl && (
                  <div className="mt-4 border p-2 rounded inline-block bg-[#1d1d1d]">
                    <Image src={uploadedImageUrl} width={200} alt="Preview" />
                  </div>
                )}
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isLoading} size="large">
              {editingId ? 'Update Slider' : 'Create Slider'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
