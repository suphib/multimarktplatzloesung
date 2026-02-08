import { useState, useEffect, useRef } from 'react';

interface Props {
  zielwert: number;
  suffix?: string;
  prefix?: string;
  dauer?: number;
}

export function AnimatedCounter({ zielwert, suffix = '', prefix = '', dauer = 2000 }: Props) {
  const [wert, setWert] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const isDecimal = zielwert % 1 !== 0;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / dauer, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * zielwert;

      setWert(isDecimal ? Math.round(current * 10) / 10 : Math.round(current));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [zielwert, dauer]);

  const display = zielwert % 1 !== 0 ? wert.toFixed(1) : wert.toString();

  return (
    <span ref={ref}>
      {prefix}{display}{suffix}
    </span>
  );
}

export default AnimatedCounter;
