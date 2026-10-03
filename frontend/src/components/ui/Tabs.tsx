import React from 'react'
import { cn } from '../../utils/helpers'

type TabIcon =
  | React.ComponentType<{ className?: string }>
  | React.ReactElement

export interface TabItem {
  id: string
  label: string
  icon?: TabIcon
}

interface TabsProps {
  tabs: readonly TabItem[]
  activeTab: string
  onChange: (tabId: string) => void
  variant?: 'default' | 'pills'
  className?: string
}

interface TabPanelProps {
  id: string
  activeTab: string
  children: React.ReactNode
  className?: string
}

function renderTabIcon(icon: TabIcon | undefined) {
  if (!icon) return null

  if (React.isValidElement(icon)) {
    return icon
  }

  return React.createElement(
    icon as React.ComponentType<{ className?: string }>,
    {
      className: 'w-4 h-4',
    }
  )
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  className,
}: TabsProps) {
  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'flex items-center gap-1 overflow-x-auto',
          variant === 'pills'
            ? 'p-1 bg-secondary-100 rounded-xl'
            : 'border-b border-secondary-200'
        )}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap transition-colors',
                variant === 'pills'
                  ? cn(
                      'px-4 py-2 text-sm font-medium rounded-lg',
                      isActive
                        ? 'bg-white text-primary-700 shadow-sm'
                        : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                    )
                  : cn(
                      'px-4 py-3 text-sm font-medium border-b-2',
                      isActive
                        ? 'text-primary-700 border-primary-600'
                        : 'text-secondary-600 border-transparent hover:text-secondary-900'
                    )
              )}
            >
              {renderTabIcon(tab.icon)}
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function TabPanel({
  id,
  activeTab,
  children,
  className,
}: TabPanelProps) {
  if (id !== activeTab) {
    return null
  }

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${id}`}
      className={cn('w-full', className)}
    >
      {children}
    </div>
  )
}