# 云控平台 API 接口文档

## 基础类型定义

### ApiResponse - 统一响应格式

```typescript
interface ApiResponse<T = any> {
  /** 响应状态码 */
  Code: number;
  /** 响应类型 */
  Type: string | null;
  /** 响应消息 */
  Message: string | null;
  /** 响应结果数据 */
  Result: T | null;
  /** 额外数据 */
  Extras: any;
  /** 响应时间 */
  Time: string; // ISO 8601 date-time
  /** 只读值 */
  readonly Value: any;
}
```

### PageObject - 分页对象

```typescript
interface PageObject {
  /** 当前页码 */
  PageIndex: number;
  /** 每页数量 */
  PageSize: number;
  /** 总页数 */
  PageCount: number;
  /** 总记录数 */
  RecordCount: number;
  /** 是否请求汇总 */
  AskSummary: boolean;
}
```

### UserLocation - 用户位置信息

```typescript
enum AuthorizationLevel {
  Level0 = 0,
  Level1 = 1,
  Level2 = 2,
  Level10 = 10
}

interface UserLocation {
  /** 授权级别 */
  AuthorizationLevel: AuthorizationLevel;
  /** 租户ID */
  TenantID: number; // int64
  /** 公司ID */
  CompanyID: number; // int32
  /** 业务ID */
  BusinessID: string | null;
  /** 位置ID */
  LocationID: number; // int32
  /** 手机号 */
  MobilePhone: string | null;
  /** 用户UID */
  UID: string | null;
  /** 请求票据 */
  RequestTicket: string | null;
  /** 令牌 */
  Token: string | null;
  /** 公司访问令牌 */
  CompanyAccessToken: string | null;
  /** 位置访问令牌 */
  LocationAccessToken: string | null;
  /** 只读：粒度ID */
  readonly GrainID: string | null;
  /** 只读：基础JSON */
  readonly BasicJson: string | null;
}
```

---

## 一、用户登录模块

### 1. 用户登录验证

**接口地址：** `POST /Api/DeviceMonitor/User/VerifyUser`

**描述：** 用户登录验证

#### 请求参数

```typescript
interface OuterUser {
  /** 用户类别 */
  UserClass: string | null;
  /** 用户ID */
  UserID: string | null;
  /** 用户数据 */
  UserData: any;
}

interface IdCardData {
  // 身份证数据，具体字段待定
}

interface VerifyUserPackage {
  /** 用户位置信息 */
  UserLocation: UserLocation;
  /** 业务ID */
  BusinessID: string | null;
  /** 用户标识符 */
  UserIdentifier: string | null;
  /** 访问密码 */
  AccessPassword: string | null;
  /** 序列号 */
  SerialNumber: string | null;
  /** 验证码 */
  VerifyCode: string | null;
  /** 访问令牌 */
  AccessToken: string | null;
  /** 用户UID */
  UID: string | null;
  /** 用户名 */
  UserName: string | null;
  /** 手机号 */
  MobilePhone: string | null;
  /** 外部用户 */
  OuterUser: OuterUser;
  /** 身份证数据 */
  IdCardData: IdCardData;
}
```

#### 响应数据

```typescript
type VerifyUserResponse = ApiResponse<any>;
```

#### 请求示例

```typescript
const loginRequest: VerifyUserPackage = {
  UserLocation: {
    AuthorizationLevel: 0,
    TenantID: 0,
    CompanyID: 0,
    BusinessID: null,
    LocationID: 0,
    MobilePhone: null,
    UID: null,
    RequestTicket: null,
    Token: null,
    CompanyAccessToken: null,
    LocationAccessToken: null
  },
  BusinessID: "your_business_id",
  UserIdentifier: "username",
  AccessPassword: "password",
  SerialNumber: null,
  VerifyCode: null,
  AccessToken: null,
  UID: null,
  UserName: null,
  MobilePhone: null,
  OuterUser: {
    UserClass: null,
    UserID: null,
    UserData: null
  },
  IdCardData: {}
};
```

---

## 二、设备管理模块

### 通用类型定义

#### Device - 设备信息

```typescript
interface Device {
  /** 租户ID */
  TenantID: number; // int64
  /** 设备编号 */
  DeviceID: string | null;
  /** 设备名称 */
  DeviceName: string | null;
  /** CPU核心数 */
  CpuCount: number; // int32
  /** 当前 CPU 总体使用率（百分比） */
  CpuPercent: number; // double
  /** 内存总量(GB) */
  MemTotal: number; // int64
  /** 内存使用率（百分比） */
  MemPercent: number; // double
  /** 剩余电量（百分比） */
  BatteryPercent: number; // double
  /** 公网IP地址 */
  PublicIP: string | null;
  /** 内网IP地址 */
  DefaultIP: string | null;
  /** 服务端口号 */
  ServicePort: number; // int32
  /** 分组编号 */
  GroupID: number; // int32
  /** 更新时间 */
  UpdateTime: string; // ISO 8601 date-time
}
```

#### DeviceState - 设备状态

