# 站内信模块设计文档

## 📋 功能概述

实现完整的站内信功能，包括通知列表、公告列表、消息详情、未读角标和清除未读功能。

## 🎯 需求列表

- ✅ HomeHeader 和 assets 页面的 IconifyBell 跳转到站内信
- ✅ 图标右上角显示未读数量角标
- ✅ 通知列表和公告列表支持下拉刷新、挂载重载、无限加载
- ✅ 点击 item 时清除未读状态并跳转到详情页
- ✅ 详情页展示标题、创建时间、内容
- ✅ 清除所有未读功能

## 🏗️ 架构设计

### 目录结构

```
notifications/
├── _hooks/
│   ├── use-unread-count.ts      # 未读数量 hook
│   ├── use-message-list.ts      # 消息列表 hook（无限加载）
│   ├── use-message-detail.ts    # 消息详情 hook
│   └── use-mark-all-read.ts     # 标记所有已读 hook
├── _comps/
│   └── notification-badge.tsx   # 角标组件
├── detail.tsx                   # 详情页面
└── DESIGN.md                    # 本文档

notifications.tsx                # 主列表页面
```

### 数据流设计

```
┌─────────────────────────────────────────────────────────────┐
│                      React Query 缓存层                       │
├─────────────────────────────────────────────────────────────┤
│  ['message', 'unread-count']  │  未读数量（30秒自动刷新）    │
│  ['message', 'list', type]    │  消息列表（无限加载）        │
│  ['message', 'detail', id]    │  消息详情                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                      API 服务层                              │
├─────────────────────────────────────────────────────────────┤
│  getUnReadMessageCount()      │  获取未读数量               │
│  getMyMessageList(params)     │  获取消息列表               │
│  getMyMessageInfo(id)         │  获取消息详情               │
│  readAllMessage()             │  标记所有已读               │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 技术实现

### 1. 未读数量角标

**位置：**
- HomeHeader（home/index.tsx）
- Assets 页面（assets/index.tsx）

**实现：**
```tsx
// 使用 hook 获取未读数量
const { data: unreadCount = 0 } = useUnreadCount()

// 角标组件
<NotificationBadge count={unreadCount} />
```

**特性：**
- 自动每 30 秒刷新未读数量
- 超过 99 显示 "99+"
- 数量为 0 时隐藏角标

### 2. 消息列表（无限加载）

**实现：**
```tsx
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  refetch,
  isRefetching,
} = useMessageList(type)
```

**特性：**
- 使用 `useInfiniteQuery` 实现无限加载
- 支持下拉刷新（RefreshControl）
- 自动加载更多（onEndReached）
- 分页大小：10 条/页

**类型：**
- 通知列表：`type: 'SINGLE'`
- 公告列表：`type: 'GROUP'`

### 3. 点击 item 交互

**乐观更新策略：**
```tsx
// 点击时立即更新本地缓存
queryClient.setQueryData(['message', 'list', type], (oldData) => {
  // 更新 isRead 状态为 'READ'
})

// 刷新未读数量
queryClient.invalidateQueries({ queryKey: ['message', 'unread-count'] })

// 跳转到详情页
router.push(`/notifications/detail?id=${item.id}`)
```

**优点：**
- 即时反馈，无需等待接口响应
- 自动同步未读数量
- 用户体验流畅

### 4. 详情页面

**路由：** `/notifications/detail?id={id}`

**实现：**
```tsx
const { id } = useLocalSearchParams<{ id: string }>()
const { data: message, isLoading } = useMessageDetail(id)
```

**展示内容：**
- 标题（title）
- 创建时间（createTime）
- 内容（content）

**状态处理：**
- 加载中：显示 ActivityIndicator
- 消息不存在：显示提示文本

### 5. 清除所有未读

**位置：** notifications 页面 header 右侧

**实现：**
```tsx
const { mutate: markAllRead } = useMarkAllRead()

// 点击图标
<IconifyRefresh onPress={handleMarkAllRead} />
```

**效果：**
- 调用 `readAllMessage()` 接口
- 自动刷新消息列表
- 自动刷新未读数量

## 📊 数据类型

### Message.MessageItem

```typescript
type MessageItem = {
  id?: string              // 消息 ID
  title?: string           // 标题
  content?: string         // 内容
  createTime?: string      // 创建时间
  isRead?: 'READ' | 'UNREAD'  // 是否已读
  type?: 'SINGLE' | 'GROUP' | 'APPROVAL' | 'ROLE' | 'ORDER'  // 类型
  // ... 其他字段
}
```

## 🎨 UI 设计

### 角标样式
- 背景色：`bg-status-danger`（红色）
- 最小宽度：16px
- 高度：16px
- 字体大小：10px
- 位置：绝对定位在图标右上角（-top-1 -right-1）

### 列表 Item 样式
- 间距：`gap-xs p-xl`
- 标题：`text-paragraph-p2 text-content-1`
- 描述：`text-paragraph-p3 text-content-4`（最多 2 行）
- 时间：`text-paragraph-p3 text-content-4`
- 未读标记：红色圆点（size-2）

### 详情页样式
- 内边距：16px
- 标题：`text-paragraph-p1 text-content-1 font-medium`
- 时间：`text-paragraph-p3 text-content-4`
- 内容：`text-paragraph-p2 text-content-2 leading-6`

## 🔄 缓存策略

### 未读数量
- 查询键：`['message', 'unread-count']`
- 自动刷新：30 秒
- 失效时机：标记已读、清除所有未读

### 消息列表
- 查询键：`['message', 'list', type]`
- 分页策略：基于 `current` 和 `pages`
- 失效时机：清除所有未读

### 消息详情
- 查询键：`['message', 'detail', id]`
- 启用条件：`enabled: !!id`

## 🚀 性能优化

1. **无限加载优化**
   - 使用 `onEndReachedThreshold={0.5}` 提前加载
   - 防止重复加载：检查 `hasNextPage` 和 `isFetchingNextPage`

2. **乐观更新**
   - 点击 item 时立即更新本地状态
   - 无需等待接口响应，提升用户体验

3. **自动刷新**
   - 未读数量每 30 秒自动刷新
   - 避免频繁请求

4. **缓存复用**
   - React Query 自动缓存数据
   - 相同查询键复用缓存

## 📝 注意事项

1. **路径问题**
   - hooks 在 `notifications/_hooks/` 目录下
   - 主页面在 `(home)/notifications.tsx`
   - 导入路径：`./notifications/_hooks/xxx`

2. **图标选择**
   - 清除所有未读使用 `IconifyRefresh`
   - 项目中没有 `IconifyBrush`

3. **类型安全**
   - 使用 `Message.MessageItem` 类型
   - 可选字段使用 `?.` 和 `||` 处理

4. **错误处理**
   - 详情页处理消息不存在的情况
   - 加载状态显示 ActivityIndicator

## 🧪 测试要点

- [ ] 未读角标显示正确
- [ ] 点击铃铛图标跳转到站内信
- [ ] 通知列表和公告列表切换正常
- [ ] 下拉刷新功能正常
- [ ] 无限加载功能正常
- [ ] 点击 item 跳转到详情页
- [ ] 点击 item 后未读状态更新
- [ ] 详情页展示内容正确
- [ ] 清除所有未读功能正常
- [ ] 未读数量自动刷新

## 📅 更新记录

- 2026-03-07：初始版本，完成所有功能实现
