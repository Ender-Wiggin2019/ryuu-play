import { Injectable } from '@angular/core';
import { Card, StateSerializer, SuperType, PokemonCard, EnergyCard, CardType,
  TrainerCard, CardManager } from '@ptcg/common';

import { ApiService } from '../../api/api.service';
import { CardInfoPopupData, CardInfoPopupComponent } from './card-info-popup/card-info-popup.component';
import { CardInfoListPopupComponent } from './card-info-list-popup/card-info-list-popup.component';
import { CardInfoPaneAction } from './card-info-pane/card-info-pane.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { SessionService } from '../session/session.service';
import { CardsData } from '../../api/interfaces/cards.interface';

@Injectable({
  providedIn: 'root'
})
export class CardsBaseService {

  private cards: Card[] = [];
  private displayCards: Card[] = [];
  private names: string[] = [];
  private cardManager: CardManager;
  private variantGroups = new Map<string, Card[]>();

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private sessionService: SessionService
  ) {
    this.cardManager = CardManager.getInstance();
  }

  public loadCardsData(data: CardsData) {
    this.cardManager.loadCardsInfo(data.cardsInfo, data.cards);
    this.cards = this.cardManager.getAllCards().slice();
    this.names = this.cards.map(c => c.fullName);
    this.cards.sort(this.compareCards);
    this.buildVariantGroups();
    StateSerializer.setKnownCards(this.cards);
  }

  private buildVariantGroups() {
    const groups = new Map<string, Card[]>();

    this.cards.forEach(card => {
      const key = this.getVariantGroupKey(card);
      const group = groups.get(key) || [];
      group.push(card);
      groups.set(key, group);
    });

    groups.forEach(cards => cards.sort((left, right) => this.compareVariantCards(left, right)));

    this.variantGroups = groups;
    this.displayCards = Array.from(groups.values())
      .map(cards => cards[0])
      .sort(this.compareCards);
  }

  private compareCards(c1: Card, c2: Card) {
    if (c1.superType !== c2.superType) {
      return c1.superType - c2.superType;
    }
    switch (c1.superType) {
      case SuperType.POKEMON: {
        const p1 = c1 as PokemonCard;
        const p2 = c2 as PokemonCard;
        const type1 = p1.cardTypes.length > 0 ? p1.cardTypes[0] : CardType.ANY;
        const type2 = p2.cardTypes.length > 0 ? p2.cardTypes[0] : CardType.ANY;
        if (type1 !== type2) {
          return type1 - type2;
        }
        break;
      }
      case SuperType.ENERGY: {
        const e1 = c1 as EnergyCard;
        const e2 = c2 as EnergyCard;
        if (e1.energyType !== e2.energyType) {
          return e1.energyType - e2.energyType;
        }
        const type1 = e1.provides.length > 0 ? e1.provides[0] : CardType.ANY;
        const type2 = e2.provides.length > 0 ? e2.provides[0] : CardType.ANY;
        if (type1 !== type2) {
          return type1 - type2;
        }
        break;
      }
      case SuperType.TRAINER: {
        const t1 = c1 as TrainerCard;
        const t2 = c2 as TrainerCard;
        if (t1.trainerType !== t2.trainerType) {
          return t1.trainerType - t2.trainerType;
        }
      }
    }
    return c1.fullName < c2.fullName ? -1 : 1;
  }

  public getAllFormats() {
    return this.cardManager.getAllFormats();
  }

  public getCards(): Card[] {
    return this.cards;
  }

  public getDisplayCards(): Card[] {
    return this.displayCards;
  }

  public getCardNames(): string[] {
    return this.names;
  }

  public isCardFromFormat(cardName: string, name: string): boolean {
    return this.cardManager.getCardFormats(cardName).some(f => f.name === name);
  }

  public getScanUrl(card: Card): string {
    const remoteImageUrl = (card as any).rawData?.image_url as string | undefined;
    if (remoteImageUrl) {
      return remoteImageUrl;
    }

    const config = this.sessionService.session.config;
    const scansUrl = config && config.scansUrl || '';
    const apiUrl = this.apiService.getApiUrl();
    return apiUrl + scansUrl
      .replace('{set}', card.set)
      .replace('{name}', card.fullName);
  }

  public getCardByName(cardName: string): Card | undefined {
    return this.cardManager.getCardByName(cardName);
  }

  public getVariantCards(card: Card): Card[] {
    return this.variantGroups.get(this.getVariantGroupKey(card)) || [card];
  }

  public getRarityLabel(card: Card): string {
    return ((card.rawData?.raw_card as any)?.details?.rarityLabel as string | undefined) || '';
  }

  public getCollectionNumber(card: Card): string {
    return ((card.rawData?.raw_card as any)?.details?.collectionNumber as string | undefined) || '';
  }

  private getVariantGroupKey(card: Card): string {
    switch (card.superType) {
      case SuperType.POKEMON:
        return this.getPokemonVariantGroupKey(card as PokemonCard);
      case SuperType.TRAINER:
        return this.getTrainerVariantGroupKey(card as TrainerCard);
      case SuperType.ENERGY:
        return this.getEnergyVariantGroupKey(card as EnergyCard);
      default:
        return card.fullName;
    }
  }

  private getPokemonVariantGroupKey(card: PokemonCard): string {
    const logicGroupKey = (card.rawData as any)?.logic_group_key as string | undefined;
    if (logicGroupKey) {
      return logicGroupKey;
    }

    const rawGroupKey = (card.rawData as any)?.variant_group_key as string | undefined;
    if (rawGroupKey) {
      return rawGroupKey;
    }

    return JSON.stringify({
      superType: card.superType,
      name: card.name,
      tags: card.tags,
      cardTypes: card.cardTypes,
      stage: card.stage,
      hp: card.hp,
      evolvesFrom: card.evolvesFrom,
      retreat: card.retreat,
      weakness: card.weakness,
      resistance: card.resistance,
      powers: card.powers.map(power => ({
        name: power.name,
        powerType: power.powerType,
        text: power.text
      })),
      attacks: card.attacks.map(attack => ({
        name: attack.name,
        cost: attack.cost,
        damage: attack.damage,
        text: attack.text
      }))
    });
  }

  private getTrainerVariantGroupKey(card: TrainerCard): string {
    const logicGroupKey = (card.rawData as any)?.logic_group_key as string | undefined;
    if (logicGroupKey) {
      return logicGroupKey;
    }

    const constructorName = card.constructor?.name;
    if (constructorName && constructorName !== 'GeneratedTrainerCard' && constructorName !== 'Object') {
      return `trainer:${card.trainerType}:${constructorName}`;
    }

    return JSON.stringify({
      superType: card.superType,
      trainerType: card.trainerType,
      name: this.normalizeVariantText(card.name),
      tags: card.tags,
      text: this.normalizeTrainerText(card.text),
      canUseOnFirstTurn: card.canUseOnFirstTurn,
      useWhenInPlay: card.useWhenInPlay
    });
  }

  private getEnergyVariantGroupKey(card: EnergyCard): string {
    const yorenCode = (card.rawData?.raw_card as any)?.yorenCode as string | undefined;
    if (yorenCode) {
      return `energy:${card.energyType}:${yorenCode}`;
    }

    const rawGroupKey = (card.rawData as any)?.variant_group_key as string | undefined;
    if (rawGroupKey) {
      return rawGroupKey;
    }

    return JSON.stringify({
      superType: card.superType,
      energyType: card.energyType,
      name: card.name,
      tags: card.tags,
      text: card.text,
      provides: card.provides
    });
  }

  private compareVariantCards(left: Card, right: Card): number {
    const rarityDiff = this.getRarityRank(this.getRarityLabel(right)) - this.getRarityRank(this.getRarityLabel(left));
    if (rarityDiff !== 0) {
      return rarityDiff;
    }

    const leftNumber = this.getCollectionNumberValue(this.getCollectionNumber(left));
    const rightNumber = this.getCollectionNumberValue(this.getCollectionNumber(right));
    if (leftNumber !== rightNumber) {
      return rightNumber - leftNumber;
    }

    return this.compareCards(left, right);
  }

  private getCollectionNumberValue(value: string): number {
    const match = value.match(/\d+/);
    return match ? Number(match[0]) : -1;
  }

  private getRarityRank(rarityLabel: string): number {
    const label = rarityLabel.toUpperCase();
    if (label.includes('SAR')) {
      return 700;
    }
    if (label.includes('UR')) {
      return 650;
    }
    if (label.includes('SR')) {
      return 600;
    }
    if (label.includes('AR')) {
      return 550;
    }
    if (label.includes('ACE')) {
      return 500;
    }
    if (label.includes('RRR')) {
      return 450;
    }
    if (label.includes('RR')) {
      return 400;
    }
    if (label.includes('R')) {
      return 300;
    }
    if (label.includes('U')) {
      return 200;
    }
    if (label.includes('C')) {
      return 100;
    }
    return 0;
  }

  private normalizeTrainerText(value: string | undefined): string {
    return this.normalizeVariantText(value)
      .replace(/在自己的回合可以使用任意张物品卡。?/g, '')
      .replace(/在自己的回合可使用任意张物品卡。?/g, '')
      .replace(/[，。、「」『』（）()【】［］〔〕…・：:；;？！?！!,.]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalizeVariantText(value: string | undefined): string {
    return (value || '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  public showCardInfo(data: CardInfoPopupData = {}): Promise<CardInfoPaneAction> {
    const dialog = this.dialog.open(CardInfoPopupComponent, {
      maxWidth: '100%',
      width: '650px',
      data
    });

    return dialog.afterClosed().toPromise()
      .catch(() => undefined);
  }

  public showCardInfoList(data: CardInfoPopupData = {}): Promise<CardInfoPaneAction> {
    if (data.cardList === undefined) {
      return this.showCardInfo(data);
    }

    const dialog = this.dialog.open(CardInfoListPopupComponent, {
      maxWidth: '100%',
      width: '670px',
      data
    });

    return dialog.afterClosed().toPromise()
      .catch(() => undefined);
  }

}
