import {NavLink} from '@remix-run/react';
import {Facebook, Instagram} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-black text-white mt-auto">
      <div className="container mx-auto px-4 py-6 md:py-4">
        <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-center">
          {/* Copyright and Developer Info */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center text-center md:text-left">
            <span className="text-sm">© {currentYear} MOKOI.</span>
            <span className="text-sm md:before:content-['•'] md:before:mx-2 md:before:text-brandBeige/50">
              SITE BY{' '}
              <a
                href="https://www.instagram.com/talyawy.dev?igsh=ZmdiMHV1dm13bjE3&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-brandBeige/70 transition-colors underline-offset-4 hover:underline"
              >
                TALYAWY.DEV
              </a>
            </span>
          </div>

          {/* Social Links and Terms */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex justify-center gap-6 md:gap-4 text-white">
              <a
                href="https://www.instagram.com/mokoicollections.eg/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-brandBeige/70 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>

            <div className="flex justify-center md:before:content-['•'] md:before:mx-2 md:before:text-brandBeige/50">
              <a
                href="/pages/policy"
                className="text-sm text-white hover:text-brandBeige/70 transition-colors underline-offset-4 hover:underline"
              >
                Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
