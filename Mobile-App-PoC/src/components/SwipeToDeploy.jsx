import { useState, useRef, useEffect } from 'react';
import './SwipeToDeploy.css';

const SwipeToDeploy = ({ onDeploy }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDeployed, setIsDeployed] = useState(false);
  const containerRef = useRef(null);
  const thumbRef = useRef(null);

  const [maxDrag, setMaxDrag] = useState(200);

  useEffect(() => {
    const updateMaxDrag = () => {
      if (containerRef.current && thumbRef.current) {
        setMaxDrag(containerRef.current.offsetWidth - thumbRef.current.offsetWidth - 10);
      }
    };
    updateMaxDrag();
    window.addEventListener('resize', updateMaxDrag);
    window.addEventListener('orientationchange', updateMaxDrag);
    return () => {
      window.removeEventListener('resize', updateMaxDrag);
      window.removeEventListener('orientationchange', updateMaxDrag);
    };
  }, []);

  const handleDragStart = (e) => {
    if (isDeployed) return;
    setIsDragging(true);
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    setStartX(clientX - currentX);
  };

  const handleDragMove = (e) => {
    if (!isDragging || isDeployed) return;
    if (e.cancelable) {
      e.preventDefault();
    }
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    let newX = clientX - startX;
    
    if (newX < 0) newX = 0;
    if (newX > maxDrag) newX = maxDrag;
    
    setCurrentX(newX);
  };

  const handleDragEnd = () => {
    if (!isDragging || isDeployed) return;
    setIsDragging(false);
    
    if (currentX >= maxDrag * 0.9) {
      setCurrentX(maxDrag);
      setIsDeployed(true);
      if (onDeploy) onDeploy();
      
      // Reset after 3 seconds
      setTimeout(() => {
        setIsDeployed(false);
        setCurrentX(0);
      }, 3000);
    } else {
      setCurrentX(0);
    }
  };

  const moveRef = useRef(handleDragMove);
  const endRef = useRef(handleDragEnd);

  useEffect(() => {
    moveRef.current = handleDragMove;
    endRef.current = handleDragEnd;
  });

  // Setup mouse move/up on window to handle dragging outside element
  useEffect(() => {
    const onMove = (e) => moveRef.current(e);
    const onEnd = () => endRef.current();

    if (isDragging) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onEnd);
      window.addEventListener('touchcancel', onEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
  }, [isDragging]);

  return (
    <div className="swipe-container glass-card" ref={containerRef}>
      <div 
        className="swipe-track-fill" 
        style={{ width: `${currentX + 25}px`, background: isDeployed ? 'rgba(0, 242, 254, 0.3)' : '' }}
      ></div>
      <div className="swipe-text">
        {isDeployed ? 'Deployed!' : 'Swipe to Deploy'}
      </div>
      <div 
        className={`swipe-thumb glass-card ${isDeployed ? 'deployed' : ''}`}
        ref={thumbRef}
        style={{ transform: `translateX(${currentX}px)` }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <span className="arrow">{isDeployed ? '✓' : '>>'}</span>
      </div>
    </div>
  );
};

export default SwipeToDeploy;
