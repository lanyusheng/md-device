# APK 批量安装功能使用说明

## ✅ 功能概述

新增了批量给设备安装APK的功能，支持：
- ✅ 上传APK文件直传到阿里云OSS
- ✅ 批量选择多台设备安装
- ✅ 单个设备安装
- ✅ 实时上传进度显示
- ✅ 文件验证（格式、大小）
- ✅ 支持拖拽上传

## 📦 新增文件

```
src/
├── types/api.ts                                    # 新增OSS相关类型定义
├── services/
│   └── ali-oss.service.ts                          # 阿里云OSS上传服务（新建）
├── components/
│   └── forms/
│       └── apk-upload.tsx                          # APK上传组件（新建）
└── features/devices/components/
    ├── install-apk-drawer.tsx                      # 批量安装APK抽屉（新建）
    └── device-tables/
        ├── device-toolbar.tsx                      # 新增批量安装APK按钮
        └── cell-action.tsx                         # 新增单个设备安装APK选项
```

## 🔧 配置说明

### 1. 环境变量配置

在 `.env.local` 文件中添加阿里云OSS配置：

```bash
# 阿里云OSS配置
NEXT_PUBLIC_OSS_REGION=oss-cn-hangzhou
NEXT_PUBLIC_OSS_ACCESS_KEY_ID=your_access_key_id
NEXT_PUBLIC_OSS_ACCESS_KEY_SECRET=your_access_key_secret
NEXT_PUBLIC_OSS_BUCKET=your_bucket_name
NEXT_PUBLIC_OSS_ENDPOINT=https://your-bucket.oss-cn-hangzhou.aliyuncs.com
```

**配置说明：**
- `NEXT_PUBLIC_OSS_REGION`: OSS地域（如 `oss-cn-hangzhou`、`oss-cn-beijing`）
- `NEXT_PUBLIC_OSS_ACCESS_KEY_ID`: 阿里云AccessKey ID
- `NEXT_PUBLIC_OSS_ACCESS_KEY_SECRET`: 阿里云AccessKey Secret
- `NEXT_PUBLIC_OSS_BUCKET`: OSS Bucket名称
- `NEXT_PUBLIC_OSS_ENDPOINT`: OSS自定义域名（可选，如不配置则使用默认域名）

### 2. 阿里云OSS Bucket配置

**必需设置：**
1. 在阿里云OSS控制台创建Bucket
2. 设置Bucket权限为 **公共读**（或配置更细粒度的访问控制）
3. 配置CORS规则（允许前端跨域上传）：
   ```
   来源：*
   允许方法：GET, POST, PUT, HEAD
   允许Headers：*
   暴露Headers：ETag
   ```

## 🚀 使用方法

### 方式一：批量安装APK

1. 在设备管理页面勾选要安装APK的设备
2. 点击工具栏的 **"批量安装APK"** 按钮
3. 在弹出的抽屉中上传APK文件（支持拖拽或点击上传）
4. 等待文件上传完成（显示上传进度）
5. 确认目标设备列表
6. 点击 **"开始安装"** 按钮

### 方式二：单个设备安装APK

1. 点击设备行的 **"操作"** 按钮
2. 选择 **"安装APK"**
3. 上传APK文件
4. 点击 **"开始安装"**

## 📊 功能特性

### APK文件验证

- ✅ 自动验证文件扩展名（必须是 `.apk`）
- ✅ 文件大小限制（最大 500MB）
- ✅ 文件类型检查
- ✅ 空文件检测

### 上传体验

- ✅ 实时上传进度条
- ✅ 拖拽上传支持
- ✅ 上传耗时显示
- ✅ 文件大小格式化显示
- ✅ 上传成功/失败提示

### 设备管理

- ✅ 显示已选设备列表
- ✅ 显示设备名称、ID、IP地址
- ✅ 支持滚动查看多台设备
- ✅ 设备数量统计

## 🔄 完整流程

```
用户操作                OSS上传                  后端处理
   │                      │                        │
   ├─ 选择设备            │                        │
   │                      │                        │
   ├─ 点击"批量安装APK"   │                        │
   │                      │                        │
   ├─ 上传APK文件 ────────▶ 验证文件              │
   │                      │                        │
   │                      ├─ 生成文件名            │
   │                      │                        │
   │                      ├─ 上传到OSS            │
   │                      │  (显示进度)            │
   │                      │                        │
   │                      ├─ 返回文件URL ─────────▶ POST /Device/InstallApk
   │                      │                        │
   │                      │                        ├─ 接收 DeviceIdList + ApkUrl
   │                      │                        │
   │◀─ 显示上传成功       │                        ├─ 下发安装任务
   │                      │                        │
   │◀─ 显示安装任务已发送 │                        ├─ 返回响应
   │                      │                        │
```

