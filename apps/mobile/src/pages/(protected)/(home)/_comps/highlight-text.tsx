import { Text } from '@/components/ui/text'
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
  )
}
