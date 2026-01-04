import { useEffect, useRef, useState, memo } from 'react';

const ECGMonitor = memo(({ heartRate = 70, height = 64 }) => {
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const tracePositionRef = useRef(0);
  const lastHeartbeatTimeRef = useRef(null);
  const heartbeatPositionsRef = useRef([]);
  const lastHeartRateRef = useRef(null);
  const [pathData, setPathData] = useState('');
  const [traceLineX, setTraceLineX] = useState(0);
  const [width, setWidth] = useState(800);

  // Grid settings
  const gridSize1mm = 10;
  const gridSize5mm = 50;
  const WAVEFORM_LENGTH_PX = 85;
  const speed = 2;

  // Update width based on container size
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        if (containerWidth > 0) {
          setWidth(prevWidth => {
            // Only update if significantly different to avoid unnecessary re-renders
            return Math.abs(containerWidth - prevWidth) > 5 ? containerWidth : prevWidth;
          });
        }
      }
    };

    // Initial update with small delay to ensure DOM is ready
    const timeoutId = setTimeout(updateWidth, 0);
    
    // Use ResizeObserver for better performance
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        if (newWidth > 0) {
          setWidth(prevWidth => {
            return Math.abs(newWidth - prevWidth) > 5 ? newWidth : prevWidth;
          });
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Fallback to window resize
    window.addEventListener('resize', updateWidth);
    
    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // Calculate heartbeat interval: Interval (ms) = 60,000 / Heart Rate
  const getHeartbeatIntervalMs = (bpm) => {
    return 60000 / bpm;
  };

  // Get Y value for a position in heartbeat waveform
  const getHeartbeatY = (xInWaveform, centerY) => {
    if (xInWaveform < 15) {
      return centerY; // Baseline
    } else if (xInWaveform < 25) {
      // P Wave
      const progress = (xInWaveform - 15) / 10;
      return centerY - Math.sin(progress * Math.PI) * 4;
    } else if (xInWaveform < 45) {
      return centerY; // PR Segment
    } else if (xInWaveform < 55) {
      // QRS Complex - sharp V-shaped spike
      const qrsProgress = (xInWaveform - 45) / 10;
      if (qrsProgress < 0.1) {
        return centerY + 2; // Q
      } else if (qrsProgress < 0.5) {
        // R wave - sharp upward spike
        const rProgress = (qrsProgress - 0.1) / 0.4;
        const peak = rProgress < 0.5 
          ? rProgress * 2
          : (1 - rProgress) * 2;
        return centerY - 15 * peak;
      } else if (qrsProgress < 0.9) {
        return centerY + 3; // S
      } else {
        return centerY;
      }
    } else if (xInWaveform < 70) {
      return centerY; // ST Segment
    } else if (xInWaveform < 85) {
      // T Wave
      const progress = (xInWaveform - 70) / 15;
      return centerY - Math.sin(progress * Math.PI) * 6;
    } else {
      return centerY; // Rest
    }
  };

  // Add electrical noise (0.5px jitter) - seeded for consistency
  const addNoise = (value, seed) => {
    const random = ((seed * 9301 + 49297) % 233280) / 233280;
    return value + (random - 0.5) * 0.5;
  };

  // Use refs for width and height to avoid restarting animation on size changes
  const widthRef = useRef(width);
  const heightRef = useRef(height);
  
  useEffect(() => {
    widthRef.current = width;
    heightRef.current = height;
  }, [width, height]);

  useEffect(() => {
    const centerY = heightRef.current / 2;
    const heartbeatIntervalMs = getHeartbeatIntervalMs(heartRate);

    // Reset when heart rate changes (but not when width/height changes)
    if (lastHeartbeatTimeRef.current === null || lastHeartRateRef.current !== heartRate) {
      const now = performance.now();
      lastHeartbeatTimeRef.current = now - heartbeatIntervalMs;
      tracePositionRef.current = 0;
      heartbeatPositionsRef.current = [];
      lastHeartRateRef.current = heartRate;
      setPathData('');
      setTraceLineX(0);
    }

    const animate = () => {
      const currentX = tracePositionRef.current;
      const now = performance.now();
      const currentWidth = widthRef.current;
      const currentHeight = heightRef.current;
      const currentCenterY = currentHeight / 2;

      // Check if it's time for a new heartbeat
      const timeSinceLastHeartbeat = now - lastHeartbeatTimeRef.current;
      if (timeSinceLastHeartbeat >= heartbeatIntervalMs) {
        // Trigger new heartbeat
        heartbeatPositionsRef.current.push({
          x: currentX,
          time: now
        });
        lastHeartbeatTimeRef.current = now;

        // Clean up old heartbeats
        heartbeatPositionsRef.current = heartbeatPositionsRef.current.filter(
          hb => hb.x >= -WAVEFORM_LENGTH_PX && hb.x <= currentWidth + WAVEFORM_LENGTH_PX
        );
      }

      // Build waveform path for entire width
      const pathPoints = [];
      let pathStarted = false;

      for (let x = 0; x < currentWidth; x++) {
        let baseY = currentCenterY;

        // Check if within any heartbeat waveform
        let bestOffset = null;
        for (const heartbeat of heartbeatPositionsRef.current) {
          const offset = x - heartbeat.x;
          if (offset >= 0 && offset < WAVEFORM_LENGTH_PX) {
            if (bestOffset === null || offset < bestOffset) {
              bestOffset = offset;
            }
          }
        }
        
        if (bestOffset !== null) {
          baseY = getHeartbeatY(bestOffset, currentCenterY);
        }

        const y = addNoise(baseY, x);

        if (!pathStarted) {
          pathPoints.push(`M ${x} ${y}`);
          pathStarted = true;
        } else {
          pathPoints.push(`L ${x} ${y}`);
        }
      }

      setPathData(pathPoints.join(' '));
      setTraceLineX(currentX);

      // Move trace forward
      tracePositionRef.current += speed;

      // Reset if too far
      if (tracePositionRef.current > currentWidth) {
        tracePositionRef.current = 0;
        setTraceLineX(0);
        heartbeatPositionsRef.current = heartbeatPositionsRef.current.map(hb => ({
          ...hb,
          x: hb.x - currentWidth
        })).filter(hb => hb.x >= -WAVEFORM_LENGTH_PX);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [heartRate]); // Only depend on heartRate, not width/height

  // Generate grid lines based on current width
  const gridLines = [];
  if (width > 0) {
    for (let x = 0; x <= width; x += gridSize1mm) {
      gridLines.push(
        <line key={`v1-${x}`} x1={x} y1={0} x2={x} y2={height} stroke="rgba(0, 255, 65, 0.05)" strokeWidth="0.5" />
      );
    }
    for (let y = 0; y <= height; y += gridSize1mm) {
      gridLines.push(
        <line key={`h1-${y}`} x1={0} y1={y} x2={width} y2={y} stroke="rgba(0, 255, 65, 0.05)" strokeWidth="0.5" />
      );
    }
    for (let x = 0; x <= width; x += gridSize5mm) {
      gridLines.push(
        <line key={`v5-${x}`} x1={x} y1={0} x2={x} y2={height} stroke="rgba(0, 255, 65, 0.1)" strokeWidth="1" />
      );
    }
    for (let y = 0; y <= height; y += gridSize5mm) {
      gridLines.push(
        <line key={`h5-${y}`} x1={0} y1={y} x2={width} y2={y} stroke="rgba(0, 255, 65, 0.1)" strokeWidth="1" />
      );
    }
  }

  return (
    <div ref={containerRef} className="w-full h-full min-w-full">
      <svg
        width={width || '100%'}
        height={height}
        className="w-full h-full"
        style={{ display: 'block', background: '#0f172a', minWidth: '100%' }}
      >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Grid */}
      <g>{gridLines}</g>
      
      {/* ECG Waveform */}
      <path
        d={pathData}
        fill="none"
        stroke="#00ff41"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
        style={{ 
          filter: 'drop-shadow(0 0 4px #00ff41)',
        }}
      />
      
      {/* Moving trace line (does nothing, just visual) */}
      <line
        x1={traceLineX}
        y1={0}
        x2={traceLineX}
        y2={height}
        stroke="rgba(0, 255, 65, 0.3)"
        strokeWidth="1"
      />
    </svg>
    </div>
  );
});

ECGMonitor.displayName = 'ECGMonitor';

export default ECGMonitor;
