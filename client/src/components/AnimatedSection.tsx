// client/src/components/AnimatedSection.tsx
import React from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

type AnimationType = 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn' | 'slideUp';

interface AnimatedSectionProps {
    children: React.ReactNode;
    animation?: AnimationType;
    delay?: number; // in ms
    className?: string;
    threshold?: number;
}

/**
 * Wraps children in a scroll-triggered animation container.
 * Elements start invisible and animate in when scrolled into view.
 */
export function AnimatedSection({
    children,
    animation = 'fadeInUp',
    delay = 0,
    className = '',
    threshold = 0.15,
}: AnimatedSectionProps) {
    const { ref, isVisible } = useScrollAnimation({ threshold });

    const animationClass = isVisible ? `animate-${animation}` : '';

    return (
        <div
            ref={ref}
            className={`${className} ${animationClass}`}
            style={{
                opacity: isVisible ? undefined : 0,
                animationDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}

/**
 * Staggered animation for a grid/list of items.
 * Each child gets an incrementally delayed animation.
 */
interface StaggeredChildrenProps {
    children: React.ReactNode[];
    animation?: AnimationType;
    baseDelay?: number;
    stagger?: number;
    className?: string;
    childClassName?: string;
    threshold?: number;
}

export function StaggeredChildren({
    children,
    animation = 'fadeInUp',
    baseDelay = 0,
    stagger = 100,
    className = '',
    childClassName = '',
    threshold = 0.1,
}: StaggeredChildrenProps) {
    const { ref, isVisible } = useScrollAnimation({ threshold });

    return (
        <div ref={ref} className={className}>
            {children.map((child, index) => (
                <div
                    key={index}
                    className={`${childClassName} ${isVisible ? `animate-${animation}` : ''}`}
                    style={{
                        opacity: isVisible ? undefined : 0,
                        animationDelay: `${baseDelay + index * stagger}ms`,
                    }}
                >
                    {child}
                </div>
            ))}
        </div>
    );
}
