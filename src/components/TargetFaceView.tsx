import React, { useState, useRef, useCallback } from 'react';
import { feedback } from '../feedback';

// Hanmato types
export type TargetType = 'kasumi' | 'hoshi';

export interface ArrowPosition {
    x: number; // 0~1 ratio within target
    y: number; // 0~1 ratio within target
    shotIndex: number;
}

interface TargetFaceViewProps {
    targetType: TargetType;
    arrows: ArrowPosition[];
    onAddArrow?: (x: number, y: number) => void;
    onRemoveArrow?: (index: number) => void;
    readonly?: boolean;
    size?: number;
    bgColor?: string;
}

// Kasumi (霞的) ring ratios relative to outer radius
const KASUMI_RINGS = [1, 0.833, 0.667, 0.5, 0.333, 0.167];
const HOSHI_RINGS = [1, 0.833, 0.667, 0.5, 0.333, 0.167];

// Colors for kasumi rings (outermost to innermost)
const KASUMI_COLORS = ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'];
const KASUMI_STROKE_COLORS = ['#333', '#333', '#333', '#333', '#333', '#333'];

// Star positions for hoshi target (5 stars at specific positions)
const HOSHI_STAR_POSITIONS = [
    { cx: 0.5, cy: 0.5, r: 0.045 }, // center
    { cx: 0.5, cy: 0.285, r: 0.035 }, // top
    { cx: 0.5, cy: 0.715, r: 0.035 }, // bottom
    { cx: 0.285, cy: 0.5, r: 0.035 }, // left
    { cx: 0.715, cy: 0.5, r: 0.035 }, // right
];

const ARROW_COLORS = [
    '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

const TargetFaceView = React.memo(({ targetType, arrows, onAddArrow, onRemoveArrow, readonly = false, size = 300, bgColor = '#fff' }: TargetFaceViewProps) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [isShaking, setIsShaking] = useState(false);

    const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        if (readonly || !onAddArrow) return;
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        // Check if within target circle (0.5, 0.5, r=0.48)
        const dx = x - 0.5;
        const dy = y - 0.5;
        if (Math.sqrt(dx * dx + dy * dy) <= 0.485) {
            feedback.playTap(200, 0.08);
            feedback.vibrate(15);
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 200);
            onAddArrow(x, y);
        }
    }, [readonly, onAddArrow]);

    const lastShotIndex = arrows.length > 0 ? Math.max(...arrows.map(a => a.shotIndex)) : -1;

    return (
        <svg
            ref={svgRef}
            viewBox="0 0 100 100"
            width={size}
            height={size}
            className={`select-none touch-none ${!readonly ? 'cursor-crosshair' : ''} ${isShaking ? 'animate-shake' : ''}`}
            onClick={handleClick}
        >
            <style>
                {`
                @keyframes arrow-pop {
                    0% { transform: scale(0); opacity: 0; }
                    70% { transform: scale(1.3); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes shake {
                    0% { transform: translate(0, 0); }
                    25% { transform: translate(-1px, 1px); }
                    50% { transform: translate(1px, -1px); }
                    75% { transform: translate(-1px, -1px); }
                    100% { transform: translate(0, 0); }
                }
                @keyframes spark-fly {
                    0% { transform: translate(0,0) scale(1); opacity: 1; }
                    100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
                }
                .animate-pop {
                    transform-origin: center;
                    animation: arrow-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                .animate-shake {
                    animation: shake 0.15s ease-in-out infinite;
                }
                .spark {
                    animation: spark-fly 0.4s ease-out forwards;
                }
                .ripple {
                    animation: ripple-out 0.8s ease-out forwards;
                }
                @keyframes ripple-out {
                    0% { stroke-width: 0.5; opacity: 1; r: 0; }
                    100% { stroke-width: 0.1; opacity: 0; r: 15; }
                }
                `}
            </style>
            {/* Target background */}
            <circle cx="50" cy="50" r="48" fill={bgColor} stroke="#333" strokeWidth="1" />

            {/* Kasumi rings */}
            {KASUMI_RINGS.map((ratio, i) => (
                <circle
                    key={i}
                    cx="50"
                    cy="50"
                    r={48 * ratio}
                    fill={KASUMI_COLORS[i] || 'white'}
                    stroke={KASUMI_STROKE_COLORS[i] || '#333'}
                    strokeWidth="0.5"
                />
            ))}

            {/* Hoshi stars (only for hoshi target) */}
            {targetType === 'hoshi' && HOSHI_STAR_POSITIONS.map((star, i) => (
                <circle
                    key={`star-${i}`}
                    cx={star.cx * 100}
                    cy={star.cy * 100}
                    r={star.r * 100}
                    fill="#333"
                />
            ))}

            {/* Horizontal center line */}
            <line x1="2" y1="50" x2="98" y2="50" stroke="#ccc" strokeWidth="0.4" />
            {/* Vertical center line */}
            <line x1="50" y1="2" x2="50" y2="98" stroke="#ccc" strokeWidth="0.4" />

            {/* Arrows */}
            {arrows.map((arrow, i) => {
                const isLatest = arrow.shotIndex === lastShotIndex;
                const color = ARROW_COLORS[i % ARROW_COLORS.length];
                return (
                    <g key={i} onClick={(e) => { e.stopPropagation(); if (!readonly && onRemoveArrow) onRemoveArrow(i); }} style={{ transformOrigin: `${arrow.x * 100}% ${arrow.y * 100}%` }} className={isLatest ? 'animate-pop' : ''}>
                        {isLatest && !readonly && (
                            <>
                                <circle cx={arrow.x * 100} cy={arrow.y * 100} r="0" fill="none" stroke={color} className="ripple" />
                                {/* Sparks */}
                                {Array.from({ length: 8 }).map((_, si) => {
                                    const angle = (si * 45) * (Math.PI / 180);
                                    const dist = 10;
                                    const dx = Math.cos(angle) * dist;
                                    const dy = Math.sin(angle) * dist;
                                    return (
                                        <circle
                                            key={si}
                                            cx={arrow.x * 100}
                                            cy={arrow.y * 100}
                                            r="0.8"
                                            fill={color}
                                            className="spark"
                                            style={{ '--dx': `${dx}px`, '--dy': `${dy}px` } as React.CSSProperties}
                                        />
                                    );
                                })}
                            </>
                        )}
                        <circle
                            cx={arrow.x * 100}
                            cy={arrow.y * 100}
                            r="3.5"
                            fill={color}
                            stroke="white"
                            strokeWidth="1"
                            className={!readonly ? 'cursor-pointer drop-shadow-sm' : ''}
                        />
                        <text
                            x={arrow.x * 100}
                            y={arrow.y * 100 + 1.2}
                            textAnchor="middle"
                            fill="white"
                            fontSize="3.5"
                            fontWeight="bold"
                        >
                            {arrow.shotIndex + 1}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
});

export default TargetFaceView;
