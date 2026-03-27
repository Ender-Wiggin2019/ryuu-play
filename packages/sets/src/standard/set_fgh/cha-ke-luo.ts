import {
  DealDamageEffect,
  Effect,
  EndTurnEffect,
  CardType,
  State,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

const CHAKELUO_MARKER = 'CHAKELUO_MARKER';

export class ChaKeLuo extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.fullName = seed.fullName;
  }

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public set: string = 'set_fgh';

  public name: string = '查克洛';

  public fullName: string = '查克洛 178/207';

  public text: string = '本回合你的斗属性宝可梦的招式对对手战斗宝可梦造成的伤害+30。';

  public rawData = {
    raw_card: {
      id: 14219,
      name: '查克洛',
      yorenCode: 'Y1081',
      cardType: '2',
      commodityCode: 'CSVE2C2',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '178/207',
        rarityLabel: '无标记',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '支援者',
        hp: null,
        evolveText: null,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/308/182.png',
      ruleLines: [
        '在这个回合，自己的【斗】宝可梦所使用的招式，给对手战斗宝可梦造成的伤害「+30」。',
        '在自己的回合，如果将2张自己的手牌（除「查克洛」外）放于弃牌区的话，则将这张「查克洛」从弃牌区，在给对手看过之后，加入手牌。（这个效果，不包含在自己的回合可以使用的支援者的张数内。）',
        '在自己的回合只可以使用1张支援者卡。',
      ],
      attacks: [],
      features: [],
      illustratorNames: ['Hideki Ishikawa'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 308,
      commodityCode: 'CSVE2C2',
      name: '对战派对 耀梦 下',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/308/182.png',
  };

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      effect.player.marker.addMarker(CHAKELUO_MARKER, this);
    }

    if (effect instanceof DealDamageEffect && effect.player.marker.hasMarker(CHAKELUO_MARKER, this)) {
      const activePokemon = effect.player.active.getPokemonCard();
      if (activePokemon !== undefined && activePokemon.cardTypes.includes(CardType.FIGHTING) && effect.damage > 0) {
        effect.damage += 30;
      }
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(CHAKELUO_MARKER, this);
    }

    return state;
  }
}
