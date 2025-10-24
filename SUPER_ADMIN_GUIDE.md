# 超级管理员权限说明

## 概述

系统中 **admin** 用户被设定为超级管理员（平台超管），拥有系统的所有权限，可以访问和操作所有菜单和功能。

**重要特性**：
- ✅ admin 用户**不调用后端权限接口**，无需从数据库加载权限
- ✅ admin 用户**固定显示所有菜单**，不受权限配置影响
- ✅ 只有非 admin 用户才会**动态加载权限**并根据后端响应显示菜单

## 超级管理员特权

### 1. 权限加载流程

系统在用户登录后，权限加载流程如下：

```
用户登录成功
    ↓
保存用户信息到 AuthStore
    ↓
判断：username === 'admin' ?
    ↓                    ↓
  是 (admin)          否 (普通用户)
    ↓                    ↓
跳过权限加载        调用后端 API
modules = []        获取 modules 数据
    ↓                    ↓
直接标记已初始化    保存权限数据
    ↓                    ↓
显示所有菜单        根据权限显示菜单
```

### 2. 权限判断优先级

系统在进行权限检查时，会优先判断用户是否为 admin 超级管理员：

```
判断流程:
1. 是否为 admin 用户？ → 是 → 直接通过，拥有所有权限
2. 否 → 检查用户的具体权限配置
```

### 3. 适用范围

超级管理员权限适用于以下所有权限检查场景：

#### 菜单导航权限
- **文件**: `src/components/layout/app-sidebar.tsx`
- **行为**: admin 用户可以看到所有菜单项，无视 `moduleCode` 和 `interfacePath` 配置
- **效果**: 侧边栏显示完整的菜单树

#### 页面访问权限
- **文件**: `src/components/guards/permission-guard.tsx`
- **行为**: admin 用户可以访问所有受保护的页面
- **效果**: 绕过所有页面级权限守卫

#### 模块权限检查
- **Hook**: `useHasModule(moduleCode)`
- **行为**: admin 用户对所有 moduleCode 返回 true
- **效果**: 可以使用所有模块功能

#### 接口权限检查
- **Hook**: `useHasInterface(interfacePath)`
- **行为**: admin 用户对所有 interfacePath 返回 true
- **效果**: 可以调用所有 API 接口

## 技术实现

### 1. 用户信息存储

```typescript
// src/stores/auth.store.ts
interface UserInfo {
  uid?: string;
  username?: string;
  mobilePhone?: string;
  roleId?: number;
  roleName?: string;
  isSuperAdmin?: boolean; // 是否为超级管理员标识
}
```

### 2. 超级管理员判定逻辑

```typescript
// 判定标准：username 为 'admin' (不区分大小写)
const isSuperAdmin = userInfo.username?.toLowerCase() === 'admin';
```

### 3. 登录流程

```typescript
// src/app/login/page.tsx
// 登录成功后
useAuthStore.getState().setUserInfo({
  uid: response.Result?.UID,
  username: username, // 例如: 'admin'
  mobilePhone: response.Result?.MobilePhone,
  roleId: response.Result?.RoleID,
  roleName: response.Result?.RoleName
});

// setUserInfo 内部会自动判断并设置 isSuperAdmin
```

### 4. 权限检查示例

```typescript
// src/hooks/use-permission.ts
hasModule: (moduleCode: string) => {
  // 优先检查：如果是超级管理员，直接返回 true
  const isSuperAdmin = useAuthStore.getState().checkIsSuperAdmin();
  if (isSuperAdmin) {
    return true;
  }

  // 普通用户：检查具体权限
  const { modules } = get();
  return modules.some((m) => m.ModuleCode === moduleCode);
}
```

## 使用场景

### 场景 1: 系统初始化
- 使用 admin 账号登录系统
- 创建公司、业务、角色
- 为其他用户分配权限

### 场景 2: 权限调试
- 当某个用户无法访问特定功能时
- 使用 admin 账号验证该功能是否正常工作
- 排除是功能问题还是权限配置问题

