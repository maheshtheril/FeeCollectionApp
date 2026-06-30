"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import NProgress from "nprogress"
import "nprogress/nprogress.css"

export function NavigationEvents() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Whenever the URL changes, the navigation is complete.
  useEffect(() => {
    NProgress.done()
    document.body.style.cursor = "default"
  }, [pathname, searchParams])

  useEffect(() => {
    // Intercept clicks on links to show loading state instantly
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a")
      if (target && target.href && target.target !== "_blank") {
        const isInternal = target.href.startsWith(window.location.origin)
        
        // Only trigger if we are actually navigating to a new path
        const currentUrl = window.location.pathname + window.location.search
        const targetUrl = new URL(target.href)
        const newUrl = targetUrl.pathname + targetUrl.search

        if (isInternal && currentUrl !== newUrl) {
           NProgress.start()
           document.body.style.cursor = "wait"
        }
      }
    }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  return null
}
