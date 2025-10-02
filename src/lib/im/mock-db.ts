// 模拟IndexedDB - 使用localStorage作为临时存储
import type { Conversation, UnifiedMessage, User } from '@/types/im';

class MockIMDatabase {
  private getKey(type: string): string {
    return `im_${type}`;
  }

  // ========== Conversations ==========
  async getConversations(): Promise<Conversation[]> {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.getKey('conversations'));
    return data ? JSON.parse(data) : [];
  }

  async saveConversations(conversations: Conversation[]): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(
      this.getKey('conversations'),
      JSON.stringify(conversations)
    );
  }

  async getConversation(id: string): Promise<Conversation | null> {
    const conversations = await this.getConversations();
    return conversations.find((c) => c.id === id) || null;
  }

  async updateConversation(
    id: string,
    data: Partial<Conversation>
  ): Promise<void> {
    const conversations = await this.getConversations();
    const index = conversations.findIndex((c) => c.id === id);
    if (index !== -1) {
      conversations[index] = { ...conversations[index], ...data };
      await this.saveConversations(conversations);
    }
  }

  // ========== Messages ==========
  async getMessages(conversationId: string): Promise<UnifiedMessage[]> {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(
      this.getKey(`messages_${conversationId}`)
    );
    return data ? JSON.parse(data) : [];
  }

  async saveMessages(
    conversationId: string,
    messages: UnifiedMessage[]
  ): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(
      this.getKey(`messages_${conversationId}`),
      JSON.stringify(messages)
    );
  }

  async addMessage(message: UnifiedMessage): Promise<void> {
    const messages = await this.getMessages(message.conversationId);
    messages.push(message);
    await this.saveMessages(message.conversationId, messages);

    // 更新会话的最后消息
    const conversation = await this.getConversation(message.conversationId);
    if (conversation) {
      await this.updateConversation(message.conversationId, {
        lastMessage: {
          id: message.id,
          senderId: message.senderId,
          senderName: message.senderName,
          type: message.type,
          content:
            message.type === 'text'
              ? (message.content as any).text
              : '[媒体消息]',
          timestamp: message.createdAt,
          isFromMe: message.isFromMe,
          status: message.status
        },
        lastMessageAt: message.createdAt,
        unreadCount: message.isFromMe
          ? conversation.unreadCount
          : conversation.unreadCount + 1
      });
    }
  }

  async updateMessageStatus(
    messageId: string,
    conversationId: string,
    status: string
  ): Promise<void> {
    const messages = await this.getMessages(conversationId);
    const index = messages.findIndex((m) => m.id === messageId);
    if (index !== -1) {
      messages[index].status = status as any;
      await this.saveMessages(conversationId, messages);

      // 如果更新的是最后一条消息，同步更新会话的 lastMessage 状态
      const conversation = await this.getConversation(conversationId);
      if (conversation?.lastMessage?.id === messageId) {
        await this.updateConversation(conversationId, {
          lastMessage: {
            ...conversation.lastMessage,
            status: status as any
          }
        });
      }
    }
  }

  // ========== Users ==========
  async getUsers(): Promise<User[]> {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.getKey('users'));
    return data ? JSON.parse(data) : [];
  }

  async saveUsers(users: User[]): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.getKey('users'), JSON.stringify(users));
  }

  async getUser(id: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find((u) => u.id === id) || null;
  }

  // ========== Clear All ==========
  async clearAll(): Promise<void> {
    if (typeof window === 'undefined') return;
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith('im_')
    );
    keys.forEach((key) => localStorage.removeItem(key));
  }
}

export const mockDB = new MockIMDatabase();
