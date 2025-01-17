import { CartItem } from "./cart-item";

export class OrderItem {
  imageUrl: string = '';
  unitPrice: number = 0;
  quantity: number = 0;
  productId: number = 0

  constructor(cartItem: CartItem) {
    this.imageUrl = cartItem.imageUrl
    this.unitPrice = cartItem.unitPrice
    this.quantity = cartItem.quantity
    this.productId = cartItem.id
  }
}
