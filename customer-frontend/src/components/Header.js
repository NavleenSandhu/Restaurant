import { Link, useLocation, useParams } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import React, { useContext } from 'react'
import { TableNumberContext } from '../contexts/TableNumberContext'

export default function Header() {
    const location = useLocation()
    const { tableNumber } = useContext(TableNumberContext)
    return (
        <header className="bg-orange-500 p-4 flex justify-between items-center">
            <Link to={`/${tableNumber}/`}><h1 className="text-white text-2xl font-bold">My Restaurant</h1></Link>
            <div className="flex items-center space-x-4">
                <Link
                    to={location.pathname === `/${tableNumber}/` ? `/${tableNumber}/sign-in` : `/${tableNumber}/`}
                    className="bg-white text-orange-500 px-4 py-2 rounded-full hover:bg-orange-100 transition-colors"
                >
                    {location.pathname === `/${tableNumber}/` ? ("Sign In") : ("View Menu")}
                </Link>
                <Link to={`/${tableNumber}/cart`} className="text-white">
                    <ShoppingCart size={24} />
                </Link>
            </div>
        </header>
    )
}