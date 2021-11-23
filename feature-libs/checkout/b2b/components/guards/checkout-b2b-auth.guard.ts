import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import {
  CheckoutAuthGuard,
  CheckoutConfigService,
} from '@spartacus/checkout/base/components';
import {
  ActiveCartService,
  AuthRedirectService,
  AuthService,
  B2BUser,
  B2BUserRole,
  GlobalMessageService,
  GlobalMessageType,
  SemanticPathService,
} from '@spartacus/core';
import { User, UserAccountFacade } from '@spartacus/user/account/root';
import { combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CheckoutB2BAuthGuard
  extends CheckoutAuthGuard
  implements CanActivate
{
  constructor(
    protected authService: AuthService,
    protected authRedirectService: AuthRedirectService,
    protected checkoutConfigService: CheckoutConfigService,
    protected activeCartService: ActiveCartService,
    protected semanticPathService: SemanticPathService,
    protected router: Router,
    protected userAccountFacade: UserAccountFacade,
    protected globalMessageService: GlobalMessageService
  ) {
    super(
      authService,
      authRedirectService,
      checkoutConfigService,
      activeCartService,
      semanticPathService,
      router
    );
  }

  canActivate(): Observable<boolean | UrlTree> {
    return combineLatest([
      this.authService.isUserLoggedIn(),
      this.activeCartService.getAssignedUser(),
      this.userAccountFacade.get(),
      this.activeCartService.isStable(),
    ]).pipe(
      filter(([_isLoggedIn, _cartUser, _user, isStable]) => isStable),
      // if the user is authenticated and we have their data, OR if the user is anonymous
      filter(
        ([isLoggedIn, _cartUser, user]) => (!!user && isLoggedIn) || !isLoggedIn
      ),
      map(([isLoggedIn, cartUser, user]) => {
        if (!isLoggedIn) {
          return this.handleAnonymousUser(cartUser);
        } else if (user && 'roles' in user) {
          return this.handleUserRole(user);
        }
        return isLoggedIn;
      })
    );
  }

  protected handleUserRole(user: User): boolean | UrlTree {
    const roles = (<B2BUser>user).roles;
    if (roles?.includes(B2BUserRole.CUSTOMER)) {
      return true;
    }
    this.globalMessageService.add(
      { key: 'checkoutB2B.invalid.accountType' },
      GlobalMessageType.MSG_TYPE_WARNING
    );
    return this.router.parseUrl(this.semanticPathService.get('home'));
  }
}
