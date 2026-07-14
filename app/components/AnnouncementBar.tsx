import { useEffect, useState } from 'react';

// Sale end date: exactly 3 days from July 14 2026 14:32:25 UTC+3
const SALE_END_DATE = new Date('2026-07-17T14:32:25+03:00').getTime();

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft {
  const now = Date.now();
  const diff = Math.max(0, SALE_END_DATE - now);
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function TimeBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="sale-time-block">
      <span className="sale-time-digits">{value}</span>
      <span className="sale-time-label">{label}</span>
    </div>
  );
}

export function SaleCountdownBar({ hasScrolled }: { hasScrolled: boolean }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  const isExpired =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  return (
    <div className="sale-countdown-bar overflow-hidden">
      <div className="sale-countdown-inner">
        {/* Left: sale copy */}
        <div className="sale-copy">
          <span className="sale-tag">SALE</span>
          <span className="sale-copy-text">
            Up to <strong>30% off</strong>
          </span>
        </div>

        {/* Divider */}
        <div className="sale-divider" aria-hidden="true" />

        {/* Countdown */}
        {isExpired ? (
          <p className="sale-expired">Sale has ended</p>
        ) : (
          <div className="sale-timer-wrap">
            <span className="sale-ends-label">Sale ends in</span>
            <div className="sale-timer">
              {timeLeft.days > 0 && (
                <>
                  <TimeBlock value={pad(timeLeft.days)} label="days" />
                  <span className="sale-sep">:</span>
                </>
              )}
              <TimeBlock value={pad(timeLeft.hours)} label="hrs" />
              <span className="sale-sep">:</span>
              <TimeBlock value={pad(timeLeft.minutes)} label="min" />
              <span className="sale-sep">:</span>
              <TimeBlock value={pad(timeLeft.seconds)} label="sec" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
