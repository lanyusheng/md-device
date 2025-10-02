'use client';

import { useState } from 'react';
import { useIMStore } from '@/lib/im/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Pin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { MessageStatus } from '@/types/im';
import { CurrentUserPanel } from './current-user-panel';

export function ConversationList() {
  const {
    conversations,
    activeConversationId,
    currentUser,
    setActiveConversation
  } = useIMStore();
  const [showUserPanel, setShowUserPanel] = useState(false);

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    // 小于1分钟
    if (diff < 60000) {
      return '刚刚';
    }

    // 小于1小时
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}分钟前`;
    }

    // 小于24小时
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}小时前`;
    }

    // 小于7天
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}天前`;
    }

    // 其他
    return formatDistanceToNow(new Date(timestamp), {
      locale: zhCN,
      addSuffix: true
    });
  };

  const getStatusIcon = (status?: MessageStatus) => {
    if (!status) return null;

    switch (status) {
      case MessageStatus.PENDING:
      case MessageStatus.SENDING:
        return (
          <div className="w-3 h-3 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
        );
      case MessageStatus.SENT:
        return (
          <svg
            className="w-4 h-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case MessageStatus.DELIVERED:
        return (
          <svg
            className="w-4 h-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7M5 13l4 4L19 7"
              transform="translate(3, 0)"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case MessageStatus.READ:
        return (
          <svg
            className="w-4 h-4 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7M5 13l4 4L19 7"
              transform="translate(3, 0)"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case MessageStatus.FAILED:
        return (
          <svg
            className="w-4 h-4 text-destructive"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 头部 */}
      <div className="p-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setShowUserPanel(true)}
            className="shrink-0 hover:opacity-80 transition-opacity"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>{currentUser.displayName[0]}</AvatarFallback>
            </Avatar>
          </button>
          <div className="flex-1">
            <h2 className="font-semibold">{currentUser.displayName}</h2>
            <p className="text-xs text-muted-foreground">
              {currentUser.bio || '在线'}
            </p>
          </div>
          <div className="h-2 w-2 rounded-full bg-green-500" />
        </div>

        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索联系人"
            className="pl-9"
          />
        </div>
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-border">
          {conversations.map((conversation) => {
            const isActive = conversation.id === activeConversationId;
            const lastMsg = conversation.lastMessage;

            return (
              <button
                key={`${conversation.id}-${lastMsg?.status || 'no-msg'}`}
                onClick={() => setActiveConversation(conversation.id)}
                className={cn(
                  'w-full p-4 flex items-start gap-3 hover:bg-accent transition-colors text-left relative',
                  isActive && 'bg-accent'
                )}
              >
                {/* 头像 */}
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conversation.avatar} />
                    <AvatarFallback>{conversation.title[0]}</AvatarFallback>
                  </Avatar>
                  {conversation.isPinned && (
                    <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1">
                      <Pin className="h-2.5 w-2.5 text-primary-foreground" />
                    </div>
                  )}
                </div>

                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  {/* 第一行 */}
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium truncate">
                      {conversation.title}
                    </h3>
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">
                      {lastMsg && formatTime(lastMsg.timestamp)}
                    </span>
                  </div>

                  {/* 第二行 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      {lastMsg?.isFromMe && (
                        <div className="shrink-0">
                          {getStatusIcon(lastMsg.status)}
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground truncate">
                        {lastMsg?.content || '暂无消息'}
                      </p>
                    </div>

                    {conversation.unreadCount > 0 && (
                      <Badge
                        variant="default"
                        className="ml-2 shrink-0 h-5 min-w-[20px] px-1.5 flex items-center justify-center"
                      >
                        {conversation.unreadCount > 99
                          ? '99+'
                          : conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* User Profile Panel */}
      <CurrentUserPanel
        open={showUserPanel}
        onOpenChange={setShowUserPanel}
      />
    </div>
  );
}
