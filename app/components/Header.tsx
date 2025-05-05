import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from '@remix-run/react';
import {Image, useOptimisticCart} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {GiHamburgerMenu} from 'react-icons/gi';
import { Menu } from 'lucide-react';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {menu} = header;
  return (
    <header className="flex items-center justify-between p-4 bg-black text-white sticky top-0 z-10 h-16">
      <div className="flex items-center">
        <HeaderMenuMobileToggle />
        <NavLink prefetch="intent" to="/" end>
          <Image
            src="/mokoi-text-logo.png"
            className="h-4 w-4"
            alt="Logo"
          />
        </NavLink>
      </div>
      <div className="flex items-center gap-4">
        <SearchToggle />
        <CartToggle cart={cart} />
      </div>
    </header>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button className="mr-2 text-white" onClick={() => open('mobile')}>
      {/* <GiHamburgerMenu className="h-6 w-6" /> */}
      <Menu className="w-5 h-5 lg:w-7 lg:h-7" />
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button className="text-white font-semibold" onClick={() => open('search')}>
      SEARCH
    </button>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  return (
    <button className="text-white font-semibold" onClick={() => open('cart')}>
      CART ({count === null ? 0 : count})
    </button>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const {close} = useAside();
  return (
    <nav className="flex flex-col gap-4 p-4">
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            key={item.id}
            to={url}
            prefetch="intent"
            onClick={close}
            className="text-black"
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};
