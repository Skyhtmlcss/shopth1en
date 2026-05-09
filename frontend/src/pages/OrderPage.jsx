import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getServices, createOrder, createTopUp } from '../services/api'

const serviceRules = [
  { text: 'Tắt xác minh 2 bước bằng cách thay mail ngẫu nhiên (không verify)', important: true },
  { text: 'Không vào acc quá 3 lần khi admin đang cày', important: false },
  { text: 'ThờI gian hoàn tất dịch vụ từ 1-5 ngày', important: false },
  { text: 'Trong quá trình dịch vụ thực hiện sẽ có khoảng thờI gian off nick để ổn định mạng', important: false },
  { text: 'Vì phạm những điều trên thì shop sẽ dừng dịch vụ và không hoàn tiền', important: true },
  { text: 'Tất cả thông tin dịch vụ vui lòng check chi tiết và nhắn tin qua khiếu nạI', important: false },
]

function OrderPage() {
  const [services, setServices] = useState([])
  const [selectedServices, setSelectedServices] = useState([])
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    note: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showTopupModal, setShowTopupModal] = useState(false)
  const [showCardModal, setShowCardModal] = useState(false)
  const [cardForm, setCardForm] = useState({ network: 'viettel', amount: '', seri: '', code: '' })
  const [topupLoading, setTopupLoading] = useState(false)
  const [topupError, setTopupError] = useState('')
  const [topupSuccess, setTopupSuccess] = useState('')

  const customerToken = localStorage.getItem('customerToken')
  const customerName = localStorage.getItem('customerName') || 'Khách'
  
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await getServices()
        setServices(res.data)
      } catch (err) {
        setError('Failed to load services')
      }
    }
    fetchServices()
  }, [])

  const toggleService = (service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id)
      if (exists) {
        return prev.filter(s => s.id !== service.id)
      }
      return [...prev, service]
    })
  }

  const totalPrice = selectedServices.reduce((sum, s) => sum + (s.price || 0), 0)

  const formatPrice = (price) => {
    if (price == null) return '0'
    return price.toLocaleString('vi-VN')
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (selectedServices.length === 0) {
      setError('Vui lòng chọn ít nhất một dịch vụ')
      return
    }
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Tài khoản và mật khẩu là bắt buộc')
      return
    }

    setLoading(true)
    try {
      const payload = {
        selectedServices: selectedServices.map(s => ({ name: s.name, price: s.price })),
        totalPrice,
        username: formData.username,
        password: formData.password,
        note: formData.note
      }
      if (customerToken) {
        payload.customerId = JSON.parse(atob(customerToken.split('.')[1])).id
      }
      await createOrder(payload)
      setSuccess('Đặt hàng thành công!')
      setSelectedServices([])
      setFormData({ username: '', password: '', note: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Tạo đơn hàng thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleTopUpSubmit = async () => {
    setTopupError('')
    setTopupSuccess('')

    if (!cardForm.amount || !cardForm.seri.trim() || !cardForm.code.trim()) {
      setTopupError('Vui lòng điền đầy đủ thông tin thẻ')
      return
    }

    setTopupLoading(true)
    try {
      const payload = {
        network: cardForm.network,
        amount: cardForm.amount,
        seri: cardForm.seri,
        code: cardForm.code
      }
      if (customerToken) {
        const decoded = JSON.parse(atob(customerToken.split('.')[1]))
        payload.customerId = decoded.id
        payload.customerEmail = decoded.email || ''
      }
      await createTopUp(payload)
      setTopupSuccess('Yêu cầu nạp thẻ đã được gửi! Vui lòng chờ admin duyệt.')
      setCardForm({ network: 'viettel', amount: '', seri: '', code: '' })
      setTimeout(() => setShowCardModal(false), 1500)
    } catch (err) {
      setTopupError(err.response?.data?.message || 'Gửi yêu cầu nạp thẻ thất bại')
    } finally {
      setTopupLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Auth Header */}
        <div className="flex items-center justify-end gap-3 mb-4">
          <Link
            to="/"
            className="mr-auto px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            🏠 Trang chủ
          </Link>
          <button
            onClick={() => setShowTopupModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white rounded-md transition-colors"
            style={{ backgroundColor: '#ec4899' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267zM10 7.812v-2.68c-.945.327-1.805.943-2.293 1.782C7.078 7.266 7 7.528 7 7.812c0 .284.078.546.207.768.267.447.728.838 1.293 1.13V7.812zM10 10.188v2.68c.945-.327 1.805-.943 2.293-1.782.137-.23.207-.492.207-.776 0-.284-.078-.546-.207-.768-.267-.447-.728-.838-1.293-1.13v2.776z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.312-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.312.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
            Nạp tiền
          </button>
          {customerToken ? (
            <>
              <span className="text-sm text-gray-600">Xin chào, <strong>{customerName}</strong></span>
              <Link
                to="/my-orders"
                className="px-3 py-1.5 text-sm font-medium text-primary bg-red-50 rounded-md hover:bg-red-100 transition-colors"
              >
                Đơn hàng của tôi
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('customerToken')
                  localStorage.removeItem('customerEmail')
                  localStorage.removeItem('customerName')
                  window.location.reload()
                }}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover transition-colors"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold text-primary mb-2">CÀY THUÊ BLOX FRUIT</h1>
              <p className="text-sm text-gray-500 mb-6">Dịch vụ cày thuê chuyên nghiệp</p>

              {/* Step 1 */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Bước 1: Chọn gói</h2>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {Array.isArray(services) && services.map(service => (
                    <label
                      key={service.id}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedServices.find(s => s.id === service.id)
                          ? 'border-primary bg-red-50'
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        checked={!!selectedServices.find(s => s.id === service.id)}
                        onChange={() => toggleService(service)}
                      />
                      <span className="ml-3 flex-1 text-sm font-medium text-gray-700">{service.name}</span>
                      <span className="text-sm font-bold text-primary">{formatPrice(service.price)}đ</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-600">CẦN THANH TOÁN:</span>
                  <span className="text-xl font-bold text-primary">{formatPrice(totalPrice)} đ</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Bước 2: Điền thông tin</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tài khoản:</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Ví dụ: tên đăng nhập"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu:</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Ví dụ: 1234566"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú cày cho Admin:</label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="Ghi chú cho admin"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>
                )}
                {success && (
                  <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">{success}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang xử lý...' : 'Thanh toán'}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Chi tiết dịch vụ</h2>
              <ul className="space-y-3">
                {serviceRules.map((rule, index) => (
                  <li
                    key={index}
                    className={`flex items-start text-sm ${
                      rule.important ? 'text-primary font-semibold' : 'text-gray-600'
                    }`}
                  >
                    <span className="mr-2 mt-0.5">-</span>
                    <span>{rule.text}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-100">
                <p className="text-xs text-primary font-medium">
                  LƯU Ý TRƯỚC KHI CÀY THUÊ ĐỂ TRÁNH GIÁN ĐOẠN QUÁ TRÌNH CÀY
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
        {/* Top-up Method Modal */}
        {showTopupModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <h3 className="text-base font-semibold text-gray-800">Chọn phương thức nạp tiền</h3>
                <button onClick={() => setShowTopupModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
              </div>
              <div className="p-5 space-y-3">
                <button
                  onClick={() => { setShowTopupModal(false); setShowCardModal(true) }}
                  className="w-full flex items-center gap-4 p-4 border rounded-lg hover:border-primary hover:bg-red-50 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Nạp thẻ cào (Card)</div>
                    <div className="text-sm text-gray-500">Viettel, Vinaphone, Mobifone</div>
                  </div>
                </button>
                <button
                  className="w-full flex items-center gap-4 p-4 border rounded-lg hover:border-primary hover:bg-red-50 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Ví điện tử - Tự động</div>
                    <div className="text-sm text-gray-500">Ngân hàng (Bank Atm) - MoMo.</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Card Top-up Modal */}
        {showCardModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <h3 className="text-base font-semibold text-gray-800">Nạp thẻ cào</h3>
                <button onClick={() => setShowCardModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nhà mạng (Ưu tiên Viettel, Vinaphone)</label>
                  <div className="flex gap-2">
                    {['viettel', 'vinaphone', 'mobifone'].map((net) => (
                      <button
                        key={net}
                        onClick={() => setCardForm(prev => ({ ...prev, network: net }))}
                        className={`flex-1 py-2 px-3 border rounded-md text-sm font-medium capitalize transition-colors ${
                          cardForm.network === net
                            ? 'border-primary text-primary bg-red-50'
                            : 'border-gray-300 text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        {net}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mệnh giá</label>
                  <select
                    value={cardForm.amount}
                    onChange={(e) => setCardForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">-- Chọn đúng mệnh giá. Sai mất thẻ --</option>
                    <option value="10000">10,000đ</option>
                    <option value="20000">20,000đ</option>
                    <option value="50000">50,000đ</option>
                    <option value="100000">100,000đ</option>
                    <option value="200000">200,000đ</option>
                    <option value="500000">500,000đ</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seri</label>
                    <input
                      type="text"
                      value={cardForm.seri}
                      onChange={(e) => setCardForm(prev => ({ ...prev, seri: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã thẻ</label>
                    <input
                      type="text"
                      value={cardForm.code}
                      onChange={(e) => setCardForm(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                {topupError && (
                  <div className="p-2 bg-red-100 text-red-700 rounded-md text-sm">{topupError}</div>
                )}
                {topupSuccess && (
                  <div className="p-2 bg-green-100 text-green-700 rounded-md text-sm">{topupSuccess}</div>
                )}
                <button
                  onClick={handleTopUpSubmit}
                  disabled={topupLoading}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 px-4 rounded-md transition-colors disabled:opacity-50"
                >
                  {topupLoading ? 'Đang xử lý...' : 'Nạp tiền'}
                </button>
                <p className="text-xs text-gray-500">
                  Xem danh sách nạp thẻ <span className="text-primary cursor-pointer hover:underline">tại đây</span> (click)
                </p>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}

export default OrderPage
