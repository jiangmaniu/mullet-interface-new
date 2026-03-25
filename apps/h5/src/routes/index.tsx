import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { PrivacyDrawer } from '@/components/ui/drawer'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const [privacyOpen, setPrivacyOpen] = useState(false)

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-3xl font-bold text-primary">Mullet H5</h1>
      <p className="text-muted-foreground">
        Vite+ · Hono · React 19 · JollyUI
      </p>

      <Button onPress={() => setPrivacyOpen(true)}>查看隐私协议</Button>

      <PrivacyDrawer open={privacyOpen} onOpenChange={setPrivacyOpen} />
    </div>
  )
}
