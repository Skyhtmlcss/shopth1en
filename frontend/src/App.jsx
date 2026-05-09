import { Routes, Route } from 'react-router-dom'
import OrderPage from './pages/OrderPage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import CustomerRegister from './pages/CustomerRegister'
import CustomerLogin from './pages/CustomerLogin'
import CustomerDashboard from './pages/CustomerDashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<OrderPage />} />
      <Route path="/register" element={<CustomerRegister />} />
      <Route path="/login" element={<CustomerLogin />} />
      <Route path="/my-orders" element={<CustomerDashboard />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  )
}

export default App
