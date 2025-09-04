import  { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Settings as SettingsIcon, 
  Store, 
  Mail, 
  Shield, 
  Bell, 
  Palette,
  Save,
} from "lucide-react"

export default function Settings() {
  const [generalSettings, setGeneralSettings] = useState({
    storeName: "EcommerceWWW",
    storeDescription: "Cửa hàng điện tử hàng đầu Việt Nam",
    storeEmail: "contact@ecommercewww.com",
    storePhone: "1900-xxxx",
    storeAddress: "123 Đường ABC, Quận 1, TP.HCM",
    timezone: "Asia/Ho_Chi_Minh",
    currency: "VND",
    language: "vi"
  })

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUsername: "noreply@ecommercewww.com",
    smtpPassword: "",
    fromEmail: "noreply@ecommercewww.com",
    fromName: "EcommerceWWW",
    orderConfirmation: true,
    shippingNotification: true,
    marketingEmails: false
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: "24",
    passwordMinLength: "8",
    requireStrongPassword: true,
    loginAttempts: "5",
    lockoutDuration: "30"
  })

  const [notificationSettings, setNotificationSettings] = useState({
    newOrders: true,
    lowStock: true,
    customerReviews: false,
    systemUpdates: true,
    securityAlerts: true,
    emailNotifications: true,
    pushNotifications: false
  })

  const handleGeneralChange = (field: string, value: string) => {
    setGeneralSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleEmailChange = (field: string, value: string | boolean) => {
    setEmailSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSecurityChange = (field: string, value: string | boolean) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }))
  }

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    // Xử lý lưu cài đặt
    console.log("Lưu cài đặt:", {
      generalSettings,
      emailSettings,
      securitySettings,
      notificationSettings
    })
  }

  return (
    <div className="space-y-3 p-2">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Cài đặt</h1>
        <p className="text-lg text-gray-600">
          Quản lý cấu hình hệ thống và tùy chọn
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="general" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
            <Store className="h-4 w-4" />
            Chung
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
            <Shield className="h-4 w-4" />
            Bảo mật
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
            <Bell className="h-4 w-4" />
            Thông báo
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
            <Palette className="h-4 w-4" />
            Giao diện
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Thông tin cửa hàng</CardTitle>
              <CardDescription className="text-gray-600">
                Cấu hình thông tin cơ bản của cửa hàng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName" className="font-medium text-gray-700">Tên cửa hàng</Label>
                  <Input
                    id="storeName"
                    value={generalSettings.storeName}
                    onChange={(e) => handleGeneralChange("storeName", e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeEmail" className="font-medium text-gray-700">Email liên hệ</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    value={generalSettings.storeEmail}
                    onChange={(e) => handleGeneralChange("storeEmail", e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeDescription" className="font-medium text-gray-700">Mô tả cửa hàng</Label>
                <Textarea
                  id="storeDescription"
                  value={generalSettings.storeDescription}
                  onChange={(e) => handleGeneralChange("storeDescription", e.target.value)}
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storePhone" className="font-medium text-gray-700">Số điện thoại</Label>
                  <Input
                    id="storePhone"
                    value={generalSettings.storePhone}
                    onChange={(e) => handleGeneralChange("storePhone", e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="font-medium text-gray-700">Múi giờ</Label>
                  <Select value={generalSettings.timezone} onValueChange={(value) => handleGeneralChange("timezone", value)}>
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</SelectItem>
                      <SelectItem value="Asia/Bangkok">Asia/Bangkok (GMT+7)</SelectItem>
                      <SelectItem value="Asia/Singapore">Asia/Singapore (GMT+8)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency" className="font-medium text-gray-700">Tiền tệ</Label>
                  <Select value={generalSettings.currency} onValueChange={(value) => handleGeneralChange("currency", value)}>
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VND">VND (₫)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language" className="font-medium text-gray-700">Ngôn ngữ</Label>
                  <Select value={generalSettings.language} onValueChange={(value) => handleGeneralChange("language", value)}>
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeAddress" className="font-medium text-gray-700">Địa chỉ cửa hàng</Label>
                <Textarea
                  id="storeAddress"
                  value={generalSettings.storeAddress}
                  onChange={(e) => handleGeneralChange("storeAddress", e.target.value)}
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Cấu hình SMTP</CardTitle>
              <CardDescription className="text-gray-600">
                Thiết lập máy chủ email để gửi thông báo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost" className="font-medium text-gray-700">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={emailSettings.smtpHost}
                    onChange={(e) => handleEmailChange("smtpHost", e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort" className="font-medium text-gray-700">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={emailSettings.smtpPort}
                    onChange={(e) => handleEmailChange("smtpPort", e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername" className="font-medium text-gray-700">Tên đăng nhập</Label>
                  <Input
                    id="smtpUsername"
                    value={emailSettings.smtpUsername}
                    onChange={(e) => handleEmailChange("smtpUsername", e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword" className="font-medium text-gray-700">Mật khẩu</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={(e) => handleEmailChange("smtpPassword", e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromEmail" className="font-medium text-gray-700">Email gửi từ</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) => handleEmailChange("fromEmail", e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromName" className="font-medium text-gray-700">Tên người gửi</Label>
                  <Input
                    id="fromName"
                    value={emailSettings.fromName}
                    onChange={(e) => handleEmailChange("fromName", e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Loại email thông báo</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="orderConfirmation" className="font-medium text-gray-700">Xác nhận đơn hàng</Label>
                    <Switch
                      id="orderConfirmation"
                      checked={emailSettings.orderConfirmation}
                      onCheckedChange={(checked) => handleEmailChange("orderConfirmation", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="shippingNotification" className="font-medium text-gray-700">Thông báo vận chuyển</Label>
                    <Switch
                      id="shippingNotification"
                      checked={emailSettings.shippingNotification}
                      onCheckedChange={(checked) => handleEmailChange("shippingNotification", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="marketingEmails" className="font-medium text-gray-700">Email marketing</Label>
                    <Switch
                      id="marketingEmails"
                      checked={emailSettings.marketingEmails}
                      onCheckedChange={(checked) => handleEmailChange("marketingEmails", checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Bảo mật tài khoản</CardTitle>
              <CardDescription className="text-gray-600">
                Thiết lập các tùy chọn bảo mật cho hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="twoFactorAuth" className="font-medium text-gray-700">Xác thực 2 yếu tố</Label>
                <Switch
                  id="twoFactorAuth"
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={(checked) => handleSecurityChange("twoFactorAuth", checked)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout" className="font-medium text-gray-700">Thời gian phiên làm việc (giờ)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => handleSecurityChange("sessionTimeout", e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength" className="font-medium text-gray-700">Độ dài mật khẩu tối thiểu</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={securitySettings.passwordMinLength}
                    onChange={(e) => handleSecurityChange("passwordMinLength", e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="requireStrongPassword" className="font-medium text-gray-700">Yêu cầu mật khẩu mạnh</Label>
                <Switch
                  id="requireStrongPassword"
                  checked={securitySettings.requireStrongPassword}
                  onCheckedChange={(checked) => handleSecurityChange("requireStrongPassword", checked)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loginAttempts" className="font-medium text-gray-700">Số lần đăng nhập tối đa</Label>
                  <Input
                    id="loginAttempts"
                    type="number"
                    value={securitySettings.loginAttempts}
                    onChange={(e) => handleSecurityChange("loginAttempts", e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lockoutDuration" className="font-medium text-gray-700">Thời gian khóa (phút)</Label>
                  <Input
                    id="lockoutDuration"
                    type="number"
                    value={securitySettings.lockoutDuration}
                    onChange={(e) => handleSecurityChange("lockoutDuration", e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Thông báo hệ thống</CardTitle>
              <CardDescription className="text-gray-600">
                Quản lý các loại thông báo và cách thức nhận
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Loại thông báo</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="newOrders" className="font-medium text-gray-700">Đơn hàng mới</Label>
                    <Switch
                      id="newOrders"
                      checked={notificationSettings.newOrders}
                      onCheckedChange={(checked) => handleNotificationChange("newOrders", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="lowStock" className="font-medium text-gray-700">Hàng tồn kho thấp</Label>
                    <Switch
                      id="lowStock"
                      checked={notificationSettings.lowStock}
                      onCheckedChange={(checked) => handleNotificationChange("lowStock", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="customerReviews" className="font-medium text-gray-700">Đánh giá khách hàng</Label>
                    <Switch
                      id="customerReviews"
                      checked={notificationSettings.customerReviews}
                      onCheckedChange={(checked) => handleNotificationChange("customerReviews", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="systemUpdates" className="font-medium text-gray-700">Cập nhật hệ thống</Label>
                    <Switch
                      id="systemUpdates"
                      checked={notificationSettings.systemUpdates}
                      onCheckedChange={(checked) => handleNotificationChange("systemUpdates", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="securityAlerts" className="font-medium text-gray-700">Cảnh báo bảo mật</Label>
                    <Switch
                      id="securityAlerts"
                      checked={notificationSettings.securityAlerts}
                      onCheckedChange={(checked) => handleNotificationChange("securityAlerts", checked)}
                    />
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Phương thức nhận</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailNotifications" className="font-medium text-gray-700">Thông báo qua email</Label>
                    <Switch
                      id="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pushNotifications" className="font-medium text-gray-700">Thông báo đẩy</Label>
                    <Switch
                      id="pushNotifications"
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => handleNotificationChange("pushNotifications", checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Tùy chỉnh giao diện</CardTitle>
              <CardDescription className="text-gray-600">
                Cấu hình giao diện và chủ đề
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme" className="font-medium text-gray-700">Chủ đề</Label>
                  <Select defaultValue="light">
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Chọn chủ đề" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Sáng</SelectItem>
                      <SelectItem value="dark">Tối</SelectItem>
                      <SelectItem value="auto">Tự động</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="colorScheme" className="font-medium text-gray-700">Bảng màu</Label>
                  <Select defaultValue="blue">
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Chọn bảng màu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Xanh dương</SelectItem>
                      <SelectItem value="green">Xanh lá</SelectItem>
                      <SelectItem value="purple">Tím</SelectItem>
                      <SelectItem value="orange">Cam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo" className="font-medium text-gray-700">Logo cửa hàng</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="favicon" className="font-medium text-gray-700">Favicon</Label>
                <Input
                  id="favicon"
                  type="file"
                  accept="image/*"
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2">
          <Save className="h-4 w-4" />
          Lưu cài đặt
        </Button>
      </div>
    </div>
  )
}
