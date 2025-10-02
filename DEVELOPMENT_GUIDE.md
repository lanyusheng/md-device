# Next.js + Shadcn-ui 开发指南

> 本指南面向 Vue 开发者，帮助快速上手 Next.js + React + TypeScript 技术栈

## 目录

- [一、项目架构概览](#一项目架构概览)
- [二、技术栈对比](#二技术栈对比)
- [三、核心概念详解](#三核心概念详解)
- [四、CRUD 开发流程](#四crud-开发流程)
- [五、代码示例详解](#五代码示例详解)
- [六、常见问题与最佳实践](#六常见问题与最佳实践)

---

## 一、项目架构概览

### 1.1 目录结构（Feature-based）

```
src/
├── app/                        # Next.js App Router（路由目录）
│   ├── api/                    # API 路由
│   │   └── auth/
│   │       ├── login/route.ts
│   │       └── logout/route.ts
│   ├── dashboard/              # 业务页面
│   │   ├── tasks/
│   │   │   └── page.tsx        # /dashboard/tasks 路由
│   │   └── layout.tsx
│   ├── login/
│   │   └── page.tsx
│   └── layout.tsx              # 根布局
│
├── features/                   # 业务功能模块（按领域划分）
│   └── tasks/
│       └── components/
│           ├── task-listing.tsx          # 列表容器组件
│           ├── task-drawer.tsx           # 表单抽屉组件
│           └── task-tables/
│               ├── index.tsx             # 表格组件
│               ├── columns.tsx           # 列定义
│               ├── task-toolbar.tsx      # 工具栏（搜索、过滤）
│               └── cell-action.tsx       # 行操作按钮
│
├── components/                 # 通用 UI 组件
│   ├── layout/                 # 布局组件
│   ├── forms/                  # 表单组件
│   └── ui/                     # Shadcn UI 组件库
│
├── types/                      # TypeScript 类型定义
│   └── task.ts
│
├── constants/                  # 常量和 Mock 数据
│   └── task-data.ts
│
├── hooks/                      # 自定义 Hooks
│   └── use-media-query.ts
│
└── lib/                        # 工具函数
    └── utils.ts
```

### 1.2 架构设计原则

| 概念 | 说明 | 示例 |
|------|------|------|
| **Feature-based** | 按业务功能组织代码，而非技术类型 | `features/tasks/` 包含任务相关的所有组件 |
| **Colocation** | 相关代码放在一起 | 表格的列定义、工具栏、单元格操作都在 `task-tables/` |
| **组件分层** | Page → Container → UI Components | `page.tsx` → `task-listing.tsx` → `TaskTable` |
| **单一职责** | 每个组件只做一件事 | `columns.tsx` 只定义列，`task-toolbar.tsx` 只管工具栏 |

---

## 二、技术栈对比

### 2.1 核心技术栈

| 技术 | 版本 | 用途 | Vue 生态对应 |
|------|------|------|-------------|
| **Next.js** | 15.x | React 框架 | Nuxt.js |
| **React** | 19.x | UI 库 | Vue 3 |
| **TypeScript** | 5.x | 类型系统 | TypeScript |
| **Tailwind CSS** | 3.x | 样式方案 | Tailwind CSS / UnoCSS |
| **Shadcn-ui** | - | 组件库 | Element Plus / Ant Design Vue |
| **TanStack Table** | 8.x | 表格组件 | 自定义封装或第三方库 |
| **React Hook Form** | 7.x | 表单管理 | VeeValidate |
| **Zod** | 3.x | 数据校验 | Yup / Valibot |
| **Zustand** | 4.x | 状态管理 | Pinia |
| **SWR / React Query** | - | 数据获取 | VueUse / Pinia |

### 2.2 React vs Vue 核心概念对比

#### 2.2.1 组件定义

```typescript
// ===== React =====
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// ===== Vue 3 Composition API =====
<script setup lang="ts">
import { ref } from 'vue';

const count = ref(0);
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="count++">Increment</button>
  </div>
</template>
```

#### 2.2.2 响应式数据

| React | Vue 3 | 说明 |
|-------|-------|------|
| `const [count, setCount] = useState(0)` | `const count = ref(0)` | 基础响应式 |
| `setCount(1)` | `count.value = 1` | 更新值 |
| `count` | `count.value` | 读取值（模板中不需要 `.value`） |
| `const double = useMemo(() => count * 2, [count])` | `const double = computed(() => count.value * 2)` | 计算属性 |
| `useEffect(() => {}, [count])` | `watch(count, () => {})` | 监听变化 |

#### 2.2.3 组件通信

```typescript
// ===== React: Props 传递 =====
// 父组件
<TaskDrawer
  open={drawerOpen}
  onOpenChange={setDrawerOpen}  // 事件通过函数传递
  initialData={task}
/>

// 子组件
interface TaskDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;  // 函数类型
  initialData: Task | null;
}

export function TaskDrawer({ open, onOpenChange, initialData }: TaskDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {/* ... */}
    </Drawer>
  );
}

// ===== Vue: Props + Emits =====
<!-- 父组件 -->
<TaskDrawer
  :open="drawerOpen"
  @update:open="setDrawerOpen"  // v-model 语法糖
  :initial-data="task"
/>

<!-- 子组件 -->
<script setup lang="ts">
interface Props {
  open: boolean;
  initialData: Task | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:open': [value: boolean];
}>();
</script>
```

#### 2.2.4 条件渲染与列表

```typescript
// ===== React =====
export function TaskList({ tasks }: { tasks: Task[] }) {
  const [showCompleted, setShowCompleted] = useState(true);

  return (
    <div>
      {/* 条件渲染：三元表达式或 && 运算符 */}
      {showCompleted ? <CompletedTasks /> : <ActiveTasks />}
      {tasks.length === 0 && <EmptyState />}

      {/* 列表渲染：map 方法 */}
      {tasks.map(task => (
        <TaskItem key={task.id} data={task} />  {/* key 必须 */}
      ))}
    </div>
  );
}

// ===== Vue 3 =====
<script setup lang="ts">
const showCompleted = ref(true);
const tasks = ref<Task[]>([]);
</script>

<template>
  <div>
    <!-- 条件渲染：v-if / v-else -->
    <CompletedTasks v-if="showCompleted" />
    <ActiveTasks v-else />
    <EmptyState v-if="tasks.length === 0" />

    <!-- 列表渲染：v-for -->
    <TaskItem
      v-for="task in tasks"
      :key="task.id"
      :data="task"
    />
  </div>
</template>
```

---

## 三、核心概念详解

### 3.1 Next.js App Router

#### 3.1.1 文件即路由

```
app/
├── page.tsx                    → /
├── login/
│   └── page.tsx                → /login
├── dashboard/
│   ├── layout.tsx              → /dashboard 的布局
│   ├── page.tsx                → /dashboard
│   └── tasks/
│       └── page.tsx            → /dashboard/tasks
└── api/
    └── tasks/
        └── route.ts            → /api/tasks (API 路由)
```

#### 3.1.2 Server Component vs Client Component

```typescript
// ===== Server Component（默认）=====
// ✅ 可以直接访问数据库
// ✅ 在服务器渲染，减少客户端 JS
// ❌ 不能使用 useState、useEffect
// ❌ 不能使用浏览器 API

export default async function TasksPage() {
  // 可以直接在组件内获取数据
  const tasks = await db.task.findMany();

  return <TaskList tasks={tasks} />;
}

// ===== Client Component（需声明 'use client'）=====
'use client';

import { useState } from 'react';

// ✅ 可以使用 Hooks
// ✅ 可以绑定事件
// ✅ 可以使用浏览器 API
// ❌ 不能直接访问服务器资源

export default function TasksPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setDrawerOpen(true)}>Create</button>
      <TaskDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
```

**何时使用 `'use client'`？**

- ✅ 使用 `useState`、`useEffect` 等 Hooks
- ✅ 使用事件处理器（`onClick`、`onChange`）
- ✅ 使用浏览器 API（`localStorage`、`window`）
- ✅ 使用需要客户端运行的第三方库

#### 3.1.3 API 路由

```typescript
// app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';

// GET /api/tasks
export async function GET(request: NextRequest) {
  const tasks = await db.task.findMany();
  return NextResponse.json(tasks);
}

// POST /api/tasks
export async function POST(request: NextRequest) {
  const body = await request.json();
  const task = await db.task.create({ data: body });
  return NextResponse.json(task, { status: 201 });
}

// app/api/tasks/[id]/route.ts
// PATCH /api/tasks/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const task = await db.task.update({
    where: { id: params.id },
    data: body
  });
  return NextResponse.json(task);
}

// DELETE /api/tasks/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await db.task.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
```

### 3.2 React Hooks 详解

#### 3.2.1 useState - 状态管理

```typescript
import { useState } from 'react';

function Counter() {
  // 基础用法
  const [count, setCount] = useState(0);

  // 对象状态
  const [user, setUser] = useState({ name: '', age: 0 });

  // 数组状态
  const [items, setItems] = useState<Task[]>([]);

  // 函数式更新（基于旧值）
  setCount(prevCount => prevCount + 1);

  // 对象更新（需要展开运算符）
  setUser(prevUser => ({ ...prevUser, name: 'John' }));

  // 数组更新
  setItems(prevItems => [...prevItems, newItem]);  // 添加
  setItems(prevItems => prevItems.filter(item => item.id !== id));  // 删除
  setItems(prevItems => prevItems.map(item =>
    item.id === id ? { ...item, status: 'done' } : item
  ));  // 更新

  return <div>{count}</div>;
}
```

#### 3.2.2 useEffect - 副作用

```typescript
import { useEffect } from 'react';

function TaskList() {
  const [tasks, setTasks] = useState([]);

  // 组件挂载时执行（类似 Vue 的 onMounted）
  useEffect(() => {
    fetchTasks();
  }, []);  // 空数组表示只执行一次

  // 监听依赖变化（类似 Vue 的 watch）
  useEffect(() => {
    console.log('Tasks changed:', tasks);
  }, [tasks]);  // tasks 变化时执行

  // 清理函数（类似 Vue 的 onUnmounted）
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Polling...');
    }, 5000);

    return () => {
      clearInterval(timer);  // 组件卸载时清理
    };
  }, []);

  return <div>{/* ... */}</div>;
}
```

#### 3.2.3 useMemo - 性能优化

```typescript
import { useMemo } from 'react';

function TaskList({ tasks }: { tasks: Task[] }) {
  // 计算属性（类似 Vue 的 computed）
  const completedTasks = useMemo(() => {
    return tasks.filter(task => task.status === 'done');
  }, [tasks]);  // 只有 tasks 变化时才重新计算

  // 昂贵的计算
  const statistics = useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'done').length,
      pending: tasks.filter(t => t.status === 'todo').length,
    };
  }, [tasks]);

  return (
    <div>
      <p>Completed: {completedTasks.length}</p>
      <p>Total: {statistics.total}</p>
    </div>
  );
}
```

#### 3.2.4 useCallback - 函数缓存

```typescript
import { useCallback } from 'react';

function TaskList({ tasks }: { tasks: Task[] }) {
  const [filter, setFilter] = useState('');

  // 缓存函数，避免子组件不必要的重新渲染
  const handleDelete = useCallback((id: string) => {
    // 删除逻辑
  }, []);  // 空数组表示函数永不改变

  const handleFilter = useCallback((value: string) => {
    setFilter(value);
  }, []);  // filter 不在依赖中，因为使用的是 setState

  return (
    <div>
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          data={task}
          onDelete={handleDelete}  // 传递稳定的函数引用
        />
      ))}
    </div>
  );
}
```

### 3.3 TypeScript 类型定义规范

```typescript
// ===== 基础类型定义 =====
// src/types/task.ts

// 使用 type 定义联合类型
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'backlog' | 'canceled';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskLabel = 'bug' | 'feature' | 'documentation';

// 使用 interface 定义对象结构
export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  label: TaskLabel;
  priority: TaskPriority;
  createdAt: string;
  updatedAt?: string;  // 可选字段
}

// 组件 Props 类型
export interface TaskDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;  // 函数类型
  initialData: Task | null;  // 联合类型
}

// 表格列选项类型
export interface TaskStatusOption {
  label: string;
  value: TaskStatus;
  icon: React.ComponentType<{ className?: string }>;  // 组件类型
}

// 导出常量（供组件使用）
export const taskStatuses: TaskStatusOption[] = [
  {
    label: 'Todo',
    value: 'todo',
    icon: IconCircle
  },
  {
    label: 'In Progress',
    value: 'in_progress',
    icon: IconCircleDashed
  },
  // ...
];

export const taskPriorities: TaskStatusOption[] = [
  { label: 'Low', value: 'low', icon: IconArrowDown },
  { label: 'Medium', value: 'medium', icon: IconArrowUpRight },
  { label: 'High', value: 'high', icon: IconArrowUp },
];

export const taskLabels: TaskStatusOption[] = [
  { label: 'Bug', value: 'bug', icon: IconAlertCircle },
  { label: 'Feature', value: 'feature', icon: IconCircle },
  { label: 'Documentation', value: 'documentation', icon: IconFileText },
];
```

---

## 四、CRUD 开发流程

### 4.1 标准开发步骤

以创建 **Products（产品管理）** 模块为例：

#### Step 1: 定义类型和常量

```typescript
// ===== src/types/product.ts =====
export type ProductCategory = 'electronics' | 'clothing' | 'food';
export type ProductStatus = 'active' | 'inactive' | 'out_of_stock';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: ProductCategory;
  status: ProductStatus;
  stock: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductFormValues {
  name: string;
  description?: string;
  price: number;
  category: ProductCategory;
  status: ProductStatus;
  stock: number;
}

// 选项数据
export const productCategories = [
  { label: 'Electronics', value: 'electronics', icon: IconDevices },
  { label: 'Clothing', value: 'clothing', icon: IconShirt },
  { label: 'Food', value: 'food', icon: IconApple },
] as const;

export const productStatuses = [
  { label: 'Active', value: 'active', icon: IconCircleCheck },
  { label: 'Inactive', value: 'inactive', icon: IconCircleX },
  { label: 'Out of Stock', value: 'out_of_stock', icon: IconAlertCircle },
] as const;
```

```typescript
// ===== src/constants/product-data.ts =====
import { Product } from '@/types/product';

export const products: Product[] = [
  {
    id: 'P001',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse',
    price: 29.99,
    category: 'electronics',
    status: 'active',
    stock: 150,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'P002',
    name: 'Cotton T-Shirt',
    price: 19.99,
    category: 'clothing',
    status: 'active',
    stock: 200,
    createdAt: '2024-01-02T00:00:00Z'
  },
  // ... 更多数据
];
```

#### Step 2: 定义表格列

```typescript
// ===== src/features/products/components/product-tables/columns.tsx =====
'use client';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Product, ProductStatus, ProductCategory } from '@/types/product';
import { ColumnDef } from '@tanstack/react-table';
import {
  IconSortAscending,
  IconSortDescending,
  IconArrowsSort,
  IconCircleCheck,
  IconCircleX,
  IconAlertCircle,
  IconDevices,
  IconShirt,
  IconApple
} from '@tabler/icons-react';
import { CellAction } from './cell-action';

// 状态样式映射
const statusVariants: Record<ProductStatus, 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  inactive: 'secondary',
  out_of_stock: 'destructive'
};

// 状态图标映射
const statusIcons: Record<ProductStatus, React.ReactNode> = {
  active: <IconCircleCheck className='h-4 w-4' />,
  inactive: <IconCircleX className='h-4 w-4' />,
  out_of_stock: <IconAlertCircle className='h-4 w-4' />
};

// 分类图标映射
const categoryIcons: Record<ProductCategory, React.ReactNode> = {
  electronics: <IconDevices className='h-4 w-4' />,
  clothing: <IconShirt className='h-4 w-4' />,
  food: <IconApple className='h-4 w-4' />
};

export const columns: ColumnDef<Product>[] = [
  // 选择框列
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },

  // ID 列（可排序）
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <button
        className='flex items-center gap-1 hover:text-foreground'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <span>Product ID</span>
        {column.getIsSorted() === 'asc' ? (
          <IconSortAscending className='h-4 w-4' />
        ) : column.getIsSorted() === 'desc' ? (
          <IconSortDescending className='h-4 w-4' />
        ) : (
          <IconArrowsSort className='h-4 w-4 opacity-50' />
        )}
      </button>
    ),
    cell: ({ row }) => <div className='font-medium'>{row.getValue('id')}</div>,
    enableSorting: true
  },

  // 名称列
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <button
        className='flex items-center gap-1 hover:text-foreground'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <span>Name</span>
        {column.getIsSorted() === 'asc' ? (
          <IconSortAscending className='h-4 w-4' />
        ) : column.getIsSorted() === 'desc' ? (
          <IconSortDescending className='h-4 w-4' />
        ) : (
          <IconArrowsSort className='h-4 w-4 opacity-50' />
        )}
      </button>
    ),
    cell: ({ row }) => (
      <div className='max-w-[300px] truncate font-medium'>
        {row.getValue('name')}
      </div>
    ),
    enableSorting: true
  },

  // 价格列（自定义排序）
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <button
        className='flex items-center gap-1 hover:text-foreground'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <span>Price</span>
        {column.getIsSorted() === 'asc' ? (
          <IconSortAscending className='h-4 w-4' />
        ) : column.getIsSorted() === 'desc' ? (
          <IconSortDescending className='h-4 w-4' />
        ) : (
          <IconArrowsSort className='h-4 w-4 opacity-50' />
        )}
      </button>
    ),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(price);
      return <div className='font-medium'>{formatted}</div>;
    },
    enableSorting: true
  },

  // 分类列（带过滤）
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      const category = row.getValue('category') as ProductCategory;
      return (
        <div className='flex items-center gap-2'>
          {categoryIcons[category]}
          <span className='capitalize'>{category}</span>
        </div>
      );
    },
    enableColumnFilter: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    meta: {
      variant: 'multiSelect',
      label: 'Category',
      options: [
        { label: 'Electronics', value: 'electronics', icon: IconDevices },
        { label: 'Clothing', value: 'clothing', icon: IconShirt },
        { label: 'Food', value: 'food', icon: IconApple }
      ]
    }
  },

  // 状态列（带过滤）
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as ProductStatus;
      return (
        <Badge variant={statusVariants[status]} className='flex items-center gap-1 w-fit'>
          {statusIcons[status]}
          <span className='capitalize'>{status.replace('_', ' ')}</span>
        </Badge>
      );
    },
    enableColumnFilter: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    meta: {
      variant: 'multiSelect',
      label: 'Status',
      options: [
        { label: 'Active', value: 'active', icon: IconCircleCheck },
        { label: 'Inactive', value: 'inactive', icon: IconCircleX },
        { label: 'Out of Stock', value: 'out_of_stock', icon: IconAlertCircle }
      ]
    }
  },

  // 库存列
  {
    accessorKey: 'stock',
    header: ({ column }) => (
      <button
        className='flex items-center gap-1 hover:text-foreground'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <span>Stock</span>
        {column.getIsSorted() === 'asc' ? (
          <IconSortAscending className='h-4 w-4' />
        ) : column.getIsSorted() === 'desc' ? (
          <IconSortDescending className='h-4 w-4' />
        ) : (
          <IconArrowsSort className='h-4 w-4 opacity-50' />
        )}
      </button>
    ),
    cell: ({ row }) => {
      const stock = row.getValue('stock') as number;
      return (
        <div className={stock < 50 ? 'text-destructive font-medium' : ''}>
          {stock}
        </div>
      );
    },
    enableSorting: true
  },

  // 操作列
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
```

#### Step 3: 创建工具栏

```typescript
// ===== src/features/products/components/product-tables/product-toolbar.tsx =====
'use client';

import { DataTableFacetedFilter } from '@/components/ui/table/data-table-faceted-filter';
import { DataTableViewOptions } from '@/components/ui/table/data-table-view-options';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table } from '@tanstack/react-table';
import { Cross2Icon } from '@radix-ui/react-icons';
import {
  IconCircleCheck,
  IconCircleX,
  IconAlertCircle,
  IconDevices,
  IconShirt,
  IconApple
} from '@tabler/icons-react';

interface ProductToolbarProps<TData> {
  table: Table<TData>;
}

export function ProductToolbar<TData>({ table }: ProductToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || table.getState().globalFilter;

  return (
    <div className='flex w-full items-start justify-between gap-2 p-1'>
      <div className='flex flex-1 flex-wrap items-center gap-2'>
        {/* 全局搜索框 */}
        <Input
          placeholder='Search products...'
          value={table.getState().globalFilter ?? ''}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className='h-8 w-40 lg:w-64'
        />

        {/* Category 过滤器 */}
        {table.getColumn('category') && (
          <DataTableFacetedFilter
            column={table.getColumn('category')}
            title='Category'
            options={[
              { label: 'Electronics', value: 'electronics', icon: IconDevices },
              { label: 'Clothing', value: 'clothing', icon: IconShirt },
              { label: 'Food', value: 'food', icon: IconApple }
            ]}
            multiple
          />
        )}

        {/* Status 过滤器 */}
        {table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title='Status'
            options={[
              { label: 'Active', value: 'active', icon: IconCircleCheck },
              { label: 'Inactive', value: 'inactive', icon: IconCircleX },
              { label: 'Out of Stock', value: 'out_of_stock', icon: IconAlertCircle }
            ]}
            multiple
          />
        )}

        {/* 重置按钮 */}
        {isFiltered && (
          <Button
            aria-label='Reset filters'
            variant='outline'
            size='sm'
            className='h-8 border-dashed px-2 lg:px-3'
            onClick={() => {
              table.resetColumnFilters();
              table.setGlobalFilter('');
            }}
          >
            <Cross2Icon className='mr-2 h-4 w-4' />
            Reset
          </Button>
        )}
      </div>

      {/* 列显示/隐藏控制 */}
      <div className='flex items-center gap-2'>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
```

#### Step 4: 创建表格组件

```typescript
// ===== src/features/products/components/product-tables/index.tsx =====
'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { Product } from '@/types/product';
import { ColumnDef, FilterFn } from '@tanstack/react-table';
import { parseAsInteger, useQueryState } from 'nuqs';
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { ProductToolbar } from './product-toolbar';
import * as React from 'react';

interface ProductTableProps {
  data: Product[];
  totalItems: number;
  columns: ColumnDef<Product, unknown>[];
}

// 全局搜索过滤函数
const globalFilterFn: FilterFn<Product> = (row, columnId, filterValue) => {
  const searchValue = String(filterValue).toLowerCase();
  const searchableText = `${row.original.id} ${row.original.name} ${row.original.category} ${row.original.status}`.toLowerCase();
  return searchableText.includes(searchValue);
};

export function ProductTable({ data, totalItems, columns }: ProductTableProps) {
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [sorting, setSorting] = React.useState([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      columnFilters,
      sorting,
      rowSelection,
      columnVisibility
    },
    enableRowSelection: true,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues()
  });

  return (
    <DataTable table={table}>
      <ProductToolbar table={table} />
    </DataTable>
  );
}
```

#### Step 5: 创建行操作组件

```typescript
// ===== src/features/products/components/product-tables/cell-action.tsx =====
'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Product } from '@/types/product';
import { IconCopy, IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ProductDrawer } from '../product-drawer';

interface CellActionProps {
  data: Product;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const router = useRouter();

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('Product ID copied to clipboard');
  };

  return (
    <>
      <ProductDrawer open={editOpen} onOpenChange={setEditOpen} initialData={data} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data.id)}>
            <IconCopy className='mr-2 h-4 w-4' />
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <IconEdit className='mr-2 h-4 w-4' />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDeleteOpen(true)} className='text-destructive'>
            <IconTrash className='mr-2 h-4 w-4' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
```

#### Step 6: 创建表单抽屉

```typescript
// ===== src/features/products/components/product-drawer.tsx =====
'use client';

import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Product, productCategories, productStatuses } from '@/types/product';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Product name must be at least 3 characters' }),
  description: z.string().optional(),
  price: z.number().positive({ message: 'Price must be greater than 0' }),
  category: z.enum(['electronics', 'clothing', 'food']),
  status: z.enum(['active', 'inactive', 'out_of_stock']),
  stock: z.number().int().min(0, { message: 'Stock cannot be negative' })
});

interface ProductDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: Product | null;
}

export function ProductDrawer({ open, onOpenChange, initialData }: ProductDrawerProps) {
  const { isDesktop } = useMediaQuery();

  const defaultValues = {
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    category: initialData?.category || 'electronics',
    status: initialData?.status || 'active',
    stock: initialData?.stock || 0
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues as z.infer<typeof formSchema>
  });

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // TODO: API 调用
      // if (initialData) {
      //   await fetch(`/api/products/${initialData.id}`, {
      //     method: 'PATCH',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify(values)
      //   });
      // } else {
      //   await fetch('/api/products', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify(values)
      //   });
      // }

      console.log(values);
      toast.success(initialData ? 'Product updated' : 'Product created');
      onOpenChange(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong');
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isDesktop ? 'right' : 'bottom'}
    >
      <DrawerContent className={isDesktop ? 'sm:max-w-md' : ''}>
        <div className={isDesktop ? 'h-full overflow-auto' : 'mx-auto w-full max-w-2xl'}>
          <DrawerHeader>
            <DrawerTitle>
              {initialData ? `Edit Product - ${initialData.id}` : 'Create Product'}
            </DrawerTitle>
            <DrawerDescription>
              {initialData ? 'Update product information' : 'Add a new product'}
            </DrawerDescription>
          </DrawerHeader>

          <div className='p-4 pb-0'>
            <Form
              form={form}
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-6'
            >
              <FormInput
                control={form.control}
                name='name'
                label='Product Name'
                placeholder='Enter product name'
                required
              />

              <FormInput
                control={form.control}
                name='description'
                label='Description'
                placeholder='Enter product description'
              />

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <FormInput
                  control={form.control}
                  name='price'
                  label='Price'
                  type='number'
                  placeholder='0.00'
                  required
                />

                <FormInput
                  control={form.control}
                  name='stock'
                  label='Stock'
                  type='number'
                  placeholder='0'
                  required
                />
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <FormSelect
                  control={form.control}
                  name='category'
                  label='Category'
                  placeholder='Select category'
                  required
                  options={productCategories.map((c) => ({
                    label: c.label,
                    value: c.value
                  }))}
                />

                <FormSelect
                  control={form.control}
                  name='status'
                  label='Status'
                  placeholder='Select status'
                  required
                  options={productStatuses.map((s) => ({
                    label: s.label,
                    value: s.value
                  }))}
                />
              </div>

              <DrawerFooter className='px-0'>
                <Button type='submit'>
                  {initialData ? 'Update Product' : 'Create Product'}
                </Button>
                <DrawerClose asChild>
                  <Button variant='outline'>Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </Form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
```

#### Step 7: 创建列表容器

```typescript
// ===== src/features/products/components/product-listing.tsx =====
'use client';

import { columns } from './product-tables/columns';
import { ProductTable } from './product-tables';
import { products } from '@/constants/product-data';

export default function ProductListingPage() {
  // 这里使用 Mock 数据
  // 真实场景：
  // const { data, isLoading } = useSWR('/api/products', fetcher);
  // if (isLoading) return <LoadingSpinner />;

  return (
    <ProductTable
      data={products}
      totalItems={products.length}
      columns={columns}
    />
  );
}
```

#### Step 8: 创建路由页面

```typescript
// ===== src/app/dashboard/products/page.tsx =====
'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import ProductListingPage from '@/features/products/components/product-listing';
import { ProductDrawer } from '@/features/products/components/product-drawer';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';

export default function ProductsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Products'
            description='Manage your products inventory'
          />
          <Button
            onClick={() => setDrawerOpen(true)}
            className='text-xs md:text-sm'
          >
            <IconPlus className='mr-2 h-4 w-4' /> Add Product
          </Button>
        </div>
        <Separator />
        <ProductListingPage />
      </div>

      <ProductDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        initialData={null}
      />
    </PageContainer>
  );
}
```

### 4.2 开发检查清单

完成以下步骤后，你的 CRUD 模块就完成了：

- [ ] **类型定义**：在 `src/types/` 定义接口和类型
- [ ] **Mock 数据**：在 `src/constants/` 创建测试数据
- [ ] **列定义**：在 `features/{module}/components/{module}-tables/columns.tsx` 定义表格列
- [ ] **工具栏**：创建 `{module}-toolbar.tsx` 实现搜索和过滤
- [ ] **表格组件**：在 `index.tsx` 配置 TanStack Table
- [ ] **行操作**：在 `cell-action.tsx` 实现编辑/删除操作
- [ ] **表单抽屉**：在 `{module}-drawer.tsx` 实现创建/编辑表单
- [ ] **列表容器**：在 `{module}-listing.tsx` 获取数据并传递给表格
- [ ] **路由页面**：在 `app/dashboard/{module}/page.tsx` 组装所有组件
- [ ] **导航菜单**：在侧边栏配置中添加菜单项

---

## 五、代码示例详解

### 5.1 TanStack Table 核心配置

```typescript
import { useReactTable, getCoreRowModel, ... } from '@tanstack/react-table';

const table = useReactTable({
  // ===== 数据源 =====
  data: tasks,              // 表格数据（必需）
  columns: columns,         // 列定义（必需）

  // ===== 状态管理 =====
  state: {
    globalFilter,           // 全局搜索值
    columnFilters,          // 列过滤值数组 [{id: 'status', value: ['todo', 'done']}]
    sorting,                // 排序状态 [{id: 'priority', desc: false}]
    rowSelection,           // 选中的行 {0: true, 2: true}
    columnVisibility,       // 列显示状态 {id: true, actions: false}
    pagination: {           // 分页状态
      pageIndex: 0,
      pageSize: 10
    }
  },

  // ===== 状态更新函数 =====
  onGlobalFilterChange: setGlobalFilter,
  onColumnFiltersChange: setColumnFilters,
  onSortingChange: setSorting,
  onRowSelectionChange: setRowSelection,
  onColumnVisibilityChange: setColumnVisibility,
  onPaginationChange: setPagination,

  // ===== 功能启用 =====
  enableRowSelection: true,       // 启用行选择
  enableMultiRowSelection: true,  // 启用多选
  enableColumnFilters: true,      // 启用列过滤
  enableSorting: true,            // 启用排序
  enableGlobalFilter: true,       // 启用全局搜索

  // ===== 自定义函数 =====
  globalFilterFn: (row, columnId, filterValue) => {
    // 自定义全局搜索逻辑
    const searchValue = String(filterValue).toLowerCase();
    const searchableText = `${row.original.id} ${row.original.title}`.toLowerCase();
    return searchableText.includes(searchValue);
  },

  // ===== 模型函数（启用功能）=====
  getCoreRowModel: getCoreRowModel(),             // 核心功能（必需）
  getFilteredRowModel: getFilteredRowModel(),     // 过滤功能
  getSortedRowModel: getSortedRowModel(),         // 排序功能
  getPaginationRowModel: getPaginationRowModel(), // 分页功能
  getFacetedRowModel: getFacetedRowModel(),       // 分面过滤（用于多选过滤器的计数）
  getFacetedUniqueValues: getFacetedUniqueValues() // 获取唯一值（用于过滤器选项）
});
```

**常用表格方法：**

```typescript
// ===== 获取状态 =====
table.getState()                    // 获取所有状态
table.getState().globalFilter       // 获取全局搜索值
table.getState().columnFilters      // 获取列过滤值
table.getState().sorting            // 获取排序状态

// ===== 设置状态 =====
table.setGlobalFilter('keyword')    // 设置全局搜索
table.resetGlobalFilter()           // 重置全局搜索
table.resetColumnFilters()          // 重置所有列过滤
table.resetSorting()                // 重置排序

// ===== 行选择 =====
table.getSelectedRowModel()         // 获取选中的行
table.toggleAllPageRowsSelected()   // 全选/取消全选当前页
table.resetRowSelection()           // 清空选中

// ===== 列操作 =====
table.getColumn('status')           // 获取列对象
table.getAllColumns()               // 获取所有列
table.getVisibleLeafColumns()       // 获取可见的列

// ===== 分页 =====
table.setPageSize(20)               // 设置每页条数
table.nextPage()                    // 下一页
table.previousPage()                // 上一页
table.setPageIndex(0)               // 跳转到指定页

// ===== 行数据 =====
table.getRowModel().rows            // 获取当前页的行数据
table.getFilteredRowModel().rows    // 获取过滤后的行数据
```

**列对象方法：**

```typescript
const column = table.getColumn('status');

column.getIsSorted()                // 获取排序状态 'asc' | 'desc' | false
column.toggleSorting(isAsc)         // 切换排序
column.clearSorting()               // 清除排序

column.getFilterValue()             // 获取过滤值
column.setFilterValue(value)        // 设置过滤值
column.getIsFiltered()              // 是否已过滤

column.getCanFilter()               // 是否可过滤
column.getCanSort()                 // 是否可排序
column.getCanHide()                 // 是否可隐藏
```

### 5.2 React Hook Form + Zod 表单校验

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// ===== 定义校验 Schema =====
const formSchema = z.object({
  // 字符串校验
  name: z.string()
    .min(3, { message: 'Name must be at least 3 characters' })
    .max(50, { message: 'Name must be less than 50 characters' }),

  // 邮箱校验
  email: z.string().email({ message: 'Invalid email address' }),

  // 数字校验
  age: z.number()
    .int({ message: 'Age must be an integer' })
    .min(18, { message: 'Must be at least 18' })
    .max(100, { message: 'Must be less than 100' }),

  price: z.number().positive({ message: 'Price must be greater than 0' }),

  // 枚举校验
  status: z.enum(['active', 'inactive'], {
    errorMap: () => ({ message: 'Please select a valid status' })
  }),

  // 可选字段
  description: z.string().optional(),

  // 日期校验
  birthDate: z.date().max(new Date(), { message: 'Birth date cannot be in the future' }),

  // 数组校验
  tags: z.array(z.string()).min(1, { message: 'At least one tag is required' }),

  // 对象校验
  address: z.object({
    street: z.string(),
    city: z.string(),
    zipCode: z.string().regex(/^\d{5}$/, 'Invalid zip code')
  }),

  // 自定义校验
  password: z.string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),

  // 确认密码
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']  // 错误显示在 confirmPassword 字段
});

// ===== 初始化表单 =====
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    name: '',
    email: '',
    age: 0,
    status: 'active',
    description: '',
    tags: []
  },
  mode: 'onChange'  // 'onChange' | 'onBlur' | 'onSubmit'
});

// ===== 表单方法 =====
// 获取值
const nameValue = form.watch('name');         // 监听单个字段
const allValues = form.watch();               // 监听所有字段

// 设置值
form.setValue('name', 'John');                // 设置单个字段
form.reset();                                 // 重置表单
form.reset({ name: 'New Default' });          // 重置并设置新默认值

// 错误处理
const errors = form.formState.errors;         // 获取所有错误
const nameError = errors.name?.message;       // 获取单个字段错误
form.setError('name', {                       // 手动设置错误
  type: 'manual',
  message: 'This name is already taken'
});
form.clearErrors('name');                     // 清除单个字段错误

// 表单状态
const isDirty = form.formState.isDirty;       // 表单是否被修改
const isValid = form.formState.isValid;       // 表单是否有效
const isSubmitting = form.formState.isSubmitting;  // 是否正在提交

// ===== 提交处理 =====
async function onSubmit(values: z.infer<typeof formSchema>) {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    const data = await response.json();
    toast.success('User created successfully');
    form.reset();
  } catch (error) {
    toast.error('Something went wrong');
    form.setError('root', {
      type: 'manual',
      message: 'Failed to submit form'
    });
  }
}

// ===== JSX 使用 =====
<Form form={form} onSubmit={form.handleSubmit(onSubmit)}>
  <FormInput
    control={form.control}
    name='name'
    label='Name'
    placeholder='Enter your name'
    required
  />

  <FormSelect
    control={form.control}
    name='status'
    label='Status'
    options={[
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' }
    ]}
  />

  <Button type='submit' disabled={form.formState.isSubmitting}>
    {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
  </Button>
</Form>
```

### 5.3 数据获取方式

#### 5.3.1 使用 fetch（基础）

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function TaskListingPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch('/api/tasks');
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTasks();
  }, []);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return <TaskTable data={tasks} />;
}
```

#### 5.3.2 使用 SWR（推荐）

```typescript
'use client';

import useSWR from 'swr';

// 定义 fetcher 函数
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function TaskListingPage() {
  const { data, error, isLoading, mutate } = useSWR<Task[]>(
    '/api/tasks',
    fetcher,
    {
      revalidateOnFocus: false,        // 窗口聚焦时不重新获取
      revalidateOnReconnect: true,     // 网络重连时重新获取
      refreshInterval: 0,              // 自动刷新间隔（0 = 不刷新）
      dedupingInterval: 2000,          // 去重间隔（2秒内的重复请求会被忽略）
    }
  );

  // 手动刷新数据
  const handleRefresh = () => {
    mutate();  // 重新获取数据
  };

  // 乐观更新
  const handleCreate = async (newTask: Task) => {
    // 立即更新 UI（乐观更新）
    mutate([...data!, newTask], false);

    // 发送 API 请求
    await fetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(newTask)
    });

    // 重新获取数据确保同步
    mutate();
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message='Failed to load tasks' />;

  return (
    <>
      <Button onClick={handleRefresh}>Refresh</Button>
      <TaskTable data={data || []} />
    </>
  );
}
```

**SWR 优势：**
- ✅ 自动缓存
- ✅ 自动去重请求
- ✅ 自动重新验证
- ✅ 乐观更新支持
- ✅ TypeScript 类型推导

#### 5.3.3 使用 React Query（企业级）

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function TaskListingPage() {
  const queryClient = useQueryClient();

  // 查询数据
  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks'],  // 查询键（用于缓存）
    queryFn: async () => {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      return response.json() as Promise<Task[]>;
    },
    staleTime: 5 * 60 * 1000,  // 数据新鲜时间（5分钟）
    gcTime: 10 * 60 * 1000,    // 垃圾回收时间（10分钟）
  });

  // 创建任务
  const createMutation = useMutation({
    mutationFn: async (newTask: Omit<Task, 'id'>) => {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      return response.json();
    },
    onSuccess: () => {
      // 创建成功后刷新列表
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created');
    },
    onError: () => {
      toast.error('Failed to create task');
    }
  });

  // 更新任务
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated');
    }
  });

  // 删除任务
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted');
    }
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message='Failed to load tasks' />;

  return (
    <TaskTable
      data={data || []}
      onUpdate={(id, data) => updateMutation.mutate({ id, data })}
      onDelete={(id) => deleteMutation.mutate(id)}
    />
  );
}
```

**React Query 优势：**
- ✅ 强大的缓存机制
- ✅ 自动后台重新获取
- ✅ 并行查询支持
- ✅ Mutation 状态管理
- ✅ 开发工具支持

---

## 六、常见问题与最佳实践

### 6.1 常见错误及解决方案

#### ❌ Error: Cannot use Hooks in Server Component

```typescript
// ❌ 错误示例
export default function Page() {
  const [count, setCount] = useState(0);  // Error!
  return <div>{count}</div>;
}

