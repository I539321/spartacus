import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import * as NgrxStore from '@ngrx/store';
import { Store, StoreModule } from '@ngrx/store';
import { WindowRef } from '@spartacus/core';
import { Observable, of } from 'rxjs';
import { PageType } from '../../model/cms.model';
import { UrlCommands } from '../configurable-routes';
import { SemanticPathService } from '../configurable-routes/url-translation/semantic-path.service';
import { PageContext } from '../models/page-context.model';
import { RoutingActions } from '../store/actions/index';
import { RouterState } from '../store/routing-state';
import { RoutingSelector } from '../store/selectors/index';
import { RoutingParamsService } from './routing-params.service';
import { RoutingService } from './routing.service';

class MockSemanticPathService {
  transform(_commands: UrlCommands): any[] {
    return [];
  }
  get(_routeName: string): string {
    return '';
  }
}
class MockRoutingParamsService {
  getParams(): Observable<{ [key: string]: string }> {
    return of();
  }
}

class MockLocation implements Partial<MockLocation> {
  back = jest.fn();
  forward = jest.fn();
}

describe('RoutingService', () => {
  let store: Store<RouterState>;
  let service: RoutingService;
  let winRef: WindowRef;
  let urlService: SemanticPathService;
  let routingParamsService: RoutingParamsService;
  let router: Router;
  let location: Location;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}), RouterTestingModule],
      providers: [
        RoutingService,
        WindowRef,
        { provide: SemanticPathService, useClass: MockSemanticPathService },
        { provide: RoutingParamsService, useClass: MockRoutingParamsService },
        { provide: Location, useClass: MockLocation },
      ],
    });

    store = TestBed.inject(Store);
    service = TestBed.inject(RoutingService);
    winRef = TestBed.inject(WindowRef);
    urlService = TestBed.inject(SemanticPathService);
    routingParamsService = TestBed.inject(RoutingParamsService);
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    jest.spyOn(store, 'dispatch').mockImplementation(() => {});
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('go', () => {
    it('should return Promise for the Angular navigation', () => {
      const navigationPromise = Promise.resolve(true);
      const queryParams = { test: true };
      jest.spyOn(urlService, 'transform').mockReturnValue(['url']);
      jest.spyOn(router, 'navigate').mockReturnValue(navigationPromise);
      const result = service.go(['url'], { queryParams });
      expect(router.navigate).toHaveBeenCalledWith(['url'], { queryParams });
      expect(result).toBe(navigationPromise);
    });

    it('should call url service with given array of commands', () => {
      const commands = ['testString', { cxRoute: 'testRoute' }];
      const resultPath = ['testString', 'testPath'];
      jest.spyOn(urlService, 'transform').mockReturnValue(resultPath);
      service.go(commands);
      expect(urlService.transform).toHaveBeenCalledWith(commands);
    });
  });

  describe('goByUrl', () => {
    it('should return Promise for the Angular navigation', () => {
      const navigationPromise = Promise.resolve(true);
      const extras = { skipLocationChange: true };
      jest.spyOn(router, 'navigateByUrl').mockReturnValue(navigationPromise);
      const result = service.goByUrl('url', extras);
      expect(router.navigateByUrl).toHaveBeenCalledWith('url', extras);
      expect(result).toBe(navigationPromise);
    });
  });

  describe('getUrl', () => {
    it('should resolve the relative url from the urlCommands', () => {
      jest.spyOn(urlService, 'transform').mockReturnValue(['product', '123']);
      const url = service.getUrl({
        cxRoute: 'product',
        params: { code: '123' },
      });
      expect(url).toEqual('/product/123');
    });

    it('should resolve the relative url from the urlCommands and NavigationExtras', () => {
      jest.spyOn(urlService, 'transform').mockReturnValue([
        'category',
        'SLR_CAMERAS',
      ]);

      const queryParams = { sortBy: 'price-desc' };
      const url = service.getUrl(
        { cxRoute: 'category', params: { code: 'SLR_CAMERAS' } },
        { queryParams }
      );
      expect(url).toEqual('/category/SLR_CAMERAS?sortBy=price-desc');
    });
  });

  describe('getFullUrl', () => {
    it('should resolve the absolute url from the urlCommands', () => {
      jest.spyOn(urlService, 'transform').mockReturnValue(['product', '123']);
      const url = service.getFullUrl({
        cxRoute: 'product',
        params: { code: '123' },
      });
      expect(url).toEqual(`${winRef.document.location.origin}/product/123`);
    });
  });

  describe('back', () => {
    it('should go to homepage on back action when referer is not from the app', () => {
      jest.spyOn(document, 'referrer', 'get').mockReturnValue(
        'http://foobar.com'
      );
      jest.spyOn(service, 'go').mockImplementation(() => {});
      jest.spyOn(urlService, 'transform').mockImplementation((x) => x);
      service.back();
      expect(service.go).toHaveBeenCalledWith(['/']);
    });

    it('should call Location.back', () => {
      service.back();
      expect(location.back).toHaveBeenCalled();
    });
  });

  describe('forward', () => {
    it('should call Location.forward', () => {
      service.forward();
      expect(location.forward).toHaveBeenCalled();
    });
  });

  it('should expose whole router state', () => {
    const mockRouterState = jest.fn().mockReturnValue(() => of({}));
    jest.spyOn(NgrxStore, 'select').mockReturnValue(mockRouterState);

    let routerState: any;
    service.getRouterState().subscribe((state) => (routerState = state));
    expect(mockRouterState).toHaveBeenCalledWith(
      RoutingSelector.getRouterState
    );
    expect(routerState).toEqual({});
  });

  it('should return only page context from the state', () => {
    const pageContext: PageContext = {
      id: 'homepage',
      type: PageType.CATALOG_PAGE,
    };
    const mockRouterState = jest.fn().mockReturnValue(() => of(pageContext));
    jest.spyOn(NgrxStore, 'select').mockReturnValue(mockRouterState);

    let result: PageContext;
    service
      .getPageContext()
      .subscribe((value) => (result = value))
      .unsubscribe();

    expect(result).toEqual(pageContext);
  });

  it('getNextPageContext should return nextPageContext state', () => {
    const pageContext: PageContext = {
      id: 'homepage',
      type: PageType.CATALOG_PAGE,
    };
    const mockRouterState = jest.fn().mockReturnValue(() => of(pageContext));
    jest.spyOn(NgrxStore, 'select').mockReturnValue(mockRouterState);

    let result: PageContext;
    service
      .getNextPageContext()
      .subscribe((value) => (result = value))
      .unsubscribe();

    expect(result).toEqual(pageContext);
    expect(NgrxStore.select as any).toHaveBeenCalledWith(
      RoutingSelector.getNextPageContext
    );
  });

  it('isNavigating should return isNavigating state', () => {
    const isNavigating = true;
    const mockRouterState = jest.fn().mockReturnValue(() => of(isNavigating));
    jest.spyOn(NgrxStore, 'select').mockReturnValue(mockRouterState);

    let result: boolean;
    service
      .isNavigating()
      .subscribe((value) => (result = value))
      .unsubscribe();

    expect(result).toEqual(isNavigating);
    expect(NgrxStore.select as any).toHaveBeenCalledWith(
      RoutingSelector.isNavigating
    );
  });

  it('should delegate getParams() to RoutingParamsService', () => {
    const spy = jest.spyOn(routingParamsService, 'getParams');
    service.getParams();
    expect(spy).toHaveBeenCalled();
  });

  describe('changeNextPageContext', () => {
    it('should dispatch ChangeNextPageContext action', () => {
      const context: PageContext = { id: 'test ' };
      service.changeNextPageContext(context);
      expect(store.dispatch).toHaveBeenCalledWith(
        new RoutingActions.ChangeNextPageContext(context)
      );
    });
  });
});
