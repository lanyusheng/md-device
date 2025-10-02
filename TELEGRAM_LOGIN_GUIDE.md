# 🔷 Telegram Login Widget 集成指南

本指南说明如何使用项目中集成的官方 Telegram Login Widget 功能。

## ✅ 已完成的功能

### 1. 前端组件
- ✅ **TelegramLoginWidget** - 官方 Telegram Login Widget 组件
- ✅ **详细的授权参数打印** - 在浏览器控制台中详细显示所有授权回调参数
- ✅ **完整的错误处理** - 处理各种认证错误情况
- ✅ **响应式设计** - 适配不同屏幕尺寸

### 2. 后端 API
- ✅ **安全验证** - 使用官方算法验证 Telegram 签名
- ✅ **数据时效检查** - 确保认证数据在有效期内（1小时）
- ✅ **详细日志记录** - 服务器控制台显示完整的处理过程
- ✅ **错误处理** - 完善的错误响应机制

### 3. 登录流程
- ✅ **多种登录方式** - 支持邮箱、GitHub、Telegram Web App 和 Widget 登录
- ✅ **自动重定向** - 登录成功后自动跳转到仪表板
- ✅ **用户反馈** - 使用 toast 显示操作结果

## 🔧 使用前的配置

### 1. 环境变量配置
```bash
# 复制示例环境文件
cp .env.example .env.local

# 编辑 .env.local 文件，添加你的 Telegram Bot Token
TELEGRAM_BOT_TOKEN=你的机器人token
```

### 2. Telegram Bot 设置
1. 与 [@BotFather](https://t.me/BotFather) 对话创建机器人
2. 获取 Bot Token
3. 使用 `/setdomain` 命令设置域名：
   ```
   /setdomain
   选择你的机器人
   输入: localhost:3003 (开发环境)
   或: yourdomain.com (生产环境)
   ```

## 🚀 如何测试

### 1. 启动开发服务器
```bash
npm run dev
```

### 2. 访问登录页面
打开 http://localhost:3003，会自动重定向到登录页面

### 3. 使用 Telegram Login Widget
1. 点击页面上的官方 Telegram 登录按钮
2. 在弹出的窗口中授权登录
3. 查看浏览器控制台的详细日志输出
4. 查看服务器控制台的处理日志

## 📊 授权回调参数详情

### 前端 Widget 回调参数
在浏览器控制台中，你会看到以下格式的详细日志：

```
🔐 Telegram 授权回调参数详情
📋 完整用户数据: {object}
🆔 用户 ID: 123456789
👤 用户名字: John
👤 用户姓氏: Doe
📧 用户名: @johndoe
🖼️ 头像 URL: https://t.me/i/userpic/...
⏰ 授权时间: 2024-03-20 15:30:45
🔐 验证哈希: abc123def456...
```

### 后端 API 处理日志
在服务器控制台中，你会看到：

```
🔷 Telegram Widget API 收到请求
📊 请求体完整数据: {详细的 JSON 数据}
👤 用户数据: {用户信息}
⏰ 服务器处理时间: 2024-03-20T08:30:45.123Z

🔐 开始验证 Telegram 签名...
🔐 开始验证数据: {验证数据}
🔤 构建的验证字符串: auth_date=1234567890\nfirst_name=John...
🔑 密钥信息: {密钥长度信息}
🧮 哈希比较: {哈希对比结果}
🔐 签名验证结果: true

✅ Telegram Widget 认证成功
👤 用户信息: {标准化的用户信息}
🎫 生成的令牌长度: 248
⏰ 令牌过期时间: 2024-03-21 15:30:45
```

## 🔍 关键代码位置

### 前端组件
- **Widget 组件**: `src/features/auth/components/telegram-login-widget.tsx`
- **认证表单**: `src/features/auth/components/user-auth-form.tsx`
- **登录页面**: `src/features/auth/components/sign-in-view.tsx`

### 后端 API
- **Widget API**: `src/app/api/auth/telegram-widget/route.ts`
- **Web App API**: `src/app/api/auth/telegram/route.ts`

### 重要函数
- **前端回调处理**: `handleTelegramWidgetAuth()`
- **后端签名验证**: `verifyTelegramLoginWidget()`
- **数据时效检查**: `isDataFresh()`

## 🛡️ 安全特性

1. **签名验证** - 使用官方 HMAC-SHA256 算法验证数据完整性
2. **时效检查** - 认证数据仅在 1 小时内有效
3. **字段完整性** - 验证所有必需字段的存在
4. **错误处理** - 防止各种攻击和异常情况
5. **详细日志** - 便于调试和安全审计

## 🔄 登录流程图

```
用户点击 Telegram 按钮
         ↓
    弹出 Telegram 授权窗口
         ↓
    用户在 Telegram 中确认授权
         ↓
    Widget 回调前端 onAuth 函数
         ↓
    前端发送用户数据到 /api/auth/telegram-widget
         ↓
    后端验证签名和数据有效性
         ↓
    返回认证结果和用户令牌
         ↓
    前端重定向到仪表板
```

## 🎯 生产环境部署

1. **更新环境变量** - 在生产环境中设置正确的 `TELEGRAM_BOT_TOKEN`
2. **配置域名** - 在 @BotFather 中设置正确的生产域名
3. **安全令牌** - 替换示例 JWT 实现为真实的安全令牌系统
4. **数据库集成** - 将用户信息保存到数据库
5. **会话管理** - 实现真实的用户会话系统

## 📝 自定义配置

### Widget 样式配置
```tsx
<TelegramLoginWidget
  botName="你的机器人名"
  buttonSize="large"        // large | medium | small
  cornerRadius={20}         // 圆角半径
  requestAccess={true}      // 是否请求发消息权限
  usePic={true}            // 是否显示头像
  onAuth={handleAuth}      // 授权回调函数
/>
```

### API 响应格式
```json
{
  "success": true,
  "user": {
    "telegramId": "123456789",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "photoUrl": "https://...",
    "authDate": 1234567890
  },
  "token": "base64_encoded_token",
  "message": "Telegram 登录成功",
  "timestamp": "2024-03-20T08:30:45.123Z"
}
```

现在你的 Telegram Login Widget 已经完全集成并可以使用了！🎉