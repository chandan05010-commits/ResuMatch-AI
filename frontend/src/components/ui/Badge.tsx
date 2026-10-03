import React from 'react'
import { cn } from '../../utils/helpers'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary' | 'outline'
  size?: 'sm' | 'md'
  dot?: boolean
  dotColor?: string
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'primary', size = 'md', dot, dotColor, children, ...props }, ref) => {
    const variantClasses = {
      primary: 'bg-primary-100 text-primary-700',
      success: 'bg-success-100 text-success-700',
      warning: 'bg-warning-100 text-warning-700',
      danger: 'bg-danger-100 text-danger-700',
      secondary: 'bg-secondary-100 text-secondary-700',
      outline: 'bg-transparent border border-secondary-300 text-secondary-700',
    }

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-xs',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full font-medium',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dotColor || 'currentColor' }} />}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'