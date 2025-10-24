import { NavItem } from '@/types';

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  // {
  //   title: '数据看板',
  //   url: '/dashboard/overview',
  //   icon: 'dashboard',
  //   isActive: false,
  //   shortcut: ['d', 'd'],
  //   items: [] // Empty array as there are no child items for Dashboard
  // },
  {
    title: '设备管理',
    url: '/dashboard/devices',
    icon: 'laptop',
    shortcut: ['d', 'v'],
    isActive: false,
    items: [] // No child items
  },
  // {
  //   title: '批量投屏',
  //   url: '/dashboard/batch-screen',
  //   icon: 'monitor',
  //   shortcut: ['b', 's'],
  //   isActive: false,
  //   items: [] // No child items
  // },
  {
    title: '权限管理',
    url: '#', // Parent item, no direct URL
    icon: 'user',
    shortcut: ['p', 'm'],
    isActive: false,
    items: [
      {
        title: '公司管理',
        url: '/dashboard/companies',
        moduleCode: 'COMPANY_MANAGEMENT' // Example module code
      },
      {
        title: '业务管理',
        url: '/dashboard/businesses',
        moduleCode: 'BUSINESS_MANAGEMENT' // Example module code
      },
      {
        title: '角色管理',
        url: '/dashboard/roles',
        moduleCode: 'ROLE_MANAGEMENT' // Example module code
      },
      {
        title: '用户管理',
        url: '/dashboard/users',
        moduleCode: 'USER_MANAGEMENT' // Example module code
      }
    ]
  }
];

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];
