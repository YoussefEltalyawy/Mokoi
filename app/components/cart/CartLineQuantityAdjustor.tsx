import type {OptimisticCartLine} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import CartLineUpdateButton from './CartLineUpdateButton';
import CartLineRemoveButton from './CartLineRemoveButton';
import {Minus, Plus} from 'lucide-react';

type CartLine = OptimisticCartLine<CartApiQueryFragment>;

type CartLineQuantityAdjustorProps = {
  line: CartLine;
};

function CartLineQuantityAdjustor({line}: CartLineQuantityAdjustorProps) {
  if (!line || typeof line.quantity === 'undefined') {
    return null;
  }
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number(Math.round(quantity + 1));
  return (
    <div className="flex justify-center items-center gap-3">
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button
          disabled={quantity <= 1}
          className={`w-8 h-8 flex items-center justify-center rounded-md border transition-all duration-300 ${
            quantity <= 1
              ? 'text-gray-300 border-gray-200 cursor-not-allowed'
              : 'border-black/20 hover:border-black hover:bg-black/5 text-black/70 hover:text-black'
          }`}
          aria-label="Decrease quantity"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </CartLineUpdateButton>
      <span className="w-8 text-center font-medium">{quantity}</span>
      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-md border border-black/20 transition-all duration-300 hover:border-black hover:bg-black/5 text-black/70 hover:text-black"
          aria-label="Increase quantity"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </CartLineUpdateButton>
      <CartLineRemoveButton
        lineIds={[lineId]}
        disabled={isOptimistic === true}
      />
    </div>
  );
}

export default CartLineQuantityAdjustor;
