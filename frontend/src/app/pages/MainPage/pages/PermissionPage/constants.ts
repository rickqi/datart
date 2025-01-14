export enum Viewpoints {
  Subject = 'subject',
  Resource = 'resource',
}

export enum ResourceTypes {
  Source = 'SOURCE',
  View = 'VIEW',
  Viz = 'VIZ',
  Share = 'SHARE',
  Download = 'DOWNLOAD',
  Schedule = 'SCHEDULE',
  Role = 'ROLE',
  User = 'USER',
  Manager = 'MANAGER',
}

export enum VizResourceSubTypes {
  Folder = 'FOLDER',
  Storyboard = 'STORYBOARD',
}

export enum SubjectTypes {
  User = 'USER',
  Role = 'ROLE',
  UserRole = 'USER_ROLE',
}

export enum PermissionLevels {
  Disable = 0,
  Enable = 1,
  Read = 1 << 1,
  Manage = (1 << 2) | Read,
  Grant = (1 << 3) | Read,
  Download = (1 << 5) | Read,
  Share = (1 << 6) | Read,
  Create = (1 << 7) | Manage,
}

export const VIEWPOINT_LABEL = {
  [Viewpoints.Subject]: '常规视图',
  [Viewpoints.Resource]: '资源视图',
};

export const RESOURCE_TYPE_LABEL = {
  [ResourceTypes.Viz]: '可视化',
  [ResourceTypes.View]: '数据视图',
  [ResourceTypes.Source]: '数据源',
  [ResourceTypes.Schedule]: '定时任务',
};

export const RESOURCE_TYPE_PERMISSION_MAPPING = {
  [ResourceTypes.Viz]: [
    PermissionLevels.Read,
    PermissionLevels.Download,
    PermissionLevels.Share,
    PermissionLevels.Create,
  ],
  [ResourceTypes.View]: [PermissionLevels.Read, PermissionLevels.Create],
  [ResourceTypes.Source]: [PermissionLevels.Read, PermissionLevels.Create],
  [ResourceTypes.Schedule]: [PermissionLevels.Create],
};

export const RESOURCE_TYPE_PERMISSION_LABEL = {
  [ResourceTypes.Viz]: ['查看', '下载', '分享', '管理'],
  [ResourceTypes.View]: ['使用', '管理'],
  [ResourceTypes.Source]: ['使用', '管理'],
  [ResourceTypes.Schedule]: ['管理'],
};

export const MODULE_PERMISSION_VALUES = [
  { text: '禁用', value: PermissionLevels.Disable },
  { text: '启用', value: PermissionLevels.Enable },
];
export const CREATE_PERMISSION_VALUES = [
  { text: '禁用', value: PermissionLevels.Disable },
  { text: '启用', value: PermissionLevels.Create },
];
