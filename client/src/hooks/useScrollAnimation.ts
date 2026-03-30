// client/src/hooks/useScrollAnimation.ts
import { useEffect, useRef, useState, useCallback } from 'react';

interface ScrollAnimationOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

/**
 * Hook that detects when an element scrolls into view using IntersectionObserver.
 * Returns a ref to attach and a boolean indicating visibility.
 */
export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
    const { threshold = 0.15, rootMargin = '0px 0px -50px 0px', triggerOnce = true } = options;
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (triggerOnce) {
                        observer.unobserve(element);
                    }
                } else if (!triggerOnce) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [threshold, rootMargin, triggerOnce]);

    return { ref, isVisible };
}

/**
 * Animated counter hook — counts from 0 to target when triggered.
 */
export function useAnimatedCounter(target: string, isActive: boolean, duration: number = 1500) {
    const [display, setDisplay] = useState('0');

    useEffect(() => {
        if (!isActive) return;

        // Extract numeric part and suffix (e.g., "50,000+" → 50000 and "+")
        const cleaned = target.replace(/,/g, '');
        const match = cleaned.match(/^([\d.]+)(.*)$/);
        if (!match) {
            setDisplay(target);
            return;
        }

        const numericTarget = parseFloat(match[1]);
        const suffix = match[2] || '';
        const hasCommas = target.includes(',');
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(numericTarget * eased);

            let formatted: string;
            if (hasCommas) {
                formatted = current.toLocaleString('en-IN') + suffix;
            } else if (target.includes('%')) {
                formatted = current + suffix;
            } else {
                formatted = current + suffix;
            }

            setDisplay(formatted);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [isActive, target, duration]);

    return display;
}
