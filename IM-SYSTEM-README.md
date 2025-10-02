# IM聊天系统实现文档

## 📋 系统概述

基于Next.js + shadcn/ui实现的完整IM聊天系统,支持PC和移动端响应式布局,使用MQTT协议实现实时消息收发。

## ✨ 核心特性

### 1. 完整的数据模型设计
- ✅ 统一消息格式 (UnifiedMessage)
- ✅ 会话管理 (Conversation)
- ✅ 用户信息 (User)
- ✅ 消息状态追踪 (pending/sent/delivered/read)
- ✅ 支持多平台适配 (WhatsApp/Telegram/WeChat等)

### 2. 本地存储方案
- ✅ Mock IndexedDB (localStorage模拟版)
- ✅ 离线消息缓存
- ✅ 增量同步机制
- ✅ 冲突解决策略

### 3. MQTT实时通信
- ✅ MQTT连接管理器 (模拟版)
- ✅ Topic订阅机制
- ✅ 消息发布/接收
- ✅ 状态更新推送

### 4. 状态管理
- ✅ Zustand + Immer
- ✅ 乐观更新策略
- ✅ 消息发送队列
- ✅ 状态持久化

### 5. UI组件
- ✅ 三栏响应式布局 (会话列表/聊天区/详情面板)
- ✅ 移动端适配 (单栏切换)
- ✅ 消息气泡组件
- ✅ 虚拟滚动 (准备集成@tanstack/react-virtual)
- ✅ 输入框组件 (支持Ctrl+Enter发送)
- ✅ 用户详情面板

## 📂 目录结构

```
src/
├── types/
│   └── im.ts                    # IM系统类型定义
├── lib/
│   └── im/
│       ├── mock-db.ts          # 模拟数据库
│       ├── mock-data.ts        # 模拟数据生成器
│       ├── mqtt-manager.ts     # MQTT管理器
│       └── store.ts            # Zustand状态管理
├── components/
│   └── im/
│       ├── conversation-list.tsx  # 会话列表
│       ├── chat-area.tsx          # 聊天区域
│       ├── message-list.tsx       # 消息列表
│       ├── message-input.tsx      # 消息输入框
│       └── user-panel.tsx         # 用户详情面板
└── app/
    └── dashboard/
        └── chat/
            └── page.tsx           # 聊天页面入口
```

## 🚀 快速开始

### 1. 访问聊天页面

登录后,从侧边栏点击 "Chat" 菜单,或访问:
```
http://localhost:3000/dashboard/chat
```

### 2. 模拟数据

系统已内置模拟数据:
- **当前用户**: John Doe (Admin)
- **联系人**:
  - Felecia Rower (Building surveyor)
  - Adalberto Granzin (Project Manager)
  - Zenia Jacobs (Building surveyor)
  - Miguel Guelff (Special educational needs teacher)
  - Lauran Starner

### 3. 测试消息发送

1. 点击任意会话
2. 在底部输入框输入消息
3. 按 `Ctrl+Enter` 或点击发送按钮
4. 查看消息状态变化: 发送中 → 已发送 → 已送达 → 已读

## 🎨 UI特性

### PC端布局 (>1024px)
```
┌─────────────┬──────────────────┬─────────────┐
│             │                  │             │
│  会话列表   │    聊天区域      │  用户详情   │
│             │                  │             │
│  - 搜索框   │  - 聊天头部      │  - 用户信息 │
│  - 会话项   │  - 消息列表      │  - 联系方式 │
│  - 未读数   │  - 输入框        │  - 聊天设置 │
│             │                  │             │
└─────────────┴──────────────────┴─────────────┘
```

### 移动端布局 (<1024px)
```
会话列表视图          消息视图
┌─────────────┐      ┌─────────────┐
│  [返回]     │      │  [←] 用户名 │
│             │      ├─────────────┤
│  会话1      │      │             │
│  会话2      │  →   │  消息列表   │
│  会话3      │      │             │
│             │      ├─────────────┤
│             │      │  输入框     │
└─────────────┘      └─────────────┘
```

## 🔧 核心功能实现

### 1. 消息发送流程

```typescript
// 1. 用户输入消息
sendMessage(conversationId, content)
  ↓
// 2. 立即显示 (乐观更新)
UI更新 → 状态: pending
  ↓
// 3. 保存到本地数据库
mockDB.addMessage()
  ↓
// 4. 通过MQTT发送
mqttManager.publish()
  ↓
// 5. 状态更新
sending → sent → delivered → read
```

### 2. 消息接收流程

```typescript
// 1. MQTT接收消息
mqttManager.onMessage()
  ↓
// 2. 保存到数据库
mockDB.addMessage()
  ↓
// 3. 更新UI状态
store.receiveMessage()
  ↓
// 4. 刷新会话列表
store.loadConversations()
```

### 3. 状态同步

```typescript
// 消息状态更新
PENDING  → 本地创建
SENDING  → 开始发送
SENT     → 服务器确认 (500ms后)
DELIVERED→ 对方收到 (1s后)
READ     → 对方已读 (2s后)
FAILED   → 发送失败
```

## 🔌 MQTT集成 (伪代码)

### Topic设计

```
// 消息主题
chat/{conversationId}/message

// 状态主题
chat/{conversationId}/status

// 输入状态
chat/{conversationId}/typing

// 用户状态
user/{userId}/status
```

