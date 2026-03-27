import {
  AddMarkerEffect,
  AttackEffect,
  CardType,
  ChoosePokemonPrompt,
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  PlayerType,
  PowerEffect,
  PowerType,
  PokemonCard,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
  UseAttackEffect,
} from '@ptcg/common';

const COOLING_JET_MARKER = 'COOLING_JET_MARKER';

export class IronBundle extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17369,
      name: '铁包袱',
      yorenCode: 'P0991',
      cardType: '1',
      commodityCode: 'PROMOGIFT02',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '232/SV-P',
        rarityLabel: '无标记',
        cardTypeLabel: '宝可梦',
        attributeLabel: '水',
        specialCardLabel: '未来',
        hp: 100,
        evolveText: '基础',
        weakness: '雷 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/454/0.png',
      ruleLines: [],
      attacks: [
        {
          id: 1,
          name: '冷却喷射',
          text: '在下一个对手的回合，受到这个招式影响的进化宝可梦，无法使用招式。',
          cost: ['水', '无色', '无色'],
          damage: '80',
        },
      ],
      features: [
        {
          id: 1,
          name: '强力吹风机',
          text: '如果这只宝可梦在备战区的话，则在自己的回合可以使用1次。将对手的战斗宝可梦与备战宝可梦互换（放于战斗场的宝可梦由对手选择）。然后，将这只宝可梦，以及放于其身上的所有卡牌，放于弃牌区。',
        },
      ],
      illustratorNames: ['Oswaldo KATO'],
      deckRuleLimit: null,
    },
    collection: {
      id: 454,
      commodityCode: 'PROMOGIFT02',
      name: '活动奖赏包 第二弹',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/454/0.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.WATER];

  public hp = 100;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance = [];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '强力吹风机',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: '如果这只宝可梦在备战区的话，则在自己的回合可以使用1次。将对手的战斗宝可梦与备战宝可梦互换（放于战斗场的宝可梦由对手选择）。然后，将这只宝可梦，以及放于其身上的所有卡牌，放于弃牌区。',
    },
  ];

  public attacks = [
    {
      name: '冷却喷射',
      cost: [CardType.WATER, CardType.COLORLESS, CardType.COLORLESS],
      damage: '80',
      text: '在下一个对手的回合，受到这个招式影响的进化宝可梦，无法使用招式。',
    },
  ];

  public set = 'set_h';

  public name = '铁包袱';

  public fullName = '铁包袱 PROMOGIFT02';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      if (!player.bench.some(slot => slot.getPokemonCard() === this)) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      const hasBench = opponent.bench.some(b => b.pokemons.cards.length > 0);
      if (!hasBench) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      const benchSlot = player.bench.find(slot => slot.getPokemonCard() === this);

      return store.prompt(
        state,
        new ChoosePokemonPrompt(
          player.id,
          GameMessage.CHOOSE_POKEMON_TO_SWITCH,
          PlayerType.TOP_PLAYER,
          [SlotType.BENCH],
          { allowCancel: false }
        ),
        result => {
          const chosen = result[0];
          opponent.switchPokemon(chosen);
          benchSlot?.moveTo(player.discard);
        }
      );
    }

    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      const addMarkerEffect = new AddMarkerEffect(effect, COOLING_JET_MARKER, this);
      addMarkerEffect.target = effect.opponent.active;
      return store.reduceEffect(state, addMarkerEffect);
    }

    if (effect instanceof UseAttackEffect) {
      const player = effect.player;
      const active = player.active;
      const activeCard = active.getPokemonCard();

      if (activeCard?.stage !== Stage.BASIC && active.marker.hasMarker(COOLING_JET_MARKER, this)) {
        throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
      }
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.active.marker.removeMarker(COOLING_JET_MARKER, this);
      return state;
    }

    return state;
  }
}
