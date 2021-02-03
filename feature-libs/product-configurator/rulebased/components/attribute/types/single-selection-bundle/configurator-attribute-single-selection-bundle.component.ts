import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ConfigFormUpdateEvent } from '../../../form/configurator-form.event';
import { Configurator } from '../../../../core/model/configurator.model';
import { ConfiguratorAttributeBaseComponent } from '../base/configurator-attribute-base.component';
import { ConfiguratorAttributeQuantityService } from '../../quantity/configurator-attribute-quantity.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'cx-configurator-attribute-single-selection-bundle',
  templateUrl:
    './configurator-attribute-single-selection-bundle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfiguratorAttributeSingleSelectionBundleComponent extends ConfiguratorAttributeBaseComponent {
  loading$ = new BehaviorSubject<boolean>(false);
  preventAction$ = new BehaviorSubject<boolean>(false);

  @Input() attribute: Configurator.Attribute;
  @Input() ownerKey: string;
  @Output() selectionChange = new EventEmitter<ConfigFormUpdateEvent>();

  constructor(private quantityService: ConfiguratorAttributeQuantityService) {
    super();
  }

  get withQuantity() {
    return this.quantityService.withQuantity(
      this.attribute.dataType,
      this.attribute.uiType
    );
  }

  get disableQuantityActions() {
    return this.quantityService.disableQuantityActions(
      this.attribute.selectedSingleValue
    );
  }

  onSelect(value: string): void {
    this.loading$.next(true);

    const event: ConfigFormUpdateEvent = {
      changedAttribute: {
        ...this.attribute,
        selectedSingleValue: value,
      },
      ownerKey: this.ownerKey,
      updateType: Configurator.UpdateType.ATTRIBUTE,
    };

    this.selectionChange.emit(event);
  }

  onDeselect(): void {
    this.loading$.next(true);

    const event: ConfigFormUpdateEvent = {
      changedAttribute: {
        ...this.attribute,
        selectedSingleValue: '',
      },
      ownerKey: this.ownerKey,
      updateType: Configurator.UpdateType.ATTRIBUTE,
    };

    this.selectionChange.emit(event);
  }

  onHandleQuantity(quantity): void {
    this.loading$.next(true);

    const event: ConfigFormUpdateEvent = {
      changedAttribute: {
        ...this.attribute,
        quantity,
      },
      ownerKey: this.ownerKey,
      updateType: Configurator.UpdateType.ATTRIBUTE_QUANTITY,
    };

    this.selectionChange.emit(event);
  }

  onChangeQuantity(eventObject): void {
    if (!eventObject.quantity) {
      this.onDeselect();
    } else {
      this.onHandleQuantity(eventObject.quantity);
    }
  }

  getSelectedValuePrice(
    attribute: Configurator.Attribute
  ): Configurator.PriceDetails | undefined {
    return attribute?.values?.find((value) => value?.selected)?.valuePrice;
  }

  getSelectedValuePriceTotal(
    attribute: Configurator.Attribute
  ): Configurator.PriceDetails | undefined {
    return attribute?.values?.find((value) => value?.selected)?.valuePriceTotal;
  }

  getProductPrice(
    attribute: Configurator.Attribute
  ): Configurator.PriceDetails | number {
    return (
      attribute?.quantity &&
      this.getSelectedValuePrice(attribute) &&
      this.getSelectedValuePriceTotal(attribute)
    );
  }

  setFormula(
    quantity?: number,
    price?: Configurator.PriceDetails,
    priceTotal?: Configurator.PriceDetails
  ) {
    return {
      quantity: quantity,
      price: price,
      priceTotal: priceTotal,
      isLightedUp: true,
    };
  }
}
