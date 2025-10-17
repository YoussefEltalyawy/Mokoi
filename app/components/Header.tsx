import { Suspense, useEffect, useState } from 'react';
import { Await, NavLink, useAsyncValue, useLocation } from '@remix-run/react';
import { Image, useOptimisticCart } from '@shopify/hydrogen';
import type { HeaderQuery, CartApiQueryFragment } from 'storefrontapi.generated';
import { useAside } from '~/components/Aside';
import { Menu } from 'lucide-react';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  announcmentText?: string;
}

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
  announcmentText,
}: HeaderProps) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setHasScrolled(scrollPosition > 0);
    };

    window.addEventListener('scroll', handleScroll);

    // Initialize scroll position check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-screen z-20">
      {/* Announcement Bar */}
      <div
        className={`w-full bg-black text-white transition-all duration-500 ease-in-out ${hasScrolled ? 'h-0 overflow-hidden' : 'h-10'}`}
      >
        <div className="marquee-container">
          <p className="text-sm font-semibold animate-marquee">
            {announcmentText ?? 'Free shipping for orders above 1400 EGP - IN MOKOI WE TRUST'}
            &nbsp;&nbsp;&nbsp;&nbsp; {announcmentText ?? 'Free shipping for orders above 1400 EGP - IN MOKOI WE TRUST'}
            &nbsp;&nbsp;&nbsp;&nbsp; {announcmentText ?? 'Free shipping for orders above 1400 EGP - IN MOKOI WE TRUST'}
            &nbsp;&nbsp;&nbsp;&nbsp;
          </p>
        </div>
      </div>

      <header className="relative flex items-center justify-between bg-white text-black w-full transition-colors duration-300 h-16">
        {/* Left section - Hamburger and Text Logo */}
        <div className="flex items-center px-4 py-2 flex-1">
          <HeaderMenuMobileToggle />
          <NavLink prefetch="intent" to="/" end>
            <Image
              src="/mokoi-text-logo-black.png"
              className="h-8 lg:h-10 w-auto object-contain"
              sizes="(min-width: 1024px) 160px, 120px"
              width={80}
              height={40}
              alt="Logo"
            />
          </NavLink>
        </div>

        {/* Center section - Symbol Logo */}
        <div className="flex items-center justify-center flex-1">
          <NavLink prefetch="intent" to="/" end>
            <Image
              src="/symbol-black.png"
              className="h-8 lg:h-10 w-auto object-contain"
              sizes="(min-width: 1024px) 120px, 80px"
              width={40}
              height={40}
              alt="Symbol"
            />
          </NavLink>
        </div>

        {/* Right section - Search and Cart */}
        <div className="flex items-center justify-end gap-4 px-4 py-2 flex-1">
          <SearchToggle />
          <CartToggle cart={cart} />
        </div>
      </header>
    </div>
  );
}

function HeaderMenuMobileToggle() {
  const { open } = useAside();
  return (
    <button className="mr-2 text-black" onClick={() => open('mobile')}>
      <Menu className="w-5 h-5 lg:w-7 lg:h-7" />
    </button>
  );
}

function SearchToggle() {
  const { open } = useAside();
  return (
    <button className="text-black font-semibold" onClick={() => open('search')}>
      SEARCH
    </button>
  );
}

function CartToggle({ cart }: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBadge({ count }: { count: number | null }) {
  const { open } = useAside();
  return (
    <button
      className="text-black font-semibold whitespace-nowrap"
      onClick={() => open('cart')}
    >
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
  const { close } = useAside();
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
