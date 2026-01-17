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
  Col,
  Collapse,
  Grid
} from 'antd';
import { EyeOutlined, ShoppingOutlined, CalendarOutlined, CreditCardOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ShopLayout from '@/component/shopLayout';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/auth';

const { Title, Text } = Typography;

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const router = useRouter();
  const screens = Grid.useBreakpoint();

  const isMobile = !screens.md;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = authUtils.getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await authUtils.fetchWithAuth('/api/orders');
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
      const response = await authUtils.fetchWithAuth(`/api/orders/${order.id}`);
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
      title: 'Order',
      dataIndex: 'order_number',
      key: 'order_number',
      fixed: 'left' as const,
      render: (text: string) => <Text strong style={{ color: '#60A5FA', fontSize: '13px' }}>{text}</Text>,
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      responsive: ['md'] as any[],
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Total',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => <Text strong>₹{amount}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'order_status',
      key: 'status',
      render: (status: string) => {
        const s = status || 'pending';
        let color = 'blue';
        if (s === 'delivered') color = 'green';
        if (s === 'cancelled') color = 'red';
        if (s === 'shipped') color = 'cyan';
        return <Tag color={color} style={{ fontSize: '11px' }}>{s.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Payment',
      dataIndex: 'payment_status',
      key: 'payment_status',
      responsive: ['sm'] as any[],
      render: (status: string) => (
        <Tag color={status === 'paid' ? 'green' : 'orange'} style={{ fontSize: '11px' }}>
          {(status || 'pending').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right' as const,
      width: 80,
      render: (_: any, record: any) => (
        <Button 
          type="text" 
          icon={<EyeOutlined />} 
          onClick={() => showOrderDetails(record)}
          style={{ color: '#3B82F6' }}
        />
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
      <ShopLayout hideFilters={true}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
          <Title level={2} style={{ color: 'white', marginBottom: '32px' }}>
            <ShoppingOutlined style={{ marginRight: '12px' }} />
            My Order History
          </Title>

          <Card 
            styles={{ body: { padding: isMobile ? '0' : '12px' } }}
            style={{ 
              background: isMobile ? 'transparent' : 'rgba(30, 41, 59, 0.6)', 
              border: isMobile ? 'none' : '1px solid rgba(100, 181, 246, 0.2)',
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            {!isMobile ? (
              <Table 
                columns={columns} 
                dataSource={orders} 
                rowKey="id" 
                loading={loading}
                pagination={{ pageSize: 10, simple: true }}
                scroll={{ x: 500 }}
                size="small"
                style={{ background: 'transparent' }}
              />
            ) : (
              <Collapse 
                ghost 
                accordion 
                expandIconPlacement="end"
                style={{ color: 'white' }}
              >
                {orders.map((order: any) => (
                  <Collapse.Panel 
                    key={order.id} 
                    header={
                      <div style={{ padding: '4px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text strong style={{ color: '#60A5FA' }}>{order.order_number}</Text>
                          <Text strong style={{ color: 'white' }}>₹{order.total_amount}</Text>
                        </div>
                        <Space separator={<Divider orientation="vertical" />} size={4} style={{ fontSize: '12px', margin: 0 }}>
                          <Text type="secondary"><CalendarOutlined /> {new Date(order.created_at).toLocaleDateString()}</Text>
                          <Tag color={(order.order_status === 'delivered' ? 'green' : 'blue')} style={{ fontSize: '10px', margin: 0 }}>
                            {(order.order_status || 'pending').toUpperCase()}
                          </Tag>
                        </Space>
                      </div>
                    }
                    style={{ 
                      background: 'rgba(30, 41, 59, 0.6)', 
                      marginBottom: 12, 
                      borderRadius: 12, 
                      border: '1px solid rgba(100, 181, 246, 0.1)' 
                    }}
                  >
                    <div style={{ padding: '8px 4px' }}>
                      <Descriptions column={1} size="small" bordered={false}>
                        <Descriptions.Item label={<><CreditCardOutlined /> Payment</>}>
                          <Tag color={order.payment_status === 'paid' ? 'green' : 'orange'} style={{ fontSize: '11px' }}>
                            {(order.payment_status || 'pending').toUpperCase()}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label={<><InfoCircleOutlined /> Method</>}>
                          <Text style={{ color: 'white' }}>{order.payment_method?.toUpperCase() || 'N/A'}</Text>
                        </Descriptions.Item>
                      </Descriptions>
                      <Button 
                        type="primary" 
                        icon={<EyeOutlined />} 
                        block 
                        style={{ marginTop: 12 }}
                        onClick={() => showOrderDetails(order)}
                      >
                        View Full Details
                      </Button>
                    </div>
                  </Collapse.Panel>
                ))}
                {orders.length === 0 && !loading && (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <Text type="secondary">No orders found</Text>
                  </div>
                )}
                {loading && <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div>}
              </Collapse>
            )}
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
                      <Descriptions 
                        column={{ xs: 1, sm: 2 }} 
                        bordered 
                        size="small" 
                        style={{ background: 'rgba(255,255,255,0.02)' }}
                      >
                        <Descriptions.Item label="Date">{new Date(selectedOrder.created_at).toLocaleString()}</Descriptions.Item>
                        <Descriptions.Item label="Status">
                          <Tag color={selectedOrder.order_status === 'delivered' ? 'green' : 'blue'}>
                            {(selectedOrder.order_status || 'pending').toUpperCase()}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Payment">{selectedOrder.payment_method?.toUpperCase()}</Descriptions.Item>
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
                        <Divider style={{ color: '#60A5FA', borderBlockStartColor: 'rgba(255,255,255,0.1)' }}>Items</Divider>
                        <Table
                          dataSource={selectedOrder.items}
                          pagination={false}
                          size="small"
                          rowKey="id"
                          scroll={{ x: 400 }}
                          columns={[
                            {
                              title: 'Book',
                              key: 'book',
                              fixed: 'left' as const,
                              render: (item) => (
                                <Space>
                                  {item.image_url && <Image src={item.image_url} width={30} preview={false} style={{ borderRadius: '4px' }} />}
                                  <Text strong style={{ color: 'white', fontSize: '12px' }}>{item.book_name}</Text>
                                </Space>
                              )
                            },
                            {
                              title: 'Qty',
                              dataIndex: 'quantity',
                              key: 'quantity',
                              width: 60,
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
