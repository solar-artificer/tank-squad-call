import { createPopper } from '@popperjs/core';

const { useRef, useEffect, useState } = BdApi.React;

export default function DiscordSlider({
    value,
    onChange,
    min = 0,
    max = 1,
    step = 0.01
}) {
    const sliderRef = useRef(null);
    const grabberRef = useRef(null);
    const tooltipRef = useRef(null);
    const popperRef = useRef(null);
    const isDraggingRef = useRef(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const percentage = ((value - min) / (max - min)) * 100;
    const showTooltip = isHovering || isDragging;

    // Initialize and update Popper
    useEffect(() => {
        if (grabberRef.current && tooltipRef.current) {
            if (!popperRef.current) {
                popperRef.current = createPopper(grabberRef.current, tooltipRef.current, {
                    placement: 'top',
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [0, 8],
                            },
                        },
                        {
                            name: 'arrow',
                            options: {
                                padding: 4,
                            },
                        },
                    ],
                });
            } else {
                popperRef.current.update();
            }
        }

        return () => {
            if (popperRef.current) {
                popperRef.current.destroy();
                popperRef.current = null;
            }
        };
    }, []);

    // Update popper position when value changes
    useEffect(() => {
        if (popperRef.current) {
            popperRef.current.update();
        }
    }, [value]);

    const calculateValueFromPosition = (clientX) => {
        if (!sliderRef.current) {
            return value;
        }
        
        const rect = sliderRef.current.getBoundingClientRect();
        const position = (clientX - rect.left) / rect.width;
        const clampedPosition = Math.max(0, Math.min(1, position));
        
        let newValue = min + clampedPosition * (max - min);
        
        // Snap to step
        newValue = Math.round(newValue / step) * step;
        newValue = Math.max(min, Math.min(max, newValue));
        
        return newValue;
    };

    const handleMouseMove = (e) => {
        if (!isDraggingRef.current) {
            return;
        }

        const newValue = calculateValueFromPosition(e.clientX);
        onChange(newValue);
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
        setIsDragging(false);

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        isDraggingRef.current = true;
        setIsDragging(true);
        
        const newValue = calculateValueFromPosition(e.clientX);
        onChange(newValue);
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const tooltipStyle = {
        background: 'var(--background-floating, #111214)',
        color: 'var(--text-normal, #dbdee1)',
        padding: '6px 10px',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.24)',
        pointerEvents: 'none',
        opacity: showTooltip ? 1 : 0,
        transition: 'opacity 0.1s ease',
        zIndex: 10,
    };

    const arrowStyle = {
        position: 'absolute',
        width: '10px',
        height: '10px',
        background: 'inherit',
        visibility: 'hidden',
    };

    const arrowBeforeStyle = {
        position: 'absolute',
        width: '10px',
        height: '10px',
        background: 'var(--background-floating, #111214)',
        transform: 'rotate(45deg)',
        top: '-5px',
        left: '50%',
        marginLeft: '-5px',
    };

    const sliderStyle = {
        '--grabber-size': '16px',
        '--bar-size': '8px',
        position: 'relative',
        height: 'var(--grabber-size)',
        width: '100%',
        cursor: 'pointer',
    };

    const trackStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    };

    const barStyle = {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: 'var(--bar-size)',
        transform: 'translateY(-50%)',
        background: 'var(--background-modifier-accent, #4e5058)',
        borderRadius: 'calc(var(--bar-size) / 2)',
    };

    const barFillStyle = {
        height: '100%',
        width: `${percentage}%`,
        background: 'var(--brand-500, #5865f2)',
        borderRadius: 'calc(var(--bar-size) / 2)',
    };

    const grabberStyle = {
        position: 'absolute',
        top: '50%',
        left: `${percentage}%`,
        width: 'var(--grabber-size)',
        height: 'var(--grabber-size)',
        marginLeft: 'calc(var(--grabber-size) / -2)',
        marginTop: 'calc(var(--grabber-size) / -2)',
        background: '#fff',
        borderRadius: '50%',
        boxShadow: '0 3px 1px 0 rgba(0,0,0,0.05), 0 2px 2px 0 rgba(0,0,0,0.1), 0 3px 3px 0 rgba(0,0,0,0.05)',
        cursor: 'grab',
    };

    return (
        <div
            ref={sliderRef}
            className="discord-slider"
            tabIndex={0}
            style={sliderStyle}
            onMouseDown={handleMouseDown}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div style={trackStyle}></div>

            <div style={barStyle}>
                <div style={barFillStyle}></div>
            </div>

            <div style={trackStyle}>
                <div
                    ref={grabberRef}
                    style={grabberStyle}
                ></div>
            </div>

            <div ref={tooltipRef} style={tooltipStyle} data-popper-placement="top">
                {Math.round(percentage)}%
                <div data-popper-arrow style={arrowStyle}>
                    <div style={arrowBeforeStyle}></div>
                </div>
            </div>
        </div>
    );
}
