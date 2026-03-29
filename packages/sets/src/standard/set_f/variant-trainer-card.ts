import { CardTag, TrainerCard, TrainerType } from '@ptcg/common';

export type VariantRawData = {
  raw_card: Record<string, unknown>;
  collection?: Record<string, unknown>;
  image_url: string;
  logic_group_key?: string;
  variant_group_key?: string;
  variant_group_size?: number;
};

export type VariantTrainerSeed = {
  set: string;
  name: string;
  fullName: string;
  text: string;
  trainerType: TrainerType;
  rawData: VariantRawData;
  canUseOnFirstTurn?: boolean;
  tags?: CardTag[];
};

export abstract class VariantTrainerCard extends TrainerCard {
  public trainerType: TrainerType;
  public set: string;
  public name: string;
  public fullName: string;
  public text: string;
  public canUseOnFirstTurn?: boolean;
  public rawData: VariantRawData;

  constructor(seed: VariantTrainerSeed) {
    super();
    this.tags = seed.tags || [];
    this.trainerType = seed.trainerType;
    this.set = seed.set;
    this.name = seed.name;
    this.fullName = seed.fullName;
    this.text = seed.text;
    this.canUseOnFirstTurn = seed.canUseOnFirstTurn;
    this.rawData = {
      ...seed.rawData,
      logic_group_key: seed.rawData.logic_group_key || `trainer:${seed.trainerType}:${this.constructor.name}`
    };
  }
}
