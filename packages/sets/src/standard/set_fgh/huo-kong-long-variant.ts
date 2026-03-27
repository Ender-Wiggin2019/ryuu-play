import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';
export type HuoKongLongVariantRawData = {
  raw_card: {
    id: number;
    name: string;
    yorenCode: string;
    cardType: string;
    commodityCode: string;
    details: {
      regulationMarkText: string;
      collectionNumber: string;
      rarityLabel: string;
      cardTypeLabel: string;
      attributeLabel: string;
      trainerTypeLabel: string | null;
      energyTypeLabel: string | null;
      pokemonTypeLabel: string | null;
      specialCardLabel: string | null;
      hp: number;
      evolveText: string;
      weakness: string;
      resistance: string | null;
      retreatCost: number;
    };
    image: string;
    ruleLines: string[];
    attacks: Array<{
      id: number;
      name: string;
      text: string;
      cost: string[];
      damage: string;
    }>;
    features: Array<{
      id: number;
      name: string;
      text: string;
    }>;
    illustratorNames: string[];
    pokemonCategory: string;
    pokedexCode: string;
    pokedexText: string;
    height: number;
    weight: number;
    deckRuleLimit: number | null;
  };
  collection: {
    id: number;
    commodityCode: string;
    name: string;
  };
  image_url: string;
  logic_group_key: string;
  variant_group_key: string;
  variant_group_size: number;
};

export type HuoKongLongVariantSeed = {
  id: number;
  commodityCode: string;
  collectionId: number;
  collectionName: string;
  collectionNumber: string;
  rarityLabel: string;
};

type HuoKongLongVariantCapable = {
  name: string;
  fullName: string;
  rawData: HuoKongLongVariantRawData;
};

export function seedHuoKongLongVariant<T extends HuoKongLongVariantCapable>(
  instance: T,
  seed: HuoKongLongVariantSeed,
  keys: {
    logicGroupKey: string;
    variantGroupKey: string;
    variantGroupSize: number;
  }
): T {
  instance.rawData = {
    ...instance.rawData,
    raw_card: {
      ...instance.rawData.raw_card,
      id: seed.id,
      commodityCode: seed.commodityCode,
      image: getCardImageUrl(seed.id),
      details: {
        ...instance.rawData.raw_card.details,
        collectionNumber: seed.collectionNumber,
        rarityLabel: seed.rarityLabel,
      },
    },
    collection: {
      id: seed.collectionId,
      commodityCode: seed.commodityCode,
      name: seed.collectionName,
    },
    image_url: getR2CardImageUrl(seed.id),
    logic_group_key: keys.logicGroupKey,
    variant_group_key: keys.variantGroupKey,
    variant_group_size: keys.variantGroupSize,
  };

  instance.fullName = `${instance.name} ${seed.commodityCode} ${seed.collectionNumber}#${seed.id}`;
  return instance;
}

export function seedHuoKongLongVariants<T extends HuoKongLongVariantCapable>(
  factory: () => T,
  seeds: HuoKongLongVariantSeed[],
  keys: {
    logicGroupKey: string;
    variantGroupKey: string;
    variantGroupSize: number;
  }
): T[] {
  return seeds.map(seed => seedHuoKongLongVariant(factory(), seed, keys));
}
