import { Address } from './address.model';
import {
  DeliveryOrderEntryGroup,
  PaymentDetails,
  Principal,
  PromotionResult,
  Voucher,
} from './cart.model';
import { PaginationModel, SortModel } from './misc.model';
import { B2BUser, CostCenter } from './org-unit.model';
import { PointOfService } from './point-of-service.model';
import { Price, Product } from './product.model';

/**
 * @deprecated since 4.1 - use order lib instead
 */
export interface DeliveryMode {
  code?: string;
  deliveryCost?: Price;
  description?: string;
  name?: string;
}

/**
 * @deprecated since 4.1 - use order lib instead
 */
export interface OrderEntry {
  orderCode?: string;
  basePrice?: Price;
  deliveryMode?: DeliveryMode;
  deliveryPointOfService?: PointOfService;
  entryNumber?: number;
  product?: Product;
  quantity?: number;
  totalPrice?: Price;
  updateable?: boolean;
  returnedItemsPrice?: Price;
  returnableQuantity?: number;
  cancelledItemsPrice?: Price;
  cancellableQuantity?: number;
  promotions?: PromotionResult[];
}

/**
 * @deprecated since 4.1 - use order lib instead
 */
export interface CancelOrReturnRequestEntryInput {
  orderEntryNumber?: number;
  quantity?: number;
}

/**
 * @deprecated since 4.1 - use order lib instead
 */
export interface ReturnRequestEntryInputList {
  orderCode?: string;
  returnRequestEntryInputs?: CancelOrReturnRequestEntryInput[];
}

/**
 * @deprecated since 4.1 - use order lib instead
 */
export interface CancellationRequestEntryInputList {
  cancellationRequestEntryInputs?: CancelOrReturnRequestEntryInput[];
}

/**
 * @deprecated since 4.1 - use order lib instead
 */
export interface ReturnRequestEntry {
  orderEntry?: OrderEntry;
  expectedQuantity?: number;
  refundAmount?: Price;
}

/**
 * @deprecated since 4.1 - use order lib instead
 */
export interface ReturnRequest {
  cancellable?: boolean;
  code?: string;
  creationTime?: Date;
  deliveryCost?: Price;
  order?: Order;
  refundDeliveryCost?: boolean;
  returnEntries?: ReturnRequestEntry[];
  returnLabelDownloadUrl?: string;
  rma?: string;
  status?: string;
  subTotal?: Price;
  totalPrice?: Price;
}

/**
 * @deprecated since 4.1 - use order lib instead
 */
export interface ReturnRequestList {
  returnRequests?: ReturnRequest[];
  pagination?: PaginationModel;
  sorts?: SortModel[];
}

/**
 * @deprecated since 4.1 - use order lib instead
 */
export interface ReturnRequestModification {
  status?: string;
}

/**
 * @deprecated since 4.1 - use order lib instead
 */
export interface PickupOrderEntryGroup {
  deliveryPointOfService?: PointOfService;
  distance?: number;
  entries?: OrderEntry[];
  quantity?: number;
  totalPriceWithTax?: Price;
}

/**
 * @deprecated since 4.1 - use order lib instead
 */
export interface PromotionOrderEntryConsumed {
  adjustedUnitPrice?: number;
  code?: string;
  orderEntryNumber?: number;
  quantity?: number;
}

/**
 * @deprecated since 4.1 - use order lib instead
 */
export interface ConsignmentEntry {
  orderEntry?: OrderEntry;
  quantity?: number;
  shippedQuantity?: number;
}

/**
 * @deprecated since 4.1 - use order lib instead
 */
export interface Consignment {
  code?: string;
  deliveryPointOfService?: PointOfService;
  entries?: ConsignmentEntry[];
  shippingAddress?: Address;
  status?: string;
  statusDate?: Date;
  trackingID?: string;
}

/**
 * @deprecated since 4.1 - use order lib instead
 */
export interface OrderHistory {
  code?: string;
  guid?: string;
  placed?: Date;
  status?: string;
  statusDisplay?: string;
  total?: Price;
}

/**
 * @deprecated since 4.1 - use order lib instead
 */
export interface OrderHistoryList {
  orders?: OrderHistory[];
  pagination?: PaginationModel;
  sorts?: SortModel[];
}

/**
 * @deprecated since 4.1 - use order lib instead
 */
export interface Order {
  appliedOrderPromotions?: PromotionResult[];
  appliedProductPromotions?: PromotionResult[];
  appliedVouchers?: Voucher[];
  calculated?: boolean;
  code?: string;
  consignments?: Consignment[];
  costCenter?: CostCenter;
  created?: Date;
  deliveryAddress?: Address;
  deliveryCost?: Price;
  deliveryItemsQuantity?: number;
  deliveryMode?: DeliveryMode;
  deliveryOrderGroups?: DeliveryOrderEntryGroup[];
  deliveryStatus?: string;
  deliveryStatusDisplay?: string;
  entries?: OrderEntry[];
  guestCustomer?: boolean;
  guid?: string;
  net?: boolean;
  orderDiscounts?: Price;
  orgCustomer?: B2BUser;
  paymentInfo?: PaymentDetails;
  pickupItemsQuantity?: number;
  pickupOrderGroups?: PickupOrderEntryGroup[];
  productDiscounts?: Price;
  purchaseOrderNumber?: string;
  site?: string;
  status?: string;
  statusDisplay?: string;
  store?: string;
  subTotal?: Price;
  totalDiscounts?: Price;
  totalItems?: number;
  totalPrice?: Price;
  totalPriceWithTax?: Price;
  totalTax?: Price;
  unconsignedEntries?: OrderEntry[];
  user?: Principal;
  returnable?: boolean;
  cancellable?: boolean;
}
