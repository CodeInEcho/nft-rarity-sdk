/**
 * The supported networks by Alchemy. Note that some functions are not available
 * on all networks. Please refer to the Alchemy documentation for which APIs are
 * available on which networks
 * {@link https://docs.alchemy.com/alchemy/apis/feature-support-by-chain}
 *
 * @public
 */
export enum Network {
  ETH_MAINNET = 'eth-mainnet',
  ETH_GOERLI = 'eth-goerli',
  OPT_MAINNET = 'opt-mainnet',
  OPT_GOERLI = 'opt-goerli',
  ARB_MAINNET = 'arb-mainnet',
  ARB_GOERLI = 'arb-goerli',
  MATIC_MAINNET = 'polygon-mainnet',
  MATIC_MUMBAI = 'polygon-mumbai',
  ASTAR_MAINNET = 'astar-mainnet',
}

/**
 * Options object used to configure the Rarity SDK.
 *
 * @public
 */
export interface RaritySettings {
  network?: Network
  alchemyApiKey?: string
}

/**
 * Optional parameters object for the {@link getNftsForContract} and
 * {@link getNftsForContractIterator} functions.
 *
 * This interface is used to fetch NFTs with their associated metadata. To get
 * Nfts without their associated metadata, use {@link GetBaseNftsForContractOptions}.
 *
 * @public
 */
export interface GetNftsForContractOptions {
  /**
   * {@link NftContractNftsResponse}to use for pagination.
   */
  pageKey?: string

  /** Optional boolean flag to omit NFT metadata. Defaults to `false`. */
  withMetadata?: boolean

  /**
   * Sets the total number of NFTs to return in the response. Defaults to 100.
   * Maximum page size is 100.
   */
  pageSize?: number

  /**
   * No set timeout by default - When metadata is requested, this parameter is
   * the timeout (in milliseconds) for the website hosting the metadata to
   * respond. If you want to only access the cache and not live fetch any
   * metadata for cache misses then set this value to 0.
   */
  tokenUriTimeoutInMs?: number
}

/**
 * Options object used to get rarity score
 * @public
 */
export interface GetNftsRarityScoreOptions {
  /**
   * {@link GetNftsForContractOptions}to use for pagination.
   */
  pageKey?: string

  /**  Return nfts tokenId in the metadata result */
  showId?: boolean

  /**  Return nfts rank in the metadata result */
  showRank?: boolean
}

/**
 * The response object for the {@link getNftsForContract} function. The object
 * contains the NFTs with metadata inside the NFT contract.
 * @public
 */
export interface NftContractNftsResponse {
  /** An array of NFTs with metadata. */
  nfts: any[]

  /**
   * Pagination token that can be passed into another request to fetch the next
   * NFTs. If there is no page key, then there are no more NFTs to fetch.
   */
  pageKey?: string
}

/**
 * Interface for the `getNftsForNftContract` endpoint. The main difference is
 * that the endpoint has a `startToken` parameter, but the SDK standardizes all
 * pagination parameters to `pageKey`.
 *
 * @internal
 */
export interface GetNftsForContractAlchemyParams {
  contractAddress: string
  startToken?: string
  withMetadata: boolean
  limit?: number
  tokenUriTimeoutInMs?: number
}

/**
 * Represents Alchemy's HTTP response for `getNftsForNftContract` with metadata.
 *
 * @internal
 */
export interface RawGetNftsForContractResponse {
  nfts: any[]
  nextToken?: string
}

/**
 * Metadata properties in Alchemy's HTTP response nfts data
 *
 * @internal
 */
export interface MetadataAttributes {
  /** Alchemy returns metadata {@link value} value type */
  display_type?: string
  /** Trait value of metadata */
  value: string | number
  /** Trait types of metadata */
  trait_type: string
  /** Trait score */
  rarity_score?: number
}

/**
 * Used to temporarily get a list of all feature properties and values
 *
 * @internal
 */
export interface TraitsAndValuesType {
  values: string[]
  traits: string[]
}
