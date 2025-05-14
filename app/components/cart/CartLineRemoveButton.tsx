import {CartForm} from '@shopify/hydrogen';
import {Trash2} from 'lucide-react';

type CartLineRemoveButtonProps = {
  lineIds: string[];
  disabled: boolean;
};

function CartLineRemoveButton({lineIds, disabled}: CartLineRemoveButtonProps) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        disabled={disabled}
        className={`flex items-center justify-center w-8 h-8 rounded-md border border-red-200 text-red-400 hover:text-red-500 hover:border-red-400 hover:bg-red-50 transition-all duration-300 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-label="Remove item from cart"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </CartForm>
  );
}

export default CartLineRemoveButton;
