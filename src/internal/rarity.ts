import {RaritySettings} from '../types/types';
import {RarityConfig} from './rarity-config';
import {
  generateRarityScore,
  getNftsForContract,
} from '../api/alchemy-api';
import {
  NftContractNftsResponse,
  GetNftsForContractOptions,
  GetNftsRarityScoreOptions,
} from '../types/types';

/**
 * @public
 */
export class Rarity {
  /**
   * Holds the setting information for the instance of the Alchemy SDK client
   * and allows access to the underlying providers.
   */
  readonly config: RarityConfig;

  constructor(settings?: RaritySettings) {
    this.config = new RarityConfig(settings);
  }

  /**
   * Based on alchemy sdk modification.
   * Get all base NFTs for a given contract address.
   *
   * This method returns the base NFTs that omit the associated metadata. To get
   * all NFTs with their associated metadata, use {@link GetNftsForContractOptions}.
   *
   * @param contractAddress - The contract address of the NFT contract.
   * @param options - The optional parameters to use for the request.
   * @beta
   */
  async getNftsForContract(
    contractAddress: string,
    options?: GetNftsForContractOptions
  ): Promise<NftContractNftsResponse>;
  getNftsForContract(
    contractAddress: string,
    options?: GetNftsForContractOptions
  ): Promise<NftContractNftsResponse> {
    return getNftsForContract(this.config, contractAddress, options);
  }

  /**
   *
   * @param contractAddress - The contract address of the NFT contract.
   * @param options - The optional parameters to use for the request.
   * @beta
   */
  async getNftsRarityScore(
    contractAddress: string,
    options?: GetNftsForContractOptions
  ): Promise<any>;
  async getNftsRarityScore(
    contractAddress: string,
    options?: GetNftsRarityScoreOptions
  ): Promise<any> {
    return await generateRarityScore(this.config, contractAddress, options);
  }
}
