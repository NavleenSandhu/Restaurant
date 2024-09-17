import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import MenuPage from './pages/MenuPage'
import SignUpPage from './pages/SignUpPage'
import CartPage from './pages/CartPage'
import React from 'react'

export default function App() {
  return (
    <Router>
      <div className="bg-white-400 min-h-screen">
        <Header />
        <Routes>
          <Route path="/:tableNo/" element={<MenuPage />} />
          <Route path="/:tableNo/sign-in" element={<SignUpPage />} />
          <Route path="/:tableNo/cart" element={<CartPage />} />
        </Routes>
      </div>
    </Router>
  )
}