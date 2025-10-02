// ============== IM系统核心类型定义 ==============

// ============== 枚举类型 ==============
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  FILE = 'file',
  LOCATION = 'location',
  SYSTEM = 'system'
}

export enum MessageStatus {
  PENDING = 'pending',
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  DELETED = 'deleted'
}

export enum ConversationType {
  PRIVATE = 'private',
  GROUP = 'group',
  CHANNEL = 'channel'
}

export enum Platform {
  INTERNAL = 'internal',
  WHATSAPP = 'whatsapp',
  TELEGRAM = 'telegram',
  WECHAT = 'wechat'
}

export enum UserStatus {
  ONLINE = 'online',
  AWAY = 'away',
  BUSY = 'busy',
  OFFLINE = 'offline'
}

// ============== 消息内容类型 ==============
export interface TextContent {
  text: string;
}

export interface MediaContent {
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  size?: number;
  mimeType?: string;
  caption?: string;
}

export interface FileContent {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface LocationContent {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

export interface SystemContent {
  text: string;
  action?: string;
}

export type MessageContent =
  | TextContent
  | MediaContent
  | FileContent
  | LocationContent
  | SystemContent;

// ============== 消息引用 ==============
export interface MessageReference {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: MessageType;
  timestamp: number;
}

// ============== 统一消息结构 ==============
export interface UnifiedMessage {
  id: string;
  conversationId: string;

  // 发送者
  senderId: string;
  senderName: string;
  senderAvatar?: string;

  // 内容
  type: MessageType;
  content: MessageContent;

  // 平台
  platform: Platform;
  platformMessageId?: string;

  // 状态
  status: MessageStatus;
  isFromMe: boolean;

  // 时间戳
  createdAt: number;
  updatedAt: number;
  deliveredAt?: number;
  readAt?: number;

  // 引用
  replyTo?: MessageReference;

  // 同步
  syncVersion: number;
  localOnly: boolean;
  deleted: boolean;

  metadata?: Record<string, any>;
}

// ============== 会话最后消息 ==============
export interface LastMessageInfo {
  id: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  content: string;
  timestamp: number;
  isFromMe: boolean;
  status?: MessageStatus;
}

// ============== 会话结构 ==============
export interface Conversation {
  id: string;
  type: ConversationType;
  platform: Platform;

  // 信息
  title: string;
  avatar?: string;
  description?: string;

  // 参与者
  participantIds: string[];
  participantCount: number;

  // 最后消息
  lastMessage?: LastMessageInfo;
  lastMessageAt: number;

  // 统计
  unreadCount: number;
  totalMessages: number;

  // 状态
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;

  // 草稿
  draft?: string;

  // 时间
  createdAt: number;
  updatedAt: number;

  // 同步
  syncVersion: number;

  metadata?: Record<string, any>;
}

// ============== 用户结构 ==============
export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;

  email?: string;
  phone?: string;

  status: UserStatus;
  lastSeen: number;
  isOnline: boolean;

  createdAt: number;
  updatedAt: number;

  metadata?: Record<string, any>;
}

// ============== MQTT消息格式 ==============
export interface MQTTMessage {
  type: 'message' | 'status' | 'typing' | 'read';
  conversationId: string;
  senderId: string;
  data: any;
  timestamp: number;
}
