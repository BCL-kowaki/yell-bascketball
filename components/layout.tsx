"use client"
import { ReactNode } from "react"
import { HeaderNavigation } from "@/components/header-navigation"
import { SidebarMenu } from "@/components/sidebar-menu"

interface LayoutProps {
  children: ReactNode
  isLoggedIn?: boolean
  currentUser?: {
    name: string
    avatar?: string
  }
}

export function Layout({ children, isLoggedIn = false, currentUser }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br">
      {/* Header */}
      <HeaderNavigation isLoggedIn={isLoggedIn} currentUser={currentUser} />
      
      <div className="flex pt-20">
        {/* Sidebar */}
        <SidebarMenu isLoggedIn={isLoggedIn} currentUser={currentUser} />
        
        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout