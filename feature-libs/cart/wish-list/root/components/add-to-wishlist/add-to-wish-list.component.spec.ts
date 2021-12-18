import {
  ChangeDetectionStrategy,
  Component,
  DebugElement,
  Input,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { Cart, OrderEntry } from '@spartacus/cart/main/root';
import { WishListFacade } from '@spartacus/cart/wish-list/root';
import { AuthService, I18nTestingModule, Product } from '@spartacus/core';
import { CurrentProductService } from '@spartacus/storefront';
import { cold } from 'jasmine-marbles';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AddToWishListComponent } from './add-to-wish-list.component';
import createSpy = jasmine.createSpy;
const mockProduct: Product = {
  code: 'xxx',
  name: 'product',
  summary: 'summary',
  stock: {
    stockLevel: 420,
    stockLevelStatus: 'Available',
  },
};

const mockOutOfStockProduct: Product = {
  code: 'xxx',
  name: 'product',
  stock: { stockLevelStatus: 'outOfStock', stockLevel: 0 },
};

const mockCartEntry: OrderEntry = {
  entryNumber: 0,
  product: { code: 'xxx' },
  quantity: 1,
};

const mockCartEntry1: OrderEntry = {
  product: { code: 'yyy' },
};

const mockCartEntry2: OrderEntry = {
  product: { code: 'zzz' },
};

const entries = [mockCartEntry, mockCartEntry1, mockCartEntry2];

const mockEmptyWishList: Cart = {
  code: '1',
  entries: [],
};

const mockWishList: Cart = {
  code: '2',
  entries: entries,
};

class MockAuthService {
  isUserLoggedIn(): Observable<boolean> {
    return of(true);
  }
}

const wishListSubject = new BehaviorSubject(mockWishList);
const productSubject = new BehaviorSubject(mockProduct);

class MockWishListService {
  addEntry = createSpy();
  removeEntry = createSpy();
  getWishList = createSpy().and.returnValue(wishListSubject);
  getWishListLoading() {
    return of(false);
  }
}

class MockCurrentProductService {
  getProduct = createSpy().and.returnValue(productSubject);
}

@Component({
  selector: 'cx-icon',
  template: '',
})
class MockIconComponent {
  @Input() type;
}

@Pipe({
  name: 'cxUrl',
})
class MockUrlPipe implements PipeTransform {
  transform(): any {}
}

const booleanValues = { t: true, f: false };

