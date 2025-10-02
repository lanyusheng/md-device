'use client';

import { useState } from 'react';
import { useIMStore } from '@/lib/im/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Phone,
  Video,
  MoreVertical,
  ChevronLeft
} from 'lucide-react';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { UserPanel } from './user-panel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent
} from '@/components/ui/sheet';

export function ChatArea() {
  const {
    conversations,
    activeConversationId,
    users,
    isMobile,
    setShowConversationList
  } = useIMStore();
  const [showUserPanel, setShowUserPanel] = useState(false);

  const conversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  if (!conversation) return null;

  // 获取对方用户信息
  const otherUserId = conversation.participantIds.find(
    (id) => id !== useIMStore.getState().currentUser.id
  );
  const otherUser = otherUserId ? users[otherUserId] : null;

  return (
    <div className="flex flex-col h-full">
      {/* 聊天头部 */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        {/* 移动端返回按钮 */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowConversationList(true)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        {/* 用户信息 */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.avatar} />
            <AvatarFallback>{conversation.title[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{conversation.title}</h3>
            <p className="text-xs text-muted-foreground truncate">
              {otherUser?.isOnline ? '在线' : '离线'}
            </p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowUserPanel(true)}>
                查看联系人
              </DropdownMenuItem>
              <DropdownMenuItem>静音通知</DropdownMenuItem>
              <DropdownMenuItem>清空聊天记录</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                屏蔽联系人
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 min-h-0">
        <MessageList conversationId={conversation.id} />
      </div>

      {/* 输入框 */}
      <div className="border-t border-border">
        <MessageInput conversationId={conversation.id} />
      </div>

      {/* 联系人详情面板（PC 和移动端都用 Sheet）*/}
      <Sheet open={showUserPanel} onOpenChange={setShowUserPanel}>
        <SheetContent side="right" className="w-full sm:w-80 p-0">
          <UserPanel />
        </SheetContent>
      </Sheet>
    </div>
  );
}
