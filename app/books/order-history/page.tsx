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
  ConfigProvider,
  theme
} from 'antd';
import { EyeOutlined, ShoppingOutlined } from '@ant-design/icons';
import ShopLayout from '@/component/shopLayout';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

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

  const showOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'Order Number',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (text: string) => <Text strong style={{ color: '#60A5FA' }}>{text}</Text>,
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
      render: (status: string) => {
        let color = 'blue';
        if (status === 'delivered') color = 'green';
        if (status === 'cancelled') color = 'red';
        if (status === 'shipped') color = 'cyan';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Payment',
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: (status: string) => (
        <Tag color={status === 'paid' ? 'green' : 'orange'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />} 
          onClick={() => showOrderDetails(record)}
          style={{ color: '#3B82F6' }}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#3B82F6',
          borderRadius: 12,
        },
      }}
    >
      <ShopLayout>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
          <Title level={2} style={{ color: 'white', marginBottom: '32px' }}>
            <ShoppingOutlined style={{ marginRight: '12px' }} />
            My Order History
          </Title>

          <Card 
            style={{ 
              background: 'rgba(30, 41, 59, 0.6)', 
              border: '1px solid rgba(100, 181, 246, 0.2)',
              borderRadius: '16px'
            }}
          >
            <Table 
              columns={columns} 
              dataSource={orders} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
              style={{ background: 'transparent' }}
            />
          </Card>

          <Modal
            title={<Title level={4} style={{ margin: 0 }}>Order Details: {selectedOrder?.order_number}</Title>}
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={[
              <Button key="close" onClick={() => setIsModalVisible(false)}>
                Close
              </Button>
            ]}
            width={700}
            style={{ top: 20 }}
          >
            {selectedOrder && (
              <div style={{ padding: '10px 0' }}>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Date">{new Date(selectedOrder.created_at).toLocaleString()}</Descriptions.Item>
                  <Descriptions.Item label="Status"><Tag color="blue">{selectedOrder.status.toUpperCase()}</Tag></Descriptions.Item>
                  <Descriptions.Item label="Payment Method">{selectedOrder.payment_method.toUpperCase()}</Descriptions.Item>
                  <Descriptions.Item label="Payment Status">{selectedOrder.payment_status.toUpperCase()}</Descriptions.Item>
                  <Descriptions.Item label="Subtotal">₹{selectedOrder.subtotal}</Descriptions.Item>
                  <Descriptions.Item label="Discount">₹{selectedOrder.discount}</Descriptions.Item>
                  <Descriptions.Item label="Shipping">₹{selectedOrder.shipping_charge}</Descriptions.Item>
                  <Descriptions.Item label="Total Amount" labelStyle={{ fontWeight: 'bold' }}>
                    <Text strong style={{ color: '#3B82F6', fontSize: '16px' }}>₹{selectedOrder.total_amount}</Text>
                  </Descriptions.Item>
                </Descriptions>
                
                <Divider>Shipping Address</Divider>
                <div style={{ background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ display: 'block', marginBottom: '4px' }}>
                    <Text>{selectedOrder.full_name}</Text>
                  </div>
                  <div style={{ display: 'block' }}>
                    <Text>{selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}</Text>
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </ShopLayout>
    </ConfigProvider>
  );
}
