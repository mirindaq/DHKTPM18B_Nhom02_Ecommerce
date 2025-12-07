import { useState, useMemo } from 'react'
import { productService } from '@/services/product.service'
import { orderService } from '@/services/order.service'
import { customerService } from '@/services/customer.service'
import { voucherService } from '@/services/voucher.service'
import { useQuery } from '@/hooks'
import type { Product, ProductVariantResponse } from '@/types/product.type'
import type { StaffOrderCreationRequest, PaymentMethod } from '@/types/order.type'
import type { VoucherAvailableResponse } from '@/types/voucher.type'
import { toast } from 'sonner'
import PaymentStatusModal from '@/components/staff/sell/PaymentStatusModal'
import ProductSearch from '@/components/staff/sell/ProductSearch'
import ProductSearchResults from '@/components/staff/sell/ProductSearchResults'
import Cart from '@/components/staff/sell/Cart'
import CustomerInfo from '@/components/staff/sell/CustomerInfo'
import VariantSelectionModal from '@/components/staff/sell/VariantSelectionModal'
import PaymentMethodModal from '@/components/staff/sell/PaymentMethodModal'
import AddCustomerModal from '@/components/staff/sell/AddCustomerModal'
import VoucherSelectionModal from '@/components/staff/sell/VoucherSelectionModal'

interface CartItem {
  productVariantId: number
  productName: string
  productImage: string
  variantInfo: string
  price: number
  oldPrice: number
  quantity: number
  stock: number
}

