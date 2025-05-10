import {CartForm} from '@shopify/hydrogen';
import {Trash2, X} from 'lucide-react';


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
        className={` text-gray-400 text-center hover:text-gray-500 transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </CartForm>
  );
}

export default CartLineRemoveButton;
