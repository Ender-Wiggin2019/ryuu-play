import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'ptcg-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss']
})
export class SearchBoxComponent {

  @Output() search = new EventEmitter<string>();

  public searchValue = '';

  constructor() { }

  public clearSearch() {
    if (this.searchValue !== '') {
      this.searchValue = '';
      this.search.next('');
    }
  }

  public onChange(value: string) {
    this.searchValue = value;
    this.search.next(value);
  }

}
