import React, { useState, useEffect } from 'react';
import { SalesService } from '../../services/api';
import { useFarm } from '../../context/FarmContext';
import { ShoppingCart, Users, Plus } from 'lucide-react';
import Modal from '../../components/UI/Modal';
import { useLayout } from '../../context/LayoutContext';


const SalesManagement = () => {
    const { setTitle } = useLayout();
    const [activeTab, setActiveTab] = useState('orders');

    useEffect(() => {
        setTitle('판매 관리');
    }, [setTitle]);
    const { fields } = useFarm();
    const [selectedFarm, setSelectedFarm] = useState(null);

    const [customers, setCustomers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });
    const [newOrder, setNewOrder] = useState({ customerId: '', items: [], totalAmount: 0 });

    // Set default farm
    useEffect(() => {
        if (fields.length > 0 && !selectedFarm) {
            setSelectedFarm(fields[0].id);
        }
    }, [fields, selectedFarm]);

    const fetchData = async () => {
        if (!selectedFarm) return;

        setLoading(true);
        try {
            // Fetch Customers
            const customersRes = await SalesService.getCustomers(selectedFarm);
            if (customersRes.data.success) {
                const customerList = customersRes.data.data;
                setCustomers(customerList);

                // Fetch Orders for all customers (Aggregate)
                let allOrders = [];
                for (const customer of customerList) {
                    try {
                        const ordersRes = await SalesService.getOrders(customer.id);
                        if (ordersRes.data.success) {
                            const customerOrders = ordersRes.data.data.map(o => ({
                                ...o,
                                customerName: customer.name,
                                // Format amount if needed, assuming backend returns number
                                amount: `${o.totalAmount.toLocaleString()}원`,
                                date: o.orderDate
                            }));
                            allOrders = [...allOrders, ...customerOrders];
                        }
                    } catch (e) {
                        console.warn(`Failed to fetch orders for customer ${customer.id}`, e);
                    }
                }
                // Sort orders by date desc
                allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
                setOrders(allOrders);
            }
        } catch (err) {
            console.error("Failed to fetch sales data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedFarm]);

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        try {
            await SalesService.registerCustomer({
                ...newCustomer,
                farmId: selectedFarm
            });
            setIsModalOpen(false);
            setNewCustomer({ name: '', email: '', phone: '' });
            fetchData();
        } catch (err) {
            console.error("Failed to register customer", err);
            alert("고객 등록 실패");
        }
    };

    const handleAddOrder = async (e) => {
        e.preventDefault();
        try {
            // Simplified order creation
            // Backend expects OrderRequest which might need items
            // For now, we'll send a basic request if backend supports it
            // Or we need to update UI to support items.
            // Let's assume we can create an order with just amount for now (if backend allows)
            // But OrderRequest likely needs items.
            // Let's check OrderRequest structure if possible, but for now we'll try to send minimal data.

            const payload = {
                customerId: Number(newOrder.customerId),
                orderDate: new Date().toISOString().split('T')[0],
                status: 'PENDING',
                totalAmount: Number(newOrder.totalAmount),
                items: [] // Empty items for now
            };

            await SalesService.createOrder(payload);
            setIsModalOpen(false);
            setNewOrder({ customerId: '', items: [], totalAmount: 0 });
            fetchData();
        } catch (err) {
            console.error("Failed to create order", err);
            alert("주문 생성 실패: " + (err.response?.data?.message || err.message));
        }
    };

    const sectionStyle = {
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--spacing-lg)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--spacing-xl)'
    };

    return (
        <div className="sales-page" style={{ padding: 'var(--spacing-lg)' }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>판매 관리</h2>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {/* Farm Selector */}
                    <select
                        value={selectedFarm || ''}
                        onChange={(e) => setSelectedFarm(Number(e.target.value))}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                    >
                        {fields.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                    </select>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            <ShoppingCart size={16} style={{ marginRight: '8px' }} />
                            주문 내역
                        </button>
                        <button
                            className={`btn ${activeTab === 'customers' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setActiveTab('customers')}
                        >
                            <Users size={16} style={{ marginRight: '8px' }} />
                            고객 관리
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
            ) : (
                <>
                    {activeTab === 'orders' ? (
                        <div style={sectionStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3>주문 목록</h3>
                                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                                    <Plus size={16} style={{ marginRight: '0.5rem' }} />
                                    주문 추가
                                </button>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                                        <th style={{ padding: '0.75rem' }}>주문 ID</th>
                                        <th style={{ padding: '0.75rem' }}>고객명</th>
                                        <th style={{ padding: '0.75rem' }}>날짜</th>
                                        <th style={{ padding: '0.75rem' }}>금액</th>
                                        <th style={{ padding: '0.75rem' }}>상태</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                            <td style={{ padding: '0.75rem' }}>#{order.id}</td>
                                            <td style={{ padding: '0.75rem' }}>{order.customerName}</td>
                                            <td style={{ padding: '0.75rem' }}>{order.date}</td>
                                            <td style={{ padding: '0.75rem' }}>{order.amount}</td>
                                            <td style={{ padding: '0.75rem' }}>{order.status}</td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '1rem' }}>주문 내역이 없습니다.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={sectionStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3>고객 목록</h3>
                                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                                    <Plus size={16} style={{ marginRight: '0.5rem' }} />
                                    고객 추가
                                </button>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                                        <th style={{ padding: '0.75rem' }}>이름</th>
                                        <th style={{ padding: '0.75rem' }}>이메일</th>
                                        <th style={{ padding: '0.75rem' }}>전화번호</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.map(customer => (
                                        <tr key={customer.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                            <td style={{ padding: '0.75rem' }}>{customer.name}</td>
                                            <td style={{ padding: '0.75rem' }}>{customer.email}</td>
                                            <td style={{ padding: '0.75rem' }}>{customer.phone}</td>
                                        </tr>
                                    ))}
                                    {customers.length === 0 && (
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: 'center', padding: '1rem' }}>등록된 고객이 없습니다.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={activeTab === 'orders' ? "주문 추가" : "고객 추가"}
            >
                {activeTab === 'orders' ? (
                    <form onSubmit={handleAddOrder}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>고객</label>
                            <select
                                value={newOrder.customerId}
                                onChange={e => setNewOrder({ ...newOrder, customerId: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                required
                            >
                                <option value="">고객 선택</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>금액</label>
                            <input
                                type="number"
                                value={newOrder.totalAmount}
                                onChange={e => setNewOrder({ ...newOrder, totalAmount: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                required
                            />
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>취소</button>
                            <button type="submit" className="btn btn-primary">저장</button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleAddCustomer}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>이름</label>
                            <input
                                type="text"
                                value={newCustomer.name}
                                onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>이메일</label>
                            <input
                                type="email"
                                value={newCustomer.email}
                                onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>전화번호</label>
                            <input
                                type="tel"
                                value={newCustomer.phone}
                                onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                            />
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>취소</button>
                            <button type="submit" className="btn btn-primary">저장</button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default SalesManagement;
