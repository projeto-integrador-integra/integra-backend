import { loadLocalEnv } from './config.local'
import { loadProdEnv } from './config.production'

const isLocal = process.env.NODE_ENV !== 'production'

export const loadEnv = isLocal ? loadLocalEnv : loadProdEnv
