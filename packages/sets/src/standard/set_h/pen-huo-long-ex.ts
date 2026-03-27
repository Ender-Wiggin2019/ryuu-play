import {
  AttachEnergyPrompt,
  AttackEffect,
  CardTag,
  CardTarget,
  CardType,
  Effect,
  EnergyCard,
  EnergyType,
  GameMessage,
  PlayPokemonEffect,
  PlayerType,
  PokemonCard,
  PowerEffect,
  PowerType,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
} from '@ptcg/common';

export class PenHuoLongEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 14732,
      name: '喷火龙ex',
      yorenCode: 'Y1181',
      cardType: '1',
      commodityCode: 'CSV5C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '075/129',
        rarityLabel: 'RR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '恶',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: '宝可梦ex',
        specialCardLabel: '太晶',
        hp: 330,
        evolveText: '2阶进化',
        weakness: '草 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/298/202.png',
      ruleLines: ['当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 3557,
          name: '燃烧黑暗',
          text: '追加造成对手已经获得的奖赏卡张数×30伤害。',
          cost: ['火', '火'],
          damage: '180+',
        },
      ],
      features: [
        {
          id: 491,
          name: '烈炎支配',
          text:
            '在自己的回合，当将这张卡牌从手牌使出并进行进化时，可使用1次。选择自己牌库中最多3张「基本【火】能量」，以任意方式附着于自己的宝可梦身上。并重洗牌库。',
        },
      ],
      illustratorNames: ['5ban Graphics'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 298,
      commodityCode: 'CSV5C',
      name: '补充包 黑晶炽诚',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/298/202.png',
  };

  public tags = [CardTag.POKEMON_EX, CardTag.TERA];

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom = '火恐龙';

  public cardTypes: CardType[] = [CardType.DARK];

  public hp: number = 330;

  public weakness = [{ type: CardType.GRASS }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers = [
    {
      name: '烈炎支配',
      powerType: PowerType.ABILITY,
      text:
        '在自己的回合，当将这张卡牌从手牌使出并进行进化时，可使用1次。选择自己牌库中最多3张「基本【火】能量」，以任意方式附着于自己的宝可梦身上。并重洗牌库。',
    },
  ];

  public attacks = [
    {
      name: '燃烧黑暗',
      cost: [CardType.FIRE, CardType.FIRE],
      damage: '180+',
      text: '追加造成对手已经获得的奖赏卡张数×30伤害。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '喷火龙ex';

  public fullName: string = '喷火龙ex CSV5C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PlayPokemonEffect && effect.pokemonCard === this) {
      const player = effect.player;
      const hasTarget = player.active.pokemons.cards.length > 0 || player.bench.some(slot => slot.pokemons.cards.length > 0);
      const fireEnergyCount = player.deck.cards.filter(card => {
        return card instanceof EnergyCard
          && card.energyType === EnergyType.BASIC
          && card.provides.includes(CardType.FIRE);
      }).length;

      if (!hasTarget || fireEnergyCount === 0) {
        player.deck.moveToBottom(player.deck);
        return state;
      }

      const blockedTo: CardTarget[] = [];
      if (player.active.pokemons.cards.length === 0) {
        blockedTo.push({ player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 });
      }
      player.bench.forEach((bench, index) => {
        if (bench.pokemons.cards.length === 0) {
          blockedTo.push({ player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index });
        }
      });

      try {
        const powerEffect = new PowerEffect(player, this.powers[0], this);
        store.reduceEffect(state, powerEffect);
      } catch {
        return state;
      }

      return store.prompt(
        state,
        new AttachEnergyPrompt(
          player.id,
          GameMessage.ATTACH_ENERGY_TO_ACTIVE,
          player.deck,
          PlayerType.BOTTOM_PLAYER,
          [SlotType.ACTIVE, SlotType.BENCH],
          { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.FIRE] },
          { allowCancel: true, min: 0, max: 3, blockedTo }
        ),
        result => {
          const transfers = (result || []) as { to: CardTarget; card: EnergyCard }[];
          for (const transfer of transfers) {
            const target = StateUtils.getTarget(state, player, transfer.to);
            player.deck.moveCardTo(transfer.card, target.energies);
          }
          player.deck.moveToBottom(player.deck);
        }
      );
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage += (6 - effect.opponent.getPrizeLeft()) * 30;
      return state;
    }

    return state;
  }
}