describe('AddToWishListComponent', () => {
  let component: AddToWishListComponent;
  let fixture: ComponentFixture<AddToWishListComponent>;
  let wishListFacade: WishListFacade;
  let authService: AuthService;
  let el: DebugElement;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [I18nTestingModule, RouterTestingModule],
        declarations: [AddToWishListComponent, MockIconComponent, MockUrlPipe],
        providers: [
          { provide: AuthService, useClass: MockAuthService },
          { provide: WishListFacade, useClass: MockWishListService },
          {
            provide: CurrentProductService,
            useClass: MockCurrentProductService,
          },
        ],
      })
        .overrideComponent(AddToWishListComponent, {
          set: { changeDetection: ChangeDetectionStrategy.Default },
        })
        .compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AddToWishListComponent);
    component = fixture.componentInstance;

    wishListFacade = TestBed.inject(WishListFacade);
    authService = TestBed.inject(AuthService);

    el = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('add', () => {
    it('should add product to wish list', () => {
      component.add(mockProduct);

      expect(wishListFacade.addEntry).toHaveBeenCalledWith(mockProduct.code);
    });
  });

  describe('remove', () => {
    it('should remove product from wish list', () => {
      component.remove(mockCartEntry);

      expect(wishListFacade.removeEntry).toHaveBeenCalledWith(mockCartEntry);
    });
  });

  describe('getProductInWishList', () => {
    it('should return entry if product is in the wish list', () => {
      const result = component.getProductInWishList(mockProduct, entries);

      expect(result).toEqual(mockCartEntry);
    });
    it('should return "undefined" if product is NOT in the wish list', () => {
      const result = component.getProductInWishList(
        { code: 'not_in_wish_list' },
        entries
      );

      expect(result).toBe(undefined);
    });
  });

  describe('setStockInfo', () => {
    it('should set "hasStock" to true', () => {
      component['setStockInfo'](mockProduct);

      expect(component.hasStock).toBeTruthy();
    });
    it('should set "hasStock" to false', () => {
      component['setStockInfo']({ code: '123' });

      expect(component.hasStock).toBeFalsy();
    });
  });

  describe('UI', () => {
    describe('logged in user', () => {
      it('should show remove from wish list if product is the in wish list', () => {
        fixture.detectChanges();
        expect(el.query(By.css('.button-remove')).nativeElement).toBeDefined();
      });

      it('should show add to wish list if product is NOT the in wish list', () => {
        wishListSubject.next(mockEmptyWishList);
        fixture.detectChanges();
        expect(el.query(By.css('.button-add')).nativeElement).toBeDefined();
      });
    });

    describe('anonymous', () => {
      it('should show "login to add to wish list link"', () => {
        component.userLoggedIn$ = of(false);
        fixture.detectChanges();
        expect(
          el.query(By.css('.button-add-link')).nativeElement
        ).toBeDefined();
      });

      it('should not show anything if there is no stock', () => {
        component.userLoggedIn$ = of(false);
        productSubject.next(mockOutOfStockProduct);
        fixture.detectChanges();
        expect(el.query(By.css('.button-add-link'))).toBeNull();
      });
    });
  });

  describe('getWishListLoading', () => {
    it('should return default value when wish list data is not required', () => {
      spyOn(component as any, 'wishListDataRequired').and.returnValue(
        cold('f', booleanValues)
      );
      spyOn(wishListFacade, 'getWishListLoading').and.stub();

      expect(component['getWishListLoading']()).toBeObservable(
        cold('f', booleanValues)
      );

      expect(wishListFacade.getWishListLoading).not.toHaveBeenCalled();
    });

    it('should return facade data when wish list data is required', () => {
      spyOn(component as any, 'wishListDataRequired').and.returnValue(
        cold('t', booleanValues)
      );
      spyOn(wishListFacade, 'getWishListLoading').and.returnValue(
        cold('t', booleanValues)
      );

      expect(component['getWishListLoading']()).toBeObservable(
        cold('t', booleanValues)
      );

      expect(wishListFacade.getWishListLoading).toHaveBeenCalled();
    });
  });

  describe('getWishListEntries', () => {
    it('should return default value when wish list data is not required', () => {
      spyOn(component as any, 'wishListDataRequired').and.returnValue(
        cold('f', booleanValues)
      );
      spyOn(component as any, 'getWishListEntriesFromFacade').and.stub();

      expect(component['getWishListEntries']()).toBeObservable(
        cold('r', { r: [] })
      );

      expect(component['getWishListEntriesFromFacade']).not.toHaveBeenCalled();
    });

    it('should return wish list data when wish list data is required', () => {
      spyOn(component as any, 'wishListDataRequired').and.returnValue(
        cold('t', booleanValues)
      );
      spyOn(component as any, 'getWishListEntriesFromFacade').and.returnValue(
        cold('e', { e: entries })
      );

      expect(component['getWishListEntries']()).toBeObservable(
        cold('r', { r: entries })
      );
    });
  });

  describe('getWishListEntriesFromFacade', () => {
    it('should return the wishlist entriies from the facade', (done) => {
      wishListSubject.next(mockWishList);
      component['getWishListEntriesFromFacade']().subscribe((wishList) => {
        expect(wishList).toEqual(mockWishList.entries);
        done();
      });
    });
  });

  describe('wishListDataRequired', () => {
    it('should return true when a user is loggd in', () => {
      spyOn(authService, 'isUserLoggedIn').and.returnValue(
        cold('t', booleanValues)
      );
      expect((component as any)['wishListDataRequired']()).toBeObservable(
        cold('(t|)', booleanValues)
      );
    });

    it('should return false when no user is loggd in', () => {
      spyOn(authService, 'isUserLoggedIn').and.returnValue(
        cold('f', booleanValues)
      );
      expect((component as any)['wishListDataRequired']()).toBeObservable(
        cold('f', booleanValues)
      );
    });
    it('should return false then true if a user eventually logs in', () => {
      spyOn(authService, 'isUserLoggedIn').and.returnValue(
        cold('f---t', booleanValues)
      );
      expect((component as any)['wishListDataRequired']()).toBeObservable(
        cold('f---(t|)', booleanValues)
      );
    });
  });
});
