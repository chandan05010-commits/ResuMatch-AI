import React, { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { cn } from '../utils/helpers'
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  FileText,
  Briefcase,
  BookOpen,
  Settings,
  ChevronDown,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/analyzer', label: 'Analyzer' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/applications', label: 'Applications' },
  { href: '/ats-guide', label: 'ATS Guide' },
]

const userNavLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analyzer', label: 'Analyzer', icon: FileText },
  { href: '/applications', label: 'Applications', icon: Briefcase },
  { href: '/history', label: 'History', icon: BookOpen },
  { href: '/profile', label: 'Profile', icon: Settings },
]

export function MainLayout() {
  const { user, isAuthenticated, logout, isLoading } = useAuth()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-secondary-200">
        <nav
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <div className="flex h-16 items-center justify-between">

            {/* Logo + Desktop Navigation */}
            <div className="flex items-center gap-8">
              <NavLink
                to="/"
                className="flex items-center gap-2 text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors"
                aria-label="ResuMatch AI Home"
              >
                <span className="text-2xl">📄</span>
                <span>ResuMatch AI</span>
              </NavLink>

              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.href}
                    to={link.href}
                    className={({ isActive }) =>
                      cn(
                        'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {isLoading ? (
                <div className="h-10 w-24 animate-pulse bg-secondary-200 rounded-lg" />
              ) : isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-secondary-700 hover:text-secondary-900 hover:bg-secondary-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-700">
                        {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>

                    <span className="hidden sm:block">
                      {user?.full_name}
                    </span>

                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                        aria-hidden="true"
                      />

                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-secondary-200 shadow-lg py-1 z-50 animate-in">

                        <div className="px-4 py-3 border-b border-secondary-200">
                          <p className="text-sm font-medium text-secondary-900">
                            {user?.full_name}
                          </p>

                          <p className="text-xs text-secondary-500 truncate">
                            {user?.email}
                          </p>
                        </div>

                        {userNavLinks.map((link) => (
                          <NavLink
                            key={link.href}
                            to={link.href}
                            onClick={() => setUserMenuOpen(false)}
                            className={({ isActive }) =>
                              cn(
                                'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                                isActive
                                  ? 'bg-primary-50 text-primary-700'
                                  : 'text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900'
                              )
                            }
                          >
                            <link.icon className="w-4 h-4" />
                            {link.label}
                          </NavLink>
                        ))}

                        <hr className="my-1 border-secondary-200" />

                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-secondary-700 hover:text-secondary-900 hover:bg-secondary-50 rounded-lg transition-colors"
                  >
                    Login
                  </NavLink>

                  <NavLink
                    to="/register"
                    className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                  >
                    Sign Up
                  </NavLink>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div
              id="mobile-menu"
              className="md:hidden py-4 border-t border-secondary-200 animate-in"
            >
              <div className="flex flex-col gap-2">

                {navLinks.map((link) => (
                  <NavLink
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'px-3 py-2.5 rounded-lg text-base font-medium',
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}

                {isAuthenticated ? (
                  <>
                    <hr className="my-2 border-secondary-200" />

                    {userNavLinks.map((link) => (
                      <NavLink
                        key={link.href}
                        to={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium',
                            isActive
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                          )
                        }
                      >
                        <link.icon className="w-5 h-5" />
                        {link.label}
                      </NavLink>
                    ))}

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-danger-600 hover:bg-danger-50 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <hr className="my-2 border-secondary-200" />

                    <NavLink
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2.5 rounded-lg text-base font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
                    >
                      Login
                    </NavLink>

                    <NavLink
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2.5 rounded-lg text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                      Sign Up
                    </NavLink>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1" id="main-content">
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className="bg-secondary-900 text-secondary-300"
        role="contentinfo"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 text-xl font-bold text-white mb-4">
                <span className="text-2xl">📄</span>
                <span>ResuMatch AI</span>
              </div>

              <p className="text-sm text-secondary-400 mb-4">
                Build a resume that gets noticed. AI-powered ATS analysis and job matching.
              </p>

              <div className="flex gap-4">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary-400 hover:text-white transition-colors"
                  aria-label="GitHub"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold text-white mb-4">
                Product
              </h3>

              <ul className="space-y-2 text-sm">
                <li>
                  <NavLink
                    to="/analyzer"
                    className="hover:text-white transition-colors"
                  >
                    Analyzer
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/dashboard"
                    className="hover:text-white transition-colors"
                  >
                    Dashboard
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/applications"
                    className="hover:text-white transition-colors"
                  >
                    Applications
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/ats-guide"
                    className="hover:text-white transition-colors"
                  >
                    ATS Guide
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-white mb-4">
                Legal
              </h3>

              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/privacy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>

                <li>
                  <a
                    href="/terms"
                    className="hover:text-white transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-white mb-4">
                Contact
              </h3>

              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="mailto:hello@resumatch.ai"
                    className="hover:text-white transition-colors"
                  >
                    hello@resumatch.ai
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-secondary-800 text-center text-sm text-secondary-500">
            <p>
              &copy; {new Date().getFullYear()} ResuMatch AI. All rights reserved.
            </p>
          </div>

        </div>
      </footer>
    </div>
  )
}