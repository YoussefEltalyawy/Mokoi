import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

type AsideType = 'search' | 'cart' | 'mobile' | 'closed';
type AsideContextValue = {
  type: AsideType;
  open: (mode: AsideType) => void;
  close: () => void;
};

const AsideContext = createContext<AsideContextValue | null>(null);

/**
 * A side bar component with Overlay
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 */
export function Aside({
  children,
  heading,
  type,
}: {
  children?: React.ReactNode;
  type: AsideType;
  heading: React.ReactNode;
}) {
  // Use the context directly instead of through the useAside hook
  const context = useContext(AsideContext);

  if (!context) {
    throw new Error('Aside component must be used within an AsideProvider');
  }

  const {type: activeType, close} = context;
  const expanded = type === activeType;

  // Use state to track animation states
  const [isVisible, setIsVisible] = useState(false);
  // Add a state to control transform animation separately
  const [isSlideIn, setIsSlideIn] = useState(false);

  // Handle open/close animations
  useEffect(() => {
    if (expanded) {
      // First make component visible with initial position
      setIsVisible(true);

      // Then trigger the slide-in animation after a small delay
      // This ensures the browser has time to render the initial state
      const timer = setTimeout(() => {
        setIsSlideIn(true);
      }, 50);

      return () => clearTimeout(timer);
    } else {
      // When closing, first slide out
      setIsSlideIn(false);

      // Then remove from DOM after animation completes
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300); // Match this with your transition duration
      return () => clearTimeout(timer);
    }
  }, [expanded]);

  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      document.addEventListener(
        'keydown',
        function handler(event: KeyboardEvent) {
          if (event.key === 'Escape') {
            close();
          }
        },
        {signal: abortController.signal},
      );
    }
    return () => abortController.abort();
  }, [close, expanded]);

  // Don't render anything if not visible (after animation out completes)
  if (!isVisible && !expanded) return null;

  return (
    <div
      aria-modal
      className={`fixed inset-0 z-[9999] transition-opacity duration-300 ${
        expanded ? 'opacity-100' : 'opacity-0'
      }`}
      role="dialog"
    >
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/40 backdrop-blur-sm w-full h-full border-0 transition-opacity duration-300"
        onClick={close}
        aria-label="Close panel"
      />

      {/* Aside panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col transition-transform duration-300 ease-out ${
          isSlideIn ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold uppercase tracking-wide">
            {heading}
          </h3>
          <button
            className="p-2 -mr-2 text-gray-500 hover:text-black transition-colors"
            onClick={close}
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </header>

        <main className="flex-1 flex flex-col h-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

export const AsideProvider = function AsideProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [type, setType] = useState<AsideType>('closed');

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}

// For backwards compatibility
Aside.Provider = AsideProvider;
