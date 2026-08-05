"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

export default function NavigationProgress() {
  const pathname = usePathname()
  const premierRendu = useRef(true)
  const timers = useRef<number[]>([])
  const [visible, setVisible] = useState(false)
  const [progression, setProgression] = useState(0)

  const nettoyerTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
  }, [])

  const demarrer = useCallback(() => {
    nettoyerTimers()
    setVisible(true)
    setProgression(18)
    timers.current.push(window.setTimeout(() => setProgression(62), 120))
    timers.current.push(window.setTimeout(() => setProgression(84), 420))
  }, [nettoyerTimers])

  const terminer = useCallback(() => {
    nettoyerTimers()
    setProgression(100)
    timers.current.push(
      window.setTimeout(() => {
        setVisible(false)
        setProgression(0)
      }, 260),
    )
  }, [nettoyerTimers])

  useEffect(() => {
    function gererClic(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }

      const cible = event.target instanceof Element ? event.target.closest("a") : null
      const href = cible?.getAttribute("href")

      if (!cible || !href || href.startsWith("#") || cible.target || cible.hasAttribute("download")) {
        return
      }

      const url = new URL(href, window.location.href)
      const destination = `${url.pathname}${url.search}`
      const actuelle = `${window.location.pathname}${window.location.search}`

      if (url.origin === window.location.origin && destination !== actuelle) {
        demarrer()
      }
    }

    document.addEventListener("click", gererClic)
    return () => {
      document.removeEventListener("click", gererClic)
      nettoyerTimers()
    }
  }, [demarrer, nettoyerTimers])

  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false
      return
    }

    terminer()
  }, [pathname, terminer])

  return (
    <div
      aria-hidden="true"
      className={`fixed left-0 top-0 z-[100] h-1 w-full overflow-hidden bg-transparent transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-full origin-left bg-primary shadow-[0_0_18px_rgba(15,138,122,0.45)] transition-transform duration-300 ease-out"
        style={{ transform: `scaleX(${progression / 100})` }}
      />
    </div>
  )
}
