import React from 'react';

const LogoMark = ({ size = 44, className = '' }) => (
  <div
    className={`relative inline-flex items-center justify-center rounded-2xl p-2 shadow-card border border-white/60 dark:border-stone-700 bg-[var(--color-card)] text-[var(--color-primary)] ${className}`}
    style={{ width: size, height: size }}
  >
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lotusGradient" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--color-primary)" />
          <stop offset="1" stopColor="var(--color-secondary)" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#lotusGradient)" opacity="0.12" />
      <path
        d="M32 16c-2.8 4.6-4.3 9.5-4.4 14.7C22 30 18 33.7 18 38c0 6 6.3 10 14 10s14-4 14-10c0-4.3-4-8-9.6-7.3C36.3 25.5 34.8 20.6 32 16Z"
        stroke="url(#lotusGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M21 36.5c2.6-.6 6.2.5 8.7 3.2"
        stroke="url(#lotusGradient)"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M43 36.5c-2.6-.6-6.2.5-8.7 3.2"
        stroke="url(#lotusGradient)"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.8"
      />
      <circle cx="32" cy="35" r="2" fill="var(--color-primary)" />
    </svg>
  </div>
);

export default LogoMark;
