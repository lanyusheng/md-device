// MQTT连接管理器 - 模拟版本
import type { MQTTMessage, UnifiedMessage } from '@/types/im';

type MessageHandler = (message: UnifiedMessage) => void;
type StatusHandler = (data: any) => void;

class MQTTManager {
  private connected: boolean = false;
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusHandlers: Set<StatusHandler> = new Set();
  private simulationInterval?: NodeJS.Timeout;

  // 连接到EMQX
  async connect(options: {
    host: string;
    port: number;
    clientId: string;
    username?: string;
    password?: string;
  }): Promise<void> {
    console.log('🔌 MQTT连接中...', options);

    // 模拟连接延迟
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.connected = true;
    console.log('✅ MQTT已连接');

    // 模拟定期接收消息
    this.startMessageSimulation();
  }

  // 断开连接
  disconnect(): void {
    this.connected = false;
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
    console.log('❌ MQTT已断开');
  }

  // 订阅主题
  subscribe(topic: string): void {
    if (!this.connected) {
      console.error('MQTT未连接');
      return;
    }
    console.log('📥 订阅主题:', topic);
  }

  // 发布消息
  publish(topic: string, message: MQTTMessage): void {
    if (!this.connected) {
      console.error('MQTT未连接');
      return;
    }
    console.log('📤 发布消息:', topic, message);

    // 模拟服务器回执
    setTimeout(() => {
      this.statusHandlers.forEach((handler) => {
        handler({
          messageId: (message.data as any).id,
          status: 'sent',
          timestamp: Date.now()
        });
      });
    }, 500);

    // 模拟对方已读
    setTimeout(() => {
      this.statusHandlers.forEach((handler) => {
        handler({
          messageId: (message.data as any).id,
          status: 'read',
          timestamp: Date.now()
        });
      });
    }, 2000);
  }

  // 监听消息
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  // 监听状态更新
  onStatus(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  // 模拟接收消息
  private startMessageSimulation(): void {
    // 可选:模拟定期接收消息
    // this.simulationInterval = setInterval(() => {
    //   // 模拟接收消息逻辑
    // }, 10000);
  }

  isConnected(): boolean {
    return this.connected;
  }
}

// 单例
export const mqttManager = new MQTTManager();

// MQTT Topic命名规范
export const MQTT_TOPICS = {
  // 消息主题: chat/{conversationId}/message
  message: (conversationId: string) => `chat/${conversationId}/message`,

  // 状态主题: chat/{conversationId}/status
  status: (conversationId: string) => `chat/${conversationId}/status`,

  // 输入状态: chat/{conversationId}/typing
  typing: (conversationId: string) => `chat/${conversationId}/typing`,

  // 用户状态: user/{userId}/status
  userStatus: (userId: string) => `user/${userId}/status`
};
