import React, { useContext, useEffect } from 'react'
import { useState } from 'react'
import Alert from '../components/Alert'
import Spinner from '../components/Spinner'
import { useParams } from 'react-router-dom'
import { TableNumberContext } from '../contexts/TableNumberContext'
export default function SignUpPage() {
    const API_URL = process.env.REACT_APP_MAIL_API_URL
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [alert, setAlert] = useState(null);
    const { tableNo } = useParams()
    const { tableNumber, setTableNumber } = useContext(TableNumberContext)


    useEffect(() => {
        setTableNumber(tableNo);
    }, [tableNumber, setTableNumber]);
    const [formData, setFormData] = useState({
        email: '',
        custName: '',
        dateOfBirth: '',
    })


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }
    useEffect(() => {
        setTimeout(() => {
            setAlert(null)
        }, 5000)
    }, [alert])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setDisabled(true)
        try {
            // Send data to API
            const response = await fetch(`${API_URL}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: "include",
                body: JSON.stringify(formData),
            })
            if (response) {
                const result = await response.json();
                if (result.status === 'success') {
                    setAlert({ message: result.message, type: 'success' });
                    setFormData({ email: '', custName: '', dateOfBirth: '' })
                } else {
                    setAlert({ message: result.message, type: 'error' });
                }
            }
        } catch (error) {
            console.error('Error:', error)
            setAlert({ message: 'An error occurred. Please try again.', type: 'error' });
        }
        setDisabled(false)
        setLoading(false);
    }

    return (
        <div className="container mx-auto p-4">
            {loading && <Spinner />}
            {alert && <Alert message={alert.message} type={alert.type} />}
            {!loading && (<><h2 className="text-2xl text-center font-bold mb-4">Sign In</h2>
                <h3 className="text-l text-center font-bold mb-4">If you do not have an account you will be automatically signed up</h3>
                <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                    <div className="mb-4">
                        <label htmlFor="email" className="block mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="custName" className="block mb-2">
                            Name
                        </label>
                        <input
                            type="text"
                            id="custName"
                            name="custName"
                            value={formData.custName}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="dateOfBirth" className="block mb-2">
                            Date of Birth
                        </label>
                        <input
                            type="date"
                            id="dateOfBirth"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <button
                        type="submit"
                        className={disabled ? "bg-orange-300 text-white px-4 py-2 rounded" : "bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"} disabled={disabled}
                    >
                        Sign In
                    </button>
                </form>
            </>)}
        </div>
    )
}