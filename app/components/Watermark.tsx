import React from 'react';

export function Watermark() {
  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '2rem',
        fontWeight: 'bold',
        color: 'rgba(255, 0, 0, 0.8)', // Light red with transparency
        pointerEvents: 'none', // Makes the watermark non-interactive
        zIndex: 1000,
        userSelect: 'none', // Prevents text selection
        opacity: 1,
      }}
    >
      talyawy.dev
      <p>please complete first payment to remove watermark</p>
    </div>
  );
}
