import { ComponentProps } from 'react'

import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

interface HighlightTextProps {
  text: string
  searchChars: string[]
  className?: string
}

export function HighlightText({
  text,
  searchChars,
  className,
  ...props
}: HighlightTextProps & ComponentProps<typeof Text>) {
  if (!searchChars.length) {
    return (
      <Text className={className} {...props}>
        {text}
      </Text>
    )
  }

  return (
    <Text className={cn(className)} {...props}>
      {text.split('').map((char, index) => {
        const isMatch = searchChars.some((c) => c.toLowerCase() === char.toLowerCase())
        return (
          <Text key={index} className={cn(className, isMatch ? 'text-brand-primary' : '')}>
            {char}
          </Text>
        )
      })}
    </Text>
  )
}
