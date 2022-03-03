import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { OrderEntriesContext, OrderEntry, ORDER_ENTRIES_CONTEXT } from '@spartacus/cart/base/root';
import { ContextService } from '@spartacus/storefront';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ExportOrderEntriesToCsvService } from './export-order-entries-to-csv.service';

@Component({
  selector: 'cx-export-order-entries',
  templateUrl: './export-order-entries.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportOrderEntriesComponent {
  // If there is no sibling component then add container class to line up with other components.
  @Input() @HostBinding('class.container') standAlone: boolean = true;

  constructor(
    protected exportEntriesService: ExportOrderEntriesToCsvService,
    protected contextService: ContextService
  ) {}

  protected orderEntriesContext$: Observable<OrderEntriesContext | undefined> =
    this.contextService.get<OrderEntriesContext>(ORDER_ENTRIES_CONTEXT);

  entries$: Observable<OrderEntry[] | undefined> = this.orderEntriesContext$.pipe(
    switchMap((orderEntriesContext) => orderEntriesContext?.getEntries?.() ?? of(undefined))
  );

  exportCsv(entries: OrderEntry[]): void {
    this.exportEntriesService.downloadCsv(entries);
  }
}
