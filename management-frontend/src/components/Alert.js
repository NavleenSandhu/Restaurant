import React from 'react'

export default function Alert({ message, type }) {
    let bgColor = 'bg-red-500'; // Error color
    if (type === 'success') {
        bgColor = 'bg-teal-500'; // Default to success
    }
    return (
        <div className={`mt-2 ${bgColor} text-sm text-white rounded-lg p-4`} role="alert" tabIndex="-1">
            {message}
        </div>
    )
}