// ✅ 解决方案
'use client';  // 添加这一行

export default function Page() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}
```

#### ❌ Error: Objects are not valid as a React child

```typescript
// ❌ 错误示例
<div>{task}</div>  // task 是对象

// ✅ 解决方案
<div>{task.title}</div>  // 渲染对象的属性
<div>{JSON.stringify(task)}</div>  // 或者序列化对象
```

#### ❌ Warning: Each child in a list should have a unique "key" prop

```typescript
// ❌ 错误示例
{tasks.map(task => <TaskItem data={task} />)}

// ✅ 解决方案
{tasks.map(task => <TaskItem key={task.id} data={task} />)}
```

#### ❌ Error: Cannot update a component while rendering

```typescript
// ❌ 错误示例
function Component() {
  const [count, setCount] = useState(0);
  setCount(1);  // 直接在渲染时调用 setState
  return <div>{count}</div>;
}

// ✅ 解决方案
function Component() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(1);  // 在 useEffect 中调用
  }, []);

  return <div>{count}</div>;
}
```

### 6.2 性能优化最佳实践

#### 1. 使用 React.memo 避免不必要的重新渲染

```typescript
import { memo } from 'react';

// ❌ 未优化：父组件更新时，子组件总是重新渲染
function TaskItem({ task }: { task: Task }) {
  console.log('TaskItem rendered');
  return <div>{task.title}</div>;
}

