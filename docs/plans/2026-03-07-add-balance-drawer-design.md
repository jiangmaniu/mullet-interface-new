# 添加余额抽屉功能设计文档

**日期**: 2026-03-07
**作者**: Claude
**状态**: 已批准

## 概述

为真实账户的"添加余额"功能创建统一的入口抽屉，提供"划转"和"入金"两个选项，优化用户操作流程。

## 背景

当前系统中：
- 交易页面的账户卡片（account-card）和资产页面的账户列表（account-list）都有 `IconifyPlusCircle` 按钮
- 真实账户的 + 号按钮点击事件为空
- 模拟账户已有专门的入金抽屉（TradeSimulateAccountDepositDrawer）
- 用户需要一个快捷方式来访问划转和入金功能

## 需求

1. 点击真实账户的 `IconifyPlusCircle` 时，打开"添加余额"抽屉
2. 抽屉内显示两个选项：划转和入金
3. 点击选项后跳转到对应页面，并传递当前账户 ID
4. 阻止事件冒泡，避免触发父级的账户切换抽屉
5. 模拟账户保持现有的直接入金抽屉逻辑

## 设计方案

### 方案选择

采用**简单抽屉 + 导航**方案：
- 抽屉作为快捷入口，不包含复杂业务逻辑
- 点击选项后跳转到现有的完整页面
- 符合现有架构，维护成本低

### 组件架构

#### 新增组件

**AddBalanceDrawer** (`apps/mobile/src/components/drawers/add-balance-drawer.tsx`)

```
AddBalanceDrawer
├── Props: accountInfo (User.AccountItem)
├── State: open (useToggle)
├── Ref: DrawerRef (open/close/toggle)
└── Content:
    ├── DrawerHeader ("添加余额")
    ├── DrawerContent
    │   ├── 划转选项卡片
    │   │   ├── 标题: "划转"
    │   │   └── 描述: "账户之间的资金划转"
    │   └── 入金选项卡片
    │       ├── 标题: "入金"
    │       └── 描述: "从外部钱包充值入金"
    └── DrawerFooter (无)
```

#### 修改组件

1. **account-card/index.tsx** (交易页面)
   - 添加 `AddBalanceDrawer` 引用
   - 为 `IconifyPlusCircle` 添加点击事件
   - 阻止事件冒泡

2. **account-list.tsx** (资产页面)
   - 在 `RealAccountRow` 中添加 `AddBalanceDrawer` 引用
   - 为 `IconifyPlusCircle` 添加点击事件
   - 阻止事件冒泡

### UI 设计

```
┌─────────────────────────────┐
│  添加余额                    │  ← DrawerHeader
├─────────────────────────────┤
│                             │
│  ┌───────────────────────┐  │
│  │ 📊 划转              →│  │
│  │ 账户之间的资金划转     │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ 💰 入金              →│  │
│  │ 从外部钱包充值入金     │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

### 交互逻辑

#### 划转选项
- 点击后关闭抽屉
- 跳转到 `/(protected)/(assets)/transfer?accountId={account.id}`
- transfer 页面将该账户设置为"转出账户"（fromAccount）

#### 入金选项
- 点击后关闭抽屉
- 跳转到 `/(protected)/(assets)/deposit?accountId={account.id}`
- deposit 页面将该账户设置为默认选中的入金账户

### 技术实现

#### 状态管理
```typescript
import { useToggle } from 'ahooks';

const [open, { toggle, setLeft: setClose, setRight: setOpen }] = useToggle(false);

useImperativeHandle(ref, () => ({
  open: setOpen,
  close: setClose,
  toggle: toggle,
}));
```

#### 事件冒泡处理
```typescript
<Pressable onPress={(e) => {
  e.stopPropagation(); // 阻止冒泡
  addBalanceDrawerRef.current?.open();
}}>
  <IconifyPlusCircle width={14} height={14} />
</Pressable>
```

#### 导航参数传递
- 划转页面：`router.push('/(protected)/(assets)/transfer?accountId=' + accountInfo.id)`
- 入金页面：`router.push('/(protected)/(assets)/deposit?accountId=' + accountInfo.id)`

两个页面都已支持接收 `accountId` 参数，无需额外修改。

### 组件 API

#### AddBalanceDrawer Props
```typescript
interface AddBalanceDrawerProps {
  accountInfo: User.AccountItem;  // 账户信息
  ref?: RefObject<DrawerRef>;     // 抽屉控制 ref
}
```

#### DrawerRef 方法
```typescript
interface DrawerRef {
  open: () => void;
  close: () => void;
  toggle: () => void;
}
```

## 文件变更清单

### 新增文件
- `apps/mobile/src/components/drawers/add-balance-drawer.tsx`

### 修改文件
- `apps/mobile/src/pages/(protected)/(tabs)/trade/_comps/account-card/index.tsx`
- `apps/mobile/src/pages/(protected)/(tabs)/assets/_comps/account-list.tsx`

## 技术栈

- **状态管理**: `useToggle` from `ahooks`
- **导航**: `useRouter` from `expo-router`
- **国际化**: `<Trans>` from `@lingui/react/macro`
- **UI 组件**: Drawer, Card, Pressable, Text, Icons

## 测试要点

1. 点击真实账户的 + 号，抽屉正常打开
2. 点击 + 号不会触发父级的账户切换抽屉
3. 点击"划转"选项，跳转到划转页面，转出账户为当前账户
4. 点击"入金"选项，跳转到入金页面，入金账户为当前账户
5. 模拟账户的 + 号保持原有逻辑（直接入金抽屉）
6. 抽屉的打开/关闭动画流畅
7. 国际化文案正确显示

## 未来扩展

如果需要在抽屉内添加更多选项（如提现、兑换等），可以：
1. 在 DrawerContent 中添加新的选项卡片
2. 保持相同的 UI 和交互模式
3. 根据账户类型动态显示/隐藏某些选项

## 风险评估

- **低风险**: 功能简单，不涉及复杂业务逻辑
- **兼容性**: 与现有架构完全兼容
- **维护性**: 代码量少，易于维护
