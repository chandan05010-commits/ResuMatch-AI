import React, { useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../utils/helpers'
import { ChevronDown, Check } from 'lucide-react'

interface DropdownOption {
  value: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
}

interface DropdownProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  searchable?: boolean
  multi?: boolean
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  className,
  searchable = false,
  multi = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = options.filter(
    (opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedOption = options.find((opt) => opt.value === value)
  const selectedOptions = multi
    ? value.split(',').map((v) => options.find((opt) => opt.value === v)).filter(Boolean)
    : []

  const handleOptionClick = (option: DropdownOption) => {
    if (option.disabled) return
    if (multi) {
      const currentValues = value.split(',').filter(Boolean)
      const newValues = currentValues.includes(option.value)
        ? currentValues.filter((v) => v !== option.value)
        : [...currentValues, option.value]
      onChange(newValues.join(','))
    } else {
      onChange(option.value)
      setIsOpen(false)
    }
  }

  return (
    <div ref={dropdownRef} className={cn('relative w-full', className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full px-4 py-2.5 rounded-lg border bg-white text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          disabled ? 'opacity-50 cursor-not-allowed border-secondary-200' : 'border-secondary-300 hover:border-primary-300',
          'flex items-center justify-between'
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex-1 truncate">
          {multi
            ? selectedOptions.length > 0
              ? selectedOptions.map((opt) => opt?.label).join(', ')
              : placeholder
            : selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-secondary-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-secondary-200 shadow-lg max-h-60 overflow-auto">
          {searchable && (
            <div className="p-2 border-b border-secondary-200 sticky top-0 bg-white">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                autoFocus
              />
            </div>
          )}
          <ul role="listbox" className="py-1">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-secondary-500 text-center">No options found</li>
            ) : (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={multi ? value.split(',').includes(option.value) : value === option.value}
                  onClick={() => handleOptionClick(option)}
                  className={cn(
                    'px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center gap-3',
                    option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary-50',
                    (multi ? value.split(',').includes(option.value) : value === option.value) && 'bg-primary-50 text-primary-700'
                  )}
                >
                  {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                  <span className="flex-1 truncate">{option.label}</span>
                  {(multi ? value.split(',').includes(option.value) : value === option.value) && (
                    <Check className="w-4 h-4 flex-shrink-0 text-primary-600" />
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: { value: string; label: string }[]
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, id, children, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-secondary-700 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border bg-white text-secondary-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none',
            'bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3E%3Cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3E%3C/svg%3E")] bg-[right_0.5rem_center] bg-no-repeat pr-10',
            error ? 'border-danger-500 focus:ring-danger-500' : 'border-secondary-300',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          {...props}
        >
          {children}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={`${selectId}-error`} className="mt-1.5 text-sm text-danger-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${selectId}-helper`} className="mt-1.5 text-sm text-secondary-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'