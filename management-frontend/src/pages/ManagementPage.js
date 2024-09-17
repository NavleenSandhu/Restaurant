import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';

export default function ManagementPage() {
    const [orders, setOrders] = useState([]);
    const API_URL = process.env.REACT_APP_ORDERS_API_URL
    const navigate = useNavigate()
    const [alert, setAlert] = useState(null)
    const bellSound = new Audio('/bell.wav');
    const [selectedDate, setSelectedDate] = useState('');
    const [dateError, setDateError] = useState('');
    const [filteredOrders, setFilteredOrders] = useState([]);

    useEffect(() => {
        const getOrders = async (date = '') => {
            const response = await fetch(`${API_URL}/getOrders?date=${date}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: "include"
            })
            const result = await response.json()
            if (result.status && result.status === 'forbidden') {
                navigate('/login')
            } else {
                setOrders(result)
                setFilteredOrders(result);
            }
        }
        const addOrder = async (order) => {
            const date = new Date()
            order.date = date.toLocaleDateString()
            order.hour = date.getHours()
            order.orderStatus = 'In progress'
            const response = await fetch(`${API_URL}/addOrder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: "include",
                body: JSON.stringify(order)
            })
            const result = await response.json()
            if (result.status === 'success') {
                setOrders(prevOrders => [...prevOrders, result.insertedOrder]);
                const today = new Date().toLocaleDateString()
                if (filteredOrders.length === 0 || (filteredOrders.length > 0 && filteredOrders[0].date === today)) {
                    setFilteredOrders(prevOrders => [...prevOrders, result.insertedOrder])
                }
                try {
                    await bellSound.play();
                } catch (error) {
                }
            } else {
                navigate("/login")
            }
        }
        getOrders()

        const ws = new WebSocket(`${process.env.REACT_APP_SOCKET_API_URL}/?type=management`);

        ws.onmessage = (message) => {
            const parsedMessage = JSON.parse(message.data);
            if (parsedMessage.type === "new_order") {
                addOrder(parsedMessage)
            }
        };
    }, [navigate]);

    useEffect(() => {
        setTimeout(() => {
            setAlert(null)
        }, 5000)
    }, [alert])

    const handleUpdateStatus = async (id) => {
        const response = await fetch(`${API_URL}/updateOrderStatus/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: "include",
        })
        const result = await response.json()
        if (result.status === 'success') {
            let updatedOrders = orders.slice()
            for (let order of updatedOrders) {
                if (order._id === id) {
                    order.orderStatus = 'Complete'
                }
            }
            setOrders(updatedOrders)
        } else if (result.status === 'forbidden') {
            navigate("/login")
        } else {
            setAlert(result)
        }
    }
    const handleSearch = () => {
        if (!selectedDate) {
            setDateError('Please select a date.');
            return;
        }
        setDateError('');
        fetchOrdersByDate(selectedDate);
    };

    const fetchOrdersByDate = async (date) => {
        try {
            const response = await fetch(`${API_URL}/getOrders?date=${date}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: "include"
            });
            const result = await response.json();
            if (result.status && result.status === 'forbidden') {
                navigate('/login');
            } else {
                setFilteredOrders(result);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setAlert({ message: 'Failed to fetch orders', type: 'error' });
        }
    };

    return (
        <div className="container mx-auto p-4">
            {alert && <Alert message={alert.message} type={alert.type} />}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                <h2 className="text-2xl font-semibold mb-4">Orders Dashboard</h2>
                <div></div>
                <div>
                    <label htmlFor="date" className="block text-lg font-medium mb-2">Search Orders by Date:</label>
                    <input
                        type="date"
                        id="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                    />
                    <button
                        onClick={handleSearch}
                        className="mt-2 bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition-colors"
                    >
                        Search
                    </button>
                    {dateError && <p className="text-red-500 mt-2">{dateError}</p>}
                </div>
            </div>
            <div className="space-y-8">
                {Array.from({ length: 24 }, (_, hour) => {
                    const ordersInSlot = filteredOrders.filter(order => order.hour === hour);
                    if (ordersInSlot.length === 0) return null;

                    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                    const amPm = hour >= 12 ? 'PM' : 'AM';

                    return (
                        <div key={hour}>
                            <h3 className="text-xl font-semibold mb-2">{`${displayHour}:00 ${amPm}`}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {ordersInSlot.map((order, index) => (
                                    <div key={index} className="bg-white rounded-lg shadow-md p-4 mb-4">
                                        <h4 className="text-lg font-semibold">{`Table ${order.tableNo}`}</h4>
                                        <p className="text-gray-800">
                                            {order.custName}
                                        </p>
                                        <p className="text-gray-600 mb-2">
                                            {order.items.map((item) => (
                                                <span key={item.item_name} className="block">
                                                    {`${item.item_name} x ${item.quantity}`}
                                                </span>
                                            ))}
                                        </p>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Status: {order.orderStatus}
                                        </p>
                                        {
                                            order.orderStatus === 'In progress' && (
                                                <button
                                                    className="bg-orange-500 text-white rounded-full px-4 py-2 hover:bg-orange-600 transition-colors"
                                                    onClick={() => handleUpdateStatus(order._id)}
                                                >
                                                    Mark as Complete
                                                </button>
                                            )
                                        }
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
