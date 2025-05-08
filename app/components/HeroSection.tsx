'use client';

import {useState, useEffect} from 'react';
import {Link} from '@remix-run/react';
import {TextScramble} from '~/components/ui/text-scramble';

export function HeroSection() {
  const [triggerWe, setTriggerWe] = useState(true);
  const [triggerIn, setTriggerIn] = useState(false);
  const [triggerTrust, setTriggerTrust] = useState(false);

  // Staggered animation sequence
  useEffect(() => {
    const animationLoop = () => {
      // Reset all
      setTriggerWe(false);
      setTriggerIn(false);
      setTriggerTrust(false);

      // Staggered sequence with longer delays
      setTimeout(() => setTriggerIn(true), 300);
      setTimeout(() => setTriggerWe(true), 1000);
      setTimeout(() => setTriggerTrust(true), 1700);

      // Complete cycle in 6 seconds (slower pace)
      setTimeout(animationLoop, 6000);
    };

    animationLoop();
    return () => clearTimeout(animationLoop as unknown as number);
  }, []);

  return (
    <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Hero Image */}
      <img
        src="/mokoi-hero.webp"
        alt="Hero background"
        className="w-screen h-full object-cover block absolute inset-0 z-0"
      />

      {/* Diagonal overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-tr from-black/70 via-black/40 to-black/20"></div>

      {/* Content Overlay - Adjusted for horizontal layout on desktop */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end items-start px-8 pb-8 md:pb-12">
        <div className="max-w-5xl w-full flex flex-col md:flex-row md:justify-between md:items-center">
          {/* Main animated text */}
          <h1 className="text-2xl md:text-4xl font-semibold text-white flex flex-wrap items-center leading-tight">
            <TextScramble
              className="mr-3 uppercase drop-shadow-lg"
              trigger={triggerIn}
              speed={0.3}
              duration={2}
              characterSet="!?#*&^%$"
            >
              IN
            </TextScramble>

            <span className="uppercase drop-shadow-lg italic">MOKOI</span>

            <TextScramble
              className="mr-3 ml-3 uppercase drop-shadow-lg"
              trigger={triggerWe}
              speed={0.3}
              duration={2}
              characterSet="!?#*&^%$"
            >
              WE
            </TextScramble>

            <TextScramble
              className="uppercase drop-shadow-lg"
              trigger={triggerTrust}
              speed={0.3}
              duration={2}
              characterSet="!?#*&^%$"
            >
              TRUST&quot;
            </TextScramble>
          </h1>

          {/* Simplified CTA Button - Smaller size */}
          <Link
            to="/collections/all"
            className="inline-flex items-center px-6 py-2 text-sm md:text-base font-bold bg-white hover:bg-white/80 transition-colors duration-300 uppercase tracking-wider rounded-lg mt-2 md:mt-0"
          >
            Shop Now
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