```typescript
interface StatData {
  /** 是否处于锁屏状态 */
  Locked: boolean;
  /** 是否启用了置顶功能 */
  TopEnabled: boolean;
  /** API 是否可用 */
  ApiAvailable: boolean | null;
  /** 当前网络接口名称（例如 wlan0） */
  NetIoIface: string | null;
  /** 当前 CPU 总体使用率（百分比） */
  CpuPercent: number; // double
  /** CPU 核心数量 */
  CpuCount: number; // int32
  /** 当前 CPU 频率（MHz） */
  CpuFreqCurrent: number; // double
  /** 最大 CPU 频率（MHz） */
  CpuFreqMax: number; // double
  /** 最小 CPU 频率（MHz） */
  CpuFreqMin: number; // double
  /** 用户态 CPU 时间（单位：秒） */
  CpuTimesUser: number; // double
  /** 内核态 CPU 时间（单位：秒） */
  CpuTimesSystem: number; // double
  /** 空闲 CPU 时间（单位：秒） */
  CpuTimesIdle: number; // double
  /** 网络发送字节数 */
  NetIoBytesSent: number; // int64
  /** 网络发送数据包数 */
  NetIoPacketsSent: number; // int64
  /** 网络接收字节数 */
  NetIoBytesRecv: number; // int64
  /** 网络接收数据包数 */
  NetIoPacketsRecv: number; // int64
  /** 网络接收丢包数量 */
  NetIoDropIn: number; // int64
  /** 网络发送丢包数量 */
  NetIoDropOut: number; // int64
  /** 网络接收错误数 */
  NetIoErrIn: number; // int64
  /** 网络发送错误数 */
  NetIoErrOut: number; // int64
  /** 总内存（字节） */
  MemTotal: number; // int64
  /** 可用内存（字节） */
  MemAvailable: number; // int64
  /** 内存使用率（百分比） */
  MemPercent: number; // double
  /** 已使用内存（字节） */
  MemUsed: number; // int64
  /** 空闲内存（字节） */
  MemFree: number; // int64
  /** 活跃内存（字节） */
  MemActive: number; // int64
  /** 非活跃内存（字节） */
  MemInactive: number; // int64
  /** 内存缓冲区（字节） */
  MemBuffers: number; // int64
  /** 已缓存内存（字节） */
  MemCached: number; // int64
  /** 共享内存（字节） */
  MemShared: number; // int64
  /** slab 分配器使用的内存（字节） */
  MemSlab: number; // int64
  /** 剩余电量（百分比） */
  BatteryPercent: number; // double
  /** 公网IP */
  PublicIP: string | null;
  /** 默认本地 IP 地址 */
  DefaultIP: string | null;
  /** 本地服务端口 */
  ServicePort: number; // int32
  /** 置顶时的 IP 地址（如适用） */
  TopIP: string | null;
}

interface DeviceState {
  /** 报文类型，例如 "STAT" */
  Type: string | null;
  /** 设备唯一标识符（UUID） */
  DeviceID: string | null;
  /** 时间戳，单位为秒（Unix 时间戳带小数） */
  Timestamp: number; // double
  /** 设备状态数据 */
  Data: StatData;
}
```

### 1. 创建设备

**接口地址：** `POST /Api/DeviceMonitor/Device/AddDevice`

**描述：** 创建设备

#### 请求参数

```typescript
type AddDeviceRequest = Device;
```

#### 响应数据

```typescript
type AddDeviceResponse = ApiResponse<any>;
```

---

### 2. 删除设备

**接口地址：** `GET /Api/DeviceMonitor/Device/DeleteDevice`

**描述：** 删除设备

#### 请求参数

```typescript
interface DeleteDeviceParams {
  /** 设备ID */
  DeviceID: string;
}
```

#### 响应数据

```typescript
type DeleteDeviceResponse = ApiResponse<any>;
```

---

### 3. 批量移除设备

**接口地址：** `GET /Api/DeviceMonitor/Device/BatchRemoveDevice`

**描述：** 批量移除设备

#### 请求参数

```typescript
interface RemoveDeviceDto {
  /** 租户ID */
  TenantId: number; // int64
  /** 设备ID数组 */
  Uids: string[] | null;
}
```

#### 响应数据

```typescript
type BatchRemoveDeviceResponse = ApiResponse<any>;
```

---

### 4. 修改设备资料

**接口地址：** `POST /Api/DeviceMonitor/Device/UpdateDevice`

**描述：** 修改设备资料

#### 请求参数

```typescript
interface DeviceProfileState {
  /** 租户ID */
  TenantId: number; // int64
  /** 设备信息 */
  Device: Device;
}

interface UpdateDeviceParams {
  /** 设备ID（Query参数） */
  DeviceID: string;
}
```

#### 请求体

```typescript
type UpdateDeviceRequest = DeviceProfileState;
```

#### 响应数据

```typescript
type UpdateDeviceResponse = ApiResponse<any>;
```

---

### 5. 修改设备状态

