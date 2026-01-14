'use client';

import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Tag, 
  Space, 
  Typography, 
  Card, 
  Button, 
  message, 
  Modal, 
  Descriptions,
  Divider,
  Select,
  Input,
  Row,
  Col,
  Tooltip
} from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  SearchOutlined, 
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

export default function AdminOrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        message.error('Failed to fetch orders');
      }
    } catch (error) {
      message.error('An error occurred while fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        message.success(`Order status updated to ${newStatus}`);
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        const data = await response.json();
        message.error(data.error || 'Failed to update status');
      }
    } catch (error) {
      message.error('Error updating order status');
    }
  };

  const showOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const filteredOrders = orders.filter((order: any) => {
    const orderNumber = order.order_number || '';
    const fullName = order.full_name || '';
    const matchesSearch = orderNumber.toLowerCase().includes(searchText.toLowerCase()) || 
                          fullName.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: 'Order #',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (text: string) => <Text strong color="blue">{text}</Text>,
    },
    {
      title: 'Customer',
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Total',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => `₹${amount}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: any) => (
        <Select 
          defaultValue={status} 
          style={{ width: 130 }} 
          onChange={(value) => updateOrderStatus(record.id, value)}
          onClick={(e) => e.stopPropagation()}
        >
          <Option value="pending">PENDING</Option>
          <Option value="confirmed">CONFIRMED</Option>
          <Option value="shipped">SHIPPED</Option>
          <Option value="delivered">DELIVERED</Option>
          <Option value="cancelled">CANCELLED</Option>
        </Select>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button shape="circle" icon={<EyeOutlined />} onClick={() => showOrderDetails(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: '24px' }}>
        <Col flex="auto">
          <Title level={2}>Order Management</Title>
        </Col>
        <Col>
          <Button icon={<ReloadOutlined />} onClick={fetchOrders}>Refresh</Button>
        </Col>
      </Row>

      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Input 
              placeholder="Search by Order # or Name" 
              prefix={<SearchOutlined />} 
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </Col>
          <Col span={6}>
            <Select 
              placeholder="Filter by Status" 
              style={{ width: '100%' }} 
              value={statusFilter}
              onChange={value => setStatusFilter(value)}
            >
              <Option value="all">All Statuses</Option>
              <Option value="pending">Pending</Option>
              <Option value="confirmed">Confirmed</Option>
              <Option value="shipped">Shipped</Option>
              <Option value="delivered">Delivered</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table 
          columns={columns} 
          dataSource={filteredOrders} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={`Order Details: ${selectedOrder?.order_number}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>Close</Button>
        ]}
      >
        {selectedOrder && (
          <div>
            <Descriptions title="Order Info" bordered column={2}>
              <Descriptions.Item label="Order Number">{selectedOrder.order_number}</Descriptions.Item>
              <Descriptions.Item label="Date">{new Date(selectedOrder.created_at).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color="blue">{selectedOrder.status.toUpperCase()}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Status">
                <Tag color={selectedOrder.payment_status === 'paid' ? 'green' : 'orange'}>
                  {selectedOrder.payment_status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />
            
            <Descriptions title="Customer & Shipping" bordered column={2}>
              <Descriptions.Item label="Name">{selectedOrder.full_name}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedOrder.email}</Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>
                {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="Financial Summary" bordered column={2}>
              <Descriptions.Item label="Subtotal">₹{selectedOrder.subtotal}</Descriptions.Item>
              <Descriptions.Item label="Discount">₹{selectedOrder.discount}</Descriptions.Item>
              <Descriptions.Item label="Shipping">₹{selectedOrder.shipping_charge}</Descriptions.Item>
              <Descriptions.Item label="Grand Total">
                <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>₹{selectedOrder.total_amount}</Text>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}