// ✅ 优化：只有 props 变化时才重新渲染
const TaskItem = memo(function TaskItem({ task }: { task: Task }) {
  console.log('TaskItem rendered');
  return <div>{task.title}</div>;
});
```

#### 2. 使用 useCallback 缓存函数

```typescript
function TaskList({ tasks }: { tasks: Task[] }) {
  const [filter, setFilter] = useState('');

  // ❌ 未优化：每次渲染都创建新函数
  const handleDelete = (id: string) => {
    console.log('Delete', id);
  };

  // ✅ 优化：函数引用不变
  const handleDelete = useCallback((id: string) => {
    console.log('Delete', id);
  }, []);

  return (
    <>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} onDelete={handleDelete} />
      ))}
    </>
  );
}
```

#### 3. 使用 useMemo 缓存计算结果

```typescript
function TaskStats({ tasks }: { tasks: Task[] }) {
  // ❌ 未优化：每次渲染都重新计算
  const stats = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<TaskStatus, number>);

  // ✅ 优化：只有 tasks 变化时才重新计算
  const stats = useMemo(() => {
    return tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<TaskStatus, number>);
  }, [tasks]);

  return <div>{JSON.stringify(stats)}</div>;
}
```

#### 4. 虚拟化长列表

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualTaskList({ tasks }: { tasks: Task[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,  // 每行高度
    overscan: 5              // 预加载行数
  });

  return (
    <div ref={parentRef} style={{ height: '500px', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            <TaskItem task={tasks[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 6.3 代码风格规范

#### 1. 组件命名

```typescript
// ✅ 组件名使用 PascalCase
export function TaskDrawer() {}
export default function TaskListingPage() {}

