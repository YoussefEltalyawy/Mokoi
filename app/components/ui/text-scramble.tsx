'use client';

import * as React from 'react';
import {useEffect, useRef, useState} from 'react';

interface TextScrambleProps {
  children: string;
  className?: string;
  as?: React.ElementType;
  speed?: number;
  tick?: number;
  scramble?: boolean;
  trigger?: boolean;
  characterSet?: string;
  duration?: number;
  onScrambleComplete?: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

const defaultCharacterSet =
  '!<>-_\\/[]{}—=+*^?#abcdefghijklmnopqrstuvwxyz0123456789';

export function TextScramble({
  children,
  className,
  as: Component = 'div',
  speed = 0.3,
  tick = 1,
  scramble = true,
  trigger = true,
  characterSet = defaultCharacterSet,
  duration = 2,
  onScrambleComplete,
  onHoverStart,
  onHoverEnd,
}: TextScrambleProps) {
  const [displayText, setDisplayText] = useState('');
  const [isScrambling, setIsScrambling] = useState(false);
  const targetText = useRef(children);
  const queue = useRef<number[]>([]);
  const frameRequest = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    targetText.current = children;
    if (scramble && trigger && !isScrambling) {
      setIsScrambling(true);
      startScrambling();
    }
  }, [children, scramble, trigger]);

  const startScrambling = () => {
    setDisplayText('');
    queue.current = [];
    startTime.current = null;

    const originalText = targetText.current;
    const originalLength = originalText.length;
    const chars: string[] = new Array(originalLength).fill('');

    for (let i = 0; i < originalLength; i++) {
      queue.current.push(Math.random() * duration * 60);
    }

    const update = (time: number) => {
      if (startTime.current === null) {
        startTime.current = time;
      }

      const elapsed = time - startTime.current;
      const progress = Math.min(1, elapsed / (duration * 1000));

      let completeCount = 0;
      for (let i = 0; i < originalLength; i++) {
        if (originalText[i] === ' ') {
          chars[i] = ' ';
          completeCount++;
          continue;
        }

        if (queue.current[i] <= elapsed * speed) {
          chars[i] = originalText[i];
          completeCount++;
        } else if (Math.random() < 0.1) {
          chars[i] =
            characterSet[Math.floor(Math.random() * characterSet.length)];
        }
      }

      setDisplayText(chars.join(''));

      if (completeCount < originalLength) {
        frameRequest.current = requestAnimationFrame(update);
      } else {
        setIsScrambling(false);
        if (onScrambleComplete) {
          onScrambleComplete();
        }
      }
    };

    frameRequest.current = requestAnimationFrame(update);

    return () => {
      if (frameRequest.current !== null) {
        cancelAnimationFrame(frameRequest.current);
      }
    };
  };

  return (
    <Component
      className={className}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      {displayText || children}
    </Component>
  );
}
