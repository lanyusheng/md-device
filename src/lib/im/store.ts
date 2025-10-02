import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  MessageStatus,
  MessageType,
  Platform
} from '@/types/im';
import type {
  Conversation,
  UnifiedMessage,
  User
} from '@/types/im';
import { mockDB } from './mock-db';
import { mqttManager, MQTT_TOPICS } from './mqtt-manager';
import { currentUser } from './mock-data';

interface IMState {
  // ========== 会话状态 ==========
  conversations: Conversation[];
  activeConversationId: string | null;
  loadingConversations: boolean;

  // ========== 消息状态 ==========
  messages: Record<string, UnifiedMessage[]>;
  loadingMessages: Record<string, boolean>;
  sendingMessages: Set<string>;

  // ========== 用户状态 ==========
  currentUser: User;
  users: Record<string, User>;
  onlineUsers: Set<string>;

  // ========== UI状态 ==========
  isMobile: boolean;
  showConversationList: boolean;

  // ========== Actions ==========
  loadConversations: () => Promise<void>;
  setActiveConversation: (id: string | null) => void;
  updateConversation: (id: string, data: Partial<Conversation>) => void;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  updateMessageStatus: (
    conversationId: string,
    messageId: string,
    status: MessageStatus
  ) => void;
  receiveMessage: (message: UnifiedMessage) => void;
  loadUsers: () => Promise<void>;
  updateUserStatus: (userId: string, isOnline: boolean) => void;
  setIsMobile: (isMobile: boolean) => void;
  setShowConversationList: (show: boolean) => void;
  init: () => Promise<void>;
}

