import {
  AttackEffect,
  CardTag,
  CardType,
  ChoosePokemonPrompt,
  DealDamageEffect,
  Effect,
  GameMessage,
  PlayerType,
  PokemonCard,
  PokemonSlot,
  PutDamageEffect,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

function hasLabel(card: PokemonCard | undefined, label: string): boolean {
  if (card === undefined) {
    return false;
  }

  const rawData = card as any;
  const labels = [
    rawData.rawData?.raw_card?.details?.specialCardLabel,
    rawData.rawData?.api_card?.specialCardLabel,
  ];

  return labels.some((item: unknown) => item === label);
}

function isFuturePokemon(card: PokemonCard | undefined): boolean {
  return hasLabel(card, '未来');
}

export class IronCrownEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 16420,
      name: '铁头壳ex',
      yorenCode: 'Y1395',
      cardType: '1',
      commodityCode: 'CSV7C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '254/204',
        rarityLabel: 'UR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '超',
        pokemonTypeLabel: '宝可梦ex',
        specialCardLabel: '未来',
        hp: 220,
        evolveText: '基础',
        weakness: '恶 ×2',
        resistance: '斗 -30',
        retreatCost: 3,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/599.png',
      ruleLines: ['当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 1771,
          name: '双刃',
          text: '给对手的2只宝可梦，各造成50伤害。这个招式的伤害，不计算弱点、抗性，以及受到伤害的宝可梦身上所附加的效果。',
          cost: ['超', '无色', '无色'],
          damage: null,
        },
      ],
      features: [
        {
          id: 246,
          name: '蔚蓝指令',
          text: '只要这只宝可梦在场上，自己的「未来」宝可梦（除「铁头壳【ex】」外）所使用的招式，给对手战斗宝可梦造成的伤害「+20」。',
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
      id: 324,
      commodityCode: 'CSV7C',
      name: '补充包 利刃猛醒',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/599.png',
  };

  public tags = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 220;

  public weakness = [{ type: CardType.DARK }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '双刃',
      cost: [CardType.PSYCHIC, CardType.COLORLESS, CardType.COLORLESS],
      damage: '',
      text: '给对手的2只宝可梦，各造成50伤害。这个招式的伤害，不计算弱点、抗性，以及受到伤害的宝可梦身上所附加的效果。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '铁头壳ex';

  public fullName: string = '铁头壳ex CSV7C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof DealDamageEffect) {
      const pokemonSlot = StateUtils.findPokemonSlot(state, this);
      if (pokemonSlot === undefined) {
        return state;
      }

      const owner = StateUtils.findOwner(state, pokemonSlot);
      const sourcePokemon = effect.source.getPokemonCard();

      if (effect.player !== owner) {
        return state;
      }

      if (!sourcePokemon || sourcePokemon.name === this.name || !isFuturePokemon(sourcePokemon)) {
        return state;
      }

      if (effect.target !== effect.opponent.active) {
        return state;
      }

      effect.damage += 20;
      return state;
    }

    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
      const targets: PokemonSlot[] = [];

      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (pokemonSlot) => {
        targets.push(pokemonSlot);
      });

      if (targets.length === 0) {
        return state;
      }

      const dealDamage = (targetIndex: number) => {
        const damage = new PutDamageEffect(effect, 50);
        damage.target = targets[targetIndex];
        store.reduceEffect(state, damage);
      };

      if (targets.length === 1) {
        dealDamage(0);
        return state;
      }

      return store.prompt(
        state,
        new ChoosePokemonPrompt(
          player.id,
          GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
          PlayerType.TOP_PLAYER,
          [SlotType.ACTIVE, SlotType.BENCH],
          { allowCancel: false }
        ),
        first => {
          if (first === null || first.length === 0) {
            return;
          }

          const firstTarget = first[0];
          const firstDamage = new PutDamageEffect(effect, 50);
          firstDamage.target = firstTarget;
          store.reduceEffect(state, firstDamage);

          const blocked = [{
            player: PlayerType.TOP_PLAYER,
            slot: firstTarget === opponent.active ? SlotType.ACTIVE : SlotType.BENCH,
            index: firstTarget === opponent.active ? 0 : opponent.bench.indexOf(firstTarget),
          }];

          if (targets.filter(target => target !== firstTarget).length === 0) {
            return;
          }

          store.prompt(
            state,
            new ChoosePokemonPrompt(
              player.id,
              GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
              PlayerType.TOP_PLAYER,
              [SlotType.ACTIVE, SlotType.BENCH],
              { allowCancel: true, blocked }
            ),
            second => {
              if (second === null || second.length === 0) {
                return;
              }

              const secondDamage = new PutDamageEffect(effect, 50);
              secondDamage.target = second[0];
              store.reduceEffect(state, secondDamage);
            }
          );
        }
      );
    }

    return state;
  }
}
