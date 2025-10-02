'use client';

import { useState } from 'react';
import { useIMStore } from '@/lib/im/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import {
  User,
  Shield,
  Bell,
  UserPlus,
  Trash2,
  LogOut,
  ChevronRight,
  Circle
} from 'lucide-react';
import { UserStatus } from '@/types/im';

interface CurrentUserPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CurrentUserPanel({
  open,
  onOpenChange
}: CurrentUserPanelProps) {
  const { currentUser } = useIMStore();
  const [selectedStatus, setSelectedStatus] = useState(
    currentUser.status || UserStatus.ONLINE
  );

  const statusOptions = [
    {
      status: UserStatus.ONLINE,
      label: 'Online',
      color: 'bg-green-500'
    },
    {
      status: UserStatus.AWAY,
      label: 'Away',
      color: 'bg-yellow-500'
    },
    {
      status: UserStatus.DND,
      label: 'Do not disturb',
      color: 'bg-red-500'
    },
    {
      status: UserStatus.OFFLINE,
      label: 'Offline',
      color: 'bg-gray-400'
    }
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 pb-4">
            <SheetTitle>Profile</SheetTitle>
          </SheetHeader>

          <Separator />

          {/* User Profile */}
          <div className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback>{currentUser.displayName[0]}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">
                {currentUser.displayName}
              </h3>
              <p className="text-sm text-muted-foreground">
                @{currentUser.username}
              </p>
              {currentUser.bio && (
                <p className="text-sm text-muted-foreground mt-2">
                  {currentUser.bio}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Status */}
          <div className="p-4">
            <h4 className="text-sm font-medium mb-3">Status</h4>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <button
                  key={option.status}
                  onClick={() => setSelectedStatus(option.status)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${option.color}`} />
                    <span className="text-sm">{option.label}</span>
                  </div>
                  {selectedStatus === option.status && (
                    <Circle className="h-4 w-4 fill-primary text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Settings */}
          <div className="flex-1 overflow-auto">
            <div className="p-4">
              <h4 className="text-sm font-medium mb-3">Settings</h4>
              <div className="space-y-1">
                {/* Two-step Verification */}
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Two-step Verification</span>
                  </div>
                  <Switch />
                </div>

                {/* Notification */}
                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Notification</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>

                {/* Invite Friends */}
                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Invite Friends</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>

                {/* Delete Account */}
                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">
                      Delete Account
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Logout Button */}
          <div className="p-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => {
                console.log('Logout clicked');
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