// ✅ 文件名使用 kebab-case
// task-drawer.tsx
// task-listing.tsx
// cell-action.tsx
```

#### 2. Props 类型定义

```typescript
// ✅ 使用 interface 定义 Props
interface TaskDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: Task | null;
}

export function TaskDrawer({ open, onOpenChange, initialData }: TaskDrawerProps) {
  // ...
}

// ✅ 或使用解构 + 类型注解（简单情况）
export function TaskItem({ task }: { task: Task }) {
  // ...
}
```

#### 3. 状态管理

```typescript
// ✅ 状态变量使用有意义的名称
const [isDrawerOpen, setIsDrawerOpen] = useState(false);
const [selectedTask, setSelectedTask] = useState<Task | null>(null);
const [tasks, setTasks] = useState<Task[]>([]);

// ❌ 避免
const [open, setOpen] = useState(false);  // 太通用
const [data, setData] = useState([]);     // 不明确
```

#### 4. 条件渲染

```typescript
// ✅ 简单条件使用 &&
{isLoading && <LoadingSpinner />}
{error && <ErrorMessage message={error} />}

// ✅ 二选一使用三元表达式
{isDesktop ? <DesktopView /> : <MobileView />}

// ✅ 复杂条件提取为变量
const content = (() => {
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;
  if (tasks.length === 0) return <EmptyState />;
  return <TaskList tasks={tasks} />;
})();

