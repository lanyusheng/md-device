import {
  Conversation,
  ConversationType,
  MessageStatus,
  MessageType,
  Platform,
  UnifiedMessage,
  User,
  UserStatus
} from '@/types/im';

// 生成UUID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 生成批量用户数据
const generateUsers = (count: number): User[] => {
  const users: User[] = [
    {
      id: 'user-1',
      username: 'john_doe',
      displayName: 'John Doe',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      bio: 'Admin',
      email: 'john@example.com',
      status: UserStatus.ONLINE,
      lastSeen: Date.now(),
      isOnline: true,
      createdAt: Date.now() - 86400000 * 30,
      updatedAt: Date.now()
    }
  ];

  const names = [
    'Felecia Rower', 'Adalberto Granzin', 'Zenia Jacobs', 'Miguel Guelff',
    'Lauran Starner', 'Emma Wilson', 'Liam Smith', 'Olivia Johnson',
    'Noah Brown', 'Ava Davis', 'William Miller', 'Sophia Garcia',
    'James Martinez', 'Isabella Rodriguez', 'Benjamin Wilson',
    'Mia Anderson', 'Lucas Thomas', 'Charlotte Taylor', 'Mason Moore',
    'Amelia Jackson', 'Ethan White', 'Harper Harris', 'Alexander Martin',
    'Evelyn Thompson', 'Michael Garcia', 'Abigail Martinez', 'Daniel Robinson',
    'Emily Clark', 'Matthew Rodriguez', 'Elizabeth Lewis'
  ];

  const bios = [
    'Building surveyor', 'Project Manager', 'Software Engineer',
    'Designer', 'Teacher', 'Sales Manager', 'Marketing Specialist',
    'Data Analyst', 'Product Manager', 'HR Manager'
  ];

  const statuses = [UserStatus.ONLINE, UserStatus.OFFLINE, UserStatus.AWAY, UserStatus.DND];

  for (let i = 0; i < count; i++) {
    const name = names[i % names.length];
    const seed = `${name.replace(' ', '')}${i}`;
    const status = statuses[i % statuses.length];
    const isOnline = status === UserStatus.ONLINE;

    users.push({
      id: `user-${i + 2}`,
      username: name.toLowerCase().replace(' ', '_') + i,
      displayName: `${name} ${i > 29 ? i - 29 : ''}`.trim(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
      bio: bios[i % bios.length],
      status,
      lastSeen: isOnline ? Date.now() : Date.now() - Math.random() * 86400000,
      isOnline,
      createdAt: Date.now() - Math.random() * 86400000 * 30,
      updatedAt: Date.now()
    });
  }

  return users;
};

// 模拟用户数据 - 生成50个用户
export const mockUsers: User[] = generateUsers(50);

// 当前用户
export const currentUser: User = mockUsers[0];

// 生成批量会话数据
const generateConversations = (users: User[], count: number): Conversation[] => {
  const conversations: Conversation[] = [];
  const messageTexts = [
    'I will purchase it for sure. 👍',
    'If it takes long you can mail me...',
    'Thank you, looking forward to it.',
    "That sounds interesting. I'll have...",
    'Let me know when you are available.',
    'Great! Looking forward to working with you.',
    'Please send me the details.',
    'Can we schedule a meeting?',
    'I agree with your proposal.',
    'Thanks for the update!',
    'Could you please review this?',
    'I have completed the task.',
    'When can we discuss this further?',
    'Perfect! See you then.',
    'I need more information about this.'
  ];

  for (let i = 0; i < count && i + 1 < users.length; i++) {
    const otherUser = users[i + 1];
    const isFromMe = Math.random() > 0.5;
    const messageText = messageTexts[i % messageTexts.length];
    const timestamp = Date.now() - Math.random() * 86400000 * 7;
    const hasUnread = Math.random() > 0.7;
    const isPinned = Math.random() > 0.9;

    conversations.push({
      id: `conv-${i + 1}`,
      type: ConversationType.PRIVATE,
      platform: Platform.INTERNAL,
      title: otherUser.displayName,
      avatar: otherUser.avatar,
      description: otherUser.bio,
      participantIds: [currentUser.id, otherUser.id],
      participantCount: 2,
      lastMessage: {
        id: `msg-last-${i + 1}`,
        senderId: isFromMe ? currentUser.id : otherUser.id,
        senderName: isFromMe ? currentUser.displayName : otherUser.displayName,
        type: MessageType.TEXT,
        content: messageText,
        timestamp,
        isFromMe,
        status: isFromMe ? MessageStatus.READ : undefined
      },
      lastMessageAt: timestamp,
      unreadCount: hasUnread && !isFromMe ? Math.floor(Math.random() * 10) + 1 : 0,
      totalMessages: Math.floor(Math.random() * 100) + 10,
      isPinned,
      isMuted: false,
      isArchived: false,
      createdAt: Date.now() - Math.random() * 86400000 * 30,
      updatedAt: timestamp,
      syncVersion: 1
    });
  }

  return conversations.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
};

// 模拟会话数据 - 生成50个会话
export const mockConversations: Conversation[] = generateConversations(mockUsers, 50);

// 保留原来的详细会话数据作为示例
export const detailedConversations: Conversation[] = [
  {
    id: 'conv-1',
    type: ConversationType.PRIVATE,
    platform: Platform.INTERNAL,
    title: 'Felecia Rower',
    avatar: mockUsers[1].avatar,
    participantIds: [currentUser.id, mockUsers[1].id],
    participantCount: 2,
    lastMessage: {
      id: 'msg-1',
      senderId: mockUsers[1].id,
      senderName: mockUsers[1].displayName,
      type: MessageType.TEXT,
      content: 'I will purchase it for sure. 👍',
      timestamp: Date.now() - 300000,
      isFromMe: false
    },
    lastMessageAt: Date.now() - 300000,
    unreadCount: 0,
    totalMessages: 10,
    isPinned: false,
    isMuted: false,
    isArchived: false,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 300000,
    syncVersion: 1
  },
  {
    id: 'conv-2',
    type: ConversationType.PRIVATE,
    platform: Platform.INTERNAL,
    title: 'Adalberto Granzin',
    avatar: mockUsers[2].avatar,
    participantIds: [currentUser.id, mockUsers[2].id],
    participantCount: 2,
    lastMessage: {
      id: 'msg-2',
      senderId: mockUsers[2].id,
      senderName: mockUsers[2].displayName,
      type: MessageType.TEXT,
      content: 'If it takes long you can mail me...',
      timestamp: Date.now() - 600000,
      isFromMe: false
    },
    lastMessageAt: Date.now() - 600000,
    unreadCount: 0,
    totalMessages: 5,
    isPinned: false,
    isMuted: false,
    isArchived: false,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 600000,
    syncVersion: 1
  },
  {
    id: 'conv-3',
    type: ConversationType.PRIVATE,
    platform: Platform.INTERNAL,
    title: 'Zenia Jacobs',
    avatar: mockUsers[3].avatar,
    participantIds: [currentUser.id, mockUsers[3].id],
    participantCount: 2,
    lastMessage: {
      id: 'msg-3',
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      type: MessageType.TEXT,
      content: 'Thank you, looking forward to it.',
      timestamp: Date.now() - 900000,
      isFromMe: true,
      status: MessageStatus.READ
    },
    lastMessageAt: Date.now() - 900000,
    unreadCount: 0,
    totalMessages: 15,
    isPinned: true,
    isMuted: false,
    isArchived: false,
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 900000,
    syncVersion: 1
  },
  {
    id: 'conv-4',
    type: ConversationType.PRIVATE,
    platform: Platform.INTERNAL,
    title: 'Miguel Guelff',
    avatar: mockUsers[4].avatar,
    description: 'Special educational needs teacher',
    participantIds: [currentUser.id, mockUsers[4].id],
    participantCount: 2,
    lastMessage: {
      id: 'msg-4',
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      type: MessageType.TEXT,
      content: 'Thank you, looking forward to it.',
      timestamp: Date.now() - 1200000,
      isFromMe: true,
      status: MessageStatus.READ
    },
    lastMessageAt: Date.now() - 1200000,
    unreadCount: 0,
    totalMessages: 20,
    isPinned: false,
    isMuted: false,
    isArchived: false,
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 1200000,
    syncVersion: 1
  },
  {
    id: 'conv-5',
    type: ConversationType.PRIVATE,
    platform: Platform.INTERNAL,
    title: 'Lauran Starner',
    avatar: mockUsers[5].avatar,
    participantIds: [currentUser.id, mockUsers[5].id],
    participantCount: 2,
    lastMessage: {
      id: 'msg-5',
      senderId: mockUsers[5].id,
      senderName: mockUsers[5].displayName,
      type: MessageType.TEXT,
      content: "That sounds interesting. I'll have...",
      timestamp: Date.now() - 1500000,
      isFromMe: false
    },
    lastMessageAt: Date.now() - 1500000,
    unreadCount: 0,
    totalMessages: 8,
    isPinned: false,
    isMuted: false,
    isArchived: false,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 1500000,
    syncVersion: 1
  }
];

// 模拟消息数据 - Miguel Guelff 的对话
export const mockMessages: UnifiedMessage[] = [
  {
    id: 'msg-conv4-1',
    conversationId: 'conv-4',
    senderId: currentUser.id,
    senderName: currentUser.displayName,
    senderAvatar: currentUser.avatar,
    type: MessageType.TEXT,
    content: {
      text: 'Hello, I would like to arrange a professional meeting.'
    },
    platform: Platform.INTERNAL,
    status: MessageStatus.READ,
    isFromMe: true,
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
    syncVersion: 1,
    localOnly: false,
    deleted: false
  },
  {
    id: 'msg-conv4-2',
    conversationId: 'conv-4',
    senderId: mockUsers[4].id,
    senderName: mockUsers[4].displayName,
    senderAvatar: mockUsers[4].avatar,
    type: MessageType.TEXT,
    content: {
      text: 'Sure, could you please provide more details about the meeting?'
    },
    platform: Platform.INTERNAL,
    status: MessageStatus.DELIVERED,
    isFromMe: false,
    createdAt: Date.now() - 3300000,
    updatedAt: Date.now() - 3300000,
    syncVersion: 1,
    localOnly: false,
    deleted: false
  },
  {
    id: 'msg-conv4-3',
    conversationId: 'conv-4',
    senderId: currentUser.id,
    senderName: currentUser.displayName,
    senderAvatar: currentUser.avatar,
    type: MessageType.TEXT,
    content: {
      text: 'The meeting is about our next project plan.'
    },
    platform: Platform.INTERNAL,
    status: MessageStatus.READ,
    isFromMe: true,
    createdAt: Date.now() - 3000000,
    updatedAt: Date.now() - 3000000,
    syncVersion: 1,
    localOnly: false,
    deleted: false
  },
  {
    id: 'msg-conv4-4',
    conversationId: 'conv-4',
    senderId: mockUsers[4].id,
    senderName: mockUsers[4].displayName,
    senderAvatar: mockUsers[4].avatar,
    type: MessageType.TEXT,
    content: {
      text: 'Okay, I will prepare the necessary documents for the meeting.'
    },
    platform: Platform.INTERNAL,
    status: MessageStatus.DELIVERED,
    isFromMe: false,
    createdAt: Date.now() - 2700000,
    updatedAt: Date.now() - 2700000,
    syncVersion: 1,
    localOnly: false,
    deleted: false
  },
  {
    id: 'msg-conv4-5',
    conversationId: 'conv-4',
    senderId: currentUser.id,
    senderName: currentUser.displayName,
    senderAvatar: currentUser.avatar,
    type: MessageType.TEXT,
    content: {
      text: 'Thank you, looking forward to it.'
    },
    platform: Platform.INTERNAL,
    status: MessageStatus.READ,
    isFromMe: true,
    createdAt: Date.now() - 1200000,
    updatedAt: Date.now() - 1200000,
    syncVersion: 1,
    localOnly: false,
    deleted: false
  }
];

// 生成大量消息用于测试虚拟滚动
const generateMessagesForConversation = (
  convId: string,
  otherUser: User,
  messageCount: number = 100
): UnifiedMessage[] => {
  const messages: UnifiedMessage[] = [];
  const sampleTexts = [
    'Hello! How are you?',
    'I will purchase it for sure. 👍',
    'If it takes long you can mail me...',
    'Thank you, looking forward to it.',
    "That sounds interesting. I'll have to think about it.",
    'Let me know when you are available.',
    'Great! Looking forward to working with you.',
    'Please send me the details when you get a chance.',
    'Can we schedule a meeting to discuss this?',
    'I agree with your proposal.',
    'Thanks for the quick update!',
    'Could you please review this document?',
    'I have completed the task you assigned.',
    'When can we discuss this further?',
    'Perfect! See you then.',
    'I need more information about this topic.',
    'Sounds good to me!',
    'Let me check and get back to you.',
    'I appreciate your help with this.',
    'That makes sense, thank you for clarifying.'
  ];

  const now = Date.now();
  for (let i = 0; i < messageCount; i++) {
    const isFromMe = Math.random() > 0.5;
    const timestamp = now - (messageCount - i) * 60000; // 每条消息间隔1分钟

    messages.push({
      id: `msg-${convId}-${i + 1}`,
      conversationId: convId,
      senderId: isFromMe ? currentUser.id : otherUser.id,
      senderName: isFromMe ? currentUser.displayName : otherUser.displayName,
      senderAvatar: isFromMe ? currentUser.avatar : otherUser.avatar,
      type: MessageType.TEXT,
      content: { text: sampleTexts[i % sampleTexts.length] },
      platform: Platform.INTERNAL,
      status: isFromMe ? MessageStatus.READ : MessageStatus.DELIVERED,
      isFromMe,
      createdAt: timestamp,
      updatedAt: timestamp,
      syncVersion: 1,
      localOnly: false,
      deleted: false
    });
  }

  return messages;
};

// 初始化模拟数据到数据库
export async function initMockData() {
  const { mockDB } = await import('./mock-db');

  console.log('📦 Initializing mock data...');
  const startTime = performance.now();

  // 保存用户
  await mockDB.saveUsers(mockUsers);
  console.log(`✅ Saved ${mockUsers.length} users`);

  // 保存会话
  await mockDB.saveConversations(mockConversations);
  console.log(`✅ Saved ${mockConversations.length} conversations`);

  // 为前5个会话生成大量消息（用于测试虚拟滚动）
  const messagesPerConversation = [500, 300, 200, 150, 100]; // 不同会话不同消息数

  for (let i = 0; i < Math.min(5, mockConversations.length); i++) {
    const conv = mockConversations[i];
    const otherUserId = conv.participantIds.find(id => id !== currentUser.id);
    const otherUser = mockUsers.find(u => u.id === otherUserId);

    if (otherUser) {
      const messages = generateMessagesForConversation(
        conv.id,
        otherUser,
        messagesPerConversation[i]
      );
      await mockDB.saveMessages(conv.id, messages);
      console.log(`✅ Generated ${messages.length} messages for ${conv.title}`);
    }
  }

  // 为其余会话生成少量消息
  for (let i = 5; i < mockConversations.length; i++) {
    const conv = mockConversations[i];
    const otherUserId = conv.participantIds.find(id => id !== currentUser.id);
    const otherUser = mockUsers.find(u => u.id === otherUserId);

    if (otherUser) {
      const messages = generateMessagesForConversation(conv.id, otherUser, 10);
      await mockDB.saveMessages(conv.id, messages);
    }
  }

  const endTime = performance.now();
  console.log(`🎉 Mock data initialized in ${(endTime - startTime).toFixed(2)}ms`);
}
