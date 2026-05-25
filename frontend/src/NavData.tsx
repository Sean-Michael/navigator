import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { SEED } from './data'
import { fetchBootstrap } from './api'
import { NavDataContext } from './navData-context'
import type { NavDataContextValue } from './navData-context'

export function NavDataProvider({ children }: { children: ReactNode }) {
  // Start from the offline seed so the UI is instant, then upgrade to live
  // data from the backend. If the API is unreachable we stay on the seed.
  const [value, setValue] = useState<NavDataContextValue>({ data: SEED, source: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    fetchBootstrap(controller.signal)
      .then((data) => setValue({ data, source: 'live' }))
      .catch(() => setValue({ data: SEED, source: 'seed' }))
    return () => controller.abort()
  }, [])

  return <NavDataContext.Provider value={value}>{children}</NavDataContext.Provider>
}
