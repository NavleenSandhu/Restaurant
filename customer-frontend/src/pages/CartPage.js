import React, { useContext } from 'react'
import { useState, useEffect } from 'react'
import { CartContext } from '../contexts/CartContext'
import Alert from '../components/Alert'
import Spinner from '../components/Spinner'
import Minus from '../components/Minus'
import { TableNumberContext } from '../contexts/TableNumberContext'
import { useParams } from 'react-router-dom'
export default function CartPage() {
    const API_URL = process.env.REACT_APP_MAIL_API_URL
    const { cartItems, setCartItems, copyCartItems } = useContext(CartContext)  // Access cartItems from context
    const [socket, setSocket] = useState(null)
    const [alert, setAlert] = useState(null)
    const [disabled, setDisabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const { tableNumber, setTableNumber } = useContext(TableNumberContext)
    const { tableNo } = useParams()

    useEffect(() => {
        setTableNumber(tableNo);
    }, [tableNumber, setTableNumber]);
    useEffect(() => {
        const ws = new WebSocket(process.env.REACT_APP_SOCKET_API_URL)
        setSocket(ws)

        return () => {
            ws.close()
        }
    }, [])
    useEffect(() => {
        setTimeout(() => {
            setAlert(null)
        }, 5000)
    }, [alert])
    const handleOrder = async () => {
        try {
            setLoading(true)
            setDisabled(true)
            const customerResponse = await fetch(`${API_URL}/getCustomer`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: "include"
            })
            const customerJson = await customerResponse.json()
            if (customerJson.status !== 'success') {
                throw new Error(customerJson.message)
            }
            let processedItems = copyCartItems()
            for (let item of processedItems) {
                item.cost *= 0.13
            }
            if (socket) {
                socket.send(JSON.stringify({ type: 'order', tableNo: tableNumber, custName: customerJson.customer.custName, items: cartItems }))
            }
            const response = await fetch(`${API_URL}/send-order-confirmation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: "include",
                body: JSON.stringify({ items: cartItems }),
            })
            const result = await response.json()
            setAlert({ message: result.message, type: result.status });
            if (result.status === 'success') {
                setCartItems([])
            }
        } catch (error) {
            console.error('Error:', error)
            setAlert({ message: error.message, type: "Error" });
        }
        setDisabled(false)
        setLoading(false);
    }

    const handleDecreaseQuantity = (itemId) => {
        const updatedCart = []
        for (let item of cartItems) {
            if (item.item_id === itemId) {
                item.quantity -= 1
            }
            if (item.quantity > 0) {
                updatedCart.push(item)
            }
        }
        setCartItems(updatedCart);
    };

    return (
        <div className="container mx-auto p-4">
            {loading && <Spinner />}
            {alert && <Alert message={alert.message} type={alert.type} />}
            {!loading && (<>
                <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
                {cartItems.length === 0 ? (
                    <p>Your cart is empty.</p>
                ) : (
                    <>
                        <ul className="mb-4">
                            {cartItems.map((item) => (
                                <li key={item.item_id} className="flex justify-between items-center mb-2">
                                    <p><span>
                                        {item.item_name} x {item.quantity}
                                    </span>
                                        <span> </span><span>${(item.cost * item.quantity).toFixed(2)}</span></p>
                                    <button
                                        onClick={() => handleDecreaseQuantity(item.item_id)}
                                        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
                                    >
                                        <Minus color={"white"} size={24} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <div className="text-xl font-bold mb-4">
                            Total: $
                            {cartItems
                                .reduce((total, item) => total + item.cost * item.quantity, 0)
                                .toFixed(2)}
                        </div>
                        <button
                            onClick={handleOrder}
                            className={disabled ? "bg-orange-300 text-white px-4 py-2 rounded" : "bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"} disabled={disabled}
                        >
                            Place Order
                        </button>
                    </>
                )}
            </>)}
        </div>
    )
}