### 实际EMQX集成示例

```typescript
// 替换 mqtt-manager.ts 中的模拟连接
import mqtt from 'mqtt';

const client = mqtt.connect('wss://your-emqx-broker:8084/mqtt', {
  clientId: `im_${userId}_${Date.now()}`,
  username: 'your_username',
  password: 'your_password',
  clean: true
});

client.on('connect', () => {
  console.log('MQTT Connected');
  client.subscribe(`chat/${conversationId}/message`);
});

client.on('message', (topic, payload) => {
  const message = JSON.parse(payload.toString());
  // 处理接收的消息
});

// 发送消息
client.publish(
  `chat/${conversationId}/message`,
  JSON.stringify(mqttMessage)
);
```

## 📱 响应式适配

### 断点设置
- **Desktop**: `>= 1024px` - 三栏布局
- **Mobile**: `< 1024px` - 单栏切换

### 移动端交互
1. 默认显示会话列表
2. 点击会话 → 切换到消息视图
3. 点击返回 → 回到会话列表
4. 用户详情面板自动隐藏

## 🎯 后续扩展

### 真实IndexedDB集成
```bash
pnpm add dexie
```

```typescript
// 替换 mock-db.ts
import Dexie from 'dexie';

class IMDatabase extends Dexie {
  conversations!: Dexie.Table<Conversation, string>;
  messages!: Dexie.Table<UnifiedMessage, string>;
  users!: Dexie.Table<User, string>;

  constructor() {
    super('IMDatabase');
    this.version(1).stores({
      conversations: 'id, lastMessageAt, [isPinned+lastMessageAt]',
      messages: 'id, conversationId, [conversationId+createdAt]',
      users: 'id, username, isOnline'
    });
  }
}
```

### 虚拟滚动优化
```typescript
// 使用@tanstack/react-virtual
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: messages.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 80,
  overscan: 10
});
```

### 多平台适配器
```typescript
// WhatsApp适配器
class WhatsAppAdapter extends MessageAdapter {
  toUnifiedFormat(whatsappMsg: any): UnifiedMessage {
    return {
      id: generateUUID(),
      conversationId: this.getConversationId(whatsappMsg),
      type: this.mapMessageType(whatsappMsg.type),
      // ... 映射字段
    };
  }
}

// Telegram适配器
class TelegramAdapter extends MessageAdapter {
  // ... 实现
}
```

## 📊 数据格式示例

### 统一消息格式
```json
{
  "id": "msg-1704096000000-abc123",
  "conversationId": "conv-4",
  "senderId": "user-1",
  "senderName": "John Doe",
  "senderAvatar": "https://...",
  "type": "text",
  "content": {
    "text": "Hello, how are you?"
  },
  "platform": "internal",
  "status": "read",
  "isFromMe": true,
  "createdAt": 1704096000000,
  "updatedAt": 1704096002000,
  "readAt": 1704096002000,
  "syncVersion": 1,
  "localOnly": false,
  "deleted": false
}
```

### 会话格式
```json
{
  "id": "conv-4",
  "type": "private",
  "platform": "internal",
  "title": "Miguel Guelff",
  "avatar": "https://...",
  "participantIds": ["user-1", "user-5"],
  "participantCount": 2,
  "lastMessage": {
    "id": "msg-xxx",
    "senderId": "user-1",
    "content": "Thank you!",
    "timestamp": 1704096000000,
    "isFromMe": true,
    "status": "read"
  },
  "lastMessageAt": 1704096000000,
  "unreadCount": 0,
  "isPinned": false,
  "isMuted": false,
  "createdAt": 1703491200000,
  "updatedAt": 1704096000000,
  "syncVersion": 1
}
```

## 🐛 已知限制

1. **模拟版本**: 当前使用localStorage模拟IndexedDB和MQTT
2. **虚拟滚动**: 尚未集成,大量消息时可能性能下降
3. **文件上传**: 未实现,仅支持文本消息
4. **表情选择**: 未实现表情选择器
5. **消息撤回**: 仅UI,未实现实际撤回逻辑

## 🔗 相关依赖

```json
{
  "dependencies": {
    "zustand": "^5.0.2",
    "immer": "^10.1.3",
    "date-fns": "^4.1.0",
    "react-responsive": "^10.0.0",
    "@tanstack/react-virtual": "^3.13.12",
    "dexie": "^4.2.0",
    "mqtt": "^5.14.1"
  }
}
```

## 📝 开发备注

### 关键文件说明

1. **types/im.ts** - 所有IM相关类型定义
2. **lib/im/store.ts** - 核心状态管理,包含所有业务逻辑
3. **lib/im/mqtt-manager.ts** - MQTT连接管理 (模拟版,可替换为真实实现)
4. **lib/im/mock-data.ts** - 模拟数据,可通过API替换

### 扩展建议

1. **真实后端集成**: 替换mock-db和mock-data为API调用
2. **文件上传**: 集成云存储服务 (OSS/S3)
3. **消息加密**: 端到端加密实现
4. **离线缓存**: Service Worker + IndexedDB
5. **推送通知**: Web Push API集成

---

**开发者**: Claude Code
**版本**: 1.0.0
**最后更新**: 2025-10-02
