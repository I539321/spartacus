import { NgModule } from '@angular/core';
import {
  CmsConfig,
  provideDefaultConfig,
  provideDefaultConfigFactory,
} from '@spartacus/core';
import { defaultCheckoutScheduledReplenishmentRoutingConfig } from './config/default-checkout-scheduled-replenishment-routing-config';
import { CheckoutScheduledReplenishmentEventModule } from './events/checkout-scheduled-replenishment-event.module';
import {
  CHECKOUT_SCHEDULED_REPLENISHMENT_CORE_FEATURE,
  CHECKOUT_SCHEDULED_REPLENISHMENT_FEATURE,
} from './feature-name';

export function defaultCheckoutComponentsConfig() {
  const config: CmsConfig = {
    featureModules: {
      [CHECKOUT_SCHEDULED_REPLENISHMENT_FEATURE]: {
        cmsComponents: [
          'CheckoutPlaceOrder',
          'CheckoutScheduleReplenishmentOrder',
          'OrderConfirmationThankMessageComponent',
          'ReplenishmentConfirmationMessageComponent',
          'ReplenishmentConfirmationOverviewComponent',
          'ReplenishmentConfirmationItemsComponent',
          'ReplenishmentConfirmationTotalsComponent',
        ],
      },
      // by default core is bundled together with components
      [CHECKOUT_SCHEDULED_REPLENISHMENT_CORE_FEATURE]:
        CHECKOUT_SCHEDULED_REPLENISHMENT_FEATURE,
    },
  };
  return config;
}

@NgModule({
  imports: [CheckoutScheduledReplenishmentEventModule],
  providers: [
    provideDefaultConfig(defaultCheckoutScheduledReplenishmentRoutingConfig),
    provideDefaultConfigFactory(defaultCheckoutComponentsConfig),
  ],
})
export class CheckoutScheduledReplenishmentRootModule {}
