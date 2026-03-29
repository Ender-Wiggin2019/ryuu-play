import {
  AttackEffect,
  CardTag,
  CardType,
  ChoosePokemonPrompt,
  Effect,
  GameError,
  GameMessage,
  PlayerType,
  PokemonCard,
  RetreatEffect,
  SlotType,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

export class IronValiantEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 15740,
      name: '铁武者ex',
      yorenCode: 'P1006',
      cardType: '1',
      commodityCode: 'CSV6C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '153/128',
        rarityLabel: 'SAR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '超',
        pokemonTypeLabel: '宝可梦ex',
        specialCardLabel: '未来',
        hp: 220,
        evolveText: '基础',
        weakness: '钢 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/311/382.png',
      ruleLines: ['当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 364,
          name: '镭射利刃',
          text: '在下一个自己的回合，这只宝可梦无法使用招式。',
          cost: ['超', '超', '无色'],
          damage: '200',
        },
      ],
      features: [
        {
          id: 52,
          name: '迅子打击',
          text: '在自己的回合，当这只宝可梦从备战区被放入战斗场时，可使用1次。给对手的1只宝可梦身上，放置2个伤害指示物。',
        },
      ],
    },
    collection: {
      id: 311,
      commodityCode: 'CSV6C',
      name: '补充包 真实玄虚',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/311/382.png',
  };

  public tags = [CardTag.POKEMON_EX];

  public stage = Stage.BASIC;

  public cardTypes = [CardType.PSYCHIC];

  public hp = 220;

  public weakness = [{ type: CardType.METAL }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '镭射利刃',
      cost: [CardType.PSYCHIC, CardType.PSYCHIC, CardType.COLORLESS],
      damage: '200',
      text: '在下一个自己的回合，这只宝可梦无法使用招式。',
    },
  ];

  public set = 'set_g';

  public name = '铁武者ex';

  public fullName = '铁武者ex 153/128#15740';

  public lockedAttackTurn = -1;

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof RetreatEffect) {
      const player = effect.player;
      const targetSlot = player.bench[effect.benchIndex];
      if (targetSlot?.getPokemonCard() !== this) {
        return state;
      }

      const opponentType = state.players[0] === player ? PlayerType.TOP_PLAYER : PlayerType.BOTTOM_PLAYER;

      return store.prompt(
        state,
        new ChoosePokemonPrompt(
          player.id,
          GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
          opponentType,
          [SlotType.ACTIVE, SlotType.BENCH],
          { min: 1, max: 1, allowCancel: false }
        ),
        targets => {
          const target = (targets || [])[0];
          if (target === undefined) {
            return;
          }
          target.damage += 20;
        }
      );
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      if (this.lockedAttackTurn === state.turn) {
        throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
      }
      this.lockedAttackTurn = state.turn + 1;
      return state;
    }

    return state;
  }
}
