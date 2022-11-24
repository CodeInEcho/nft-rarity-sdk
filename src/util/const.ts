import { Network } from '../types/types';

export const DEFAULT_ALCHEMY_API_KEY = 'demo';
export const DEFAULT_NETWORK = Network.ETH_MAINNET;

/**
 * Returns the base URL for making Alchemy API requests. The `alchemy.com`
 * endpoints only work with non eth json-rpc requests.
 *
 * @internal
 */
export function getAlchemyHttpUrl(network: Network, apiKey: string): string {
  return `https://${network}.g.alchemy.com/v2/${apiKey}`;
}
