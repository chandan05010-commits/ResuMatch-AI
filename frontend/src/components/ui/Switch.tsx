import React from 'react'
import { cn } from '../../utils/helpers'

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  disabled?: boolean
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, disabled, id, ...props }, ref) => {
    const switchId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex items-center gap-3">
        <button
          role="switch"
          aria-checked={props.checked}
          aria-disabled={disabled}
          aria-label={label}
          onClick={() => !disabled && props.onChange?.({ target: { checked: !props.checked } } as React.ChangeEvent<HTMLInputElement>)}
          className={cn(
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            props.checked ? 'bg-primary-600' : 'bg-secondary-300',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              props.checked ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>
        {label && (
          <label htmlFor={switchId} className="text-sm font-medium text-secondary-700 cursor-pointer select-none">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type="checkbox"
          id={switchId}
          className="sr-only"
          {...props}
          disabled={disabled}
          onChange={(e) => props.onChange?.(e)}
        />
      </div>
    )
  }
)

Switch.displayName = 'Switch'