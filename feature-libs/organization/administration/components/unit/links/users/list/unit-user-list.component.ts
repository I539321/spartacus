import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ROUTE_PARAMS } from '../../../../constants';
import { OrganizationListService } from '../../../../shared/organization-list/organization-list.service';
import { UnitUserListService } from '../services/unit-user-list.service';

@Component({
  templateUrl: './unit-user-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: OrganizationListService,
      useExisting: UnitUserListService,
    },
  ],
})
export class UnitUserListComponent {
  routerKey = ROUTE_PARAMS.userCode;
}