export default function StaffSell() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showVariantModal, setShowVariantModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerId, setCustomerId] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_ON_DELIVERY')
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false)
  const [customerFound, setCustomerFound] = useState<boolean | null>(null)
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false)

  const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(false)
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null)
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(null)
  const [showVoucherModal, setShowVoucherModal] = useState(false)

  const { data: availableVouchers = [], isLoading: isLoadingVouchers } = useQuery<VoucherAvailableResponse[]>(
    () => voucherService.getAvailableVouchersForCustomer(customerId!),
    {
      queryKey: ['vouchers', 'available', customerId?.toString() || ''],
      enabled: !!customerId,
    }
  )

  const currentSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [cart])

  const applicableVouchers = useMemo(() => {
    return availableVouchers.filter(v => currentSubtotal >= v.minOrderAmount)
  }, [availableVouchers, currentSubtotal])

  const bestVoucher = useMemo(() => {
    if (applicableVouchers.length === 0) return null
    
    let best: VoucherAvailableResponse | null = null
    let bestAmount = 0

    for (const voucher of applicableVouchers) {
      let discountAmount = currentSubtotal * (voucher.discount / 100)
      if (voucher.maxDiscountAmount && discountAmount > voucher.maxDiscountAmount) {
        discountAmount = voucher.maxDiscountAmount
      }
      if (discountAmount > bestAmount) {
        bestAmount = discountAmount
        best = voucher
      }
    }
    return best
  }, [applicableVouchers, currentSubtotal])

  const selectedVoucher = useMemo(() => {
    if (selectedVoucherId === -1) return null // Không dùng voucher
    if (selectedVoucherId && selectedVoucherId > 0) {
      return applicableVouchers.find(v => v.id === selectedVoucherId) || null
    }
    return bestVoucher // Mặc định dùng voucher tốt nhất
  }, [selectedVoucherId, applicableVouchers, bestVoucher])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    try {
      setIsSearching(true)
      const response = await productService.searchProductsWithElasticsearch(searchQuery, 1, 30)
      setSearchResults(response.data.data || [])
    } catch (error) {
      console.error('Error searching products:', error)
      toast.error('Không thể tìm kiếm sản phẩm')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchCustomer = async () => {
    if (!customerPhone.trim()) {
      toast.error('Vui lòng nhập số điện thoại')
      return
    }

    try {
      setIsSearchingCustomer(true)
      const response = await customerService.getCustomerByPhone(customerPhone.trim())
      
      if (response.data) {
        setCustomerId(response.data.id)
        setCustomerName(response.data.fullName || '')
        setCustomerEmail(response.data.email || '')
        setCustomerFound(true)
      } else {
        setCustomerId(null)
        setCustomerName('')
        setCustomerEmail('')
        setCustomerFound(false)
        setShowAddCustomerModal(true)
      }
    } catch (error) {
      console.error('Error searching customer:', error)
      setCustomerId(null)
      setCustomerName('')
      setCustomerEmail('')
      setCustomerFound(false)
      setShowAddCustomerModal(true)
    } finally {
      setIsSearchingCustomer(false)
    }
  }

  const handleCreateCustomer = async () => {
    if (!customerName.trim()) {
      toast.error('Vui lòng nhập tên khách hàng')
      return
    }

    if (!customerPhone.trim()) {
      toast.error('Vui lòng nhập số điện thoại')
      return
    }

    try {
      setIsCreatingCustomer(true)

      // Create customer with default password
      const customerData = {
        fullName: customerName,
        phone: customerPhone,
        email: customerEmail || `${customerPhone}@customer.com`,
        password: 'Customer@123',
        dateOfBirth: null,
        avatar: '',
        addresses: []
      }

      const response = await customerService.createCustomer(customerData)
      
      if (response.data) {
        setCustomerId(response.data.id)
        setCustomerFound(true)
        setShowAddCustomerModal(false)
      }
    } catch (error: any) {
      console.error('Error creating customer:', error)
      const errorMessage = error?.response?.data?.message || 'Không thể tạo khách hàng'
      toast.error(errorMessage)
    } finally {
      setIsCreatingCustomer(false)
    }
  }

  const handleProductClick = (product: Product) => {
    if (!product.variants || product.variants.length === 0) {
      toast.error('Sản phẩm không có biến thể')
      return
    }

    setSelectedProduct(product)
    setShowVariantModal(true)
  }

  const addVariantToCart = (variant: ProductVariantResponse) => {
    if (!selectedProduct) return

    const existingItem = cart.find(item => item.productVariantId === variant.id)
    
    if (existingItem) {
      updateQuantity(existingItem.productVariantId, existingItem.quantity + 1)
    } else {
      const variantInfo = variant.productVariantValues
        .map(pv => pv.variantValue.value)
        .join(' - ')

      const newItem: CartItem = {
        productVariantId: variant.id,
        productName: selectedProduct.name,
        productImage: selectedProduct.thumbnail,
        variantInfo: variantInfo || 'Mặc định',
        price: variant.price,
        oldPrice: variant.oldPrice,
        quantity: 1,
        stock: variant.stock
      }

      setCart([...cart, newItem])
    }

    setShowVariantModal(false)
    setSelectedProduct(null)
  }

  const updateQuantity = (productVariantId: number, newQuantity: number) => {
    const item = cart.find(item => item.productVariantId === productVariantId)
    
    if (!item) return

    if (newQuantity <= 0) {
      removeFromCart(productVariantId)
      return
    }

    if (newQuantity > item.stock) {
      toast.error(`Chỉ còn ${item.stock} sản phẩm trong kho`)
      return
    }

    setCart(cart.map(item => 
      item.productVariantId === productVariantId 
        ? { ...item, quantity: newQuantity }
        : item
    ))
  }

  const removeFromCart = (productVariantId: number) => {
    setCart(cart.filter(item => item.productVariantId !== productVariantId))
  }

  const clearCart = () => {
    setCart([])
    setCustomerPhone('')
    setCustomerName('')
    setCustomerEmail('')
    setCustomerId(null)
    setCustomerFound(null)
    setNote('')
    setSelectedVoucherId(null)
  }

  const voucherDiscount = useMemo(() => {
    if (!selectedVoucher) return 0
    let discount = currentSubtotal * (selectedVoucher.discount / 100)
    if (selectedVoucher.maxDiscountAmount && discount > selectedVoucher.maxDiscountAmount) {
      discount = selectedVoucher.maxDiscountAmount
    }
    return discount
  }, [selectedVoucher, currentSubtotal])

  const subtotal = currentSubtotal
  const total = subtotal - voucherDiscount

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const validateForm = () => {
    if (cart.length === 0) {
      toast.error('Vui lòng thêm sản phẩm vào giỏ hàng')
      return false
    }

    if (!customerId) {
      toast.error('Vui lòng tìm kiếm hoặc tạo khách hàng trước')
      return false
    }

    if (!customerName.trim()) {
      toast.error('Vui lòng nhập tên khách hàng')
      return false
    }

    if (!customerPhone.trim()) {
      toast.error('Vui lòng nhập số điện thoại khách hàng')
      return false
    }

    return true
  }

  const extractOrderIdFromUrl = (url: string): number | null => {
    try {
      const urlObj = new URL(url)
      const returnUrl = urlObj.searchParams.get('vnp_ReturnUrl')
      if (returnUrl) {
        const decodedReturnUrl = decodeURIComponent(returnUrl)
        const returnUrlParams = new URLSearchParams(decodedReturnUrl.split('?')[1])
        const orderId = returnUrlParams.get('orderId')
        if (orderId) {
          return parseInt(orderId)
        }
      }
    } catch (error) {
      console.error('Error extracting orderId from URL:', error)
    }
    return null
  }

  const handlePaymentComplete = () => {
    clearCart()
    setPaymentMethod('CASH_ON_DELIVERY')
    setShowPaymentStatusModal(false)
    setCurrentOrderId(null)
    setPaymentUrl(null)
    toast.success('Thanh toán thành công! Đã tạo đơn hàng mới.')
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setIsSubmitting(true)

      const orderData: StaffOrderCreationRequest = {
        customerId: customerId!,
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        note: note || undefined,
        voucherId: selectedVoucher?.id,
        paymentMethod,
        items: cart.map(item => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity
        }))
      }

      const response = await orderService.staffCreateOrder(orderData)

      if (response.data && typeof response.data === 'string' && response.data.includes('vnpayment')) {
        const paymentUrlStr = response.data
        const orderId = extractOrderIdFromUrl(paymentUrlStr)
        setPaymentUrl(paymentUrlStr)
        setCurrentOrderId(orderId)
        setShowPaymentModal(false)
        setShowPaymentStatusModal(true)
      } else {
        toast.success('Tạo đơn hàng thành công!')
        clearCart()
        setPaymentMethod('CASH_ON_DELIVERY')
        setShowPaymentModal(false)
      }
    } catch (error: any) {
      console.error('Error creating order:', error)
      const errorMessage = error?.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại!'
      toast.error(errorMessage)
      setShowPaymentModal(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Bán hàng tại cửa hàng</h1>
        <p className="text-gray-600">Tạo đơn hàng cho khách mua tại quầy</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <ProductSearch
            searchQuery={searchQuery}
            isSearching={isSearching}
            onSearchQueryChange={setSearchQuery}
            onSearch={handleSearch}
          />
          <ProductSearchResults
            products={searchResults}
            formatPrice={formatPrice}
            onProductClick={handleProductClick}
          />
        </div>

        <div className="space-y-6">
          <Cart
            cart={cart}
            customerFound={customerFound}
            isLoadingVouchers={isLoadingVouchers}
            applicableVouchers={applicableVouchers}
            selectedVoucher={selectedVoucher}
            selectedVoucherId={selectedVoucherId}
            voucherDiscount={voucherDiscount}
            subtotal={subtotal}
            total={total}
            formatPrice={formatPrice}
            onClearCart={clearCart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onOpenVoucherModal={() => setShowVoucherModal(true)}
          />

          {cart.length > 0 && (
            <CustomerInfo
              customerPhone={customerPhone}
              customerName={customerName}
              customerEmail={customerEmail}
              customerFound={customerFound}
              isSearchingCustomer={isSearchingCustomer}
              paymentMethod={paymentMethod}
              note={note}
              total={total}
              isSubmitting={isSubmitting}
              formatPrice={formatPrice}
              onPhoneChange={(phone) => {
                setCustomerPhone(phone)
                setCustomerFound(null)
              }}
              onSearchCustomer={handleSearchCustomer}
              onNameChange={setCustomerName}
              onEmailChange={setCustomerEmail}
              onNoteChange={setNote}
              onOpenAddCustomerModal={() => setShowAddCustomerModal(true)}
              onOpenPaymentModal={() => setShowPaymentModal(true)}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>

      <VariantSelectionModal
        open={showVariantModal}
        onOpenChange={setShowVariantModal}
        product={selectedProduct}
        cart={cart}
        formatPrice={formatPrice}
        onSelectVariant={addVariantToCart}
      />

      <PaymentMethodModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        currentMethod={paymentMethod}
        onSelectMethod={setPaymentMethod}
      />

      <AddCustomerModal
        open={showAddCustomerModal}
        onOpenChange={setShowAddCustomerModal}
        customerPhone={customerPhone}
        customerName={customerName}
        customerEmail={customerEmail}
        isCreating={isCreatingCustomer}
        onNameChange={setCustomerName}
        onEmailChange={setCustomerEmail}
        onSubmit={handleCreateCustomer}
        onCancel={() => {
          setShowAddCustomerModal(false)
          setCustomerName('')
          setCustomerEmail('')
        }}
      />

      <VoucherSelectionModal
        open={showVoucherModal}
        onOpenChange={setShowVoucherModal}
        vouchers={applicableVouchers}
        selectedVoucher={selectedVoucher}
        bestVoucher={bestVoucher}
        selectedVoucherId={selectedVoucherId}
        subtotal={currentSubtotal}
        formatPrice={formatPrice}
        onSelectVoucher={setSelectedVoucherId}
      />

      <PaymentStatusModal
        open={showPaymentStatusModal}
        onClose={() => {
          setShowPaymentStatusModal(false)
          setCurrentOrderId(null)
          setPaymentUrl(null)
        }}
        orderId={currentOrderId}
        paymentUrl={paymentUrl}
        totalAmount={total}
        formatPrice={formatPrice}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  )
}
