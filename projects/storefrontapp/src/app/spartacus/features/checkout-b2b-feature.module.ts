import { NgModule } from '@angular/core';
import {
  checkoutB2BTranslationChunksConfig,
  checkoutB2BTranslations,
} from '@spartacus/checkout/b2b/assets';
import { CheckoutB2BRootModule } from '@spartacus/checkout/b2b/root';
import {
  checkoutTranslationChunksConfig,
  checkoutTranslations,
} from '@spartacus/checkout/base/assets';
import { CHECKOUT_FEATURE } from '@spartacus/checkout/base/root';
import { provideConfig } from '@spartacus/core';

@NgModule({
  imports: [CheckoutB2BRootModule],
  providers: [
    provideConfig({
      i18n: {
        resources: checkoutTranslations,
        chunks: checkoutTranslationChunksConfig,
      },
    }),
    provideConfig({
      i18n: {
        resources: checkoutB2BTranslations,
        chunks: checkoutB2BTranslationChunksConfig,
      },
    }),
    provideConfig({
      featureModules: {
        [CHECKOUT_FEATURE]: {
          module: () =>
            import('./checkout-b2b-custom-feature.module').then(
              (m) => m.CheckoutB2BFeatureCustomModule
            ),
        },
      },
    }),
  ],
})
export class CheckoutB2BFeatureModule {}
