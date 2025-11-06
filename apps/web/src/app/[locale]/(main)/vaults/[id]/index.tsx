// import { TextCopyButton } from '@/components/button/copy-button'

import { useRouter } from 'next/navigation'

import { cn } from '@mullet/ui/lib/utils'
import { renderFallback } from '@mullet/utils/fallback'
import { formatAddress } from '@mullet/utils/format'

import VaultDetailCharts from './_comps/charts'
import VaultDetailInfo from './_comps/info'
import VaultDetailIOPanel from './_comps/io'
import { VaultDetailOverview } from './_comps/overview'
import VaultDetailRecords from './_comps/records'
import { useVaultDetail } from './_hooks/use-vault-detail'

export default function VaultDetail() {
  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <VaultDetailTitle />

      <div className="flex flex-col gap-2.5">
        <VaultDetailOverview />
        <div className="flex gap-2.5">
          <div className="flex flex-1 flex-col items-stretch gap-2.5">
            <div>
              <VaultDetailInfo />
            </div>
            <div>
              <VaultDetailCharts />
            </div>
          </div>

          <div className="w-full max-w-[480px]">
            <VaultDetailIOPanel />
          </div>
        </div>

        <div>
          <VaultDetailRecords />
        </div>
      </div>
    </div>
  )
}

function VaultDetailTitle() {
  const { vaultDetail } = useVaultDetail()
  const { replace } = useRouter()

  return (
    <div className="py-5">
      <div className="relative">
        <div
          className="absolute top-0 right-full mr-2 flex size-[30px] cursor-pointer items-center justify-center rounded-full border border-[#3B3D52]"
          onClick={() => {
            replace('/vaults')
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16">
            <defs>
              <clipPath id="master_svg0_171_30674">
                <rect x="0" y="0" width="16" height="16" rx="0" />
              </clipPath>
            </defs>
            <g clip-path="url(#master_svg0_171_30674)">
              <g>
                <path
                  d="M13.741770875,7.349476775L3.825407975,7.349476775L7.923589675,3.273112775C8.163225175000001,3.016730075,8.156471275000001,2.6165320850000002,7.908320475,2.368381735C7.660170575,2.12023139,7.259973075,2.11347723,7.003589675,2.353112695L1.796317325,7.542203875C1.54445672,7.797157275,1.54445672,8.207248674999999,1.796317325,8.462203075L7.003589675,13.665839375C7.257726175,13.919685375,7.669453575,13.919685375,7.923589675,13.665839375C8.175450375,13.410884375,8.175450375,13.000793375,7.923589675,12.745840375L3.825407975,8.651294674999999L13.741770875,8.651294674999999C14.101258875,8.651294674999999,14.392682875,8.359872775,14.392682875,8.000386675C14.392682875,7.640898675,14.101258875,7.349476775,13.741770875,7.349476775Z"
                  fill="#FFFFFF"
                  fillOpacity="1"
                  style={{ mixBlendMode: 'passthrough' as React.CSSProperties['mixBlendMode'] }}
                />
              </g>
            </g>
          </svg>
        </div>

        <div className={cn('text-[24px] font-bold text-white')} title={vaultDetail?.followPoolName}>
          {renderFallback(vaultDetail?.followPoolName)}
        </div>

        <div className="flex items-center gap-2.5">
          <div className={'text-[14px] text-[#9FA0B0]'} title={vaultDetail?.pdaAddress}>
            {renderFallback(formatAddress(vaultDetail?.pdaAddress))}
          </div>
          {/* {vaultDetail?.pdaAddress && <TextCopyButton text={vaultDetail?.pdaAddress} />} */}
        </div>
      </div>
    </div>
  )
}
