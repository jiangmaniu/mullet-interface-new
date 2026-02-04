import { z } from 'zod'
import { t } from '@lingui/core/macro'

/** 登录 - 表单控制 */
export const loginSchema = z.object({
  // tenanId: z.string().min(1, { message: t`Server placeholder` }),
  // 非必需
  tenanId: z.string().optional(),
  email: z.string().email({ message: t`Customer NO placeholder` }),
  password: z
    .string()
    .min(6, { message: t`Password min` })
    .refine((value) => /[a-z]/.test(value), { message: t`Password lowercase` })
    .refine((value) => /[A-Z]/.test(value), { message: t`Password uppercase` })
    // .refine((value) => /[0-9]/.test(value), { message: t`Password number` })
    .refine((value) => /[\W_]/.test(value), { message: t`Password symbol` })
})