return <div>{content}</div>;
```

#### 5. 事件处理

```typescript
// ✅ 简单处理直接内联
<Button onClick={() => setDrawerOpen(true)}>Open</Button>

// ✅ 复杂逻辑提取为函数
const handleSubmit = async (values: FormValues) => {
  try {
    await createTask(values);
    toast.success('Task created');
    setDrawerOpen(false);
  } catch (error) {
    toast.error('Failed to create task');
  }
};

<Form onSubmit={handleSubmit} />
```

### 6.4 项目组织最佳实践

#### 1. 文件组织

```
features/tasks/
├── components/
│   ├── task-listing.tsx        # 列表容器（数据获取）
│   ├── task-drawer.tsx         # 表单抽屉
│   └── task-tables/
│       ├── index.tsx           # 表格组件（状态管理）
│       ├── columns.tsx         # 列定义（纯配置）
│       ├── task-toolbar.tsx    # 工具栏（UI）
│       └── cell-action.tsx     # 行操作（UI）
├── hooks/
│   └── use-tasks.ts            # 自定义 Hook（可选）
└── utils/
    └── task-helpers.ts         # 工具函数（可选）
```

#### 2. 关注点分离

```typescript
// ✅ 数据获取层（task-listing.tsx）
export default function TaskListingPage() {
  const { data, isLoading } = useSWR('/api/tasks', fetcher);

  if (isLoading) return <LoadingSpinner />;

  return <TaskTable data={data} columns={columns} />;
}

