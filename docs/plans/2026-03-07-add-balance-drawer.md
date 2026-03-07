# 添加余额抽屉功能实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为真实账户创建统一的"添加余额"入口抽屉，提供划转和入金两个选项

**Architecture:** 创建可复用的 AddBalanceDrawer 组件，使用 useToggle 管理状态，通过 ref 暴露控制方法。点击选项后跳转到现有的 transfer 和 deposit 页面并传递 accountId 参数。

**Tech Stack:** React Native, Expo Router, ahooks (useToggle), Lingui (国际化), MobX

---

## Task 1: 创建 AddBalanceDrawer 组件

**Files:**
- Create: `apps/mobile/src/components/drawers/add-balance-drawer.tsx`

**Step 1: 创建基础组件结构**

创建文件并实现基础的抽屉组件：

```typescript
import { View } from 'react-native'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerRef } from '@/components/ui/drawer'
import { Card, CardContent } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { IconifyNavArrowRight } from '@/components/ui/icons'
import { Trans } from '@lingui/react/macro'
import { useToggle } from 'ahooks'
import { RefObject, useImperativeHandle } from 'react'
import { Pressable } from 'react-native'
import { useRouter } from 'expo-router'

export type AddBalanceDrawerRef = DrawerRef

interface AddBalanceDrawerProps {
  accountInfo: User.AccountItem
  ref?: RefObject<AddBalanceDrawerRef | null>
}

export const AddBalanceDrawer = ({ accountInfo, ref }: AddBalanceDrawerProps) => {
  const [open, { toggle, setLeft: setClose, setRight: setOpen }] = useToggle(false)
  const router = useRouter()

  useImperativeHandle(ref, () => ({
    open: setOpen,
    close: setClose,
    toggle: toggle,
  }))

  const handleTransferPress = () => {
    setClose()
    router.push(`/(protected)/(assets)/transfer?accountId=${accountInfo.id}`)
  }

  const handleDepositPress = () => {
    setClose()
    router.push(`/(protected)/(assets)/deposit?accountId=${accountInfo.id}`)
  }

  return (
    <Drawer open={open} onOpenChange={toggle}>
      <DrawerContent>
        <DrawerHeader className="px-5 pt-xl">
          <DrawerTitle><Trans>添加余额</Trans></DrawerTitle>
        </DrawerHeader>

        <View className="px-5 gap-xl pb-3xl">
          {/* 划转选项 */}
          <Pressable onPress={handleTransferPress}>
            <Card>
              <CardContent className="py-xl px-xl">
                <View className="flex-row items-center justify-between">
                  <View className="gap-xs flex-1">
                    <Text className="text-paragraph-p2 text-content-1">
                      <Trans>划转</Trans>
                    </Text>
                    <Text className="text-paragraph-p3 text-content-4">
                      <Trans>账户之间的资金划转</Trans>
                    </Text>
                  </View>
                  <IconifyNavArrowRight width={16} height={16} className="text-content-4" />
                </View>
              </CardContent>
            </Card>
          </Pressable>

          {/* 入金选项 */}
          <Pressable onPress={handleDepositPress}>
            <Card>
              <CardContent className="py-xl px-xl">
                <View className="flex-row items-center justify-between">
                  <View className="gap-xs flex-1">
                    <Text className="text-paragraph-p2 text-content-1">
                      <Trans>入金</Trans>
                    </Text>
                    <Text className="text-paragraph-p3 text-content-4">
                      <Trans>从外部钱包充值入金</Trans>
                    </Text>
                  </View>
                  <IconifyNavArrowRight width={16} height={16} className="text-content-4" />
                </View>
              </CardContent>
            </Card>
          </Pressable>
        </View>
      </DrawerContent>
    </Drawer>
  )
}
```

**Step 2: 验证组件创建**

检查文件是否正确创建：
```bash
ls -la apps/mobile/src/components/drawers/add-balance-drawer.tsx
```

Expected: 文件存在

**Step 3: 提交组件**

```bash
git add apps/mobile/src/components/drawers/add-balance-drawer.tsx
git commit -m "$(cat <<'EOF'
feat(drawers): 创建 AddBalanceDrawer 组件

为真实账户添加统一的"添加余额"入口抽屉，包含划转和入金两个选项。

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: 在 account-card 中集成 AddBalanceDrawer

**Files:**
- Modify: `apps/mobile/src/pages/(protected)/(tabs)/trade/_comps/account-card/index.tsx`

**Step 1: 导入 AddBalanceDrawer 并添加 ref**

在文件顶部添加导入：

```typescript
import { AddBalanceDrawer, AddBalanceDrawerRef } from '@/components/drawers/add-balance-drawer'
```

在 AccountCard 组件内部添加 ref（第 22 行之后）：

```typescript
const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false)
const addBalanceDrawerRef = useRef<AddBalanceDrawerRef>(null)  // 新增这行
const { trade } = useStores()
```

**Step 2: 修改 IconifyPlusCircle 的点击事件**

找到第 76-78 行的 IconButton，修改为：

```typescript
<Pressable
  onPress={(e) => {
    e.stopPropagation()
    addBalanceDrawerRef.current?.open()
  }}
>
  <IconButton color="primary">
    <IconifyPlusCircle width={14} height={14} />
  </IconButton>