export const useIMStore = create<IMState>()(
  devtools((set, get) => ({
    // ========== 初始状态 ==========
    conversations: [],
    activeConversationId: null,
    loadingConversations: false,
    messages: {},
    loadingMessages: {},
    sendingMessages: new Set(),
    currentUser: currentUser,
    users: {},
    onlineUsers: new Set(),
    isMobile: false,
    showConversationList: true,

    // ========== 会话操作 ==========
    loadConversations: async () => {
      set({ loadingConversations: true });
      try {
        const conversations = await mockDB.getConversations();
        set({
          conversations: conversations.sort(
            (a, b) => b.lastMessageAt - a.lastMessageAt
          ),
          loadingConversations: false
        });
      } catch (error) {
        console.error('加载会话失败:', error);
        set({ loadingConversations: false });
      }
    },

    setActiveConversation: (id) => {
      const state = get();
      set({
        activeConversationId: id,
        showConversationList:
          state.isMobile && id ? false : state.showConversationList
      });

      if (id) {
        get().loadMessages(id);
        if (mqttManager.isConnected()) {
          mqttManager.subscribe(MQTT_TOPICS.message(id));
          mqttManager.subscribe(MQTT_TOPICS.status(id));
        }
      }
    },

    updateConversation: (id, data) => {
      set((state) => {
        const index = state.conversations.findIndex((c) => c.id === id);
        if (index === -1) return state;

        const oldConversation = state.conversations[index];

        // 深度合并 lastMessage
        let updatedConversation;
        if (data.lastMessage && oldConversation.lastMessage) {
          updatedConversation = {
            ...oldConversation,
            ...data,
            lastMessage: {
              ...oldConversation.lastMessage,
              ...data.lastMessage
            }
          };
        } else {
          updatedConversation = {
            ...oldConversation,
            ...data
          };
        }

        const conversations = state.conversations.map((conv, idx) =>
          idx === index ? updatedConversation : conv
        );

        return { conversations };
      });
    },

    // ========== 消息操作 ==========
    loadMessages: async (conversationId) => {
      const state = get();
      set({
        loadingMessages: { ...state.loadingMessages, [conversationId]: true }
      });

      try {
        const messages = await mockDB.getMessages(conversationId);
        set({
          messages: { ...state.messages, [conversationId]: messages },
          loadingMessages: {
            ...state.loadingMessages,
            [conversationId]: false
          }
        });

        get().updateConversation(conversationId, { unreadCount: 0 });
        await mockDB.updateConversation(conversationId, { unreadCount: 0 });
      } catch (error) {
        console.error('加载消息失败:', error);
        set({
          loadingMessages: {
            ...state.loadingMessages,
            [conversationId]: false
          }
        });
      }
    },

    sendMessage: async (conversationId, content) => {
      const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const state = get();

      const message: UnifiedMessage = {
        id: messageId,
        conversationId,
        senderId: state.currentUser.id,
        senderName: state.currentUser.displayName,
        senderAvatar: state.currentUser.avatar,
        type: MessageType.TEXT,
        content: { text: content },
        platform: Platform.INTERNAL,
        status: MessageStatus.PENDING,
        isFromMe: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncVersion: 1,
        localOnly: true,
        deleted: false
      };

      // 立即显示消息并更新会话列表 - 在一次 set 中完成
      set((state) => {
        const currentMessages = state.messages[conversationId] || [];

        // 更新会话列表
        const conversationIndex = state.conversations.findIndex(
          (c) => c.id === conversationId
        );

        const newConversations = [...state.conversations];
        if (conversationIndex !== -1) {
          newConversations[conversationIndex] = {
            ...state.conversations[conversationIndex],
            lastMessage: {
              id: messageId,
              senderId: state.currentUser.id,
              senderName: state.currentUser.displayName,
              type: MessageType.TEXT,
              content: content,
              timestamp: Date.now(),
              isFromMe: true,
              status: MessageStatus.PENDING
            },
            lastMessageAt: Date.now()
          };
        }

        return {
          messages: {
            ...state.messages,
            [conversationId]: [...currentMessages, message]
          },
          sendingMessages: new Set([...state.sendingMessages, messageId]),
          conversations: newConversations
        };
      });

      try {
        await mockDB.addMessage(message);

        get().updateMessageStatus(
          conversationId,
          messageId,
          MessageStatus.SENDING
        );

        if (mqttManager.isConnected()) {
          mqttManager.publish(MQTT_TOPICS.message(conversationId), {
            type: 'message',
            conversationId,
            senderId: state.currentUser.id,
            data: message,
            timestamp: Date.now()
          });
        } else {
          // 模拟发送成功
          setTimeout(() => {
            get().updateMessageStatus(
              conversationId,
              messageId,
              MessageStatus.SENT
            );
          }, 500);

          setTimeout(() => {
            get().updateMessageStatus(
              conversationId,
              messageId,
              MessageStatus.DELIVERED
            );
          }, 1000);

          setTimeout(() => {
            get().updateMessageStatus(
              conversationId,
              messageId,
              MessageStatus.READ
            );
          }, 2000);
        }
      } catch (error) {
        console.error('发送消息失败:', error);
        get().updateMessageStatus(
          conversationId,
          messageId,
          MessageStatus.FAILED
        );
      } finally {
        const newSendingMessages = new Set(get().sendingMessages);
        newSendingMessages.delete(messageId);
        set({ sendingMessages: newSendingMessages });
      }
    },

    updateMessageStatus: (conversationId, messageId, status) => {
      // 1. 直接更新状态，不做任何复杂判断
      set((state) => {
        // 更新消息列表
        let updatedMessages = state.messages[conversationId];
        if (updatedMessages) {
          updatedMessages = updatedMessages.map((m) =>
            m.id === messageId
              ? { ...m, status }
              : m
          );
        }

        // 更新会话列表 - 强制更新，不判断是否是最后一条消息
        const updatedConversations = state.conversations.map((conv) => {
          if (conv.id === conversationId && conv.lastMessage) {
            // 只要会话ID匹配，就更新状态
            return {
              ...conv,
              lastMessage: {
                ...conv.lastMessage,
                status
              }
            };
          }
          return conv;
        });

        return {
          messages: updatedMessages
            ? { ...state.messages, [conversationId]: updatedMessages }
            : state.messages,
          conversations: updatedConversations
        };
      });

      // 2. 更新数据库
      mockDB.updateMessageStatus(messageId, conversationId, status);
    },

    receiveMessage: (message) => {
      const state = get();
      const currentMessages = state.messages[message.conversationId] || [];
      set({
        messages: {
          ...state.messages,
          [message.conversationId]: [...currentMessages, message]
        }
      });
      mockDB.addMessage(message);
      get().loadConversations();
    },

    // ========== 用户操作 ==========
    loadUsers: async () => {
      try {
        const users = await mockDB.getUsers();
        const usersMap: Record<string, User> = {};
        const onlineSet = new Set<string>();

        users.forEach((user) => {
          usersMap[user.id] = user;
          if (user.isOnline) {
            onlineSet.add(user.id);
          }
        });

        set({ users: usersMap, onlineUsers: onlineSet });
      } catch (error) {
        console.error('加载用户失败:', error);
      }
    },

    updateUserStatus: (userId, isOnline) => {
      const state = get();
      const user = state.users[userId];
      if (user) {
        const updatedUsers = { ...state.users };
        updatedUsers[userId] = { ...user, isOnline };
        const newOnlineUsers = new Set(state.onlineUsers);
        if (isOnline) {
          newOnlineUsers.add(userId);
        } else {
          newOnlineUsers.delete(userId);
        }
        set({ users: updatedUsers, onlineUsers: newOnlineUsers });
      }
    },

    // ========== UI操作 ==========
    setIsMobile: (isMobile) => {
      set({
        isMobile,
        showConversationList: isMobile ? get().showConversationList : true
      });
    },

    setShowConversationList: (show) => {
      set({ showConversationList: show });
    },

    // ========== 初始化 ==========
    init: async () => {
      await Promise.all([get().loadConversations(), get().loadUsers()]);

      try {
        await mqttManager.connect({
          host: 'broker.emqx.io',
          port: 8084,
          clientId: `im_${currentUser.id}_${Date.now()}`
        });

        mqttManager.onMessage((message) => {
          get().receiveMessage(message);
        });

        mqttManager.onStatus((data) => {
          if (data.messageId && data.status) {
            const conversationId = get().activeConversationId;
            if (conversationId) {
              get().updateMessageStatus(
                conversationId,
                data.messageId,
                data.status
              );
            }
          }
        });
      } catch (error) {
        console.error('MQTT连接失败:', error);
      }
    }
  }))
);
