import { useEffect, useRef } from 'react';

/**
 * Performance Tracking Hook & Logger
 * Identifies component re-render frequency, renders per second, and potential infinite loops.
 */
interface RenderStats {
  count: number;
  lastRenderTime: number;
  rendersInLastSecond: number;
  secondStartTime: number;
}

const renderStatsMap = new Map<string, RenderStats>();

export function useRenderTracker(componentName: string, trackedProps?: Record<string, any>) {
  const renderCount = useRef(0);
  const prevProps = useRef(trackedProps);
  renderCount.current += 1;

  useEffect(() => {
    const now = performance.now();
    let stats = renderStatsMap.get(componentName);

    if (!stats) {
      stats = {
        count: 0,
        lastRenderTime: now,
        rendersInLastSecond: 0,
        secondStartTime: now,
      };
      renderStatsMap.set(componentName, stats);
    }

    stats.count += 1;

    // Calculate frequency in the last 1 second
    if (now - stats.secondStartTime > 1000) {
      stats.secondStartTime = now;
      stats.rendersInLastSecond = 1;
    } else {
      stats.rendersInLastSecond += 1;
    }

    stats.lastRenderTime = now;

    // Detect high frequency / potential loop
    if (stats.rendersInLastSecond > 8) {
      console.warn(
        `%c[PERF ALERT] ⚠️ <${componentName} /> rendered ${stats.rendersInLastSecond} times in <1s! (Total: ${stats.count})`,
        'color: #f59e0b; font-weight: bold; background: #78350f20; padding: 2px 6px; border-radius: 4px;'
      );
    } else if (process.env.NODE_ENV !== 'production') {
      console.debug(
        `%c[RenderTrack] 🔄 <${componentName} /> (#${renderCount.current})`,
        'color: #a78bfa; font-size: 11px;'
      );
    }

    // Check changed props if provided
    if (trackedProps && prevProps.current) {
      const changedKeys: string[] = [];
      Object.keys(trackedProps).forEach((key) => {
        if (trackedProps[key] !== prevProps.current?.[key]) {
          changedKeys.push(key);
        }
      });
      if (changedKeys.length > 0 && process.env.NODE_ENV !== 'production') {
        console.debug(`  ↳ Props changed for <${componentName} />:`, changedKeys);
      }
    }
    prevProps.current = trackedProps;
  });
}
