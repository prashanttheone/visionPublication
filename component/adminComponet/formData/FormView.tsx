'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Typography, 
  Tabs, 
  Tag, 
  Space, 
  Spin, 
  Alert, 
  Modal, 
  Row, 
  Col, 
  Divider, 
  message 
} from 'antd';
import { 
  CheckCircleOutlined, 
  DeleteOutlined, 
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BookOutlined
} from '@ant-design/icons';
import { authUtils } from '@/lib/auth';

const { Title, Text, Paragraph } = Typography;

interface ContactInquiry {
  id: number;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface AuthorApplication {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  qualification: string;
  specialization: string;
  experience: string;
  book_title: string;
  book_description: string;
  publishing_goal: string;
  status: string;
  created_at: string;
}

export default function FormView() {
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>([]);
  const [authorApplications, setAuthorApplications] = useState<AuthorApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('contact');

  // Fetch form submissions
  const fetchSubmissions = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch contact inquiries
      const contactRes = await authUtils.fetchWithAuth('/api/form?type=contact');
      const contactData = await contactRes.json();
      if (contactData.success) {
        setContactInquiries(contactData.data);
      }

      // Fetch author applications
      const authorRes = await authUtils.fetchWithAuth('/api/form?type=author');
      const authorData = await authorRes.json();
      if (authorData.success) {
        setAuthorApplications(authorData.data);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to fetch form submissions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleMarkAsRead = async (id: number) => {
    try {
      const response = await authUtils.fetchWithAuth(`/api/form/${id}?type=contact`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true }),
      });

      if (response.ok) {
        message.success('Inquiry marked as read');
        await fetchSubmissions();
      }
    } catch (err) {
      console.error('Error marking as read:', err);
      message.error('Failed to update inquiry');
    }
  };

  const handleUpdateApplicationStatus = async (id: number, status: string) => {
    try {
      const response = await authUtils.fetchWithAuth(`/api/form/${id}?type=author`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        message.success(`Application ${status} successfully`);
        await fetchSubmissions();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      message.error('Failed to update status');
    }
  };

  const handleDelete = (id: number, type: 'contact' | 'author') => {
    Modal.confirm({
      title: 'Are you sure you want to delete this submission?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await authUtils.fetchWithAuth(`/api/form/${id}?type=${type}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            message.success('Submission deleted successfully');
            await fetchSubmissions();
          }
        } catch (err) {
          console.error('Error deleting submission:', err);
          message.error('Failed to delete submission');
        }
      },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const contactTabContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
      {contactInquiries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text type="secondary">No contact inquiries yet</Text>
        </div>
      ) : (
        contactInquiries.map((inquiry) => (
          <Card
            key={inquiry.id}
            hoverable
            style={{ 
              borderRadius: '12px',
              border: `1px solid ${inquiry.is_read ? '#f0f0f0' : '#ffa940'}`
            }}
            styles={{ body: { padding: '20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <Title level={5} style={{ marginBottom: '4px', color: inquiry.is_read ? 'rgba(0,0,0,0.45)' : 'inherit' }}>
                  {inquiry.subject}
                </Title>
                <Space orientation="vertical" size={0}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    <UserOutlined /> From: <strong>{inquiry.full_name}</strong>
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    <MailOutlined /> {inquiry.email}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    <ClockCircleOutlined /> {formatDate(inquiry.created_at)}
                  </Text>
                </Space>
              </div>
              <Space>
                {!inquiry.is_read && (
                  <Button
                    type="primary"
                    ghost
                    size="small"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleMarkAsRead(inquiry.id)}
                  >
                    Mark Read
                  </Button>
                )}
                <Button
                  danger
                  ghost
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(inquiry.id, 'contact')}
                >
                  Delete
                </Button>
              </Space>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <Paragraph style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: 0 }}>
              {inquiry.message}
            </Paragraph>
          </Card>
        ))
      )}
    </div>
  );

  const authorTabContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
      {authorApplications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text type="secondary">No author applications yet</Text>
        </div>
      ) : (
        authorApplications.map((app) => (
          <Card
            key={app.id}
            hoverable
            style={{ borderRadius: '12px' }}
            styles={{ body: { padding: '20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <Title level={5} style={{ marginBottom: '4px' }}>
                  {app.full_name}
                </Title>
                <Space direction="vertical" size={0}>
                  <Text type="secondary"><MailOutlined /> {app.email}</Text>
                  <Text type="secondary"><PhoneOutlined /> {app.phone}</Text>
                  <Text type="secondary"><ClockCircleOutlined /> {formatDate(app.created_at)}</Text>
                </Space>
              </div>
              <Space wrap>
                <Button
                  type="primary"
                  ghost={app.status !== 'approved'}
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleUpdateApplicationStatus(app.id, 'approved')}
                  style={app.status === 'approved' ? { background: '#f6ffed', borderColor: '#b7eb8f', color: '#52c41a' } : {}}
                >
                  Approve
                </Button>
                <Button
                  danger
                  ghost={app.status !== 'rejected'}
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                  style={app.status === 'rejected' ? { background: '#fff1f0', borderColor: '#ffa39e', color: '#f5222d' } : {}}
                >
                  Reject
                </Button>
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(app.id, 'author')}
                >
                  Delete
                </Button>
              </Space>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Tag color={
                app.status === 'approved' ? 'success' : 
                app.status === 'rejected' ? 'error' : 'processing'
              }>
                {app.status.toUpperCase()}
              </Tag>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
              <Col xs={24} sm={12} md={6}>
                <Text type="secondary" strong style={{ display: 'block', fontSize: '12px' }}>Qualification</Text>
                <Text>{app.qualification}</Text>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text type="secondary" strong style={{ display: 'block', fontSize: '12px' }}>Specialization</Text>
                <Text>{app.specialization}</Text>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text type="secondary" strong style={{ display: 'block', fontSize: '12px' }}>Experience</Text>
                <Text>{app.experience}</Text>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text type="secondary" strong style={{ display: 'block', fontSize: '12px' }}>Book Title</Text>
                <Text><BookOutlined /> {app.book_title}</Text>
              </Col>
            </Row>

            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px' }}>
                <Text strong style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>Book Description</Text>
                <Paragraph style={{ marginBottom: 0 }}>{app.book_description}</Paragraph>
              </div>
              <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px' }}>
                <Text strong style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>Publishing Goal</Text>
                <Paragraph style={{ marginBottom: 0 }}>{app.publishing_goal}</Paragraph>
              </div>
            </Space>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Title level={3}>Form Submissions Manager</Title>
      
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Spin size="large" tip="Loading submissions..." />
        </div>
      ) : (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'contact',
              label: `Contact Inquiries (${contactInquiries.length})`,
              children: contactTabContent,
            },
            {
              key: 'author',
              label: `Author Applications (${authorApplications.length})`,
              children: authorTabContent,
            },
          ]}
        />
      )}
    </div>
  );
}
