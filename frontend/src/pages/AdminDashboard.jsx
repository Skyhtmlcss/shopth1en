import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getOrders, updateOrderStatus, deleteOrder, getTopUps, updateTopUpStatus, deleteTopUp } from '../services/api'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800'
}

const topUpStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
}

const topUpStatusLabels = {
  pending: 'Chờ duyệt',
  accepted: 'Đã duyệt',
  rejected: 'Từ chối'
}

function AdminDashboard() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [topups, setTopups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [topupActionId, setTopupActionId] = useState(null)
  const [deletingTopupId, setDeletingTopupId] = useState(null)

  const adminUser = localStorage.getItem('adminUser') || 'Quản trị viên'

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/admin')
      return
    }
    fetchOrders()
    fetchTopUps()
  }, [navigate])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await getOrders()
      setOrders(res.data)
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('adminUser')
        navigate('/admin')
      } else {
        setError('Tải đơn hàng thất bại')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchTopUps = async () => {
    try {
      const res = await getTopUps()
      setTopups(res.data)
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('adminUser')
        navigate('/admin')
      } else {
        setError('Tải yêu cầu nạp thẻ thất bại')
      }
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      await updateOrderStatus(orderId, newStatus)
      setOrders(prev =>
        prev.map(o => (o._id === orderId ? { ...o, status: newStatus } : o))
      )
    } catch (err) {
      setError('Cập nhật trạng thái thất bại')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (orderId) => {
    if (!confirm('Bạn có chắc muốn xóa đơn hàng này?')) return
    setDeletingId(orderId)
    try {
      await deleteOrder(orderId)
      setOrders(prev => prev.filter(o => o._id !== orderId))
    } catch (err) {
      setError('Xóa đơn hàng thất bại')
    } finally {
      setDeletingId(null)
    }
  }

  const handleTopUpAction = async (topupId, status) => {
    const actionLabel = status === 'accepted' ? 'duyệt' : 'từ chối'
    if (!confirm(`Bạn có chắc muốn ${actionLabel} yêu cầu nạp thẻ này?`)) return
    setTopupActionId(topupId)
    try {
      await updateTopUpStatus(topupId, status)
      setTopups(prev =>
        prev.map(t => (t._id === topupId ? { ...t, status } : t))
      )
    } catch (err) {
      setError('Cập nhật trạng thái nạp thẻ thất bại')
    } finally {
      setTopupActionId(null)
    }
  }

  const handleDeleteTopUp = async (topupId) => {
    if (!confirm('Bạn có chắc muốn xóa yêu cầu nạp thẻ này?')) return
    setDeletingTopupId(topupId)
    try {
      await deleteTopUp(topupId)
      setTopups(prev => prev.filter(t => t._id !== topupId))
    } catch (err) {
      setError('Xóa yêu cầu nạp thẻ thất bại')
    } finally {
      setDeletingTopupId(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('adminUser')
    navigate('/admin')
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString()
  }

  const formatPrice = (price) => {
    if (price == null) return '0'
    return price.toLocaleString('vi-VN')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Bảng điều khiển</h1>
            <p className="text-sm text-gray-500">Quản lý đơn hàng</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Trang chủ
            </Link>
            <span className="text-sm text-gray-600">Xin chào, <strong>{adminUser}</strong></span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>
        )}

        {/* Orders Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Đơn hàng</h2>
            <p className="text-sm text-gray-500">{orders.length} đơn hàng</p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Đang tải...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Không có đơn hàng</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tài khoản</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dịch vụ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghi chú</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ThờI gian</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map(order => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.username}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <ul className="list-disc list-inside">
                          {order.selectedServices.map((s, i) => (
                            <li key={i}>{s.name} ({formatPrice(s.price)}đ)</li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                        {formatPrice(order.totalPrice)}đ
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {order.note || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={updatingId === order._id}
                          className={`text-xs font-semibold px-3 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary ${statusColors[order.status]}`}
                        >
                          <option value="pending">Chờ xử lý</option>
                          <option value="processing">Đang cày</option>
                          <option value="completed">Hoàn thành</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(order._id)}
                          disabled={deletingId === order._id}
                          className="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
                        >
                          {deletingId === order._id ? 'Đang xóa...' : 'Xóa'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top-ups Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Yêu cầu nạp thẻ</h2>
            <p className="text-sm text-gray-500">{topups.length} yêu cầu</p>
          </div>

          {topups.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Không có yêu cầu nạp thẻ</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhà mạng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mệnh giá</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seri</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã thẻ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ThờI gian</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topups.map(topup => (
                    <tr key={topup._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {topup.customerEmail || <span className="text-gray-400 italic">Khách</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                        {topup.network}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                        {formatPrice(topup.amount)}đ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                        {topup.seri}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                        {topup.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${topUpStatusColors[topup.status]}`}>
                          {topUpStatusLabels[topup.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(topup.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {topup.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleTopUpAction(topup._id, 'accepted')}
                                disabled={topupActionId === topup._id}
                                className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                              >
                                Duyệt
                              </button>
                              <button
                                onClick={() => handleTopUpAction(topup._id, 'rejected')}
                                disabled={topupActionId === topup._id}
                                className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                              >
                                Từ chối
                              </button>
                            </div>
                          )}
                          <button
                            onClick={() => handleDeleteTopUp(topup._id)}
                            disabled={deletingTopupId === topup._id}
                            className="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
                          >
                            {deletingTopupId === topup._id ? 'Đang xóa...' : 'Xóa'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
