'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Role } from '@/types/permission';
import { IconDotsVertical, IconEdit, IconTrash, IconShieldCheck } from '@tabler/icons-react';
import { useState } from 'react';
import { useRoleStore } from '../../store/role.store';
import { useRouter } from 'next/navigation';
import { RoleDrawer } from '../role-drawer';

interface CellActionProps {
  data: Role;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const { deleteRole } = useRoleStore();
  const router = useRouter();

  const handleDelete = async () => {
    try {
      await deleteRole(data.RoleID);
      setDeleteOpen(false);
    } catch (error) {
      // Error handled in store
    }
  };

  const handleAssignPermission = () => {
    router.push(`/dashboard/permissions/assign?roleId=${data.RoleID}&roleName=${encodeURIComponent(data.RoleName)}`);
  };

  return (
    <>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除角色 &quot;{data.RoleName}&quot; 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <IconDotsVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>操作</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <IconEdit className="mr-2 h-4 w-4" />
            编辑
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAssignPermission}>
            <IconShieldCheck className="mr-2 h-4 w-4" />
            分配权限
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive"
          >
            <IconTrash className="mr-2 h-4 w-4" />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RoleDrawer
        open={editOpen}
        onOpenChange={setEditOpen}
        initialData={data}
      />
    </>
  );
};
