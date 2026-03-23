import {
  AttachEnergyPrompt,
  CardTag,
  CardTarget,
  Effect,
  EnergyCard,
  EnergyType,
  GameError,
  GameMessage,
  PlayerType,
  SlotType,
  State,
  StateUtils,
  StoreLike,
  SuperType,
  TrainerCard,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

export class ProfessorSadasVitality extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 17375,
      name: '奥琳博士的气魄',
      yorenCode: 'Y1375',
      cardType: '2',
      commodityCode: 'PROMOGIFT02',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '238/SV-P',
      },
      image: 'img/454/6.png',
      hash: 'e3fb60efa391e25e2b1c540f0cbc97a7',
    },
    collection: {
      id: 454,
      commodityCode: 'PROMOGIFT02',
      name: '活动奖赏包 第二弹',
      salesDate: '2026-03-13',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/454/6.png',
  };

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public set: string = 'set_g';

  public name: string = 'Professor Sada\'s Vitality';

  public fullName: string = 'Professor Sada\'s Vitality PROMOGIFT02';

  public text: string =
    'Attach up to 1 Basic Energy card from your discard pile to each of up to 2 of your Ancient Pokemon. ' +
    'If you attached any Energy cards in this way, draw 3 cards.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const player = effect.player;
      const blockedTo: CardTarget[] = [];

      const basicEnergyInDiscard = player.discard.cards.filter(
        c => c instanceof EnergyCard && c.energyType === EnergyType.BASIC
      ).length;

      if (basicEnergyInDiscard === 0) {
        throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
      }

      let ancientPokemonCount = 0;
      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (_slot, card, target) => {
        if (card.tags.includes(CardTag.ANCIENT)) {
          ancientPokemonCount += 1;
        } else {
          blockedTo.push(target);
        }
      });

      if (ancientPokemonCount === 0) {
        throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
      }

      effect.preventDefault = true;

      return store.prompt(
        state,
        new AttachEnergyPrompt(
          player.id,
          GameMessage.ATTACH_ENERGY_CARDS,
          player.discard,
          PlayerType.BOTTOM_PLAYER,
          [SlotType.ACTIVE, SlotType.BENCH],
          { superType: SuperType.ENERGY, energyType: EnergyType.BASIC },
          {
            allowCancel: false,
            min: 1,
            max: Math.min(2, basicEnergyInDiscard, ancientPokemonCount),
            differentTargets: true,
            blockedTo,
          }
        ),
        transfers => {
          transfers = transfers || [];
          let attachedCount = 0;

          for (const transfer of transfers) {
            const target = StateUtils.getTarget(state, player, transfer.to);
            const pokemonCard = target.getPokemonCard();

            if (!pokemonCard || !pokemonCard.tags.includes(CardTag.ANCIENT)) {
              continue;
            }

            player.discard.moveCardTo(transfer.card, target.energies);
            attachedCount += 1;
          }

          player.hand.moveCardTo(this, player.supporter);

          if (attachedCount > 0) {
            player.deck.moveTo(player.hand, 3);
          }
        }
      );
    }

    return state;
  }
}
