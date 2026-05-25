import { createContext, useContext } from 'react'
import { SEED } from './data'
import type { NavData } from './data'

export type DataSource = 'loading' | 'live' | 'seed'

export interface NavDataContextValue {
  data: NavData
  source: DataSource
}

export const NavDataContext = createContext<NavDataContextValue>({ data: SEED, source: 'seed' })

export function useNavData(): NavData {
  return useContext(NavDataContext).data
}

export function useDataSource(): DataSource {
  return useContext(NavDataContext).source
}
