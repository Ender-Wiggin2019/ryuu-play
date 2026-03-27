import { Injectable } from '@angular/core';
import { Card } from '@ptcg/common';
import { TranslateService } from '@ngx-translate/core';

import { CardsBaseService } from '../cards/cards-base.service';

type LocalizedField = {
  name?: unknown;
  text?: unknown;
};

type LocalizedRawCard = LocalizedField & {
  attacks?: LocalizedField[];
  powers?: LocalizedField[];
  abilities?: LocalizedField[];
};

@Injectable({
  providedIn: 'root'
})
export class DisplayTextService {

  constructor(
    private translate: TranslateService,
    private cardsBaseService: CardsBaseService
  ) { }

  public getCardDisplayName(card: Card | string | null | undefined, fallback: 'name' | 'fullName' = 'name'): string {
    if (card == null) {
      return '';
    }

    if (typeof card === 'string') {
      return this.getCardDisplayNameByText(card);
    }

    if (this.isChineseLanguage()) {
      const localizedName = this.getRawCardField(card, 'name');
      if (localizedName) {
        return localizedName;
      }
    }

    return fallback === 'fullName' ? card.fullName : card.name;
  }

  public getLocalizedCardText(card: Card | null | undefined): string {
    if (card == null) {
      return '';
    }

    if (this.isChineseLanguage()) {
      const rawText = this.getRawCardField(card, 'text');
      if (rawText) {
        return rawText;
      }
    }

    return (card as Card & { text?: string }).text || '';
  }

  public getLocalizedAttackName(card: Card | null | undefined, attack: { name: string }, index: number): string {
    return this.getLocalizedCardEntry(card, attack, index, 'attacks', 'name');
  }

  public getLocalizedAttackText(card: Card | null | undefined, attack: { text?: string }, index: number): string {
    return this.getLocalizedCardEntry(card, attack, index, 'attacks', 'text');
  }

  public getLocalizedPowerName(card: Card | null | undefined, power: { name: string }, index: number): string {
    return this.getLocalizedCardEntry(card, power, index, 'powers', 'name')
      || this.getLocalizedCardEntry(card, power, index, 'abilities', 'name');
  }

  public getLocalizedPowerText(card: Card | null | undefined, power: { text?: string }, index: number): string {
    return this.getLocalizedCardEntry(card, power, index, 'powers', 'text')
      || this.getLocalizedCardEntry(card, power, index, 'abilities', 'text');
  }

  public getFormatName(formatName: string | null | undefined): string {
    if (!formatName) {
      return '';
    }

    const key = 'FORMAT_LABELS.' + this.toTranslationKey(formatName);
    const translated = this.translate.instant(key);
    return translated !== key ? translated : formatName;
  }

  public localizeGameLogParams(params: Record<string, string | number>): Record<string, string | number> {
    const localizedParams: Record<string, string | number> = { ...params };

    Object.keys(localizedParams).forEach(key => {
      const value = localizedParams[key];
      if (typeof value !== 'string') {
        return;
      }

      switch (key) {
        case 'message':
        case 'choice':
          localizedParams[key] = this.translate.instant('GAME_MESSAGES.' + value);
          break;
        case 'card':
        case 'pokemon':
        case 'active':
        case 'benched':
        case 'stadium':
          localizedParams[key] = this.getCardDisplayNameByText(value);
          break;
        case 'attack':
          localizedParams[key] = this.getLocalizedAttackNameByText(value);
          break;
        case 'ability':
          localizedParams[key] = this.getLocalizedPowerNameByText(value);
          break;
      }
    });

    return localizedParams;
  }

  public getSystemName(): string {
    const key = 'LABEL_SYSTEM';
    const translated = this.translate.instant(key);
    return translated !== key ? translated : 'System';
  }

  private getCardDisplayNameByText(value: string): string {
    if (!this.isChineseLanguage()) {
      return value;
    }

    const card = this.findCard(value);
    if (!card) {
      return value;
    }

    return this.getCardDisplayName(card);
  }

  private getLocalizedAttackNameByText(value: string): string {
    if (!this.isChineseLanguage()) {
      return value;
    }

    for (const card of this.cardsBaseService.getCards()) {
      const attacks = (card as Card & { attacks?: Array<{ name: string }> }).attacks || [];
      const index = attacks.findIndex(attack => attack.name === value);
      if (index !== -1) {
        return this.getLocalizedAttackName(card, attacks[index], index);
      }
    }

    return value;
  }

  private getLocalizedPowerNameByText(value: string): string {
    if (!this.isChineseLanguage()) {
      return value;
    }

    for (const card of this.cardsBaseService.getCards()) {
      const powers = (card as Card & { powers?: Array<{ name: string }> }).powers || [];
      const index = powers.findIndex(power => power.name === value);
      if (index !== -1) {
        return this.getLocalizedPowerName(card, powers[index], index);
      }
    }

    return value;
  }

  private getLocalizedCardEntry(
    card: Card | null | undefined,
    entry: { name?: string, text?: string },
    index: number,
    collectionKey: 'attacks' | 'powers' | 'abilities',
    field: 'name' | 'text'
  ): string {
    if (card == null) {
      return entry[field] || '';
    }

    if (this.isChineseLanguage()) {
      const rawCard = this.getRawCard(card);
      const items = rawCard?.[collectionKey];
      const localizedValue = Array.isArray(items) ? this.readLocalizedField(items[index], field) : undefined;
      if (localizedValue) {
        return localizedValue;
      }
    }

    return entry[field] || '';
  }

  private getRawCard(card: Card): LocalizedRawCard | undefined {
    const rawCard = (card.rawData?.raw_card || {}) as LocalizedRawCard;
    return rawCard;
  }

  private getRawCardField(card: Card, field: 'name' | 'text'): string | undefined {
    return this.readLocalizedField(this.getRawCard(card), field);
  }

  private readLocalizedField(value: LocalizedField | undefined, field: 'name' | 'text'): string | undefined {
    const fieldValue = value?.[field];
    return typeof fieldValue === 'string' && fieldValue.trim() !== '' ? fieldValue : undefined;
  }

  private findCard(value: string): Card | undefined {
    return this.cardsBaseService.getCards().find(card => {
      const localizedName = this.getRawCardField(card, 'name');
      return card.fullName === value || card.name === value || localizedName === value;
    });
  }

  private isChineseLanguage(): boolean {
    const language = this.translate.currentLang || this.translate.defaultLang || '';
    return language.toLowerCase().startsWith('zh');
  }

  private toTranslationKey(value: string): string {
    return value
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toUpperCase();
  }

}
