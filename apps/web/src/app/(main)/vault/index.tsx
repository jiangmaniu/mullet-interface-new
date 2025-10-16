import { cn } from '@/utils/cn'
import { useEmotionCss } from '@ant-design/use-emotion-css'
import VaultList from './_comps/list'
import { VaultOverview } from './_comps/vault-overview'

export default function ValutPage() {
  const bgClassName = useEmotionCss(() => {
    return {
      'font-family': 'HarmonyOS Sans SC',
      'font-size': '24px',
      'font-weight': 'bold',
      'line-height': 'normal',
      'letter-spacing': '0em',
      'font-variation-settings': 'opsz auto',
      'font-feature-settings': 'kern on',
      color: '#FFFFFF'
    }
  })

  return (
    <div className={'mx-auto max-w-[1200px] w-full'}>
      <div className={cn([bgClassName, 'py-5'])}>金库</div>

      <div>
        <VaultOverview />
      </div>

      <div className="mt-2.5">
        <VaultList />
      </div>
    </div>
  )
}
