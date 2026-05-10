import React, { useMemo } from 'react';

/**
 * QRCode Component
 * Uses goqr.me API for lightweight, dependency-free QR generation.
 * Can be easily swapped for a local generator if needed.
 */
const QRCode = ({ 
  value, 
  size = 200, 
  level = 'M', 
  bgColor = 'ffffff', 
  fgColor = '000000', 
  margin = 1 
}) => {
  const qrUrl = useMemo(() => {
    const encodedValue = encodeURIComponent(value);
    return `https://api.qrserver.com/v1/create-qr-code/?data=${encodedValue}&size=${size}x${size}&bgcolor=${bgColor.replace('#', '')}&color=${fgColor.replace('#', '')}&ecc=${level}&margin=${margin}`;
  }, [value, size, level, bgColor, fgColor, margin]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="relative group">
        <img
          src={qrUrl}
          alt={`QR Code for ${value}`}
          className="w-full h-auto rounded-lg shadow-inner"
          style={{ maxWidth: size }}
        />
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none"></div>
      </div>
      
      <div className="text-center">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Scan to Check-in</p>
        <p className="text-xs font-bold text-gray-700 truncate max-w-[180px]">{value}</p>
      </div>

      <button 
        onClick={() => {
          const link = document.createElement('a');
          link.href = qrUrl;
          link.download = `QR_${value}.png`;
          link.target = "_blank"; // Falls back to opening if download is blocked
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }}
        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-primary transition-all active:scale-95"
      >
        <span className="material-symbols-outlined text-sm">download</span>
        ดาวน์โหลด QR Code
      </button>
    </div>
  );
};

export default QRCode;
