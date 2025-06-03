import { useEffect, useRef } from 'react';

const ParticleBackground = () => {
  const particlesRef = useRef(null);

  useEffect(() => {
    if (!particlesRef.current) return;

    // Clear any existing particles
    while (particlesRef.current.firstChild) {
      particlesRef.current.removeChild(particlesRef.current.firstChild);
    }

    // Create particles
    const particleCount = 65; // Increased particle count
    const container = particlesRef.current;
    
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      // Random size between 2-8px (slightly larger particles)
      const size = Math.random() * 6 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Random position
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      
      // Random animation duration between 10-30s (some slower particles)
      const duration = Math.random() * 20 + 10;
      particle.style.animationDuration = `${duration}s`;
      
      // Random animation delay
      particle.style.animationDelay = `${Math.random() * 5}s`;
      
      // Random brightness
      const opacity = Math.random() * 0.6 + 0.2;
      particle.style.opacity = opacity;
      
      // Enhanced glow effect with ocean colors
      if (Math.random() > 0.5) {
        const glowSize = Math.random() * 8 + 3;
        const glowColors = [
          'rgba(0, 188, 212, 0.7)',
          'rgba(168, 197, 209, 0.6)',
          'rgba(255, 255, 255, 0.6)',
          'rgba(34, 211, 238, 0.7)'
        ];
        const glowColor = glowColors[Math.floor(Math.random() * glowColors.length)];
        particle.style.boxShadow = `0 0 ${glowSize}px ${glowColor}`;
        
        // Add subtle blur to some particles
        if (Math.random() > 0.7) {
          particle.style.filter = 'blur(1px)';
        }
      }
      
      // Add to container
      container.appendChild(particle);
      
      // Remove particle after animation completes
      setTimeout(() => {
        if (particle.parentNode === container) {
          container.removeChild(particle);
          createParticle(); // Create a new particle to replace it
        }
      }, duration * 1000 + 5000);
    };
    
    // Initial creation
    for (let i = 0; i < particleCount; i++) {
      createParticle();
    }
    
    // Periodically add new particles
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && Math.random() > 0.6) {
        createParticle();
      }
    }, 1800);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <div className="ocean-waves">
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>
      <div className="blueprint-grid"></div>
      <div className="particles" ref={particlesRef}></div>
    </>
  );
};

export default ParticleBackground; 