## 🎨 UI组件

### 1. ApkUpload 组件

**位置:** `src/components/forms/apk-upload.tsx`

**Props:**
```typescript
interface ApkUploadProps {
  onUploadComplete?: (url: string, fileName: string) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}
```

**功能:**
- 文件选择/拖拽上传
- 上传进度显示
- 文件验证
- 成功/失败状态显示

### 2. InstallApkDrawer 组件

**位置:** `src/features/devices/components/install-apk-drawer.tsx`

**Props:**
```typescript
interface InstallApkDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devices: Device[];
}
```

**功能:**
- APK上传区域
- 目标设备列表展示
- 安装任务提交

## 🔌 API 接口

### 安装APK接口

**接口:** `POST /Api/DeviceMonitor/Device/InstallApk`

**请求参数:**
```typescript
{
  DeviceIdList: string[];  // 设备ID列表
  ApkUrl: string;          // APK文件的OSS URL
}
```

**响应:**
```typescript
{
  Code: 200,
  Message: "成功",
  Result: any
}
```

## 📝 代码示例

### 使用 OSS 上传服务

```typescript
import { uploadToOSS, validateAPKFile } from '@/services/ali-oss.service';

// 验证APK文件
const validation = validateAPKFile(file);
if (!validation.valid) {
  console.error(validation.message);
  return;
}

// 上传到OSS
const result = await uploadToOSS({
  file: apkFile,
  onProgress: (progress) => {
    console.log(`上传进度: ${progress}%`);
  }
});

console.log('文件URL:', result.url);
console.log('上传耗时:', result.duration, 'ms');
```

### 调用安装APK接口

```typescript
import { deviceService } from '@/services/device.service';

const response = await deviceService.installApk({
  DeviceIdList: ['device-001', 'device-002'],
  ApkUrl: 'https://your-bucket.oss-cn-hangzhou.aliyuncs.com/apk/xxx.apk'
});

if (response.Code === 200) {
  console.log('安装任务已发送');
}
```

## 🛡️ 安全性

### 文件验证
- 前端验证文件类型和大小
- 只允许上传 `.apk` 文件
- 限制文件大小为 500MB

### OSS安全
- 使用阿里云AccessKey进行身份验证
- 建议使用STS临时凭证（生产环境）
- 上传的文件自动设置为公共可读

### API安全
- 所有API请求自动携带Token
- 后端验证用户权限
- APK URL验证

## 🐛 常见问题

### Q: 上传失败，提示"OSS配置缺失"
A: 检查 `.env.local` 文件中的OSS配置是否完整

### Q: 上传成功但安装失败
A:
1. 检查后端API `/Device/InstallApk` 是否正常
2. 检查设备ID是否有效
3. 检查APK URL是否可访问

### Q: 文件上传很慢
A:
1. 检查网络连接
2. 考虑选择离用户更近的OSS地域
3. 检查文件大小

### Q: 拖拽上传不生效
A: 确保浏览器支持拖拽API（现代浏览器均支持）

## 📊 性能优化

### 1. OSS上传优化
- 使用XMLHttpRequest支持上传进度
- 直传到OSS，不经过后端服务器
- 自动生成唯一文件名避免冲突

### 2. 用户体验优化
- 实时进度反馈
- 上传耗时显示
- 错误信息友好提示
- 支持拖拽上传

### 3. 代码优化
- 使用React Hooks管理状态
- 组件职责单一
- 错误边界处理

## 🔮 后续扩展建议

- [ ] 支持断点续传
- [ ] 支持多文件上传队列
- [ ] APK包信息解析（包名、版本号）
- [ ] 上传历史记录
- [ ] APK文件管理（列表、删除）
- [ ] 安装进度实时反馈（WebSocket）
- [ ] 安装失败重试机制
- [ ] 使用STS临时凭证替代AccessKey

## 📞 技术支持

如有问题，请查看：
1. 浏览器控制台错误信息
2. Network面板查看请求详情
3. 阿里云OSS控制台日志
4. 后端API日志

---

**最后更新时间:** 2024-01-XX

**维护者:** 开发团队
