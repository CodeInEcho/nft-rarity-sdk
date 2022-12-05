import {
  NftContractNftsResponse,
  GetNftsForContractOptions,
  GetNftsRarityScoreOptions,
  RawGetNftsForContractResponse,
  GetNftsForContractAlchemyParams
} from '../types/types';
import { getAlchemyHttpUrl } from '../util/const';
import { sendAxiosRequest } from '../util/sendRest';
import { RarityConfig } from '../internal/rarity-config';
import {
  generateTally,
  calculateTotalRaritybase
} from '../internal/ratity-summation';

/**
 * Flips the `omitMetadata` SDK parameter type to the `withMetadata` parameter
 * required by the Alchemy API. If `omitMetadata` is undefined, the SDK defaults
 * to including metadata.
 * @internal
 */
function omitMetadataToWithMetadata(
  withMetadata: boolean | undefined
): boolean {
  return withMetadata === undefined ? true : withMetadata;
}

export async function getNftsForContract(
  config: RarityConfig,
  contractAddress: string,
  options?: GetNftsForContractOptions,
  srcMethod = 'getNFTsForCollection'
): Promise<NftContractNftsResponse> {
  const withMetadata = omitMetadataToWithMetadata(options?.withMetadata);
  const baseUrl = getAlchemyHttpUrl(config.network, config.alchemyApiKey);
  const requestUrl = baseUrl + '/' + srcMethod;
  const response = await sendAxiosRequest<GetNftsForContractAlchemyParams, RawGetNftsForContractResponse>(requestUrl, {
    contractAddress,
    startToken: options?.pageKey,
    withMetadata,
    limit: options?.pageSize ?? undefined,
    tokenUriTimeoutInMs: 50
  });

  if (response.status === 200) {
    return {
      nfts: response.data.nfts,
      pageKey: response.data.nextToken
    };
  } else {
    const error = new Error(response.status + ': ' + response.data);
    return Promise.reject(error);
  }
}

export async function getNftsAndMetaData(
  config: RarityConfig,
  contractAddress: string,
  options?: GetNftsRarityScoreOptions,
) {
  const allNfts = [];
  const metadata = [];
  const metadataAttributes = [];
  let nextPage = options?.pageKey ? options?.pageKey : '' as string | undefined;

  while (nextPage || nextPage === '') {
    const nOptions = options ? Object.assign(options, { pageKey: nextPage, withMetadata: true }) : { pageKey: nextPage, withMetadata: true };
    const { nfts, pageKey } = await getNftsForContract(config, contractAddress, nOptions);
    for (const token of nfts) {
      if (token.metadata.attributes) {
        allNfts.push(token);
        metadata.push(token.metadata);
        metadataAttributes.push(token.metadata.attributes);
      }
    }
    nextPage = pageKey;
  }

  return [metadata, allNfts, metadataAttributes];
};

export async function generateRarityScore(
  config: RarityConfig,
  contractAddress: string,
  options?: GetNftsRarityScoreOptions,
) {
  const [metadata, allNfts, metadataAttributes] = await getNftsAndMetaData(config, contractAddress, options);
  const totalMetadata = metadataAttributes.length;
  const tally = generateTally(metadataAttributes);
  const collectionAttributes = Object.keys(tally);

  const nftArr = [];
  for (let i = 0; i < metadataAttributes.length; i++) {
    const currentMeta = [...metadataAttributes[i]];
    let totalRarity = await calculateTotalRaritybase(currentMeta, tally, totalMetadata);

    const rarityScoreNumTraits = 8 * (1 / (tally.TraitCount[Object.keys(currentMeta).length] / totalMetadata));

    currentMeta.push({
      trait_type: 'TraitCount',
      value: Object.keys(currentMeta).length,
      rarityScore: Math.round(100 * rarityScoreNumTraits) / 100
    });

    totalRarity += rarityScoreNumTraits;

    if (currentMeta.length < collectionAttributes.length) {
      const attributes = currentMeta.map((e) => e.trait_type);
      const absent = collectionAttributes.filter((e) => !attributes.includes(e));

      absent.forEach((type) => {
        const rarityScoreNull = 1 / ((totalMetadata - tally[type].occurences) / totalMetadata);

        currentMeta.push({
          value: null,
          trait_type: type,
          rarityScore: Math.round(100 * rarityScoreNull) / 100
        });

        totalRarity += rarityScoreNull;
      });
    }

    const currentNft = allNfts[i];
    // if (currentNft?.metadata) {
    //   currentNft.image = resolveLink(currentNft.metadata?.image);
    // } else if (currentNft.token_uri) {
    //   allNfts[i].image = await getNftImage(currentNft.token_uri);
    // }

    const nft = {
      name: currentNft.metadata.name,
      image: currentNft.metadata.image,
      attributes: currentMeta,
      rarityScore: Math.round(100 * totalRarity) / 100,
    };

    nftArr.push(nft);
  }
  return nftArr;
}