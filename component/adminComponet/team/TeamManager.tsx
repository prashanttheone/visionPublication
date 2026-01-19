'use client';

import { useState, useEffect } from 'react';
import { Card, Input, Button, Typography, Space, Table, Tag, Modal, Form, message, Radio } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import CloudinaryImageUpload from '@/component/imageUpload/CloudinaryImageUpload';
import { authUtils } from '@/lib/auth';

const { Title, Text } = Typography;
const { confirm } = Modal;

interface TeamMember {
  id: number;
  name: string;
  role: string;
  team: string;
  image_url: string;
  bio: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const TeamManager = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'upload'>('upload');
  const [form] = Form.useForm();
  
  // State for image upload
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const token = authUtils.getToken();
      const response = await fetch('/api/team-members', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      const result = await response.json();

      if (result.success) {
        setTeamMembers(result.data);
      } else {
        message.error(result.error || 'Failed to fetch team members');
      }
    } catch (error) {
      message.error('Error fetching team members');
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

      const url = editingMember ? '/api/team-members' : '/api/team-members';
      const method = editingMember ? 'PUT' : 'POST';
      
      const payload = {
        ...(editingMember && { id: editingMember.id }),
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
        message.success(editingMember ? 'Team member updated successfully' : 'Team member created successfully');
        setFormVisible(false);
        form.resetFields();
        setEditingMember(null);
        setUploadMethod('upload');
        setUploadedImageUrl(''); // Reset uploaded image URL
        fetchTeamMembers(); // Refresh the list
      } else {
        message.error(result.error || 'Operation failed');
      }
    } catch (error) {
      message.error('Error saving team member');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = authUtils.getToken();
      const response = await fetch(`/api/team-members?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const result = await response.json();

      if (result.success) {
        message.success('Team member deleted successfully');
        fetchTeamMembers(); // Refresh the list
      } else {
        message.error(result.error || 'Failed to delete team member');
      }
    } catch (error) {
      message.error('Error deleting team member');
      console.error('Error:', error);
    }
  };

  const showDeleteConfirm = (record: TeamMember) => {
    confirm({
      title: 'Delete Team Member',
      content: `Are you sure you want to delete "${record.name}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => handleDelete(record.id),
    });
  };

  const showEditModal = (record?: TeamMember) => {
    if (record) {
      setEditingMember(record);
      form.setFieldsValue({
        name: record.name,
        role: record.role,
        team: record.team,
        image_url: record.image_url,
        bio: record.bio,
        display_order: record.display_order,
        is_active: record.is_active,
      });
      setUploadedImageUrl(record.image_url);
      setUploadMethod('url'); // Default to URL for editing
    } else {
      setEditingMember(null);
      form.resetFields();
      setUploadMethod('upload'); // Default to upload for new members
      setUploadedImageUrl('');
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
          alt="Team member" 
          style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} 
        />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Team',
      dataIndex: 'team',
      key: 'team',
    },
    {
      title: 'Bio',
      dataIndex: 'bio',
      key: 'bio',
      render: (bio: string) => (
        <Text ellipsis={{ tooltip: bio }}>
          {bio || '-'}
        </Text>
      ),
    },
    {
      title: 'Display Order',
      dataIndex: 'display_order',
      key: 'display_order',
      sorter: (a: TeamMember, b: TeamMember) => a.display_order - b.display_order,
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
      render: (_: any, record: TeamMember) => (
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
        <Title level={3}>Team Members Management</Title>
        <Text>Manage team members displayed on the website</Text>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => showEditModal()}
          >
            Add Team Member
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={teamMembers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingMember ? 'Edit Team Member' : 'Add Team Member'}
        open={formVisible}
        onCancel={() => {
          setFormVisible(false);
          setEditingMember(null);
          form.resetFields();
          setUploadedImageUrl('');
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
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter name' }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please enter role' }]}
          >
            <Input placeholder="Enter role" />
          </Form.Item>

          <Form.Item
            name="team"
            label="Team"
            rules={[{ required: true, message: 'Please enter team' }]}
          >
            <Input placeholder="Enter team" />
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
            name="bio"
            label="Bio"
          >
            <Input.TextArea rows={3} placeholder="Enter bio" />
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
                setEditingMember(null);
                setUploadMethod('upload');
                form.resetFields();
                setUploadedImageUrl('');
              }}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                disabled={uploadMethod === 'upload' && !uploadedImageUrl}
              >
                {editingMember ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeamManager;