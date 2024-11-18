"use client"

import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import Cookie from 'js-cookie'
import { useEffect, useState } from 'react'

const inter = Inter({ subsets: ['latin'] })



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSignedIn, setIsSignedIn] = useState(false)

  useEffect(() => {
    // Check if the accessToken cookie exists on load
    const checkSignInStatus = () => {
      const token = Cookie.get('accessToken')
      setIsSignedIn(!!token)
    }

    checkSignInStatus() // Initial check when the component loads

    // Set up an interval to check for token changes every second
    const interval = setInterval(checkSignInStatus, 1000)

    // Clean up interval when component unmounts
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    // Remove the accessToken cookie
    Cookie.remove('accessToken')
    setIsSignedIn(false)
    // Optionally, redirect to the homepage or refresh the page
    window.location.href = '/'
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-gray-100 dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="text-black dark:text-white font-bold text-xl">
                  Car Dealership
                </Link>
              </div>
              <div className="flex">
                {isSignedIn ? (
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 dark:text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                      Login
                    </Link>
                    <Link href="/signup" className="text-gray-700 dark:text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
