import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { cn } from '../utils/helpers'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-secondary-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <NavLink
              to="/"
              className="flex items-center gap-2 text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors"
              aria-label="ResuMatch AI Home"
            >
              <span className="text-2xl">📄</span>
              <span>ResuMatch AI</span>
            </NavLink>
            <NavLink
              to="/"
              className="text-sm font-medium text-secondary-600 hover:text-secondary-900 transition-colors"
            >
              Back to Home
            </NavLink>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      <footer className="bg-secondary-900 text-secondary-300 py-8" role="contentinfo">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} ResuMatch AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}