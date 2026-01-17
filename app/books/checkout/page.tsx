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
    ConfigProvider,
    theme,
    Radio,
    Badge as AntBadge,
    Spin,
    Checkbox,
    App
} from 'antd';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import ShopLayout from '@/component/shopLayout';
import { EnvironmentOutlined, PlusOutlined, EditOutlined, CreditCardOutlined, MoneyCollectOutlined } from '@ant-design/icons';
import { usePayment } from '@/hooks/usepayment';
import { authUtils } from '@/lib/auth';

const { Title, Text } = Typography;

export default function CheckoutPage() {
    const { cart, cartTotal, clearCart } = useCart();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [addresses, setAddresses] = useState<any[]>([]);
    const { message } = App.useApp();
    const [selectedAddressId, setSelectedAddressId] = useState<string | number>('');
    const [isFetchingAddresses, setIsFetchingFetchingAddresses] = useState(true);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('online');
    const [form] = Form.useForm();
    const { processPayment, isProcessing: isPaymentProcessing } = usePayment();

    const fetchAddresses = async () => {
        try {
            const token = authUtils.getToken();
            if (!token) return;

            const response = await authUtils.fetchWithAuth('/api/users/addresses');
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
        const token = authUtils.getToken();

        try {
            let finalAddressId = selectedAddressId;

            // If we are editing an existing address, update it first
            if (editingAddressId && editingAddressId !== 'new') {
                const updateRes = await authUtils.fetchWithAuth('/api/users/addresses', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
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

            const response = await authUtils.fetchWithAuth('/api/orders', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
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
                const userEmail = form.getFieldValue('email') || (await authUtils.fetchWithAuth('/api/auth/me').then(res => res.json()).then(data => data.email).catch(() => ''));
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
                },
            }}
        >
            <ShopLayout hideFilters={true}>
                <div style={{ padding: '20px 10px', maxWidth: '1200px', margin: '0 auto' }}>
                    <Title level={2} style={{ fontSize: '24px', marginBottom: '20px' }}>Checkout</Title>
                    
                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={15}>
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <Card 
                                    title={<Space><EnvironmentOutlined />Shipping Address</Space>}
                                    extra={isFetchingAddresses && <Spin size="small" />}
                                    styles={{ body: { padding: '12px' } }}
                                >
                                    {addresses.length > 0 && (
                                        <div style={{ marginBottom: 24 }}>
                                            <Radio.Group 
                                                value={selectedAddressId} 
                                                onChange={(e) => handleAddressSelect(e.target.value)}
                                                style={{ width: '100%' }}
                                            >
                                                <Row gutter={[12, 12]}>
                                                    {addresses.map((addr) => (
                                                        <Col span={24} sm={12} key={addr.id}>
                                                            <Card 
                                                                size="small"
                                                                hoverable
                                                                onClick={() => handleAddressSelect(addr.id)}
                                                                style={{ 
                                                                    borderColor: selectedAddressId === addr.id ? '#3B82F6' : undefined,
                                                                    background: selectedAddressId === addr.id ? 'rgba(59, 130, 246, 0.05)' : undefined
                                                                }}
                                                                extra={
                                                                    <Space>
                                                                        {addr.is_default && <AntBadge status="success" text="Default" />}
                                                                        <Button 
                                                                            type="text" 
                                                                            icon={<EditOutlined />} 
                                                                            size="small"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleEditAddress(addr);
                                                                            }}
                                                                        />
                                                                    </Space>
                                                                }
                                                            >
                                                                <Radio value={addr.id}>
                                                                    <Text strong>{addr.full_name}</Text>
                                                                    <div style={{ fontSize: '12px', marginTop: 4 }}>
                                                                        <Text type="secondary">
                                                                            {addr.address_line_1}, {addr.locality}, {addr.city}
                                                                        </Text>
                                                                    </div>
                                                                </Radio>
                                                            </Card>
                                                        </Col>
                                                    ))}
                                                    <Col span={24} sm={12}>
                                                        <Button 
                                                            type="dashed" 
                                                            block 
                                                            style={{ height: '100%', minHeight: 80 }}
                                                            icon={<PlusOutlined />}
                                                            onClick={() => handleAddressSelect('new')}
                                                        >
                                                            Add New Address
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            </Radio.Group>
                                        </div>
                                    )}

                                    {isFormVisible ? (
                                        <Card title={editingAddressId ? 'Edit Address' : 'New Address'} size="small" extra={addresses.length > 0 && <Button type="link" onClick={handleCancelForm}>Cancel</Button>}>
                                            <Form
                                                form={form}
                                                layout="vertical"
                                                onFinish={handleSubmit}
                                                initialValues={{ country: 'India' }}
                                            >
                                                <Row gutter={16}>
                                                    <Col span={12}><Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
                                                    <Col span={12}><Form.Item name="phone" label="Phone" rules={[{ required: true }]}><Input /></Form.Item></Col>
                                                </Row>
                                                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
                                                <Form.Item name="address" label="Street Address" rules={[{ required: true }]}><Input /></Form.Item>
                                                <Row gutter={16}>
                                                    <Col span={12}><Form.Item name="locality" label="Locality" rules={[{ required: true }]}><Input /></Form.Item></Col>
                                                    <Col span={12}><Form.Item name="landmark" label="Landmark"><Input /></Form.Item></Col>
                                                </Row>
                                                <Row gutter={16}>
                                                    <Col span={8}><Form.Item name="city" label="City" rules={[{ required: true }]}><Input /></Form.Item></Col>
                                                    <Col span={8}><Form.Item name="state" label="State" rules={[{ required: true }]}><Input /></Form.Item></Col>
                                                    <Col span={8}><Form.Item name="zipCode" label="ZIP" rules={[{ required: true }]}><Input /></Form.Item></Col>
                                                </Row>
                                                <Form.Item name="saveAsDefault" valuePropName="checked"><Checkbox>Save as default address</Checkbox></Form.Item>
                                            </Form>
                                        </Card>
                                    ) : (
                                        <div style={{ textAlign: 'center' }}>
                                            {!selectedAddressId && <Text type="secondary">Please select a shipping address</Text>}
                                        </div>
                                    )}
                                </Card>

                                <Card title="Payment Method" styles={{ body: { padding: '12px' } }}>
                                    <Radio.Group 
                                        value={paymentMethod} 
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        optionType="button"
                                        buttonStyle="solid"
                                        style={{ width: '100%' }}
                                    >
                                        <Row gutter={8}>
                                            <Col span={12}>
                                                <Radio.Button value="online" style={{ width: '100%', height: 'auto', padding: '8px 4px', textAlign: 'center', fontSize: '12px' }}>
                                                    <CreditCardOutlined style={{ fontSize: '18px' }} /> <div>Online</div>
                                                </Radio.Button>
                                            </Col>
                                            <Col span={12}>
                                                <Radio.Button value="cod" style={{ width: '100%', height: 'auto', padding: '8px 4px', textAlign: 'center', fontSize: '12px' }}>
                                                    <MoneyCollectOutlined style={{ fontSize: '18px' }} /> <div>COD</div>
                                                </Radio.Button>
                                            </Col>
                                        </Row>
                                    </Radio.Group>
                                </Card>
                            </Space>
                        </Col>

                        <Col xs={24} lg={9}>
                            <div style={{ position: 'sticky', top: 20 }}>
                                <Card title="Order Summary">
                                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                        {cart.map((item) => (
                                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Space>
                                                    <Image src={item.image_url} width={40} height={55} preview={false} style={{ borderRadius: 4, objectFit: 'cover' }} />
                                                    <div>
                                                        <Text strong style={{ display: 'block' }}>{item.name}</Text>
                                                        <Text type="secondary" style={{ fontSize: '12px' }}>Qty: {item.quantity}</Text>
                                                    </div>
                                                </Space>
                                                <Text strong>₹{item.price * item.quantity}</Text>
                                            </div>
                                        ))}
                                        <Divider style={{ margin: '8px 0' }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Text type="secondary">Subtotal</Text>
                                            <Text>₹{cartTotal}</Text>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Text type="secondary">Shipping</Text>
                                            <Text type="success">Free</Text>
                                        </div>
                                        <Divider style={{ margin: '8px 0' }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text strong>Total Amount</Text>
                                            <Title level={4} style={{ margin: 0, color: '#3B82F6' }}>₹{cartTotal}</Title>
                                        </div>
                                    </Space>
                                </Card>
                            </div>
                        </Col>
                    </Row>

                    {/* Final Action Button - Bottom on Mobile, Aligned on Desktop */}
                    <Row style={{ marginTop: 24 }}>
                        <Col xs={24} lg={15}>
                            <Button 
                                type="primary" 
                                size="large" 
                                block 
                                loading={isLoading || isPaymentProcessing}
                                onClick={() => isFormVisible ? form.submit() : handleSubmit({})}
                                disabled={!selectedAddressId && !isFormVisible}
                                style={{ 
                                    height: '56px', 
                                    fontSize: '18px', 
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(to right, #3B82F6, #06B6D4)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                }}
                            >
                                Place Order (₹{cartTotal})
                            </Button>
                        </Col>
                    </Row>
                </div>
            </ShopLayout>
        </ConfigProvider>
    );
}
