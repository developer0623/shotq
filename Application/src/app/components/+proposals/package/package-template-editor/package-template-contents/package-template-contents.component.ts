import * as _ from 'lodash';
import {
  Component, Input, Output,
  OnChanges, SimpleChanges, EventEmitter } from '@angular/core';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { ItemTemplate } from '../../../../../models/item-template';
import { PackageTemplateItem } from '../../../../../models/package-template-item';


interface ContentItem {
  id?: number;
  item: ItemTemplate;
  item_template_data: ItemTemplate;
  quantity: number;
  position: number;
}

@Component({
  selector: 'package-template-contents',
  templateUrl: './package-template-contents.component.html',
  styleUrls: ['./package-template-contents.component.scss']
})
export class PackageTemplateContentsComponent implements OnChanges {
  @Input() allItems: ItemTemplate[];
  @Input() contents: PackageTemplateItem[];
  @Output() contentsChanged = new EventEmitter();
  items: ContentItem[] = [];
  dragulaOptions = {
    modelItemModifier: (item) => {
      return {item: item, quantity: 1};
    }
  };
  activeItemId: number = null;

  constructor(dragulaService: DragulaService) {
    dragulaService.dropModel.subscribe((args) => {
      if (this.contents.length !== this.items.length) {
        this.contentsChanged.emit(this.getContents());
      } else {
        this.contentsChanged.emit(this.getContents());
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['contents']) {
      this.items = this.contents.map((item, index): ContentItem => {
        let itemTemplate = _.find(this.allItems, {id: item.item_template});
        return {
          id: item.id || this.generateRandomId(),
          item: itemTemplate,
          item_template_data: _.cloneDeep(item.item_template_data || itemTemplate),
          quantity: item.quantity,
          position: index
        };
      });
    }
  }

  getContents(): PackageTemplateItem[] {
    return this.items.map((item, index) => {
      return {
        id: item.id,
        item_template: item.item.id,
        item_template_data: item.item_template_data,
        quantity: item.quantity,
        position: index
      };
    });
  }

  removeProduct(index: number) {
    this.items.splice(index, 1);
    this.contentsChanged.emit(this.getContents());
  }

  increaseProductUnit(product: ContentItem, e: MouseEvent): void {
    this.changeUnit(product, e, 1);
  }

  decreaseProductUnit(product: ContentItem, e: MouseEvent): void {
    if (product.quantity < 2) {
      return;
    }
    this.changeUnit(product, e, -1);
  }

  onChangeItem() {
    this.contentsChanged.emit(this.getContents());
  }

  toggleItemOptions(item: ContentItem) {
    if (this.activeItemId === item.id) {
      this.activeItemId = null;
    } else {
      if (item.item_template_data.item_template_option_groups.length === 0) {
        this.activeItemId = null;
      } else {
        this.activeItemId = item.id;
      }
    }
  }

  private changeUnit(product: ContentItem, e: MouseEvent, size: number) {
    e.preventDefault();
    e.stopPropagation();
    product.quantity += size;
    this.contentsChanged.emit(this.getContents());
  }

  private generateRandomId(): number {
    let r = _.random(-1, -1000);
    while (_.find(this.items, {id: r})) {
      r = _.random(-1, -1000);
    }
    return r;
  }
}
