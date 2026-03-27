import {
  Attack,
  AttackEffect,
  CardTag,
  CardType,
  ChooseAttackPrompt,
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  PokemonCard,
  PowerEffect,
  PowerType,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

const RESTART_MARKER = 'MEW_EX_RESTART_MARKER';

export class MewEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 11514,
      name: '梦幻ex',
      yorenCode: 'Y1191',
      cardType: '1',
      commodityCode: '151C4',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '151/151',
        rarityLabel: 'RR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '超',
        pokemonTypeLabel: '宝可梦ex',
        hp: 180,
        evolveText: '基础',
        weakness: '恶 ×2',
        resistance: '斗 -30',
        retreatCost: 0,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/280/428.png',
      ruleLines: [
        '当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。',
      ],
      attacks: [
        {
          id: 1,
          name: '基因侵入',
          text: '选择对手战斗宝可梦所拥有的1个招式，作为这个招式使用。',
          cost: ['无色', '无色', '无色'],
          damage: 'none',
        },
      ],
      features: [
        {
          id: 1,
          name: '再起动',
          text: '在自己的回合可以使用1次。从牌库上方抽取卡牌，直到自己的手牌变为3张为止。',
        },
      ],
      deckRuleLimit: null,
    },
    collection: {
      id: 280,
      commodityCode: '151C4',
      name: '收集啦151 聚',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/280/428.png',
  };

  public tags = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp = 180;

  public weakness = [{ type: CardType.DARK }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat: CardType[] = [];

  public powers = [
    {
      name: '再起动',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: '在自己的回合可以使用1次。从牌库上方抽取卡牌，直到自己的手牌变为3张为止。',
    },
  ];

  public attacks = [
    {
      name: '基因侵入',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: '',
      text: '选择对手战斗宝可梦所拥有的1个招式，作为这个招式使用。',
    },
  ];

  public set = 'set_f';

  public name = '梦幻ex';

  public fullName = '梦幻ex 151C4';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      if (player.marker.hasMarker(RESTART_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      if (player.hand.cards.length >= 3 || player.deck.cards.length === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      player.marker.addMarker(RESTART_MARKER, this);
      player.deck.moveTo(player.hand, Math.min(3 - player.hand.cards.length, player.deck.cards.length));
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const opponentActive = StateUtils.getOpponent(state, effect.player).active.getPokemonCard();

      if (opponentActive === undefined || opponentActive.attacks.length === 0) {
        throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
      }

      const applyChosenAttack = (attack: Attack) => {
        const copiedAttack = { ...attack };
        effect.attack = copiedAttack;
        const value = copiedAttack.damage.replace(/\D/g, '');
        effect.damage = value !== '' ? parseInt(value, 10) : 0;
      };

      if (opponentActive.attacks.length === 1) {
        applyChosenAttack(opponentActive.attacks[0]);
        return state;
      }

      return store.prompt(
        state,
        new ChooseAttackPrompt(effect.player.id, GameMessage.CHOOSE_ATTACK_TO_COPY, [opponentActive], {
          allowCancel: false,
          blocked: [],
        }),
        result => {
          applyChosenAttack(result as Attack);
        }
      );
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(RESTART_MARKER, this);
      return state;
    }

    return state;
  }
}
