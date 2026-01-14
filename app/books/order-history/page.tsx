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
  theme,
  Spin,
  Image,
  Row,
  Col
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
  const [modalLoading, setModalLoading] = useState(false);
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

  const showOrderDetails = async (order: any) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
    setModalLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/orders/${order.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const fullDetail = await response.json();
        setSelectedOrder(fullDetail);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setModalLoading(false);
    }
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
            title={<Title level={4} style={{ margin: 0, color: '#60A5FA' }}>Order Details: {selectedOrder?.order_number}</Title>}
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={[
              <Button key="close" type="primary" onClick={() => setIsModalVisible(false)}>
                Close
              </Button>
            ]}
            width={800}
            style={{ top: 20 }}
            bodyStyle={{ padding: '24px' }}
          >
            {selectedOrder && (
              <Spin spinning={modalLoading}>
                <div style={{ padding: '0' }}>
                  <Row gutter={[24, 24]}>
                    <Col span={24}>
                      <Descriptions column={2} bordered size="small" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <Descriptions.Item label="Date">{new Date(selectedOrder.created_at).toLocaleString()}</Descriptions.Item>
                        <Descriptions.Item label="Status">
                          <Tag color={selectedOrder.status === 'delivered' ? 'green' : 'blue'}>
                            {selectedOrder.status.toUpperCase()}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Payment Method">{selectedOrder.payment_method?.toUpperCase()}</Descriptions.Item>
                        <Descriptions.Item label="Payment Status">
                          <Tag color={selectedOrder.payment_status === 'paid' ? 'green' : 'orange'}>
                            {selectedOrder.payment_status?.toUpperCase()}
                          </Tag>
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>

                    <Col xs={24} md={12}>
                      <Title level={5} style={{ color: '#60A5FA', marginBottom: '16px' }}>Shipping Address</Title>
                      <div style={{ 
                        background: 'rgba(59, 130, 246, 0.05)', 
                        padding: '20px', 
                        borderRadius: '12px', 
                        border: '1px solid rgba(59, 130, 246, 0.1)',
                        minHeight: '160px'
                      }}>
                        <Text strong style={{ color: 'white', fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                          {selectedOrder.shipping_name || selectedOrder.user_name}
                        </Text>
                        <Space direction="vertical" size={2} style={{ width: '100%' }}>
                          <Text style={{ color: 'rgba(255,255,255,0.85)' }}>{selectedOrder.address_line_1}</Text>
                          {selectedOrder.address_line_2 && <Text style={{ color: 'rgba(255,255,255,0.85)' }}>{selectedOrder.address_line_2}</Text>}
                          <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
                            {selectedOrder.locality && `${selectedOrder.locality}, `}{selectedOrder.city}
                          </Text>
                          <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
                            {selectedOrder.state} - {selectedOrder.pincode}
                          </Text>
                          <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>{selectedOrder.country}</Text>
                          {selectedOrder.shipping_phone && (
                            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                              <Text style={{ color: 'rgba(255,255,255,0.65)' }}>Phone: {selectedOrder.shipping_phone}</Text>
                            </div>
                          )}
                        </Space>
                      </div>
                    </Col>

                    <Col xs={24} md={12}>
                      <Title level={5} style={{ color: '#60A5FA', marginBottom: '16px' }}>Order Summary</Title>
                      <div style={{ 
                        background: 'rgba(255,255,255,0.02)', 
                        padding: '20px', 
                        borderRadius: '12px', 
                        border: '1px solid rgba(255,255,255,0.05)',
                        minHeight: '160px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <Text type="secondary">Subtotal</Text>
                          <Text style={{ color: 'white' }}>₹{selectedOrder.subtotal}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <Text type="secondary">Discount</Text>
                          <Text style={{ color: '#F87171' }}>-₹{selectedOrder.discount}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <Text type="secondary">Shipping</Text>
                          <Text style={{ color: '#4ADE80' }}>{selectedOrder.shipping_charge > 0 ? `₹${selectedOrder.shipping_charge}` : 'FREE'}</Text>
                        </div>
                        <Divider style={{ margin: '12px 0', borderColor: 'rgba(255,255,255,0.1)' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text strong style={{ fontSize: '18px', color: 'white' }}>Total Amount</Text>
                          <Text strong style={{ fontSize: '20px', color: '#60A5FA' }}>₹{selectedOrder.total_amount}</Text>
                        </div>
                      </div>
                    </Col>

                    {selectedOrder.items && (
                      <Col span={24}>
                        <Divider style={{ color: '#60A5FA', borderBlockStartColor: 'rgba(255,255,255,0.1)' }}>Order Items</Divider>
                        <Table
                          dataSource={selectedOrder.items}
                          pagination={false}
                          size="small"
                          rowKey="id"
                          columns={[
                            {
                              title: 'Book',
                              key: 'book',
                              render: (item) => (
                                <Space>
                                  {item.image_url && <Image src={item.image_url} width={30} preview={false} style={{ borderRadius: '4px' }} />}
                                  <div>
                                    <Text strong style={{ color: 'white' }}>{item.book_name}</Text>
                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>SKU: {item.sku}</div>
                                  </div>
                                </Space>
                              )
                            },
                            {
                              title: 'Qty',
                              dataIndex: 'quantity',
                              key: 'quantity',
                            },
                            {
                              title: 'Price',
                              dataIndex: 'offer_price',
                              key: 'price',
                              render: (price) => `₹${price}`
                            },
                            {
                              title: 'Total',
                              key: 'total',
                              render: (item) => `₹${item.offer_price * item.quantity}`
                            }
                          ]}
                        />
                      </Col>
                    )}
                  </Row>
                </div>
              </Spin>
            )}
          </Modal>
        </div>
      </ShopLayout>
    </ConfigProvider>
  );
}
