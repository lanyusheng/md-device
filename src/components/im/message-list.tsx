'use client';

import { useEffect, useRef } from 'react';
import { useIMStore } from '@/lib/im/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { MessageStatus, MessageType } from '@/types/im';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Check, CheckCheck, Clock } from 'lucide-react';

interface MessageListProps {
  conversationId: string;
}

export function MessageList({ conversationId }: MessageListProps) {
  const { messages, users, currentUser } = useIMStore();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const conversationMessages = messages[conversationId] || [];

  const formatMessageTime = (timestamp: number) => {
    const now = new Date();
    const msgDate = new Date(timestamp);

    // 今天
    if (msgDate.toDateString() === now.toDateString()) {
      return format(msgDate, 'HH:mm');
    }

    // 昨天
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (msgDate.toDateString() === yesterday.toDateString()) {
      return '昨天 ' + format(msgDate, 'HH:mm');
    }

    // 本周
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    if (msgDate >= weekStart) {
      return format(msgDate, 'EEEE HH:mm', { locale: zhCN });
    }

    // 其他
    return format(msgDate, 'MM月dd日 HH:mm');
  };

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case MessageStatus.PENDING:
      case MessageStatus.SENDING:
        return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
      case MessageStatus.SENT:
        return <Check className="h-3.5 w-3.5 text-muted-foreground" />;
      case MessageStatus.DELIVERED:
        return <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />;
      case MessageStatus.READ:
        return <CheckCheck className="h-3.5 w-3.5 text-primary" />;
      case MessageStatus.FAILED:
        return (
          <span className="text-xs text-destructive font-medium">发送失败</span>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollArea className="h-full" ref={scrollAreaRef}>
      <div className="p-4 space-y-4">
        {conversationMessages.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center space-y-2">
              <div className="text-4xl">💭</div>
              <p>暂无消息</p>
            </div>
          </div>
        ) : (
          conversationMessages.map((message, index) => {
            const isFromMe = message.isFromMe;
            const sender = isFromMe
              ? currentUser
              : users[message.senderId] || null;

            // 时间分组 - 如果距离上一条消息超过5分钟，显示时间
            const showTime =
              index === 0 ||
              message.createdAt - conversationMessages[index - 1].createdAt >
                300000;

            return (
              <div key={message.id}>
                {/* 时间分隔 */}
                {showTime && (
                  <div className="flex justify-center mb-4">
                    <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      {formatMessageTime(message.createdAt)}
                    </span>
                  </div>
                )}

                {/* 消息 */}
                <div
                  className={cn(
                    'flex gap-3 items-start',
                    isFromMe && 'flex-row-reverse'
                  )}
                >
                  {/* 头像 */}
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={sender?.avatar} />
                    <AvatarFallback>
                      {sender?.displayName?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>

                  {/* 消息内容 */}
                  <div
                    className={cn(
                      'flex flex-col gap-1 max-w-[70%]',
                      isFromMe && 'items-end'
                    )}
                  >
                    {/* 消息气泡 */}
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-2.5',
                        isFromMe
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      )}
                    >
                      {message.type === MessageType.TEXT && (
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {(message.content as any).text}
                        </p>
                      )}
                      {message.type === MessageType.IMAGE && (
                        <div className="space-y-2">
                          <img
                            src={(message.content as any).url}
                            alt="图片消息"
                            className="rounded-lg max-w-full"
                          />
                          {(message.content as any).caption && (
                            <p className="text-sm">
                              {(message.content as any).caption}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 状态和时间 */}
                    <div
                      className={cn(
                        'flex items-center gap-1 px-2',
                        isFromMe && 'flex-row-reverse'
                      )}
                    >
                      {isFromMe && getStatusIcon(message.status)}
                      <span className="text-xs text-muted-foreground">
                        {format(message.createdAt, 'HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
}
