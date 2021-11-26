## b2b

- feature-libs/checkout/base/components/components/shipping-address/shipping-address.component.spec.ts contained some b2b-related tests
- feature-libs/checkout/base/components/components/review-submit/review-submit.component.spec.ts
- do we have a b2b express checkout?
- LL broken for b2b? in feature-libs/checkout/b2b/root/config/default-b2b-occ-config.ts:
  - there's an import from the user/account and user/profile
  - does this mean we are bundling both user/account and user/profile with the b2b checkout?

## scheduled replenishment

- feature-libs/checkout/base/components/components/place-order/place-order.component.spec.ts

## other-to-merge-with-later

1. Handle Jalo error everywhere? When can it happen? Is there a doc for it?
2. go through all the queries, and add a back-off operator? we did this in the feature-libs/checkout/base/core/facade/checkout-delivery-modes.service.ts
3. append "state" to all facade methods that do return the state
4. fix xit
   1. in
      1. projects/core/src/util/command-query/query.service.spec.ts
      2. feature-libs/checkout/base/core/facade/checkout-payment.service.spec.ts
      3. feature-libs/checkout/base/core/facade/checkout-query.service.spec.ts
   2. To double check:     
      1. If we start with an error in plain Subject.error, and then try Subject.next -> it doesn't work?
      2. Wrapping an observable$ which errors and providing it as such to the query service - it works. See `supportedDeliveryModesQuery` and its test - it is wrapped `checkoutPreconditions()`, and in the test we emit an error two times from the connector, and then a success. Is it because the preconditions are retried by the back-off operator? 
   3. feature-libs/checkout/base/components/services/express-checkout.service.spec.ts
5. search for "// TODO:#checkout"
6. some b2b-related tests were removed from b2c components / classes. Re-add them in /b2b entry point.
   1. feature-libs/checkout/base/components/guards/checkout-auth.guard.spec.ts - should return to /home when user roles does not have b2bcustomergroup
7. Docs
   1. go by example -> create the docs around the delivery address, or delivery mode, or payment step (one of them). Maybe choose the mostly customized one (payment step)?
   2. If using an old facade -> use the new facade
   3. If customized an effect -> please remove ngrx, and extend our facade service where you can add your custom logic by extending a method, or by adding new ones
   4. if using old components -> you can consider using our new components. If you don't want to, you can just import our new facade in your existing components, and keep using them and potentially slightly modifying them.
   5. go through triggers - mention how to do a single step checkout and what to keep an eye for. i.e. remove redundant events, in order to not trigger the query too many times.
8. Styles.
9. add checkout-old-feature module which can be enabled by an env flag.
   1.  the new one is the default one, but if the flag is true, then import the oldcheckoutmodule
10. check the cart validation feature - is it using something from the checkout?
    1.  maybe the checkout needs to switch to using it?
11. query debounce?
12. converters and any - https://github.com/SAP/spartacus/pull/14165#discussion_r751912800


Deprecation strategy:

1. Rename component to have a Checkout prefix in order to avoid name clashes
2. Prefix the components' selectors
3. coordinate with UX and A11Y teams about the new checkout and announce a work on the components
4. not expose components in the public API --> how to use them internally? in our app, between endpoints, etc.
5. rename endpoints to b2b_experimental and publish / expose everything. Be clear to customers that it's still in an experimental state. --> what to do about the deprecations of the current classes? Deprecate them? Wait until 5.1?



# Checkout TO DO list

- branches:
  - epic/checkout-refactor-c-and-q
  - feature/base-entry-point
  - feature/b2b-checkout-entry-point
  - feature/checkout-scheduled-replenishement-entry-point
  - feature/prefix-components

1. implement unit tests
   - b2b entry point
   - scheduled replenishment entry point
   - checkout base entry point
   - takeActiveCartId in `projects/core/src/cart/facade/active-cart.service.ts`
