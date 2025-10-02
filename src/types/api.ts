/**
 * API 基础类型定义
 */

// ==================== 基础类型 ====================

/** 统一响应格式 */
export interface ApiResponse<T = any> {
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
  Time: string;
  /** 只读值 */
  readonly Value: any;
}

/** 分页对象 */
export interface PageObject {
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

/** 授权级别 */
export enum AuthorizationLevel {
  Level0 = 0,
  Level1 = 1,
  Level2 = 2,
  Level10 = 10
}

/** 用户位置信息 */
export interface UserLocation {
  /** 授权级别 */
  AuthorizationLevel: AuthorizationLevel;
  /** 租户ID */
  TenantID: number;
  /** 公司ID */
  CompanyID: number;
  /** 业务ID */
  BusinessID: string | null;
  /** 位置ID */
  LocationID: number;
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

// ==================== 用户登录模块 ====================

export interface OuterUser {
  /** 用户类别 */
  UserClass: string | null;
  /** 用户ID */
  UserID: string | null;
  /** 用户数据 */
  UserData: any;
}

export interface IdCardData {
  // 身份证数据，具体字段待定
}

export interface VerifyUserPackage {
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

// ==================== 设备管理模块 ====================

/** 设备信息 */
export interface Device {
  /** 租户ID */
  TenantID: number;
  /** 设备编号 */
  DeviceID: string | null;
  /** 设备名称 */
  DeviceName: string | null;
  /** CPU核心数 */
  CpuCount: number;
  /** 当前 CPU 总体使用率（百分比） */
  CpuPercent: number;
  /** 内存总量(GB) */
  MemTotal: number;
  /** 内存使用率（百分比） */
  MemPercent: number;
  /** 剩余电量（百分比） */
  BatteryPercent: number;
  /** 公网IP地址 */
  PublicIP: string | null;
  /** 内网IP地址 */
  DefaultIP: string | null;
  /** 服务端口号 */
  ServicePort: number;
  /** 分组编号 */
  GroupID: number;
  /** 更新时间 */
  UpdateTime: string;
}

/** 设备状态数据 */
export interface StatData {
  /** 是否处于锁屏状态 */
  Locked: boolean;
  /** 是否启用了置顶功能 */
  TopEnabled: boolean;
  /** API 是否可用 */
  ApiAvailable: boolean | null;
  /** 当前网络接口名称（例如 wlan0） */
  NetIoIface: string | null;
  /** 当前 CPU 总体使用率（百分比） */
  CpuPercent: number;
  /** CPU 核心数量 */
  CpuCount: number;
  /** 当前 CPU 频率（MHz） */
  CpuFreqCurrent: number;
  /** 最大 CPU 频率（MHz） */
  CpuFreqMax: number;
  /** 最小 CPU 频率（MHz） */
  CpuFreqMin: number;
  /** 用户态 CPU 时间（单位：秒） */
  CpuTimesUser: number;
  /** 内核态 CPU 时间（单位：秒） */
  CpuTimesSystem: number;
  /** 空闲 CPU 时间（单位：秒） */
  CpuTimesIdle: number;
  /** 网络发送字节数 */
  NetIoBytesSent: number;
  /** 网络发送数据包数 */
  NetIoPacketsSent: number;
  /** 网络接收字节数 */
  NetIoBytesRecv: number;
  /** 网络接收数据包数 */
  NetIoPacketsRecv: number;
  /** 网络接收丢包数量 */
  NetIoDropIn: number;
  /** 网络发送丢包数量 */
  NetIoDropOut: number;
  /** 网络接收错误数 */
  NetIoErrIn: number;
  /** 网络发送错误数 */
  NetIoErrOut: number;
  /** 总内存（字节） */
  MemTotal: number;
  /** 可用内存（字节） */
  MemAvailable: number;
  /** 内存使用率（百分比） */
  MemPercent: number;
  /** 已使用内存（字节） */
  MemUsed: number;
  /** 空闲内存（字节） */
  MemFree: number;
  /** 活跃内存（字节） */
  MemActive: number;
  /** 非活跃内存（字节） */
  MemInactive: number;
  /** 内存缓冲区（字节） */
  MemBuffers: number;
  /** 已缓存内存（字节） */
  MemCached: number;
  /** 共享内存（字节） */
  MemShared: number;
  /** slab 分配器使用的内存（字节） */
  MemSlab: number;
  /** 剩余电量（百分比） */
  BatteryPercent: number;
  /** 公网IP */
  PublicIP: string | null;
  /** 默认本地 IP 地址 */
  DefaultIP: string | null;
  /** 本地服务端口 */
  ServicePort: number;
  /** 置顶时的 IP 地址（如适用） */
  TopIP: string | null;
}

/** 设备状态 */
export interface DeviceState {
  /** 报文类型，例如 "STAT" */
  Type: string | null;
  /** 设备唯一标识符（UUID） */
  DeviceID: string | null;
  /** 时间戳，单位为秒（Unix 时间戳带小数） */
  Timestamp: number;
  /** 设备状态数据 */
  Data: StatData;
}

/** 删除设备参数 */
export interface DeleteDeviceParams {
  /** 设备ID */
  DeviceID: string;
}

/** 批量移除设备 */
export interface RemoveDeviceDto {
  /** 租户ID */
  TenantId: number;
  /** 设备ID数组 */
  Uids: string[] | null;
}

/** 设备资料状态 */
export interface DeviceProfileState {
  /** 租户ID */
  TenantId: number;
  /** 设备信息 */
  Device: Device;
}

/** 设备搜索请求 */
export interface DeviceSearchRequest {
  /** 搜索关键词 */
  KeyWord: string | null;
  /** 分页对象 */
  PageObject: PageObject;
}

/** 设备列表响应 */
export interface DevicePageResponse {
  /** 当前页码 */
  PageIndex: number;
  /** 每页数量 */
  PageSize: number;
  /** 总页数 */
  PageCount: number;
  /** 总记录数 */
  RecordCount: number;
  /** 设备列表 */
  ResultList: Device[];
}

/** 安装应用请求 */
export interface InstallApkRequest {
  /** 设备ID列表 */
  DeviceIdList: string[] | null;
  /** APK下载地址 */
  ApkUrl: string | null;
}

/** 卸载应用请求 */
export interface UninstallApkRequest {
  /** 设备ID列表 */
  DeviceIdList: string[] | null;
  /** 包名 */
  PackageName: string | null;
}

/** 获取应用列表参数 */
export interface GetPackageListParams {
  /** 设备ID */
  DeviceID: string;
}

/** 开始投屏参数 */
export interface StartScreenMirroringParams {
  /** 设备ID */
  DeviceID: string;
}

/** 停止投屏参数 */
export interface StopScreenMirroringParams {
  /** 设备ID */
  DeviceID: string;
}
