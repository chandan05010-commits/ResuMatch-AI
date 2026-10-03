import React from 'react'
import { cn } from '../../utils/helpers'

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      leftIcon,
      rightIcon,
      disabled,
      children,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variantClasses = {
      primary:
        'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 active:bg-primary-800',
      secondary:
        'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 focus-visible:ring-secondary-500 active:bg-secondary-300',
      outline:
        'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-500 active:bg-primary-100',
      ghost:
        'text-secondary-600 hover:bg-secondary-100 focus-visible:ring-secondary-500 active:bg-secondary-200',
      danger:
        'bg-danger-600 text-white hover:bg-danger-700 focus-visible:ring-danger-500 active:bg-danger-800',
    }

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    const classes = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    )

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{
        className?: string
        onClick?: React.MouseEventHandler
      }>

      return React.cloneElement(child, {
        className: cn(classes, child.props.className),
      })
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : leftIcon ? (
          <span>{leftIcon}</span>
        ) : null}

        {children}

        {!isLoading && rightIcon && (
          <span>{rightIcon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'