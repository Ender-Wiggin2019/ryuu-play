import {
  AttackEffect,
  CardTag,
  CardTarget,
  CardType,
  ChoosePokemonPrompt,
  DealDamageEffect,
  Effect,
  GameMessage,
  PlayerType,
  PokemonCard,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

import { commonMarkers } from '../../common';

export class XiCuiNianMeiLongV extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 10204,
      name: '洗翠 黏美龙V',
      yorenCode: 'Y1072',
      cardType: '1',
      commodityCode: 'CS5.5C',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '052/066',
        rarityLabel: 'RR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '龙',
        pokemonTypeLabel: '宝可梦V',
        specialCardLabel: null,
        hp: 220,
        evolveText: '基础',
        weakness: null,
        resistance: null,
        retreatCost: 3,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/202/94.png',
      ruleLines: ['当宝可梦V【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 2903,
          name: '滑溜打滚',
          text: '将对手的战斗宝可梦与备战宝可梦互换。[放于战斗场的宝可梦由对手选择。]',
          cost: ['水', '钢'],
          damage: '60',
        },
        {
          id: 2904,
          name: '贝壳滚动',
          text: '在下一个对手的回合，这只宝可梦所受到的招式的伤害「-30」。',
          cost: ['水', '钢', '无色'],
          damage: '140',
        },
      ],
      features: [],
      illustratorNames: ['5ban Graphics'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 202,
      commodityCode: 'CS5.5C',
      name: '强化包 暗影夺辉',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/202/94.png',
  };

  public tags = [CardTag.POKEMON_V];
  public stage: Stage = Stage.BASIC;
  public cardTypes: CardType[] = [CardType.DRAGON];
  public hp: number = 220;
  public weakness = [];
  public resistance = [];
  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '滑溜打滚',
      cost: [CardType.WATER, CardType.METAL],
      damage: '60',
      text: '将对手的战斗宝可梦与备战宝可梦互换。[放于战斗场的宝可梦由对手选择。]',
    },
    {
      name: '贝壳滚动',
      cost: [CardType.WATER, CardType.METAL, CardType.COLORLESS],
      damage: '140',
      text: '在下一个对手的回合，这只宝可梦所受到的招式的伤害「-30」。',
    },
  ];

  public set: string = 'set_f';
  public name: string = '洗翠 黏美龙V';
  public fullName: string = '洗翠 黏美龙V CS5.5C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    const opponentNextTurn = commonMarkers.duringOpponentNextTurn(this, store, state, effect);

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage = 60;
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
      const blocked = opponent.bench
        .map((slot, index) => (slot.pokemons.cards.length === 0
          ? { player: PlayerType.TOP_PLAYER, slot: SlotType.BENCH, index }
          : null))
        .filter((value): value is CardTarget => value !== null);

      if (blocked.length === opponent.bench.length) {
        return state;
      }

      return store.prompt(
        state,
        new ChoosePokemonPrompt(
          player.id,
          GameMessage.CHOOSE_NEW_ACTIVE_POKEMON,
          PlayerType.TOP_PLAYER,
          [SlotType.BENCH],
          { allowCancel: false, blocked }
        ),
        selected => {
          const targets = selected || [];
          if (targets.length > 0) {
            opponent.switchPokemon(targets[0]);
          }
        }
      );
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      opponentNextTurn.setMarker(effect, effect.player.active);
      return state;
    }

    if (effect instanceof DealDamageEffect) {
      const pokemonSlot = StateUtils.findPokemonSlot(state, this);
      if (pokemonSlot === undefined || effect.target !== pokemonSlot || !opponentNextTurn.hasMarker(effect, pokemonSlot)) {
        return state;
      }

      effect.damage = Math.max(0, effect.damage - 30);
      return state;
    }

    return state;
  }
}
