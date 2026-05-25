import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { SEED } from './data'
import type { NavData } from './data'
import { fetchBootstrap } from './api'
import { NavDataContext } from './navData-context'
import type { DataSource } from './navData-context'

export function NavDataProvider({ children }: { children: ReactNode }) {
  // Start from the offline seed so the UI is instant, then upgrade to live
  // data from the backend. If the API is unreachable we stay on the seed.
  const [data, setData] = useState<NavData>(SEED)
  const [source, setSource] = useState<DataSource>('loading')

  const refresh = useCallback(
    () =>
      fetchBootstrap()
        .then((next) => {
          setData(next)
          setSource('live')
        })
        .catch(() => {
          setSource((prev) => (prev === 'live' ? 'live' : 'seed'))
        }),
    [],
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchBootstrap(controller.signal)
      .then((next) => {
        setData(next)
        setSource('live')
      })
      .catch(() => setSource('seed'))
    return () => controller.abort()
  }, [])

  return (
    <NavDataContext.Provider value={{ data, source, refresh }}>{children}</NavDataContext.Provider>
  )
}
