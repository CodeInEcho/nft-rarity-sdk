import { RaritySettings, Network } from '../types/types'
import { DEFAULT_ALCHEMY_API_KEY, DEFAULT_NETWORK } from '../util/const'

/**
 * This class holds the config information for the SDK client instance and
 * exposes the underlying providers for more advanced use cases.
 *
 * @public
 */
export class RarityConfig {
  /** The Alchemy API key. */
  readonly alchemyApiKey: string

  /** The Network that this SDK is associated with. */
  readonly network: Network

  constructor(config?: RaritySettings) {
    this.alchemyApiKey = config?.alchemyApiKey || DEFAULT_ALCHEMY_API_KEY
    this.network = config?.network || DEFAULT_NETWORK
  }
}
