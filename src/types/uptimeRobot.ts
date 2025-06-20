/**
 * UptimeRobot API v3 相关类型定义
 */

// 监控状态枚举
export enum MonitorStatus {
  PAUSED = 0,
  NOT_CHECKED_YET = 1,
  UP = 2,
  SEEMS_DOWN = 8,
  DOWN = 9,
}

// 监控类型枚举
export enum MonitorType {
  HTTP = 1,
  KEYWORD = 2,
  PING = 3,
  PORT = 4,
  HEARTBEAT = 5,
}

// 监控子类型枚举
export enum MonitorSubType {
  UNKNOWN = 0,
  HTTP = 1,
  HTTPS = 2,
  FTP = 3,
  SMTP = 4,
  POP3 = 5,
  IMAP = 6,
  CUSTOM_PORT = 99,
}

// V3 API 监控信息
export interface MonitorV3 {
  id: number;
  attributes: {
    friendly_name: string;
    url: string;
    type: MonitorType;
    sub_type?: MonitorSubType;
    keyword_type?: number;
    keyword_case_type?: number;
    keyword_value?: string;
    http_username?: string;
    http_password?: string;
    port?: number;
    interval: number;
    timeout: number;
    status: MonitorStatus;
    create_datetime: string; // ISO 8601 格式
    monitor_group?: number;
    is_group_main?: number;
    uptime_ratio?: number;
    logs?: LogV3[];
    response_times?: ResponseTimeV3[];
    ssl?: SSLInfoV3;
  };
}

// V3 API 日志
export interface LogV3 {
  type: number;
  datetime: string; // ISO 8601 格式
  duration: number;
  reason?: {
    code?: string;
    detail?: string;
  };
}

// V3 API 响应时间数据
export interface ResponseTimeV3 {
  datetime: string; // ISO 8601 格式
  value: number;
}

// V3 API SSL 信息
export interface SSLInfoV3 {
  brand: string;
  product: string;
  expires: string; // ISO 8601 格式
}

// V3 API 响应基础结构
export interface UptimeRobotV3Response<T = any> {
  data: T[];
  pagination?: {
    offset: number;
    limit: number;
    total: number;
  };
  error?: {
    type: string;
    message: string;
  };
}

// getMonitors V3 API 响应
export interface GetMonitorsV3Response extends UptimeRobotV3Response<MonitorV3> {
  data: MonitorV3[];
}

// 监控统计信息
export interface MonitorStats {
  uptime: number;
  averageResponseTime: number;
  incidents: number;
  lastIncident?: Date;
}

// 监控卡片显示数据
export interface MonitorCardData {
  id: number;
  name: string;
  url: string;
  status: MonitorStatus;
  uptimePercentage: number;
  responseTime: number;
  lastCheck: Date;
  type: string;
  incidents?: IncidentData[];
}

// 故障数据
export interface IncidentData {
  datetime: Date;
  duration: number; // 分钟
  reason?: string;
}

// API 配置
export interface UptimeRobotConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

// V3 API 请求参数
export interface GetMonitorsV3Params {
  range?: number; // 天数，默认30
  logs?: boolean;
  logs_start_date?: string; // ISO 8601
  logs_end_date?: string; // ISO 8601
  logs_limit?: number;
  response_times?: boolean;
  response_times_limit?: number;
  response_times_start_date?: string; // ISO 8601
  response_times_end_date?: string; // ISO 8601
  custom_uptime_ranges?: string;
  all_time_uptime_ratio?: boolean;
  ssl?: boolean;
  offset?: number;
  limit?: number;
  search?: string;
}

// 监控名称映射
export interface MonitorNameMapping {
  [key: string]: string;
}

// 默认监控名称映射
export const DEFAULT_MONITOR_MAPPINGS: MonitorNameMapping = {
  'www.voidix.net': '官网主机', // PING
  'https://www.voidix.net': '官网', // HTTPS
  'voidix-net.mail.protection.outlook.com': '邮箱系统', // SMTP
};
