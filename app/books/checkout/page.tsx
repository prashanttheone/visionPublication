'use client';

import { useState, useEffect } from 'react';
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
    theme,
    Radio,
    Badge as AntBadge,
    Spin,
    Checkbox
} from 'antd';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import ShopLayout from '@/component/shopLayout';
import { EnvironmentOutlined, PlusOutlined, EditOutlined, CreditCardOutlined, MoneyCollectOutlined } from '@ant-design/icons';
import { usePayment } from '@/hooks/usepayment';

const { Title, Text } = Typography;

export default function CheckoutPage() {
    const { cart, cartTotal, clearCart } = useCart();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | number>('');
    const [isFetchingAddresses, setIsFetchingFetchingAddresses] = useState(true);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('online');
    const [form] = Form.useForm();
    const { processPayment, isProcessing: isPaymentProcessing } = usePayment();

    const fetchAddresses = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            const response = await fetch('/api/users/addresses', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success && data.addresses.length > 0) {
                setAddresses(data.addresses);
                
                // Find default address or use the first one
                const defaultAddr = data.addresses.find((a: any) => a.is_default) || data.addresses[0];
                handleAddressSelect(defaultAddr.id, data.addresses);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setIsFetchingFetchingAddresses(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleAddressSelect = (id: string | number, currentAddresses = addresses) => {
        setSelectedAddressId(id);
        setEditingAddressId(null);
        setIsFormVisible(id === 'new');
        
        if (id === 'new') {
            form.resetFields();
            form.setFieldsValue({ country: 'India' });
        } else {
            // Just select, don't prefill/show form unless Edit is clicked
            form.resetFields();
        }
    };

    const handleEditAddress = (addr: any) => {
        setEditingAddressId(addr.id);
        setSelectedAddressId(addr.id);
        setIsFormVisible(true);
        form.setFieldsValue({
            fullName: addr.full_name,
            phone: addr.contact_no,
            address: addr.address_line_1,
            locality: addr.locality,
            landmark: addr.landmark,
            city: addr.city,
            state: addr.state,
            zipCode: addr.pincode,
            country: addr.country,
            saveAsDefault: addr.is_default
        });
    };

    const handleCancelForm = () => {
        setIsFormVisible(false);
        setEditingAddressId(null);
        // If we were adding new, maybe select the first available or clear selection
        if (selectedAddressId === 'new' && addresses.length > 0) {
            setSelectedAddressId(addresses.find(a => a.is_default)?.id || addresses[0].id);
        }
    };

    const handleSubmit = async (values: any) => {
        // If form is visible, we are either adding a new address or editing an existing one
        // If editing, we might want to save it first.
        // For simplicity and following existing logic, we'll let the backend handle creation if shippingAddress is provided.
        // But if editing, we should probably update it in the DB first or send special payload.
        
        setIsLoading(true);
        const token = localStorage.getItem('authToken');

        try {
            let finalAddressId = selectedAddressId;

            // If we are editing an existing address, update it first
            if (editingAddressId && editingAddressId !== 'new') {
                const updateRes = await fetch('/api/users/addresses', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        id: editingAddressId,
                        ...values,
                        isDefault: values.saveAsDefault
                    }),
                });
                if (!updateRes.ok) throw new Error('Failed to update address');
                finalAddressId = editingAddressId;
            }

            const payload: any = {
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
                payment_method: paymentMethod,
            };

            if (isFormVisible && !editingAddressId) {
                // New address from form
                payload.shippingAddress = values;
            } else {
                // Use selected (and potentially just updated) address ID
                payload.address_id = finalAddressId;
            }

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to place order');
            }

            const orderData = await response.json();

            if (paymentMethod === 'online') {
                // Trigger Razorpay
                const userEmail = form.getFieldValue('email') || (await fetch('/api/auth/me').then(res => res.json()).then(data => data.email).catch(() => ''));
                const userName = form.getFieldValue('fullName') || addresses.find(a => a.id === selectedAddressId)?.full_name || 'Customer';
                const userPhone = form.getFieldValue('phone') || addresses.find(a => a.id === selectedAddressId)?.contact_no || '';

                await processPayment({
                    amount: cartTotal,
                    orderId: orderData.order_id,
                    userName: userName,
                    userEmail: userEmail,
                    userPhone: userPhone,
                    description: `Payment for Order ${orderData.order_number}`
                });
            } else {
                // COD Flow
                clearCart();
                message.success('Your order has been placed successfully.');
                router.push(`/books/order/success?order_number=${orderData.order_number}`);
            }

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
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                            <Title level={4} style={{ color: '#60A5FA', margin: 0 }}>Shipping Address</Title>
                                            {isFetchingAddresses && <Spin size="small" />}
                                        </div>

                                        {addresses.length > 0 && (
                                            <div style={{ marginBottom: '32px' }}>
                                                <Text type="secondary" style={{ display: 'block', marginBottom: '12px' }}>Choose from saved addresses:</Text>
                                                <Radio.Group 
                                                    value={selectedAddressId} 
                                                    onChange={(e) => handleAddressSelect(e.target.value)}
                                                    style={{ width: '100%' }}
                                                >
                                                    <Row gutter={[12, 12]}>
                                                        {addresses.map((addr) => (
                                                            <Col span={24} sm={12} key={addr.id}>
                                                                <div style={{ position: 'relative' }}>
                                                                    <Radio.Button 
                                                                        value={addr.id}
                                                                        style={{ 
                                                                            width: '100%', 
                                                                            height: 'auto', 
                                                                            padding: '12px',
                                                                            background: selectedAddressId === addr.id ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.2)',
                                                                            borderColor: selectedAddressId === addr.id ? '#3B82F6' : 'rgba(255,255,255,0.1)',
                                                                            borderRadius: '8px',
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            textAlign: 'left'
                                                                        }}
                                                                    >
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', paddingRight: '24px' }}>
                                                                            <Text strong style={{ color: 'white' }}>{addr.full_name}</Text>
                                                                            {addr.is_default && <AntBadge count="Default" style={{ backgroundColor: '#52c41a', fontSize: '10px' }} />}
                                                                        </div>
                                                                        <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px', maxWidth: '80%' }}>
                                                                            {addr.address_line_1}, {addr.locality}, {addr.city}, {addr.state}
                                                                        </Text>
                                                                    </Radio.Button>
                                                                    <Button 
                                                                        type="text" 
                                                                        icon={<EditOutlined style={{ color: '#60A5FA' }} />} 
                                                                        size="small"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            handleEditAddress(addr);
                                                                        }}
                                                                        style={{ 
                                                                            position: 'absolute', 
                                                                            right: '8px', 
                                                                            top: '8px',
                                                                            zIndex: 2
                                                                        }}
                                                                    />
                                                                </div>
                                                            </Col>
                                                        ))}
                                                        <Col span={24} sm={12}>
                                                            <Radio.Button 
                                                                value="new"
                                                                style={{ 
                                                                    width: '100%', 
                                                                    height: '100%', 
                                                                    minHeight: '70px',
                                                                    padding: '12px',
                                                                    background: selectedAddressId === 'new' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.2)',
                                                                    borderColor: selectedAddressId === 'new' ? '#3B82F6' : 'rgba(255,255,255,0.1)',
                                                                    borderRadius: '8px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                            >
                                                                <PlusOutlined style={{ marginRight: '8px' }} />
                                                                Add New Address
                                                            </Radio.Button>
                                                        </Col>
                                                    </Row>
                                                </Radio.Group>
                                                <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                                                
                                                <div style={{ marginBottom: '24px' }}>
                                                    <Title level={4} style={{ color: '#60A5FA', marginBottom: '16px' }}>Payment Method</Title>
                                                    <Radio.Group 
                                                        value={paymentMethod} 
                                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                                        style={{ width: '100%' }}
                                                    >
                                                        <Row gutter={[12, 12]}>
                                                            <Col span={12}>
                                                                <Radio.Button 
                                                                    value="online"
                                                                    style={{ 
                                                                        width: '100%', 
                                                                        height: 'auto', 
                                                                        padding: '16px',
                                                                        background: paymentMethod === 'online' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.2)',
                                                                        borderColor: paymentMethod === 'online' ? '#3B82F6' : 'rgba(255,255,255,0.1)',
                                                                        borderRadius: '8px',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}
                                                                >
                                                                    <CreditCardOutlined style={{ fontSize: '24px', marginBottom: '8px', color: paymentMethod === 'online' ? '#3B82F6' : 'white' }} />
                                                                    <Text strong style={{ color: 'white' }}>Online Payment</Text>
                                                                    <Text type="secondary" style={{ fontSize: '11px' }}>UPI, Card, Net Banking</Text>
                                                                </Radio.Button>
                                                            </Col>
                                                            <Col span={12}>
                                                                <Radio.Button 
                                                                    value="cod"
                                                                    style={{ 
                                                                        width: '100%', 
                                                                        height: 'auto', 
                                                                        padding: '16px',
                                                                        background: paymentMethod === 'cod' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.2)',
                                                                        borderColor: paymentMethod === 'cod' ? '#3B82F6' : 'rgba(255,255,255,0.1)',
                                                                        borderRadius: '8px',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}
                                                                >
                                                                    <MoneyCollectOutlined style={{ fontSize: '24px', marginBottom: '8px', color: paymentMethod === 'cod' ? '#3B82F6' : 'white' }} />
                                                                    <Text strong style={{ color: 'white' }}>Cash on Delivery</Text>
                                                                    <Text type="secondary" style={{ fontSize: '11px' }}>Pay when you receive</Text>
                                                                </Radio.Button>
                                                            </Col>
                                                        </Row>
                                                    </Radio.Group>
                                                </div>
                                                
                                                <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                                            </div>
                                        )}

                                        {isFormVisible ? (
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                    <Title level={5} style={{ color: 'white', margin: 0 }}>
                                                        {editingAddressId ? 'Edit Address' : 'Add New Shipping Address'}
                                                    </Title>
                                                    {addresses.length > 0 && (
                                                        <Button type="link" onClick={handleCancelForm} style={{ padding: 0 }}>Cancel</Button>
                                                    )}
                                                </div>
                                                <Form
                                                    form={form}
                                                    layout="vertical"
                                                    onFinish={handleSubmit}
                                                    initialValues={{ country: 'India' }}
                                                >
                                                    <Row gutter={16}>
                                                        <Col span={12}>
                                                            <Form.Item
                                                                name="fullName"
                                                                rules={[{ required: true, message: 'Please enter your full name' }]}
                                                            >
                                                                <Input size="large" placeholder="Full Name" style={{ background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={12}>
                                                            <Form.Item
                                                                name="phone"
                                                                rules={[{ required: true, message: 'Phone number is required' }]}
                                                            >
                                                                <Input size="large" placeholder="Phone Number" style={{ background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>

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
                                                        <Input size="large" placeholder="Street Address (House No, Building)" style={{ background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                                                    </Form.Item>

                                                    <Row gutter={16}>
                                                        <Col span={12}>
                                                            <Form.Item
                                                                name="locality"
                                                                rules={[{ required: true, message: 'Locality/Area is required' }]}
                                                            >
                                                                <Input size="large" placeholder="Locality / Sector" style={{ background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={12}>
                                                            <Form.Item name="landmark">
                                                                <Input size="large" placeholder="Landmark (Optional)" style={{ background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>

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

                                                    <Form.Item name="saveAsDefault" valuePropName="checked">
                                                        <Checkbox style={{ color: 'white' }}>Save this address and set as default</Checkbox>
                                                    </Form.Item>

                                                    <Form.Item style={{ marginTop: '16px' }}>
                                                        <Button
                                                            type="primary"
                                                            htmlType="submit"
                                                            size="large"
                                                            block
                                                            loading={isLoading || isPaymentProcessing}
                                                            style={{ 
                                                                height: '50px',
                                                                background: 'linear-gradient(to right, #3B82F6, #06B6D4)',
                                                                border: 'none',
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            {editingAddressId ? 'Update & Place Order' : 'Place Order'} (₹{cartTotal})
                                                        </Button>
                                                    </Form.Item>
                                                </Form>
                                            </div>
                                        ) : (
                                            <div>
                                                {selectedAddressId ? (
                                                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                                        <Text style={{ color: 'white', display: 'block', marginBottom: '20px' }}>
                                                            You have selected <strong>{addresses.find(a => a.id === selectedAddressId)?.full_name}</strong> for delivery.
                                                        </Text>
                                                        <Button
                                                            type="primary"
                                                            size="large"
                                                            block
                                                            onClick={() => handleSubmit({})} // Empty values because we use selectedAddressId
                                                            loading={isLoading || isPaymentProcessing}
                                                            style={{ 
                                                                height: '50px',
                                                                background: 'linear-gradient(to right, #3B82F6, #06B6D4)',
                                                                border: 'none',
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            Place Order (₹{cartTotal})
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                                        <EnvironmentOutlined style={{ fontSize: '32px', color: '#60A5FA', marginBottom: '16px' }} />
                                                        <Text style={{ color: 'white', display: 'block' }}>Please select or add a shipping address to proceed.</Text>
                                                    </div>
                                                )}
                                            </div>
                                        )}
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
