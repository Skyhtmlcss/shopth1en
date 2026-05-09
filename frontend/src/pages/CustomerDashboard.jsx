import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getMyOrders } from '../services/api'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800'
}

const statusLabels = {
  pending: 'Chờ xử lý',
  processing: 'Đang cày',
  completed: 'Hoàn thành'
}

function CustomerDashboard() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const customerName = localStorage.getItem('customerName') || 'Khách'

  useEffect(() => {
    const token = localStorage.getItem('customerToken')
    if (!token) {
      navigate('/login')
      return
    }
    fetchOrders()
  }, [navigate])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await getMyOrders()
      setOrders(res.data)
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('customerToken')
        localStorage.removeItem('customerEmail')
        localStorage.removeItem('customerName')
        navigate('/login')
      } else {
        setError('Tải đơn hàng thất bại')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('customerToken')
    localStorage.removeItem('customerEmail')
    localStorage.removeItem('customerName')
    navigate('/login')
  }

  const formatPrice = (price) => price.toLocaleString('vi-VN')
  const formatDate = (dateStr) => new Date(dateStr).toLocaleString()

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Đơn hàng của tôi</h1>
            <p className="text-sm text-gray-500">Theo dõi trạng thái dịch vụ</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Trang chủ
            </Link>
            <span className="text-sm text-gray-600 hidden sm:inline">Xin chào, <strong>{customerName}</strong></span>
            <Link
              to="/"
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Đặt hàng mới
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>
        )}

        {loading ? (
          <div className="text-center text-gray-500 py-8">Đang tải đơn hàng...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào.</p>
            <Link
              to="/"
              className="inline-block bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded-md transition-colors"
            >
              Đặt hàng
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </div>

                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Dịch vụ đã chọn:</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {order.selectedServices.map((s, i) => (
                      <li key={i}>{s.name} ({formatPrice(s.price)}đ)</li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-sm font-bold text-primary">Tổng cộng: {formatPrice(order.totalPrice)}đ</span>
                  {order.note && (
                    <span className="text-xs text-gray-400 truncate max-w-xs">Ghi chú: {order.note}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default CustomerDashboard
