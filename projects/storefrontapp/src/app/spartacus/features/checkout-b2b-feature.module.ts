import { NgModule } from '@angular/core';
import {
  checkoutB2BTranslationChunksConfig,
  checkoutB2BTranslations,
} from '@spartacus/checkout/b2b/assets';
import { CheckoutB2BStepsSetGuard } from '@spartacus/checkout/b2b/components';
import {
  CheckoutB2BRootModule,
  CHECKOUT_B2B_FEATURE,
} from '@spartacus/checkout/b2b/root';
import { CheckoutStepsSetGuard } from '@spartacus/checkout/base/components';
import { CHECKOUT_FEATURE } from '@spartacus/checkout/base/root';
import { provideConfig } from '@spartacus/core';

@NgModule({
  imports: [CheckoutB2BRootModule],
  providers: [
    provideConfig({
      featureModules: {
        [CHECKOUT_B2B_FEATURE]: {
          module: () =>
            import('@spartacus/checkout/b2b').then((m) => m.CheckoutB2BModule),
          dependencies: [CHECKOUT_FEATURE],
        },
      },
      i18n: {
        resources: checkoutB2BTranslations,
        chunks: checkoutB2BTranslationChunksConfig,
      },
    }),
    // solution 2
    {
      provide: CheckoutStepsSetGuard,
      useExisting: CheckoutB2BStepsSetGuard,
    },
  ],
})
export class CheckoutB2BFeatureModule {}
