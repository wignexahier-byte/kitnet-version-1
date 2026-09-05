import React, { useEffect, useState, useRef, memo } from 'react';
import { formatCurrency } from '../utils/formatters';

interface AnimatedNumberProps {
  value: number;
  format?: 'currency' | 'number' | 'percent';
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  animateOnMount?: boolean;
}

export const AnimatedNumberComponent: React.FC<AnimatedNumberProps> = ({
  value,
  format = 'number',
  duration = 800,
  className = '',
  prefix = '',
  suffix = '',
  animateOnMount = true,
}) => {
  // Start from 0 on mount if animateOnMount is true and value is non-zero
  const [displayValue, setDisplayValue] = useState<number>(() => {
    return animateOnMount && value !== 0 ? 0 : value;
  });
  const prevValueRef = useRef<number>(animateOnMount && value !== 0 ? 0 : value);
  const isFirstMount = useRef<boolean>(true);

  useEffect(() => {
    const startValue = isFirstMount.current
      ? (animateOnMount ? 0 : value)
      : prevValueRef.current;
    
    isFirstMount.current = false;
    const endValue = value;

    if (startValue === endValue) {
      setDisplayValue(endValue);
      prevValueRef.current = endValue;
      return;
    }

    let startTimestamp: number | null = null;
    let animId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Silky smooth Ease-out Quart curve
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const current = startValue + (endValue - startValue) * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
        prevValueRef.current = endValue;
      }
    };

    animId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(animId);
      prevValueRef.current = displayValue;
    };
  }, [value, duration, animateOnMount]);

  let formattedText = '';
  if (format === 'currency') {
    formattedText = formatCurrency(displayValue);
  } else if (format === 'percent') {
    formattedText = `${Math.round(displayValue)}%`;
  } else {
    formattedText = Math.round(displayValue).toLocaleString('pt-BR');
  }

  return (
    <span className={className}>
      {prefix}
      {formattedText}
      {suffix}
    </span>
  );
};

export const AnimatedNumber = memo(AnimatedNumberComponent);


