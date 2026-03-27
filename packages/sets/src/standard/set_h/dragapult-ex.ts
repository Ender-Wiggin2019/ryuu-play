import {
  AttackEffect,
  CardTag,
  CardType,
  CheckHpEffect,
  DamageMap,
  Effect,
  GameMessage,
  PlayerType,
  PokemonCard,
  PutCountersEffect,
  PutDamagePrompt,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

function* usePhantomDive(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AttackEffect
): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  const maxAllowedDamage: DamageMap[] = [];
  let damageLeft = 0;

  opponent.forEachPokemon(PlayerType.TOP_PLAYER, (pokemonSlot, _card, target) => {
    if (target.slot !== SlotType.BENCH) {
      return;
    }

    const checkHpEffect = new CheckHpEffect(opponent, pokemonSlot);
    store.reduceEffect(state, checkHpEffect);
    const availableDamage = checkHpEffect.hp - pokemonSlot.damage;
    damageLeft += availableDamage;
    maxAllowedDamage.push({ target, damage: checkHpEffect.hp });
  });

  if (maxAllowedDamage.length === 0 || damageLeft <= 0) {
    return state;
  }

  const damage = Math.min(60, damageLeft);

  return store.prompt(
    state,
    new PutDamagePrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
      PlayerType.TOP_PLAYER,
      [SlotType.BENCH],
      damage,
      maxAllowedDamage,
      { allowCancel: false }
    ),
    targets => {
      const results = targets || [];
      for (const result of results) {
        const target = StateUtils.getTarget(state, player, result.target);
        const putCountersEffect = new PutCountersEffect(effect, result.damage);
        putCountersEffect.target = target;
        store.reduceEffect(state, putCountersEffect);
      }
      next();
    }
  );
}

export class DragapultEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17536,
      name: '多龙巴鲁托ex',
      yorenCode: 'Y1459',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '159/207',
      },
      image: 'img/458/436.png',
      hash: '2796649d9dc3e4b64d6b4fec7e8975f5',
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
      salesDate: '2026-03-13',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/436.png',
  };

  public tags = [CardTag.POKEMON_EX, CardTag.TERA];

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom = '多龙奇';

  public cardTypes: CardType[] = [CardType.DRAGON];

  public hp: number = 320;

  public weakness = [];

  public resistance = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '喷射头击',
      cost: [CardType.COLORLESS],
      damage: '70',
      text: '',
    },
    {
      name: '幻影潜袭',
      cost: [CardType.FIRE, CardType.PSYCHIC],
      damage: '200',
      text: '将6个伤害指示物，以任意方式放置于对手的备战宝可梦身上。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '多龙巴鲁托ex';

  public fullName: string = '多龙巴鲁托ex CSV8C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const generator = usePhantomDive(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
