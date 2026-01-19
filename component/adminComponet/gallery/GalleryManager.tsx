'use client';

import { useState, useEffect } from 'react';
import { Card, Input, Button, Typography, Space, Table, Tag, Modal, Form, message, Radio } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, LinkOutlined } from '@ant-design/icons';
import CloudinaryImageUpload from '@/component/imageUpload/CloudinaryImageUpload';
import { useAuth } from '@/context/AuthProvider';
import { authUtils } from '@/lib/auth';

const { Title, Text } = Typography;
const { confirm } = Modal;

interface GalleryImage {
  id: number;
  title: string;
  description: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const GalleryManager = () => {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'upload'>('upload');
  const [form] = Form.useForm();
  
  // State for image upload
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');



  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    try {
      setLoading(true);
      const token = authUtils.getToken();
      const response = await fetch('/api/gallery', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      const result = await response.json();

      if (result.success) {
        setGalleryImages(result.data);
      } else {
        message.error(result.error || 'Failed to fetch gallery images');
      }
    } catch (error) {
      message.error('Error fetching gallery images');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (values: any) => {
    try {
      // Determine the final image URL based on upload method
      const finalImageUrl = uploadedImageUrl || values.image_url;
      
      // Validate image URL is provided
      if (!finalImageUrl) {
        message.error('Please provide an image URL');
        return;
      }

      const url = editingImage ? '/api/gallery' : '/api/gallery';
      const method = editingImage ? 'PUT' : 'POST';
      
      const payload = {
        ...(editingImage && { id: editingImage.id }),
        ...values,
        image_url: finalImageUrl, // Use the determined image URL
        is_active: values.is_active ?? true
      };

      const token = authUtils.getToken();
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        message.success(editingImage ? 'Gallery image updated successfully' : 'Gallery image created successfully');
        setFormVisible(false);
        form.resetFields();
        setEditingImage(null);
        setUploadMethod('upload');
        setUploadedImageUrl(''); // Reset uploaded image URL
        fetchGalleryImages(); // Refresh the list
      } else {
        message.error(result.error || 'Operation failed');
      }
    } catch (error) {
      message.error('Error saving gallery image');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = authUtils.getToken();
      const response = await fetch(`/api/gallery?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const result = await response.json();

      if (result.success) {
        message.success('Gallery image deleted successfully');
        fetchGalleryImages(); // Refresh the list
      } else {
        message.error(result.error || 'Failed to delete gallery image');
      }
    } catch (error) {
      message.error('Error deleting gallery image');
      console.error('Error:', error);
    }
  };

  const showDeleteConfirm = (record: GalleryImage) => {
    confirm({
      title: 'Delete Gallery Image',
      content: `Are you sure you want to delete "${record.title}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => handleDelete(record.id),
    });
  };

  const showEditModal = (record?: GalleryImage) => {
    if (record) {
      setEditingImage(record);
      form.setFieldsValue({
        title: record.title,
        description: record.description,
        image_url: record.image_url,
        alt_text: record.alt_text,
        display_order: record.display_order,
        is_active: record.is_active,
      });
      setUploadMethod('url'); // Default to URL for editing
    } else {
      setEditingImage(null);
      form.resetFields();
      setUploadMethod('upload'); // Default to upload for new images
      form.setFieldValue('image_url', '');
    }
    setFormVisible(true);
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image_url',
      key: 'image_url',
      render: (image_url: string) => (
        <img 
          src={image_url} 
          alt="Gallery" 
          style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} 
        />
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => (
        <Text ellipsis={{ tooltip: description }}>
          {description}
        </Text>
      ),
    },
    {
      title: 'Alt Text',
      dataIndex: 'alt_text',
      key: 'alt_text',
      render: (alt_text: string) => alt_text || '-',
    },
    {
      title: 'Display Order',
      dataIndex: 'display_order',
      key: 'display_order',
      sorter: (a: GalleryImage, b: GalleryImage) => a.display_order - b.display_order,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (is_active: boolean) => (
        <Tag color={is_active ? 'green' : 'red'}>
          {is_active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: GalleryImage) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => showEditModal(record)}
          />
          <Button 
            icon={<DeleteOutlined />} 
            size="small" 
            danger
            onClick={() => showDeleteConfirm(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3}>Gallery Management</Title>
        <Text>Manage gallery images displayed on the website</Text>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => showEditModal()}
          >
            Add Gallery Image
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={galleryImages}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingImage ? 'Edit Gallery Image' : 'Add Gallery Image'}
        open={formVisible}
        onCancel={() => {
          setFormVisible(false);
          setEditingImage(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateOrUpdate}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter title' }]}
          >
            <Input placeholder="Enter title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} placeholder="Enter description" />
          </Form.Item>

          <Form.Item
            label="Image Source"
          >
            <Radio.Group 
              value={uploadMethod} 
              onChange={(e) => {
                setUploadMethod(e.target.value);
                if (e.target.value === 'upload') {
                  form.setFieldValue('image_url', '');
                }
              }}
              style={{ marginBottom: 16 }}
            >
              <Radio value="upload">Upload from Device</Radio>
              <Radio value="url">Enter URL</Radio>
            </Radio.Group>
            
            {uploadMethod === 'upload' ? (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary">
                    Select and upload an image from your device
                  </Text>
                </div>
                <CloudinaryImageUpload
                  onImageSelect={(url) => {
                    setUploadedImageUrl(url);
                    form.setFieldValue('image_url', url);
                  }}
                />
                {uploadedImageUrl && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Preview:</strong>
                    </div>
                    <img 
                      src={uploadedImageUrl} 
                      alt="Uploaded preview" 
                      style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 4, border: '1px solid #d9d9d9' }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <Form.Item
                name="image_url"
                rules={[{ required: true, message: 'Please enter image URL' }]}
                noStyle
              >
                <Input 
                  prefix={<LinkOutlined />} 
                  placeholder="Enter image URL" 
                />
              </Form.Item>
            )}
          </Form.Item>

          <Form.Item
            name="alt_text"
            label="Alt Text"
          >
            <Input placeholder="Enter alt text for accessibility" />
          </Form.Item>

          <Form.Item
            name="display_order"
            label="Display Order"
            rules={[{ required: true, message: 'Please enter display order' }]}
          >
            <Input type="number" placeholder="Enter display order (lower numbers appear first)" />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Status"
            valuePropName="checked"
            initialValue={true}
          >
            <Radio.Group>
              <Radio value={true}>Active</Radio>
              <Radio value={false}>Inactive</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => {
                setFormVisible(false);
                setEditingImage(null);
                setUploadMethod('upload');
                form.resetFields();
                form.setFieldValue('image_url', '');
              }}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                disabled={uploadMethod === 'upload' && !uploadedImageUrl}
              >
                {editingImage ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GalleryManager;