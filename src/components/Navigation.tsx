import Link from 'next/link'
import { Briefcase, Home, Settings, List } from 'lucide-react'

export default function Navigation() {
  return (
    <nav className="bg-blue-600 text-white shadow-lg border-b border-blue-700" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex justify-between items-center py-4">
          <Link 
            href="/" 
            className="flex items-center space-x-3 text-xl font-bold hover:text-blue-100 transition-colors"
            aria-label="Job Tracker - Go to homepage"
          >
            <Briefcase className="h-6 w-6" aria-hidden="true" />
            <span>Job Tracker</span>
          </Link>
          <div className="flex space-x-1" role="menubar">
            <Link 
              href="/" 
              className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
              role="menuitem"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link 
              href="/jobs" 
              className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
              role="menuitem"
            >
              <List className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Jobs</span>
            </Link>
            <Link 
              href="/config" 
              className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
              role="menuitem"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Configuration</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}