</Pressable>
```

**Step 3: 在组件末尾添加 AddBalanceDrawer**

在 TradeAccountSwitchDrawer 之后（第 90 行之后）添加：

```typescript
      {/* Account Selection Drawer */}
      <TradeAccountSwitchDrawer
        visible={isAccountDrawerOpen}
        onClose={() => setIsAccountDrawerOpen(false)}
        selectedAccountId={currentAccountInfo.id}
      />

      {/* Add Balance Drawer */}
      <AddBalanceDrawer
        ref={addBalanceDrawerRef}
        accountInfo={currentAccountInfo}
      />
    </>
```

**Step 4: 验证修改**

读取文件检查修改是否正确：
```bash
grep -n "AddBalanceDrawer" apps/mobile/src/pages/(protected)/(tabs)/trade/_comps/account-card/index.tsx
```

Expected: 显示导入和使用的行号

**Step 5: 提交修改**

```bash
git add apps/mobile/src/pages/(protected)/(tabs)/trade/_comps/account-card/index.tsx
git commit -m "$(cat <<'EOF'
feat(trade): 在 account-card 中集成 AddBalanceDrawer

点击 + 号打开添加余额抽屉，阻止事件冒泡避免触发账户切换。

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: 在 account-list 的 RealAccountRow 中集成 AddBalanceDrawer

**Files:**
- Modify: `apps/mobile/src/pages/(protected)/(tabs)/assets/_comps/account-list.tsx`

**Step 1: 导入 AddBalanceDrawer**

在文件顶部（第 14 行之后）添加导入：

```typescript
import { TradeSimulateAccountDepositDrawer, TradeSimulateAccountDepositDrawerRef } from "@/components/drawers/trade-simulate-account-deposit-drawer";
import { AddBalanceDrawer, AddBalanceDrawerRef } from "@/components/drawers/add-balance-drawer";  // 新增这行
```

**Step 2: 在 RealAccountRow 中添加 ref**

在 RealAccountRow 组件内部（第 43 行之后）添加：

```typescript
const RealAccountRow = observer(({ account,
}: RealAccountRowProps) => {
  const { textColorContent1, colorBrandSecondary1, colorBrandPrimary } = useThemeColors()
  const addBalanceDrawerRef = useRef<AddBalanceDrawerRef>(null)  // 新增这行
  const synopsis = getAccountSynopsisByLng(account.synopsis)
```

**Step 3: 修改 IconifyPlusCircle 的点击事件**

找到第 73-75 行的 Pressable，修改为：

```typescript
<Pressable onPress={(e) => {
  e.stopPropagation()
  addBalanceDrawerRef.current?.open()
}}>
  <IconifyPlusCircle width={14} height={14} color={colorBrandPrimary} />
</Pressable>
```

**Step 4: 在 RealAccountRow 末尾添加 AddBalanceDrawer**

在 Card 组件之后（第 90 行之后）添加：

```typescript
      </CardContent>
    </Card>

    {/* Add Balance Drawer */}
    <AddBalanceDrawer
      ref={addBalanceDrawerRef}
      accountInfo={account}
    />
    // </Pressable>
```

**Step 5: 验证修改**

读取文件检查修改是否正确：
```bash
grep -n "AddBalanceDrawer" apps/mobile/src/pages/(protected)/(tabs)/assets/_comps/account-list.tsx
```

Expected: 显示导入和使用的行号

**Step 6: 提交修改**

```bash
git add apps/mobile/src/pages/(protected)/(tabs)/assets/_comps/account-list.tsx
git commit -m "$(cat <<'EOF'
feat(assets): 在 RealAccountRow 中集成 AddBalanceDrawer

真实账户列表的 + 号点击打开添加余额抽屉，模拟账户保持原有逻辑。

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: 测试和验证

**Step 1: 启动开发服务器**

提醒用户手动启动：
```bash
# 用户需要在终端手动运行
cd apps/mobile && npm run start
```

**Step 2: 测试清单**

手动测试以下场景：

- [ ] 交易页面的真实账户卡片，点击 + 号打开抽屉
- [ ] 点击 + 号不会触发账户切换抽屉
- [ ] 抽屉显示"划转"和"入金"两个选项
- [ ] 点击"划转"跳转到划转页面，转出账户为当前账户
- [ ] 点击"入金"跳转到入金页面，入金账户为当前账户
- [ ] 资产页面的真实账户列表，点击 + 号打开抽屉
- [ ] 模拟账户的 + 号保持原有的直接入金抽屉
- [ ] 国际化文案正确显示（中英文切换）
- [ ] 抽屉打开/关闭动画流畅

**Step 3: 最终提交（如有修复）**

如果测试中发现问题并修复，提交修复：
```bash
git add .
git commit -m "$(cat <<'EOF'
fix(drawers): 修复 AddBalanceDrawer 的问题

[描述具体修复的问题]

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## 完成

所有任务完成后，功能应该正常工作：
- ✅ AddBalanceDrawer 组件已创建
- ✅ account-card 已集成抽屉
- ✅ account-list 的 RealAccountRow 已集成抽屉
- ✅ 事件冒泡已阻止
- ✅ 导航参数正确传递
- ✅ 所有修改已提交

用户可以在真实账户的 + 号上点击，快速访问划转和入金功能。
