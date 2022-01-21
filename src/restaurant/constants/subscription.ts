import { Order } from './../entities/order.entity';
export const NEW_PENDING_ORDER = 'NEW_PENDING_ORDER';
export const NEW_COOKED_ORDER = 'NEW_COOKED_ORDER';
export type NewPendingOrderPayload = {
  order: Order;
};
export type NewCookedOrder = {
  order: Order;
};
