import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CHECKOUT_PAYMENT_TYPE_NORMALIZER } from '@spartacus/checkout/b2b/core';
import {
  Cart,
  ConverterService,
  Occ,
  OccConfig,
  OccEndpoints,
} from '@spartacus/core';
import { take } from 'rxjs/operators';
import { OccCheckoutPaymentTypeAdapter } from './occ-checkout-payment-type.adapter';

const MockOccModuleConfig: OccConfig = {
  backend: {
    occ: {
      baseUrl: '',
      prefix: '',
      endpoints: {
        setCartPaymentType:
          'users/${userId}/carts/${cartId}/paymenttype?fields=DEFAULT',
        paymentTypes: 'paymenttypes',
      } as OccEndpoints,
    },
  },
  context: {
    baseSite: [''],
  },
};
const userId = '123';
const cartId = '456';
const cartData: Cart = {
  store: 'electronics',
  guid: '1212121',
};

describe('OccCheckoutPaymentTypeAdapter', () => {
  let service: OccCheckoutPaymentTypeAdapter;
  let httpMock: HttpTestingController;
  let converter: ConverterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        OccCheckoutPaymentTypeAdapter,
        { provide: OccConfig, useValue: MockOccModuleConfig },
      ],
    });
    service = TestBed.inject(
      OccCheckoutPaymentTypeAdapter as Type<OccCheckoutPaymentTypeAdapter>
    );
    httpMock = TestBed.inject(
      HttpTestingController as Type<HttpTestingController>
    );
    converter = TestBed.inject(ConverterService as Type<ConverterService>);

    spyOn(converter, 'pipeableMany').and.callThrough();
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('loadPaymentypes', () => {
    it('should return paymentTypes', (done) => {
      const paymentTypesList: Occ.PaymentTypeList = {
        paymentTypes: [
          {
            code: 'card',
            displayName: 'card',
          },
          {
            code: 'account',
            displayName: 'account',
          },
        ],
      };

      service
        .getPaymentTypes()
        .pipe(take(1))
        .subscribe((result) => {
          expect(result).toEqual(paymentTypesList.paymentTypes);
          done();
        });

      const mockReq = httpMock.expectOne((req) => {
        return req.method === 'GET' && req.url === 'paymenttypes';
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(paymentTypesList);
    });

    it('should use converter', () => {
      service.getPaymentTypes().subscribe();
      httpMock.expectOne('paymenttypes').flush({});
      expect(converter.pipeableMany).toHaveBeenCalledWith(
        CHECKOUT_PAYMENT_TYPE_NORMALIZER
      );
    });
  });

  describe('setPaymentType', () => {
    it('should set payment type to cart', (done) => {
      const paymentType = 'CARD';

      service
        .setPaymentType(userId, cartId, paymentType)
        .pipe(take(1))
        .subscribe((result) => {
          expect(result).toEqual(cartData);
          done();
        });

      const mockReq = httpMock.expectOne((req) => {
        return (
          req.method === 'PUT' &&
          req.url ===
            `users/${userId}/carts/${cartId}/paymenttype?fields=DEFAULT&paymentType=${paymentType}`
        );
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(cartData);
    });
  });

  describe('setPaymentType (set po number to cart)', () => {
    it('should set payment type to cart', (done) => {
      const paymentType = 'CARD';
      const purchaseOrderNumber = 'test-number';

      service
        .setPaymentType(userId, cartId, paymentType, purchaseOrderNumber)
        .pipe(take(1))
        .subscribe((result) => {
          expect(result).toEqual(cartData);
          done();
        });

      const mockReq = httpMock.expectOne((req) => {
        return (
          req.method === 'PUT' &&
          req.url ===
            `users/${userId}/carts/${cartId}/paymenttype?fields=DEFAULT&paymentType=${paymentType}&purchaseOrderNumber=${purchaseOrderNumber}`
        );
      });

      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(cartData);
    });
  });
});
