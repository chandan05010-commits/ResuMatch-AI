import React from 'react'
import { cn, getScoreColor, getScoreRingColor } from '../../utils/helpers'

interface ScoreCircleProps {
  score: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showLabel?: boolean
  label?: string
  animate?: boolean
  strokeWidth?: number
}

const sizeConfig = {
  sm: { size: 48, strokeWidth: 4, fontSize: 'text-xs' },
  md: { size: 80, strokeWidth: 6, fontSize: 'text-sm' },
  lg: { size: 120, strokeWidth: 8, fontSize: 'text-lg' },
  xl: { size: 160, strokeWidth: 10, fontSize: 'text-2xl' },
}

export function ScoreCircle({ score, size = 'md', showLabel = true, label, animate = true, strokeWidth }: ScoreCircleProps) {
  const config = sizeConfig[size]
  const radius = (config.size - (strokeWidth || config.strokeWidth)) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.max(0, Math.min(100, score)) / 100
  const strokeDashoffset = circumference * (1 - progress)
  const ringColor = getScoreRingColor(score)
  const textColor = getScoreColor(score)

  return (
    <div className={cn('relative inline-flex flex-col items-center', animate && 'animate-in')}>
      <div className="relative" style={{ width: config.size, height: config.size }}>
        <svg width={config.size} height={config.size} className="transform -rotate-90">
          <circle
            className="text-secondary-200"
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth || config.strokeWidth}
          />
          <circle
            className={cn('transition-all duration-1000 ease-out', ringColor, animate ? '' : 'transition-none')}
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth || config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ strokeDashoffset: animate ? strokeDashoffset : circumference }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-bold', config.fontSize, textColor)}>
            {Math.round(score)}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className={cn('mt-2 text-center', label ? 'text-sm font-medium text-secondary-700' : 'text-xs text-secondary-500')}>
          {label || 'ATS Score'}
        </span>
      )}
    </div>
  )
}

export function ScoreBar({ score, size = 'md', showLabel = true, label, animate = true }: Omit<ScoreCircleProps, 'strokeWidth'>) {
  const config = sizeConfig[size]
  const barHeight = { sm: 4, md: 6, lg: 8, xl: 12 }[size]
  const ringColor = getScoreRingColor(score)

  return (
    <div className={cn('w-full', animate && 'animate-in')}>
      <div className="relative h-2 bg-secondary-200 rounded-full overflow-hidden" style={{ height: barHeight }}>
        <div
          className={cn('h-full rounded-full transition-all duration-1000 ease-out', ringColor, animate ? '' : 'transition-none')}
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-sm font-medium text-secondary-700">{label || 'Score'}</span>
          <span className={cn('text-sm font-bold', getScoreColor(score))}>{Math.round(score)}%</span>
        </div>
      )}
    </div>
  )
}