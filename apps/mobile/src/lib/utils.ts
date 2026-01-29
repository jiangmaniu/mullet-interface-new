import { clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'

const createCn = (...args: Parameters<typeof extendTailwindMerge>) => {
  const customTwMerge = extendTailwindMerge(...args)

  function cn(...inputs: ClassValue[]) {
    return customTwMerge(clsx(inputs))
  }

  return cn
}

export const cn = createCn({
  extend: {
    theme: {
      text: [
        'xs',
        'small',
        'medium',
        'large',
        'xl',
        '2xl',
        '3xl',
        'title-h1',
        'title-h2',
        'title-h3',
        'paragraph-p1',
        'paragraph-p2',
        'paragraph-p3',
        'paragraph-p4',
        'important-1',
        'important-2',
        'button-1',
        'button-2',
        'clickable-1',

      ],
      background: ['', ''],
      border: [],
      spacing: [
        'spacing-xs',
        'spacing-small',
        'spacing-medium',
        'spacing-large',
        'spacing-xl',
        'spacing-2xl',
        'spacing-3xl',
        'spacing-4xl',
      ],
    },
  },
})
