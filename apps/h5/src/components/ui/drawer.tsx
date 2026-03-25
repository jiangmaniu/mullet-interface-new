import { Drawer as VaulDrawer } from 'vaul'
import type { ReactNode, ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  通用 Drawer                                                        */
/* ------------------------------------------------------------------ */

type DrawerRootProps = ComponentProps<typeof VaulDrawer.Root>

/** 底部抽屉根组件，透传 vaul 所有 props（open / onOpenChange 等） */
function Drawer({ shouldScaleBackground = true, ...props }: DrawerRootProps) {
  return <VaulDrawer.Root shouldScaleBackground={shouldScaleBackground} {...props} />
}

function DrawerTrigger({ className, ...props }: ComponentProps<typeof VaulDrawer.Trigger>) {
  return <VaulDrawer.Trigger className={cn(className)} {...props} />
}

function DrawerClose({ className, ...props }: ComponentProps<typeof VaulDrawer.Close>) {
  return <VaulDrawer.Close className={cn(className)} {...props} />
}

function DrawerOverlay({ className, ...props }: ComponentProps<typeof VaulDrawer.Overlay>) {
  return (
    <VaulDrawer.Overlay
      className={cn('fixed inset-0 z-50 bg-black/60 backdrop-blur-sm', className)}
      {...props}
    />
  )
}

interface DrawerContentProps extends ComponentProps<typeof VaulDrawer.Content> {
  /** 是否显示顶部拖拽指示条 @default true */
  showHandle?: boolean
}

function DrawerContent({
  className,
  children,
  showHandle = true,
  ...props
}: DrawerContentProps) {
  return (
    <VaulDrawer.Portal>
      <DrawerOverlay />
      <VaulDrawer.Content
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 flex max-h-[96dvh] flex-col rounded-t-3 border-t bg-card',
          className,
        )}
        {...props}
      >
        {/* 拖拽指示条 */}
        {showHandle && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
          </div>
        )}
        {/* 底部安全区域由内容自行决定 */}
        {children}
      </VaulDrawer.Content>
    </VaulDrawer.Portal>
  )
}

function DrawerHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-4 pt-2 pb-3', className)} {...props} />
}

function DrawerTitle({ className, ...props }: ComponentProps<typeof VaulDrawer.Title>) {
  return (
    <VaulDrawer.Title
      className={cn('text-lg font-semibold text-card-foreground', className)}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: ComponentProps<typeof VaulDrawer.Description>) {
  return (
    <VaulDrawer.Description
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

function DrawerBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex-1 overflow-y-auto overscroll-contain px-4', className)}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-4 pt-3 pb-4 pb-safe', className)} {...props} />
}

/* ------------------------------------------------------------------ */
/*  隐私协议 Drawer                                                    */
/* ------------------------------------------------------------------ */

interface PrivacyDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 自定义隐私协议内容，默认使用内置占位文案 */
  children?: ReactNode
}

/**
 * 隐私协议底部抽屉
 *
 * 支持手势下滑关闭，自动处理底部安全区域。
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false)
 *
 * <Button onPress={() => setOpen(true)}>查看隐私协议</Button>
 * <PrivacyDrawer open={open} onOpenChange={setOpen} />
 * ```
 */
function PrivacyDrawer({ open, onOpenChange, children }: PrivacyDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>隐私协议</DrawerTitle>
          <DrawerDescription>请仔细阅读以下隐私条款</DrawerDescription>
        </DrawerHeader>

        <DrawerBody>{children ?? <DefaultPrivacyContent />}</DrawerBody>

        <DrawerFooter>
          <DrawerClose className="w-full rounded-2 bg-primary px-4 py-3 text-sm font-medium text-primary-foreground active:opacity-90">
            我已阅读并同意
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function DefaultPrivacyContent() {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
      <section>
        <h3 className="mb-1 font-medium text-card-foreground">1. 信息收集</h3>
        <p>
          我们会收集您在使用服务时主动提供的信息，以及通过自动化手段收集的设备信息、日志信息等，用于为您提供更好的服务体验。
        </p>
      </section>
      <section>
        <h3 className="mb-1 font-medium text-card-foreground">2. 信息使用</h3>
        <p>
          收集的信息将用于身份验证、安全防护、服务优化及法律法规要求的其他用途。我们不会将您的个人信息出售给第三方。
        </p>
      </section>
      <section>
        <h3 className="mb-1 font-medium text-card-foreground">3. 信息保护</h3>
        <p>
          我们采取业界标准的安全措施保护您的个人信息，防止数据遭到未经授权的访问、公开披露、使用、修改或损毁。
        </p>
      </section>
      <section>
        <h3 className="mb-1 font-medium text-card-foreground">4. 您的权利</h3>
        <p>
          您有权访问、更正、删除您的个人信息，也可以撤回此前授予的同意。如需行使上述权利，请通过应用内的反馈渠道联系我们。
        </p>
      </section>
    </div>
  )
}

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  PrivacyDrawer,
}
