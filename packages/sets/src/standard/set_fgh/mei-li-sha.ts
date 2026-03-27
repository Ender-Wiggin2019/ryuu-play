import {
  CardTag,
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  PutDamageEffect,
  State,
  StateUtils,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

const defaultSeed: VariantTrainerSeed = {
  set: 'set_f',
  name: '梅丽莎',
  fullName: '梅丽莎 168/131#10471',
  text: '这张卡牌，只有在自己放逐区有10张以上（包含10张）卡牌时才可使用。\n在下一个对手的回合，自己的所有宝可梦，受到对手「宝可梦V」的招式的伤害「-120」。（也包括新出场的宝可梦。）\n在自己的回合只可以使用1张支援者卡。',
  trainerType: TrainerType.SUPPORTER,
  rawData: {
    raw_card: {
      id: 10471,
      name: '梅丽莎',
      cardType: '2',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '168/131',
        rarityLabel: 'HR',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '支援者',
        attributeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: null,
        evolveText: null,
        weakness: null,
        resistance: null,
        retreatCost: null,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/206/277.png',
      ruleLines: [
        '这张卡牌，只有在自己放逐区有10张以上（包含10张）卡牌时才可使用。',
        '在下一个对手的回合，自己的所有宝可梦，受到对手「宝可梦V」的招式的伤害「-120」。（也包括新出场的宝可梦。）',
        '在自己的回合只可以使用1张支援者卡。',
      ],
      attacks: [],
      features: [],
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/206/277.png',
  },
};

function isOpponentVsAttack(state: State, owner: any, effect: PutDamageEffect): boolean {
  const opponent = StateUtils.getOpponent(state, owner);
  if (effect.player !== opponent) {
    return false;
  }
  const source = effect.source.getPokemonCard();
  return source !== undefined && source.tags.includes(CardTag.POKEMON_V);
}

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  self: MeiLiSha,
  effect: TrainerEffect
): IterableIterator<State> {
  const player = effect.player;

  if (player.lostzone.cards.length < 10) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  player.marker.addMarker(self.MEI_LI_SHA_MARKER, self);
  return state;
}

export class MeiLiSha extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public readonly MEI_LI_SHA_MARKER = 'MEI_LI_SHA_MARKER';

  constructor(seed: VariantTrainerSeed = defaultSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    if (effect instanceof PutDamageEffect) {
      const owner = StateUtils.findOwner(state, effect.target);
      if (owner === undefined || !owner.marker.hasMarker(this.MEI_LI_SHA_MARKER, this)) {
        return state;
      }

      if (isOpponentVsAttack(state, owner, effect)) {
        effect.damage = Math.max(0, effect.damage - 120);
      }
    }

    if (effect instanceof EndTurnEffect) {
      const cardList = StateUtils.findCardList(state, this);
      const owner = StateUtils.findOwner(state, cardList);
      if (owner !== undefined && effect.player === StateUtils.getOpponent(state, owner)) {
        owner.marker.removeMarker(this.MEI_LI_SHA_MARKER, this);
      }
    }

    return state;
  }
}
