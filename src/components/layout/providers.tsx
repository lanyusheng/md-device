'use client';
import React from 'react';
import { ActiveThemeProvider } from '../active-theme';
import { PermissionProvider } from '../providers/permission-provider';

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  return (
    <ActiveThemeProvider initialTheme={activeThemeValue}>
      <PermissionProvider>{children}</PermissionProvider>
    </ActiveThemeProvider>
  );
}
