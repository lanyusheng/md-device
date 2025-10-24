'use client';

import { columns } from './role-tables/columns';
import { RoleTable } from './role-tables';
import { RoleDrawer } from './role-drawer';
import { useRoleStore } from '../store/role.store';
import { useEffect, useState } from 'react';

export default function RoleListingPage() {
  const { roles, fetchRoles, isLoading } = useRoleStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return (
    <>
      <RoleTable
        data={roles}
        totalItems={roles.length}
        columns={columns}
        isLoading={isLoading}
        onAddClick={() => setDrawerOpen(true)}
      />
      <RoleDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        initialData={null}
      />
    </>
  );
}