**接口地址：** `POST /Api/DeviceMonitor/Device/UpdateDeviceState`

**描述：** 修改设备状态

#### 请求参数

```typescript
type UpdateDeviceStateRequest = DeviceState;
```

#### 响应数据

```typescript
type UpdateDeviceStateResponse = ApiResponse<any>;
```

---

### 6. 分页搜索设备列表

**接口地址：** `POST /Api/DeviceMonitor/Device/GetDevicePage`

**描述：** 分页搜索设备列表

#### 请求参数

```typescript
interface DeviceSearchRequest {
  /** 搜索关键词 */
  KeyWord: string | null;
  /** 分页对象 */
  PageObject: PageObject;
}
```

#### 响应数据

```typescript
type GetDevicePageResponse = ApiResponse<{
  /** 设备列表 */
  items: Device[];
  /** 分页信息 */
  pageInfo: PageObject;
}>;
```

#### 请求示例

```typescript
const searchRequest: DeviceSearchRequest = {
  KeyWord: "设备名称",
  PageObject: {
    PageIndex: 1,
    PageSize: 20,
    PageCount: 0,
    RecordCount: 0,
    AskSummary: true
  }
};
```

---

### 7. 安装应用

**接口地址：** `POST /Api/DeviceMonitor/Device/InstallApk`

**描述：** 安装应用

#### 请求参数

```typescript
interface InstallApkRequest {
  /** 设备ID列表 */
  DeviceIdList: string[] | null;
  /** APK下载地址 */
  ApkUrl: string | null;
}
```

#### 响应数据

```typescript
type InstallApkResponse = ApiResponse<any>;
```

---

### 8. 卸载应用

**接口地址：** `POST /Api/DeviceMonitor/Device/UninstallApk`

**描述：** 卸载应用

#### 请求参数

```typescript
interface UninstallApkRequest {
  /** 设备ID列表 */
  DeviceIdList: string[] | null;
  /** 包名 */
  PackageName: string | null;
}
```

#### 响应数据

```typescript
type UninstallApkResponse = ApiResponse<any>;
```

---

### 9. 获取应用列表

**接口地址：** `GET /Api/DeviceMonitor/Device/GetPackageList`

**描述：** 获取应用列表

#### 请求参数

```typescript
interface GetPackageListParams {
  /** 设备ID */
  DeviceID: string;
}
```

#### 响应数据

```typescript
type GetPackageListResponse = ApiResponse<string[]>;
```

---

### 10. 开始投屏

**接口地址：** `GET /Api/DeviceMonitor/Device/StartScreenMirroring`

**描述：** 开始投屏

#### 请求参数

```typescript
interface StartScreenMirroringParams {
  /** 设备ID */
  DeviceID: string;
}
```

#### 响应数据

```typescript
type StartScreenMirroringResponse = ApiResponse<any>;
```

---

### 11. 停止投屏

**接口地址：** `GET /Api/DeviceMonitor/Device/StopScreenMirroring`

**描述：** 停止投屏

#### 请求参数

```typescript
interface StopScreenMirroringParams {
  /** 设备ID */
  DeviceID: string;
}
```

#### 响应数据

```typescript
type StopScreenMirroringResponse = ApiResponse<any>;
```

---

### 12. 上报设备状态

**接口地址：** `POST /Api/DeviceMonitor/Device/ReportDeviceState`

**描述：** 上报设备状态

#### 请求参数

```typescript
type ReportDeviceStateRequest = DeviceState;
```

#### 响应数据

```typescript
type ReportDeviceStateResponse = ApiResponse<any>;
```

---

## 使用说明

### 1. Content-Type

所有 POST 请求支持以下 Content-Type：
- `application/json`
- `application/json-patch+json`
- `text/json`
- `application/*+json`

推荐使用：`application/json`

### 2. 响应格式

所有接口返回统一的 `ApiResponse` 格式，支持以下 Accept 类型：
- `application/json`
- `text/plain`
- `text/json`

### 3. 错误处理

```typescript
// 判断请求是否成功
function isSuccess(response: ApiResponse): boolean {
  return response.Code === 200; // 具体状态码需根据实际情况调整
}
```

### 4. 时间格式

所有时间字段遵循 ISO 8601 标准格式：`YYYY-MM-DDTHH:mm:ss.sssZ`

### 5. 数值类型说明

- `int32`: 32位整数
- `int64`: 64位长整数（JavaScript 中可能需要使用 BigInt 或字符串）
- `double`: 双精度浮点数


● 已为您生成完整的 TypeScript 接口文档，包含：

用户登录模块（1个接口）：
- 用户登录验证

设备管理模块（12个接口）：
- 创建设备
- 删除设备
- 批量移除设备
- 修改设备资料
- 修改设备状态
- 分页搜索设备列表
- 安装应用
- 卸载应用
- 获取应用列表
- 开始投屏
- 停止投屏
- 上报设备状态

文档已保存至 D:\API接口文档.md，包含了所有标准的 TypeScript 类型定义、请求参数、响应格式和使用说明。
