import {
  MetadataAttributes,
  TraitsAndValuesType,
  GetNftsRarityScoreOptions,
} from '../types/types'
import { RarityConfig } from '../internal/rarity-config'
import { getNftsForContract } from '../api/alchemy-api'

/**
 * Extract NFT Trait and Value
 * @internal
 */
export function extractTraitsAndValues(metadata: MetadataAttributes[]) {
  return metadata.reduce(
    (traitsAndValues: TraitsAndValuesType, meta) => {
      return {
        ...traitsAndValues,
        traits: [...traitsAndValues.traits, meta.trait_type] as string[],
        values: [...traitsAndValues.values, meta.value] as string[],
      }
    },
    { traits: [], values: [] },
  )
}

/**
 * Extract NFT Trait and Value
 * @internal
 */
export function generateTally(metadataList: MetadataAttributes[][]) {
  return metadataList.reduce(
    (tally: any, meta) => {
      const { traits, values } = extractTraitsAndValues(meta)
      const numOfTraits = traits.length
      tally.TraitCount[numOfTraits] ? tally.TraitCount[numOfTraits]++ : (tally.TraitCount[numOfTraits] = 1)

      traits.forEach((trait, index) => {
        const traitValue = values[index]
        tally[trait] ? tally[trait].occurences++ : (tally[trait] = { occurences: 1 })
        tally[trait][traitValue] ? tally[trait][traitValue]++ : (tally[trait][traitValue] = 1)
      })

      return tally
    },
    { TraitCount: {} },
  )
}

/**
 * This will calculate the base rarity score
 * and mutate the 'rarityScore' on the passed in meta list reference
 * @internal
 */
export async function calculateTotalRaritybase(meta: MetadataAttributes[], tally: any, totalMetadata: number) {
  return meta.reduce((totalRarity: number, currentMeta: MetadataAttributes, index: number) => {
    const { trait_type, value } = currentMeta
    const rarityScore = 1 / (tally[trait_type][value] / totalMetadata)

    meta[index].rarity_score = Math.round(100 * rarityScore) / 100
    return totalRarity + rarityScore
  }, 0)
}

export async function getNftsAndMetaData(
  config: RarityConfig,
  contractAddress: string,
  options?: GetNftsRarityScoreOptions,
) {
  const allNfts = []
  const metadata = []
  const metadataAttributes = []
  let nextPage = options?.pageKey ? options?.pageKey : ('' as string | undefined)

  while (nextPage || nextPage === '') {
    const nOptions = options
      ? Object.assign(options, { pageKey: nextPage, withMetadata: true })
      : { pageKey: nextPage, withMetadata: true }
    const { nfts, pageKey } = await getNftsForContract(config, contractAddress, nOptions)
    for (const token of nfts) {
      if (token.metadata.attributes) {
        allNfts.push(token)
        metadata.push(token.metadata)
        metadataAttributes.push(token.metadata.attributes)
      }
    }
    nextPage = pageKey
  }

  return [metadata, allNfts, metadataAttributes]
}

export async function generateRarityScore(
  config: RarityConfig,
  contractAddress: string,
  options?: GetNftsRarityScoreOptions,
) {
  const [metadata, allNfts, metadataAttributes] = await getNftsAndMetaData(config, contractAddress, options)
  const totalMetadata = metadataAttributes.length
  const tally = generateTally(metadataAttributes)
  const collectionAttributes = Object.keys(tally)

  const nftArr = []
  for (let i = 0; i < metadataAttributes.length; i++) {
    const currentMeta = [...metadataAttributes[i]]
    let totalRarity = await calculateTotalRaritybase(currentMeta, tally, totalMetadata)

    const rarityScoreNumTraits = 8 * (1 / (tally.TraitCount[Object.keys(currentMeta).length] / totalMetadata))

    currentMeta.push({
      trait_type: 'TraitCount',
      value: Object.keys(currentMeta).length,
      rarityScore: Math.round(100 * rarityScoreNumTraits) / 100,
    })

    totalRarity += rarityScoreNumTraits

    if (currentMeta.length < collectionAttributes.length) {
      const attributes = currentMeta.map((e) => e.trait_type)
      const absent = collectionAttributes.filter((e) => !attributes.includes(e))

      absent.forEach((type) => {
        const rarityScoreNull = 1 / ((totalMetadata - tally[type].occurences) / totalMetadata)

        currentMeta.push({
          value: null,
          trait_type: type,
          rarityScore: Math.round(100 * rarityScoreNull) / 100,
        })

        totalRarity += rarityScoreNull
      })
    }

    const currentNft = allNfts[i]
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
    } as { name: string, image: string, tokenId?: string,  attributes: any, rarityScore: number };

    if (options?.showId) {
      nft.tokenId = currentNft.id.tokenId
    }

    nftArr.push({...nft})
  }

  if (options?.showRank) {
    const rankMap = {} as { [key: string]: number }
    nftArr
      .slice()
      .sort((a, b) => b.rarityScore - a.rarityScore)
      .map((nft, index) => {
        rankMap[nft.name] = index + 1
      })
    nftArr.map((item) => Object.assign(item, { rank: rankMap[item.name] }))
  }

  return nftArr
}
