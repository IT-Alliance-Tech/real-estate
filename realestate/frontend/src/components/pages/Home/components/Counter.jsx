import React, { useState, useEffect, useRef } from "react";

const Counter = ({ target, label, style }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (isVisible) {
      let start = 0;
      const end = target;
      const duration = 2000; // ms
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          start = end;
          clearInterval(timer);
        }
        setCount(Math.floor(start));
      }, 16);
    }
  }, [isVisible, target]);
  return (
    <div className="counter-item" ref={ref} style={style}>
      <h2 className="counter-number">{count}</h2>
      <p className="counter-label">{label}</p>
    </div>
  );
};

export default Counter;
