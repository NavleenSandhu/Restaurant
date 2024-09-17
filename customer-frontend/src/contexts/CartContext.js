import React, { createContext, useState } from 'react'

// Create the Cart Context
export const CartContext = createContext()

// Cart Provider to wrap around components that need access to the cart
export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([])

    // Function to add an item to the cart
    const addToCart = (item) => {
        let previousItems = []
        for (let cartItem of cartItems) {
            previousItems.push(cartItem)
        }
        let itemToIncreaseQuantity = null
        for (let cartItem of previousItems) {
            if (cartItem.item_id === item.item_id) {
                cartItem.quantity += 1
                itemToIncreaseQuantity = cartItem
            }
        }
        if (!itemToIncreaseQuantity) {
            item.quantity = 1
            previousItems.push(item)
        }
        setCartItems(previousItems)
    }

    // Function to remove an item from the cart (if needed)
    const removeFromCart = (id) => {
        setCartItems(prevCartItems => prevCartItems.filter(item => item.id !== id))
    }
    const copyCartItems = () => {
        return cartItems.slice()
    }

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, setCartItems, copyCartItems }}>
            {children}
        </CartContext.Provider>
    )
}
