interface MetadataAttributes {
  /** Alchemy returns metadata {@link value} value type */
  display_type?: string;
  /** Trait value of metadata */
  value: string | number;
  /** Trait types of metadata */
  trait_type: string;
  /** Trait score */
  rarity_score?: number;
}

interface TraitsAndValuesType {
  values: string[];
  traits: string[];
}

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
      const { traits, values } = extractTraitsAndValues(meta);
      const numOfTraits = traits.length;
      tally.TraitCount[numOfTraits] ? tally.TraitCount[numOfTraits]++ : tally.TraitCount[numOfTraits] = 1;

      traits.forEach((trait, index) => {
        const traitValue = values[index];
        tally[trait] ? tally[trait].occurences++ : tally[trait] = { occurences: 1 };
        tally[trait][traitValue] ? tally[trait][traitValue]++ : tally[trait][traitValue] = 1;
      });

      return tally;
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
    const { trait_type, value } = currentMeta;
    const rarityScore = 1 / (tally[trait_type][value] / totalMetadata);

    meta[index].rarity_score = Math.round(100 * rarityScore) / 100;
    return totalRarity + rarityScore;
  }, 0);
}