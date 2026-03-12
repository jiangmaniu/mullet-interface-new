import { Trans } from '@lingui/react/macro'

import { Text } from '@/components/ui/text'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface HighlightTextProps {
  text: string
  searchChars: string[]
  className?: string
}

export function HighlightText({ text, searchChars, className }: HighlightTextProps) {
  if (!searchChars.length) {
    return <Text className={className}>{text}</Text>
  }

  return (
    <Tooltip title={<Trans>提示</Trans>}>
      <TooltipTrigger className="text-paragraph-p3 text-content-4" hasUnderline={false} numberOfLines={1}>
        <Text className={cn('')}>
          {text.split('').map((char, index) => {
            const isMatch = searchChars.some((c) => c.toLowerCase() === char.toLowerCase())
            return (
              <Text key={index} className={cn(className, isMatch ? 'text-brand-primary' : '')}>
                {char}
              </Text>
            )
          })}
        </Text>
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  )
}
