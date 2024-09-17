import { useContext, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import React from 'react'
import { CartContext } from '../contexts/CartContext'
import { TableNumberContext } from '../contexts/TableNumberContext'

import Alert from '../components/Alert'
import { useParams } from 'react-router-dom'
export default function MenuPage() {
    const API_URL = process.env.REACT_APP_MENU_API_URL
    const { addToCart } = useContext(CartContext)
    const { tableNumber, setTableNumber } = useContext(TableNumberContext)
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All')
    const [filteredItems, setFilteredItems] = useState([]);
    const [alert, setAlert] = useState(null);
    const { tableNo } = useParams()

    useEffect(() => {
        setTableNumber(tableNo);
    }, [tableNumber, setTableNumber]);

    useEffect(() => {
        const fetchItemsAndCategories = async () => {
            try {
                const itemsResponse = await fetch(`${API_URL}/items`)
                const itemsData = await itemsResponse.json()
                itemsData.forEach(item => {
                    item.quantity = 0
                });
                setItems(itemsData)
                setFilteredItems(itemsData)
                const categoriesResponse = await fetch(`${API_URL}/categories`)
                const categoriesData = await categoriesResponse.json()
                setCategories(categoriesData)
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }
        fetchItemsAndCategories()
    }, [])
    useEffect(() => {
        if (activeCategory === 'All') {
            setFilteredItems(items)
        } else {
            setFilteredItems(items.filter(item => item.category_id === categoryIdMap[activeCategory]))
        }
    }, [activeCategory, items])
    useEffect(() => {
        setTimeout(() => {
            setAlert(null)
        }, 5000)
    }, [alert])

    const categoryIdMap = categories.reduce((map, category) => {
        map[category.category_name] = category.category_id;
        return map;
    }, {});

    const addItemToCart = (item) => {
        addToCart(item)
        setAlert({ message: "Item added to cart.", type: "success" })
    }


    return (
        <div className="container mx-auto p-4">
            {alert && <Alert message={alert.message} type={alert.type} />}
            <div className="overflow-x-auto">
                <div className="flex space-x-4 mb-4">
                    <button
                        key="All"
                        className={`px-4 py-2 rounded-full ${activeCategory === 'All'
                            ? 'bg-orange-500 text-white'
                            : 'bg-white text-orange-500'
                            }`}
                        onClick={() => setActiveCategory("All")}
                    >
                        All
                    </button>
                    {categories.map(category => (
                        <button key={category.category_id}
                            className={`px-4 py-2 rounded-full ${activeCategory === category.category_name
                                ? 'bg-orange-500 text-white'
                                : 'bg-white text-orange-500'
                                }`} onClick={() => setActiveCategory(category.category_name)}>
                            {category.category_name}
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.length === 0 ? (<p>No items available in this category.</p>) : (

                    filteredItems.map((item) => (

                        <div key={item.item_id} className="bg-white rounded-lg shadow-md p-4 flex">
                            <img
                                src={`${API_URL}/uploads/${item.item_id}`}
                                alt={item.item_name}
                                className="w-24 h-24 object-cover rounded-md mr-4"
                            />
                            <div className="flex-grow">
                                <h3 className="text-lg font-semibold">{item.item_name}</h3>
                                <p className="text-gray-600">${parseFloat(item.cost).toFixed(2)}</p>
                                <p className="text-sm text-gray-500">{item.item_description}</p>
                            </div>
                            <button className="self-center bg-orange-500 text-white rounded-full p-2 hover:bg-orange-600 transition-colors" onClick={() => addItemToCart(item)}>
                                <Plus size={24} />
                            </button>
                        </div>
                    ))

                )}
            </div>
        </div>
    )
}