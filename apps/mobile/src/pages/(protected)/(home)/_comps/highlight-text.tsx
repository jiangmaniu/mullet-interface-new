import { Text } from '@/components/ui/text'

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
    <Text className={className}>
      {text.split('').map((char, index) => {
        const isMatch = searchChars.some(c => c.toLowerCase() === char.toLowerCase())
        return (
          <Text key={index} className={isMatch ? 'text-brand-default' : ''}>
            {char}
          </Text>
        )
      })}
    </Text>
  )
}
