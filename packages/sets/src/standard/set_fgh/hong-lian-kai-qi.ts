import {
  AttackEffect,
  CardType,
  ChoosePokemonPrompt,
  Effect,
  EnergyCard,
  GameMessage,
  PlayerType,
  PokemonCard,
  PutDamageEffect,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

export class HongLianKaiQi extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17854,
      name: '红莲铠骑',
      yorenCode: 'P0936',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '040/207',
        rarityLabel: 'U★★',
        cardTypeLabel: '宝可梦',
        attributeLabel: '火',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 140,
        evolveText: '1阶进化',
        weakness: '水 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/113.png',
      ruleLines: [],
      attacks: [
        {
          id: 604,
          name: '烈焰',
          text: '',
          cost: ['无色', '无色'],
          damage: '50',
        },
        {
          id: 605,
          name: '红莲引爆',
          text: '将这只宝可梦身上附着的【火】能量全部放于弃牌区，给对手的1只备战宝可梦，造成180伤害。[备战宝可梦不计算弱点、抗性。]',
          cost: ['火', '火', '无色'],
          damage: null,
        },
      ],
      features: [],
      illustratorNames: ['DOM'],
      pokemonCategory: '火战士宝可梦',
      pokedexCode: '0936',
      pokedexText: '身上包裹着通过超能力和火焰的能量而得到强化的铠甲。会释放灼热的火球。',
      height: 1.5,
      weight: 85,
      deckRuleLimit: null,
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/113.png',
  };

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '炭小侍';

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 140;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '烈焰',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: '50',
      text: '',
    },
    {
      name: '红莲引爆',
      cost: [CardType.FIRE, CardType.FIRE, CardType.COLORLESS],
      damage: '',
      text: '将这只宝可梦身上附着的【火】能量全部放于弃牌区，给对手的1只备战宝可梦，造成180伤害。[备战宝可梦不计算弱点、抗性。]',
    },
  ];

  public set: string = 'set_h';

  public name: string = '红莲铠骑';

  public fullName: string = '红莲铠骑 040/207#17854';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage = 50;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const benchTargets = effect.opponent.bench
        .map((slot, index) => (slot.pokemons.cards.length > 0 ? { player: PlayerType.TOP_PLAYER, slot: SlotType.BENCH, index } : null))
        .filter((target): target is { player: PlayerType; slot: SlotType; index: number } => target !== null);

      if (benchTargets.length === 0) {
        return state;
      }

      const fireEnergies = player.active.energies.cards.filter(
        card => card instanceof EnergyCard && card.provides.includes(CardType.FIRE)
      );

      return store.prompt(
        state,
        new ChoosePokemonPrompt(
          player.id,
          GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
          PlayerType.TOP_PLAYER,
          [SlotType.BENCH],
          { allowCancel: false }
        ),
        targets => {
          const target = (targets || [])[0];
          if (target === undefined) {
            return;
          }

          const damageEffect = new PutDamageEffect(effect, 180);
          damageEffect.target = target;
          store.reduceEffect(state, damageEffect);

          if (fireEnergies.length > 0) {
            player.active.energies.moveCardsTo(fireEnergies, player.discard);
          }
        }
      );
    }

    return state;
  }
}
