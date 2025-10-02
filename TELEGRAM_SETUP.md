# Telegram Web App 登录集成指南

本项目已集成 Telegram Web App 登录功能，用户可以通过 Telegram 客户端直接登录应用。

## 🚀 功能特性

- ✅ 安全的 Telegram Web App 认证
- ✅ 数据签名验证
- ✅ 触觉反馈支持
- ✅ 响应式设计
- ✅ 错误处理和用户提示
- ✅ 与现有认证系统集成

## 📋 设置步骤

### 1. 创建 Telegram Bot

1. 打开 Telegram，搜索 `@BotFather`
2. 发送 `/start` 命令
3. 发送 `/newbot` 创建新的 bot
4. 设置 bot 名称和用户名
5. 获取 Bot Token

### 2. 配置 Web App

1. 向 @BotFather 发送 `/mybots`
2. 选择你的 bot
3. 选择 "Bot Settings" > "Menu Button"
4. 选择 "Configure Menu Button"
5. 设置按钮文本和 Web App URL

```
按钮文本: 打开应用
Web App URL: https://yourdomain.com
```

### 3. 环境变量配置

在项目根目录创建 `.env` 文件，添加以下配置：

```env
TELEGRAM_BOT_TOKEN=你的bot_token
```

### 4. 本地开发设置

对于本地开发，你需要使用 HTTPS，因为 Telegram Web App 只能在 HTTPS 环境下工作。

#### 使用 ngrok（推荐）

```bash
# 安装 ngrok
npm install -g ngrok

# 启动开发服务器
npm run dev

# 在另一个终端启动 ngrok
ngrok http 3000
```

然后在 @BotFather 中将 Web App URL 设置为 ngrok 提供的 HTTPS URL。

#### 使用本地 HTTPS 证书

```bash
# 安装 mkcert
# macOS
brew install mkcert

# Windows
choco install mkcert

# 创建本地证书
mkcert -install
mkcert localhost 127.0.0.1 ::1

# 修改 package.json 中的 dev 脚本
# "dev": "next dev --experimental-https --experimental-https-key ./localhost-key.pem --experimental-https-cert ./localhost.pem"
```

## 🔧 代码结构

### API 路由
- `src/app/api/auth/telegram/route.ts` - Telegram 认证 API 端点

### 组件
- `src/features/auth/components/telegram-auth-button.tsx` - Telegram 登录按钮
- `src/features/auth/components/user-auth-form.tsx` - 更新的认证表单

### 类型定义
- `src/types/telegram.ts` - Telegram Web App 相关类型定义

### 钩子
- `src/hooks/useTelegramWebApp.ts` - Telegram Web App 集成钩子

## 📱 用户使用流程

1. 用户在 Telegram 中打开你的 bot
2. 点击菜单按钮或发送命令打开 Web App
3. Web App 在 Telegram 内浏览器中加载
4. 用户点击 "使用 Telegram 登录" 按钮
5. 系统验证 Telegram 提供的用户数据
6. 认证成功后重定向到仪表板

## 🔒 安全特性

### 数据验证
- 验证 Telegram 提供的数据签名
- 检查数据时效性（5分钟内有效）
- 验证必要字段完整性

### 错误处理
- 详细的错误日志记录
- 用户友好的错误提示
- 自动重试机制

## 🎨 用户体验

### 触觉反馈
- 按钮点击时的轻微震动
- 成功/失败操作的不同反馈类型

### 视觉反馈
- 加载状态指示器
- 成功/错误消息提示
- 响应式设计适配

## 🔄 与现有系统集成

### Clerk 集成
如果你使用 Clerk 作为主要认证提供商，可以在认证成功后创建或更新 Clerk 用户：

```typescript
const handleTelegramSuccess = async (userData: TelegramAuthResponse) => {
  // 创建或更新 Clerk 用户
  const clerkUser = await createClerkUser({
    externalId: userData.user.telegramId,
    firstName: userData.user.firstName,
    lastName: userData.user.lastName,
    emailAddress: `${userData.user.telegramId}@telegram.local`
  });

  // 设置会话
  await setClerkSession(clerkUser.id);
};
```

### 自定义认证
如果使用自定义认证系统，可以在认证成功后：

```typescript
const handleTelegramSuccess = async (userData: TelegramAuthResponse) => {
  // 保存用户信息到数据库
  await saveUserToDatabase(userData.user);

  // 创建会话
  await createUserSession(userData.token);

  // 重定向到仪表板
  router.push('/dashboard');
};
```

## 🐛 调试指南

### 常见问题

1. **"未检测到 Telegram Web App 环境"**
   - 确保在 Telegram 客户端中打开应用
   - 检查 Web App URL 配置是否正确

2. **"无效的认证数据"**
   - 验证 TELEGRAM_BOT_TOKEN 是否正确
   - 检查服务器时间是否同步

3. **"认证数据已过期"**
   - 数据有效期为5分钟，需要重新打开 Web App

### 调试日志

在开发环境中，可以在浏览器控制台查看详细日志：

```javascript
// 检查 Telegram Web App 对象
console.log(window.Telegram?.WebApp);

// 查看初始化数据
console.log(window.Telegram?.WebApp?.initData);

// 查看用户信息
console.log(window.Telegram?.WebApp?.initDataUnsafe?.user);
```

## 📚 参考资料

- [Telegram Web Apps 官方文档](https://core.telegram.org/bots/webapps)
- [Telegram Bot API 文档](https://core.telegram.org/bots/api)
- [Telegram Web Apps SDK](https://github.com/twa-dev/sdk)

## 🤝 贡献

如果你发现任何问题或有改进建议，请创建 Issue 或 Pull Request。

## 📄 许可证

本集成遵循项目的原始许可证。