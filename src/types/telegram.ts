/**
 * Telegram Web App 用户数据接口
 */
export interface TelegramUser {
  /** 用户在 Telegram 中的唯一标识符 */
  id: number;

  /** 用户的姓 */
  first_name: string;

  /** 用户的名（可选） */
  last_name?: string;

  /** 用户名（可选） */
  username?: string;

  /** 用户头像的 URL（可选） */
  photo_url?: string;

  /** 用户的语言代码（可选） */
  language_code?: string;

  /** 用户是否为 Telegram Premium 用户（可选） */
  is_premium?: boolean;
}

/**
 * Telegram Web App 初始化数据接口
 */
export interface TelegramWebAppInitData {
  /** 当前用户信息 */
  user?: TelegramUser;

  /** 查询 ID */
  query_id?: string;

  /** 认证时间戳 */
  auth_date: number;

  /** 数据哈希值，用于验证数据完整性 */
  hash: string;
}

/**
 * 应用内用户数据接口
 */
export interface AppTelegramUser {
  /** Telegram 用户 ID */
  telegramId: string;

  /** 姓 */
  firstName: string;

  /** 名 */
  lastName: string;

  /** 用户名 */
  username: string;

  /** 头像 URL */
  photoUrl: string;

  /** 语言代码 */
  languageCode: string;

  /** 是否为 Premium 用户 */
  isPremium: boolean;

  /** 认证时间 */
  authDate: number;
}

/**
 * API 响应接口
 */
export interface TelegramAuthResponse {
  /** 操作是否成功 */
  success: boolean;

  /** 用户信息（成功时返回） */
  user?: AppTelegramUser;

  /** 认证 token（成功时返回） */
  token?: string;

  /** 响应消息 */
  message?: string;

  /** 错误信息（失败时返回） */
  error?: string;
}

/**
 * Telegram Web App 主题参数
 */
export interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

/**
 * Telegram Web App 接口
 */
export interface TelegramWebApp {
  /** 初始化数据 */
  initData: string;

  /** 解析后的初始化数据 */
  initDataUnsafe: TelegramWebAppInitData;

  /** 应用版本 */
  version: string;

  /** 平台信息 */
  platform: string;

  /** 颜色主题 */
  colorScheme: 'light' | 'dark';

  /** 主题参数 */
  themeParams: TelegramThemeParams;

  /** 是否展开 */
  isExpanded: boolean;

  /** 视口高度 */
  viewportHeight: number;

  /** 视口稳定高度 */
  viewportStableHeight: number;

  /** 头部颜色 */
  headerColor: string;

  /** 背景颜色 */
  backgroundColor: string;

  /** 是否闭合确认 */
  isClosingConfirmationEnabled: boolean;

  /** 主按钮 */
  MainButton: TelegramMainButton;

  /** 返回按钮 */
  BackButton: TelegramBackButton;

  /** 设置按钮 */
  SettingsButton: TelegramSettingsButton;

  /** 触觉反馈 */
  HapticFeedback: TelegramHapticFeedback;

  /** 云存储 */
  CloudStorage: TelegramCloudStorage;

  /** 生物识别管理器 */
  BiometricManager: TelegramBiometricManager;

  /** 方法 */
  ready(): void;
  expand(): void;
  close(): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  onEvent(eventType: string, eventHandler: () => void): void;
  offEvent(eventType: string, eventHandler: () => void): void;
  sendData(data: string): void;
  switchInlineQuery(query: string, choose_chat_types?: string[]): void;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  openTelegramLink(url: string): void;
  openInvoice(url: string, callback?: (status: string) => void): void;
  showPopup(params: {
    title?: string;
    message: string;
    buttons?: Array<{ id?: string; type?: string; text: string }>;
  }, callback?: (buttonId: string) => void): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
  showScanQrPopup(params: { text?: string }, callback?: (text: string) => void): void;
  closeScanQrPopup(): void;
  readTextFromClipboard(callback?: (text: string) => void): void;
  requestWriteAccess(callback?: (granted: boolean) => void): void;
  requestContact(callback?: (granted: boolean) => void): void;
}

/**
 * Telegram 主按钮接口
 */
export interface TelegramMainButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
  setText(text: string): void;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  show(): void;
  hide(): void;
  enable(): void;
  disable(): void;
  showProgress(leaveActive?: boolean): void;
  hideProgress(): void;
  setParams(params: {
    text?: string;
    color?: string;
    text_color?: string;
    is_active?: boolean;
    is_visible?: boolean;
  }): void;
}

/**
 * Telegram 返回按钮接口
 */
export interface TelegramBackButton {
  isVisible: boolean;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  show(): void;
  hide(): void;
}

/**
 * Telegram 设置按钮接口
 */
export interface TelegramSettingsButton {
  isVisible: boolean;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  show(): void;
  hide(): void;
}

/**
 * Telegram 触觉反馈接口
 */
export interface TelegramHapticFeedback {
  impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
  notificationOccurred(type: 'error' | 'success' | 'warning'): void;
  selectionChanged(): void;
}

/**
 * Telegram 云存储接口
 */
export interface TelegramCloudStorage {
  setItem(key: string, value: string, callback?: (error?: string, result?: boolean) => void): void;
  getItem(key: string, callback: (error?: string, result?: string) => void): void;
  getItems(keys: string[], callback: (error?: string, result?: Record<string, string>) => void): void;
  removeItem(key: string, callback?: (error?: string, result?: boolean) => void): void;
  removeItems(keys: string[], callback?: (error?: string, result?: boolean) => void): void;
  getKeys(callback: (error?: string, result?: string[]) => void): void;
}

/**
 * Telegram 生物识别管理器接口
 */
export interface TelegramBiometricManager {
  isInited: boolean;
  isBiometricAvailable: boolean;
  biometricType: 'finger' | 'face' | 'unknown';
  isAccessRequested: boolean;
  isAccessGranted: boolean;
  isBiometricTokenSaved: boolean;
  deviceId: string;
  init(callback?: () => void): void;
  requestAccess(params: { reason?: string }, callback?: (granted: boolean) => void): void;
  authenticate(params: { reason?: string }, callback?: (authenticated: boolean, biometric_token?: string) => void): void;
  updateBiometricToken(token: string, callback?: (updated: boolean) => void): void;
  openSettings(): void;
}

/**
 * 全局 Telegram Web App 声明
 */
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}