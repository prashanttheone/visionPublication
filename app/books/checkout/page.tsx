'use client';

import { useState } from 'react';
import { 
    Form, 
    Input, 
    Button, 
    Typography, 
    Row, 
    Col, 
    Card, 
    Divider, 
    Space, 
    Image, 
    message,
    ConfigProvider,
    theme
} from 'antd';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import ShopLayout from '@/component/shopLayout';

const { Title, Text } = Typography;

export default function CheckoutPage() {
    const { cart, cartTotal, clearCart } = useCart();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [form] = Form.useForm();

    const handleSubmit = async (values: any) => {
        setIsLoading(true);

        try {
            // Check if user is logged in (Assuming authUtils or similar is available via token check)
            const token = localStorage.getItem('authToken');
            if (!token) {
                message.error('Please login to place an order');
                router.push('/login');
                return;
            }

            // Note: The API expects address_id or creating an address first.
            // For now, we follow the previous logic of sending the full address.
            // We might need to adjust this to match the refined API requirements.
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    items: cart.map(item => ({
                        book_id: item.id,
                        quantity: item.quantity,
                        price: item.price,
                        offer_price: item.offer_price || item.price,
                        sku: item.sku || ''
                    })),
                    subtotal: cartTotal,
                    discount: 0,
                    shipping_charge: 0,
                    total_amount: cartTotal,
                    payment_method: 'cod', // Default for now
                    shippingAddress: values
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to place order');
            }

            clearCart();
            message.success('Your order has been placed successfully.');
            router.push('/books/order/success');

        } catch (error: any) {
            message.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <ShopLayout>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
                    <Title level={2} style={{ color: 'white' }}>Your Cart is Empty</Title>
                    <Button 
                        type="primary" 
                        size="large" 
                        style={{ marginTop: '20px' }}
                        onClick={() => router.push('/books')}
                    >
                        Go Shopping
                    </Button>
                </div>
            </ShopLayout>
        );
    }

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
                <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1a2332 100%)', padding: '40px 0' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                        <Title style={{ color: 'white', marginBottom: '32px' }}>Checkout</Title>
                        
                        <Row gutter={[32, 32]}>
                            {/* Left Column: Shipping Form */}
                            <Col xs={24} lg={14}>
                                <div>
                                    <Card 
                                        style={{ 
                                            background: 'rgba(30, 41, 59, 0.6)', 
                                            border: '1px solid rgba(100, 181, 246, 0.2)',
                                            borderRadius: '16px'
                                        }}
                                    >
                                        <Title level={4} style={{ color: '#60A5FA', marginBottom: '24px' }}>Shipping Address</Title>
                                        <Form
                                            form={form}
                                            layout="vertical"
                                            onFinish={handleSubmit}
                                            initialValues={{ country: 'India' }}
                                        >
                                            <Form.Item
                                                name="fullName"
                                                rules={[{ required: true, message: 'Please enter your full name' }]}
                                            >
                                                <Input size="large" placeholder="Full Name" style={{ background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                                            </Form.Item>

                                            <Form.Item
                                                name="email"
                                                rules={[
                                                    { required: true, message: 'Please enter your email' },
                                                    { type: 'email', message: 'Please enter a valid email' }
                                                ]}
                                            >
                                                <Input size="large" placeholder="Email Address" style={{ background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                                            </Form.Item>

                                            <Form.Item
                                                name="address"
                                                rules={[{ required: true, message: 'Please enter your street address' }]}
                                            >
                                                <Input size="large" placeholder="Street Address" style={{ background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                                            </Form.Item>

                                            <Row gutter={16}>
                                                <Col span={12}>
                                                    <Form.Item
                                                        name="city"
                                                        rules={[{ required: true, message: 'City is required' }]}
                                                    >
                                                        <Input size="large" placeholder="City" style={{ background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item
                                                        name="state"
                                                        rules={[{ required: true, message: 'State is required' }]}
                                                    >
                                                        <Input size="large" placeholder="State" style={{ background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Row gutter={16}>
                                                <Col span={12}>
                                                    <Form.Item
                                                        name="zipCode"
                                                        rules={[{ required: true, message: 'ZIP Code is required' }]}
                                                    >
                                                        <Input size="large" placeholder="ZIP Code" style={{ background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item name="country">
                                                        <Input size="large" placeholder="Country" disabled style={{ background: 'rgba(0,0,0,0.2)', color: 'gray' }} />
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Form.Item style={{ marginTop: '16px' }}>
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    size="large"
                                                    block
                                                    loading={isLoading}
                                                    style={{ 
                                                        height: '50px',
                                                        background: 'linear-gradient(to right, #3B82F6, #06B6D4)',
                                                        border: 'none',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    Place Order (₹{cartTotal})
                                                </Button>
                                            </Form.Item>
                                        </Form>
                                    </Card>
                                </div>
                            </Col>

                            {/* Right Column: Order Summary */}
                            <Col xs={24} lg={10}>
                                <div>
                                    <Card
                                        style={{ 
                                            background: 'rgba(30, 41, 59, 0.8)', 
                                            border: '1px solid rgba(100, 181, 246, 0.2)',
                                            borderRadius: '16px',
                                            position: 'sticky',
                                            top: '100px'
                                        }}
                                    >
                                        <Title level={4} style={{ color: 'white', marginBottom: '24px' }}>Order Summary</Title>
                                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                            {cart.map((item) => (
                                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Space align="center" size="middle">
                                                        <div style={{ width: '50px', height: '70px', borderRadius: '8px', overflow: 'hidden' }}>
                                                            <Image 
                                                                preview={false}
                                                                src={item.image_url} 
                                                                alt={item.name} 
                                                                width={50}
                                                                height={70}
                                                                style={{ objectFit: 'cover' }} 
                                                            />
                                                        </div>
                                                        <div>
                                                            <Text strong style={{ color: 'white', display: 'block' }}>{item.name}</Text>
                                                            <Text type="secondary" style={{ fontSize: '12px' }}>Qty: {item.quantity}</Text>
                                                        </div>
                                                    </Space>
                                                    <Text strong style={{ color: 'white' }}>₹{item.price * item.quantity}</Text>
                                                </div>
                                            ))}
                                            
                                            <Divider style={{ margin: '8px 0', borderColor: 'rgba(255,255,255,0.1)' }} />
                                            
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Text type="secondary">Subtotal</Text>
                                                <Text style={{ color: 'white' }}>₹{cartTotal}</Text>
                                            </div>
                                            
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Text type="secondary">Shipping</Text>
                                                <Text style={{ color: '#4ADE80' }}>Free</Text>
                                            </div>
                                            
                                            <Divider style={{ margin: '8px 0', borderColor: 'rgba(255,255,255,0.1)' }} />
                                            
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Title level={4} style={{ margin: 0, color: 'white' }}>Total</Title>
                                                <Title level={3} style={{ margin: 0, color: '#60A5FA' }}>₹{cartTotal}</Title>
                                            </div>
                                        </Space>
                                    </Card>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>
            </ShopLayout>
        </ConfigProvider>
    );
}