// ✅ 状态管理层（task-tables/index.tsx）
export function TaskTable({ data, columns }) {
  const [globalFilter, setGlobalFilter] = useState('');
  const table = useReactTable({ ... });

  return <DataTable table={table}><TaskToolbar table={table} /></DataTable>;
}

// ✅ UI 展示层（task-toolbar.tsx）
export function TaskToolbar({ table }) {
  return (
    <Input
      value={table.getState().globalFilter}
      onChange={(e) => table.setGlobalFilter(e.target.value)}
    />
  );
}
```

### 6.5 调试技巧

#### 1. 使用 React DevTools

```bash
# 安装浏览器扩展
# Chrome: React Developer Tools
# Firefox: React Developer Tools

# 查看组件树、Props、State、Hooks
```

#### 2. 日志调试

```typescript
function TaskTable({ data }: { data: Task[] }) {
  console.log('TaskTable rendered', { data });  // 查看渲染时机

  const [filter, setFilter] = useState('');

  useEffect(() => {
    console.log('Filter changed:', filter);  // 监听状态变化
  }, [filter]);

  return <div>...</div>;
}
```

#### 3. 性能分析

```typescript
import { Profiler } from 'react';

function App() {
  return (
    <Profiler
      id='TaskList'
      onRender={(id, phase, actualDuration) => {
        console.log(`${id} (${phase}) took ${actualDuration}ms`);
      }}
    >
      <TaskList />
    </Profiler>
  );
}
```

---

## 附录

### A. 快速参考表

#### React Hooks

| Hook | 用途 | Vue 对应 |
|------|------|---------|
| `useState` | 状态管理 | `ref` |
| `useEffect` | 副作用 | `watch` / `onMounted` |
| `useMemo` | 计算属性 | `computed` |
| `useCallback` | 函数缓存 | 手动缓存 |
| `useRef` | DOM 引用 | `ref` (template ref) |
| `useContext` | 上下文 | `provide/inject` |

#### TanStack Table 快捷键

| 方法 | 说明 |
|------|------|
| `table.setGlobalFilter(value)` | 设置全局搜索 |
| `table.resetColumnFilters()` | 重置列过滤 |
| `table.getColumn('id')` | 获取列对象 |
| `column.toggleSorting()` | 切换排序 |
| `row.toggleSelected()` | 切换行选中 |

#### 常用命令

```bash
# 开发服务器
npm run dev

# 类型检查
npm run type-check

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# Lint 检查
npm run lint
```

### B. 学习资源

- **Next.js 官方文档**: https://nextjs.org/docs
- **React 官方文档**: https://react.dev
- **TanStack Table**: https://tanstack.com/table/latest
- **Shadcn-ui**: https://ui.shadcn.com
- **React Hook Form**: https://react-hook-form.com
- **Zod**: https://zod.dev

---

**最后更新时间**: 2024-01-01

**维护者**: 开发团队

**反馈**: 如有问题或建议，请联系技术负责人
