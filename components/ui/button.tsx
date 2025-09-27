import * as React from 'react'
import { cn } from '@/lib/utils'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => (
    <button ref={ref} className={cn('inline-flex items-center justify-center rounded border px-4 py-2 text-sm', className)} {...props} />
  )
)
Button.displayName = 'Button'

