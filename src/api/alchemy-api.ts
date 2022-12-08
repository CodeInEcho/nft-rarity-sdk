import {
  NftContractNftsResponse,
  GetNftsForContractOptions,
  RawGetNftsForContractResponse,
  GetNftsForContractAlchemyParams,
} from '../types/types'

import { getAlchemyHttpUrl } from '../util/const'
import { sendAxiosRequest } from '../util/sendRest'
import { RarityConfig } from '../internal/rarity-config'

/**
 * Flips the `omitMetadata` SDK parameter type to the `withMetadata` parameter
 * required by the Alchemy API. If `omitMetadata` is undefined, the SDK defaults
 * to including metadata.
 * @internal
 */
function omitMetadataToWithMetadata(withMetadata: boolean | undefined): boolean {
  return withMetadata === undefined ? true : withMetadata
}

export async function getNftsForContract(
  config: RarityConfig,
  contractAddress: string,
  options?: GetNftsForContractOptions,
  srcMethod = 'getNFTsForCollection',
): Promise<NftContractNftsResponse> {
  const withMetadata = omitMetadataToWithMetadata(options?.withMetadata)
  const baseUrl = getAlchemyHttpUrl(config.network, config.alchemyApiKey)
  const requestUrl = baseUrl + '/' + srcMethod
  const response = await sendAxiosRequest<GetNftsForContractAlchemyParams, RawGetNftsForContractResponse>(requestUrl, {
    contractAddress,
    startToken: options?.pageKey,
    withMetadata,
    limit: options?.pageSize ?? undefined,
    tokenUriTimeoutInMs: 50,
  })

  if (response.status === 200) {
    return {
      nfts: response.data.nfts,
      pageKey: response.data.nextToken,
    }
  } else {
    const error = new Error(response.status + ': ' + response.data)
    return Promise.reject(error)
  }
}