2. styles in the base checkout?
3. Deprecate the existing components
4. add js doc comments
5. Checkout base:
   1. feature-libs/checkout/base/public_api.ts - populate
   2. types in:
      1. feature-libs/checkout/base/core/connectors/delivery-modes/converters.ts
      2. feature-libs/checkout/base/core/connectors/payment/converters.ts
      3. create a converter for the delivery-address
6. feature-libs/checkout/base/core/facade/checkout-delivery-address.service.ts, feature-libs/checkout/base/core/facade/checkout-payment.service.ts and feature-libs/checkout/base/core/facade/checkout-delivery-modes.service.ts - check the usage of the store
7. align the event names - start with Checkout?
8. augment checkoutsteptype enum in b2b - feature-libs/checkout/b2b/root/augmented-models/augmented-types.ts and feature-libs/checkout/b2b/root/augmented-models/index.ts
9. register b2b defaultB2bCheckoutConfig somewhere within the b2b entrypoint?
10. check ll of: base checkout, b2b, replenishment
11. move event listeners to /root? this means the feature will be ll if an event occurs before it is actually loaded. and this is what we want actually. consider the following scenario:
    1.  a user started the checkout, entered their delivery address, and set the delivery mode. This is set on the back-end for the active cart.
    2.  the user changes their mind, and navigates away from the checkout page to homepage, and refresh the browser.
    3.  after it, they decide to change their address in the profile menu. 
    4.  if they now start the checkout (and LL the feature), the current back-end data is _not_ valid for the active cart - we must reset the set delivery mode, and load the supported delivery modes again for the new address.
    5.  if the lister was in the root module, it can listen to the userupdateaddress event, ll the checkout, and issue a reset query event
12. adjust b2b's file structure (components/components)   https://github.com/SAP/spartacus/pull/14174/#discussion_r752874030
13. update schematics
    1. install from the new entry-points
    2. offer options for b2b and repl checkouts?
14. feature-libs/checkout/b2b/root/config/default-b2b-occ-config.ts - move to feature module?
15. remove orderType$ from feature-libs/checkout/scheduled-replenishment/root/facade/checkout-scheduled-replenishment.facade.ts - re-watch ep17, from ~30:00 - ~45:00
12. order$ from checkoutService should stay and not todo from Marcin. Maybe you're mentioning about part 17 (38:00 - 44:00)
13. catch refresh bug on b2b (account type on refresh displays the payment method step when it's not supposed to)
14. fix b2b mechanism if not done already for importing config (old vs new) - done but double check 
15. update schematic test for @spartacus/checkout assertions https://app.travis-ci.com/github/SAP/spartacus/jobs/549205902
16. go over the components on epic and compare with develop. ex: https://github.com/SAP/spartacus/commit/b23c1ef0cd82e4f9787fe2278c694db2fb1160e7







16. option
  - 5.0 -> release with the old-ish components in the new checkout/base
  - 5.0 -> deprecate the whole current checkout
  - 6.0 -> remove the current (now old) checkout
  - 6.0+ -> refactor components, add a11y, talk to UX guys and change UX



Feature matrix
- version in which was introduced
- checkout - from 5.0 default in our shell app
- order lib
- etc.
- comment - how to enable the new or the old one
- add cart


Usages of CART:

## Core

- ActiveCartService - added a method
- Cart - just a model
- StateWithMultiCart - not important, used just for the Store's type safety. We can use anything here really. 
- CartActions - how to import without breaking LL?
- MergeCartSuccessEvent - I created it. Move it to cart lib
- CART_NORMALIZER - how to import without breaking LL?

## Storefrontlib

- CartSharedModule - seems important how to import it without breaking LL?
- CartValidationGuard - seems important. How to import it without breaking LL?

### Test

- https://sap.service-now.com/now/workspace/agent/record/sn_customerservice_case/1117004f1bf7345c5b1fdcef9b4bcbb2 - https://github.com/SAP/spartacus/issues/14386

- express checkout update - might not need to update 'new' checkout - https://github.com/SAP/spartacus/pull/14418/files