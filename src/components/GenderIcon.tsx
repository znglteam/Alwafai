import React from 'react';

interface GenderUserIconProps {
  gender?: 'male' | 'female';
  size?: number;
  className?: string;
  isAlive?: boolean;
}

// Female Avatar (Person with hair / ponytail / feminine silhouette)
export const FemaleUserIcon: React.FC<{ size?: number; className?: string; isAlive?: boolean }> = ({ 
  size = 24, 
  className = "", 
  isAlive = true 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 36 36" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0`}
      style={isAlive ? undefined : { opacity: 0.5 }}
    >
      {/* Hair background silhouette */}
      <path 
        d="M10 17.5C10 11 13.5 7 18 7C22.5 7 26 11 26 17.5C26 21 24.5 24 24.5 24C24.5 24 23.5 19 22.5 18C21.5 17 19.5 17 18 17C16.5 17 14.5 17 13.5 18C12.5 19 11.5 24 11.5 24C11.5 24 10 21 10 17.5Z" 
        fill="currentColor" 
        opacity="0.25"
      />
      {/* Head */}
      <circle cx="18" cy="14" r="5.2" fill="currentColor" />
      {/* Hair styling outline/bangs */}
      <path 
        d="M12.8 14.5C12.8 11.5 15.1 9 18 9C20.9 9 23.2 11.5 23.2 14.5C23.2 15 22.2 13 20 12.2C18.2 11.6 15 12.5 12.8 14.5Z" 
        fill="currentColor" 
      />
      {/* Female shoulders / torso */}
      <path 
        d="M11.5 29C11.5 24.8 14.2 22 18 22C21.8 22 24.5 24.8 24.5 29" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />
      {/* Body fill */}
      <path 
        d="M12 29C12 25.2 14.5 23 18 23C21.5 23 24 25.2 24 29Z" 
        fill="currentColor" 
        opacity="0.3"
      />
    </svg>
  );
};

// Male Avatar (Person with short hair / masculine silhouette)
export const MaleUserIcon: React.FC<{ size?: number; className?: string; isAlive?: boolean }> = ({ 
  size = 24, 
  className = "", 
  isAlive = true 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 36 36" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0`}
      style={isAlive ? undefined : { opacity: 0.5 }}
    >
      {/* Head */}
      <circle cx="18" cy="13.5" r="5.5" fill="currentColor" />
      {/* Male Shoulders / Torso */}
      <path 
        d="M9.5 29C9.5 24.2 13 21.5 18 21.5C23 21.5 26.5 24.2 26.5 29" 
        stroke="currentColor" 
        strokeWidth="2.6" 
        strokeLinecap="round"
      />
      {/* Body fill */}
      <path 
        d="M10.2 29C10.2 24.8 13.4 22.5 18 22.5C22.6 22.5 25.8 24.8 25.8 29Z" 
        fill="currentColor" 
        opacity="0.3"
      />
    </svg>
  );
};

export const GenderUserIcon: React.FC<GenderUserIconProps> = ({ 
  gender, 
  size = 24, 
  className = "", 
  isAlive = true 
}) => {
  if (gender === 'female') {
    return <FemaleUserIcon size={size} className={className} isAlive={isAlive} />;
  }
  return <MaleUserIcon size={size} className={className} isAlive={isAlive} />;
};
