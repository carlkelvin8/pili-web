"use client";

import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, start]);

  return count;
}

const stats = [
  { number: 500, suffix: "+", label: "Projects Completed" },
  { number: 50, suffix: "+", label: "Industry Partners" },
  { number: 99, suffix: "%", label: "Client Satisfaction" },
  { number: 4, suffix: "", label: "Core Product Lines" },
];

export default function Stats() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat) => (
            <StatItem key={stat.label} stat={stat} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatItem({ stat, visible }: { stat: typeof stats[number]; visible: boolean }) {
  const count = useCountUp(stat.number, 2000, visible);

  return (
    <div className="text-center">
      <div className="text-4xl sm:text-5xl font-bold text-white">
        {count}
        <span className="text-[var(--color-primary-light)]">{stat.suffix}</span>
      </div>
      <div className="mt-2 text-sm sm:text-base text-white/70 font-medium">
        {stat.label}
      </div>
    </div>
  );
}
