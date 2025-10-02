'use client';

import { useState, KeyboardEvent } from 'react';
import { useIMStore } from '@/lib/im/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Smile,
  Paperclip,
  Mic,
  Send,
  MoreVertical
} from 'lucide-react';

interface MessageInputProps {
  conversationId: string;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const { sendMessage } = useIMStore();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(conversationId, message.trim());
      setMessage('');
    } catch (error) {
      console.error('发送失败:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Enter 发送
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4">
      {/* 输入区域 */}
      <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
        {/* 左侧工具按钮 */}
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
          <Smile className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* 输入框 */}
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-8"
          disabled={isSending}
        />

        {/* 右侧工具按钮 */}
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Mic className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Paperclip className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isSending}
            size="icon"
            className="h-9 w-9 shrink-0 ml-1"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
