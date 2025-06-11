import React, { useState, useEffect } from 'react';
import './ColoredIcon.css';

interface ColoredIconProps {
  iconName: string;
  color?: string;
  size?: number;
}

const ColoredIcon: React.FC<ColoredIconProps> = ({ 
  iconName, 
  color = '#FFFFFF', 
  size = 32 
}) => {
  const [iconLoaded, setIconLoaded] = useState(false);
  const [iconError, setIconError] = useState(false);

  useEffect(() => {
    const img = document.createElement('img');
    img.src = `/icons/${iconName}.png`;
    img.onload = () => setIconLoaded(true);
    img.onerror = () => setIconError(true);
  }, [iconName]);

  if (iconError) {
    console.warn(`Failed to load icon: ${iconName}`);
    return null;
  }

  return (
    <div 
      className="colored-icon"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        maskImage: iconLoaded ? `url(/icons/${iconName}.png)` : 'none',
        WebkitMaskImage: iconLoaded ? `url(/icons/${iconName}.png)` : 'none',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        opacity: iconLoaded ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out',
      }}
    />
  );
};

export default ColoredIcon; 