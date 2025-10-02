'use client';

import { useEffect } from 'react';
import { useIMStore } from '@/lib/im/store';
import { initMockData } from '@/lib/im/mock-data';
import { ConversationList } from '@/components/im/conversation-list';
import { ChatArea } from '@/components/im/chat-area';
import { useMediaQuery } from 'react-responsive';

export default function ChatPage() {
  const {
    activeConversationId,
    isMobile,
    showConversationList,
    setIsMobile,
    init
  } = useIMStore();

  const isMobileDevice = useMediaQuery({ maxWidth: 1024 });

  // 初始化
  useEffect(() => {
    // 清除旧数据并初始化模拟数据
    const initData = async () => {
      const { mockDB } = await import('@/lib/im/mock-db');
      await mockDB.clearAll(); // 清除旧数据
      await initMockData(); // 初始化新数据
      init(); // 初始化store
    };
    initData();
  }, [init]);

  // 响应式
  useEffect(() => {
    setIsMobile(isMobileDevice);
  }, [isMobileDevice, setIsMobile]);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background overflow-hidden">
      {/* 左侧 - 会话列表 */}
      <div
        className={`
          ${isMobile ? (showConversationList ? 'flex' : 'hidden') : 'flex'}
          w-full lg:w-80 xl:w-96
          border-r border-border
          flex-col
          h-full
          overflow-hidden
        `}
      >
        <ConversationList />
      </div>

      {/* 聊天区域 */}
      <div
        className={`
          ${isMobile ? (showConversationList ? 'hidden' : 'flex') : 'flex'}
          flex-1
          flex-col
          h-full
          overflow-hidden
        `}
      >
        {activeConversationId ? (
          <ChatArea />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center space-y-3">
              <div className="text-6xl">💬</div>
              <p className="text-lg font-medium">选择一个会话开始聊天</p>
              <p className="text-sm">从左侧列表中选择联系人</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
