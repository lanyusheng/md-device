'use client';

import { columns } from './user-tables/columns';
import { UserTable } from './user-tables';
import { UserDrawer } from './user-drawer';
import { useUserStore } from '../store/user.store';
import { useEffect, useState } from 'react';

export default function UserListingPage() {
  const { users, fetchUsers, isLoading } = useUserStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <>
      <UserTable
        data={users}
        totalItems={users.length}
        columns={columns}
        isLoading={isLoading}
        onAddClick={() => setDrawerOpen(true)}
      />
      <UserDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}
