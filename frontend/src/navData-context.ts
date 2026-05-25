import { createContext, useContext } from 'react'
import { SEED } from './data'
import type { NavData } from './data'

export type DataSource = 'loading' | 'live' | 'seed'

export interface NavDataContextValue {
  data: NavData
  source: DataSource
  refresh: () => Promise<void>
}

export const NavDataContext = createContext<NavDataContextValue>({
  data: SEED,
  source: 'seed',
  refresh: async () => {},
})

export function useNavData(): NavData {
  return useContext(NavDataContext).data
}

export function useDataSource(): DataSource {
  return useContext(NavDataContext).source
}

export function useNavRefresh(): () => Promise<void> {
  return useContext(NavDataContext).refresh
}