### 场景 3: 紧急访问
- 普通管理员权限配置错误导致无法访问系统功能时
- 使用 admin 账号修复权限配置

### 场景 4: 日常管理
- admin 可以管理所有租户的所有公司
- admin 可以查看和修改所有角色的权限
- admin 可以管理所有操作员账号

## 安全建议

### 1. 密码管理
- ⚠️ admin 账号密码应该设置为强密码
- ⚠️ 定期更换 admin 密码
- ⚠️ 不要在多人之间共享 admin 账号

### 2. 使用限制
- ✅ 建议只在必要时使用 admin 账号
- ✅ 日常操作使用具有适当权限的普通账号
- ✅ 记录 admin 账号的登录和操作日志（后续实现）

### 3. 账号管理
- ✅ admin 用户名固定为 'admin'，不可修改
- ✅ admin 账号不能被删除
- ✅ admin 账号不能被禁用

## 常见问题

### Q1: 如何确认当前用户是否为 admin？

在任何组件中使用：
```typescript
import { useAuthStore } from '@/stores/auth.store';

const { checkIsSuperAdmin, userInfo } = useAuthStore();
const isAdmin = checkIsSuperAdmin();

console.log('当前用户:', userInfo?.username);
console.log('是否为超管:', isAdmin);
```

### Q2: admin 用户需要配置权限吗？

不需要。admin 用户的权限是硬编码在系统中的，不依赖数据库的权限配置。即使 admin 用户在角色权限表中没有任何权限记录，依然拥有所有权限。

### Q3: 可以有多个超级管理员吗？

当前版本只支持 username 为 'admin' 的用户作为超级管理员。如果需要多个超管，有两种方案：

**方案 1: 修改判定逻辑**
```typescript
// src/stores/auth.store.ts
const superAdmins = ['admin', 'root', 'superadmin'];
const isSuperAdmin = superAdmins.includes(userInfo.username?.toLowerCase());
```

**方案 2: 基于角色判定**
```typescript
// 某个特定的 RoleID 代表超管
const isSuperAdmin = userInfo.roleId === 1;
```

### Q4: admin 用户会加载权限数据吗？

**不会**。系统已优化，admin 用户登录后不会调用后端权限接口：

```typescript
// src/hooks/use-permission.ts
fetchMyPermissions: async () => {
  // 如果是超级管理员，跳过权限加载，直接标记为已初始化
  const isSuperAdmin = useAuthStore.getState().checkIsSuperAdmin();
  if (isSuperAdmin) {
    set({
      modules: [],
      isLoading: false,
      isInitialized: true
    });
    console.log('Admin 超级管理员无需加载权限，拥有所有权限');
    return;
  }

  // 普通用户：从后端加载权限
  // ...
}
```

**优势**：
- ✅ 减少不必要的 API 请求
- ✅ admin 用户登录更快
- ✅ 降低后端服务器压力

## 代码位置总结

| 功能 | 文件路径 | 说明 |
|------|---------|------|
| 用户信息存储 | `src/stores/auth.store.ts` | 存储登录用户信息和超管标识 |
| 登录保存用户信息 | `src/app/login/page.tsx` | 登录成功后保存用户信息 |
| 权限检查 Hook | `src/hooks/use-permission.ts` | 优先判断超管权限 |
| 侧边栏菜单过滤 | `src/components/layout/app-sidebar.tsx` | 超管显示所有菜单 |
| 页面权限守卫 | `src/components/guards/permission-guard.tsx` | 超管绕过所有守卫 |
| 登出清除信息 | `src/services/auth.service.ts` | 登出时清除用户信息 |

## 更新日志

- **2025-01-XX**: 初始版本，实现 admin 超级管理员功能
  - 添加用户信息存储
  - 实现超管权限判断
  - 集成到所有权限检查点

---

**维护者**: Claude Code
**最后更新**: 2025-01-XX
