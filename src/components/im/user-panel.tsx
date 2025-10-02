'use client';

import { useIMStore } from '@/lib/im/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Mail,
  Phone,
  Clock,
  Star,
  Archive,
  Trash2,
  Ban
} from 'lucide-react';

export function UserPanel() {
  const {
    conversations,
    activeConversationId,
    users,
    currentUser
  } = useIMStore();

  const conversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  if (!conversation) return null;

  const otherUserId = conversation.participantIds.find(
    (id) => id !== currentUser.id
  );
  const otherUser = otherUserId ? users[otherUserId] : null;

  if (!otherUser) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 头部 */}
      <div className="p-4 border-b border-border shrink-0">
        <h3 className="font-semibold">联系人信息</h3>
      </div>

      {/* 滚动内容区域 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* 用户信息 */}
          <div className="flex flex-col items-center text-center space-y-3">
            <Avatar className="h-24 w-24">
              <AvatarImage src={otherUser.avatar} />
              <AvatarFallback className="text-3xl">
                {otherUser.displayName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">
                {otherUser.displayName}
              </h2>
              <p className="text-sm text-muted-foreground">
                @{otherUser.username}
              </p>
            </div>
            {otherUser.bio && (
              <p className="text-sm text-muted-foreground max-w-[250px]">
                {otherUser.bio}
              </p>
            )}
          </div>

          <Separator />

          {/* 联系方式 */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground">
              联系方式
            </h3>
            {otherUser.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{otherUser.email}</span>
              </div>
            )}
            {otherUser.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{otherUser.phone}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* 状态信息 */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground">
              状态信息
            </h3>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {otherUser.isOnline
                  ? '在线'
                  : `最后在线: ${new Date(otherUser.lastSeen).toLocaleString('zh-CN')}`}
              </span>
            </div>
          </div>

          <Separator />

          {/* 聊天设置 */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground">
              聊天设置
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">标为重要</span>
                </div>
                <Switch checked={conversation.isPinned} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Archive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">免打扰</span>
                </div>
                <Switch checked={conversation.isMuted} />
              </div>
            </div>
          </div>

          <Separator />

          {/* 操作按钮 */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Archive className="h-4 w-4 mr-2" />
              归档聊天
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              清空聊天记录
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              size="sm"
            >
              <Ban className="h-4 w-4 mr-2" />
              屏蔽联系人
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
