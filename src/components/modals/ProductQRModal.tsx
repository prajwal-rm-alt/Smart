import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Copy,
  Check,
  Download,
  Share2,
} from 'lucide-react';
import { Product } from '../../types';
import { getProductShareUrl, encodeProductPayload } from '../../utils/share';

interface ProductQRModalProps {
  product: Product;
  theme: 'black' | 'cream';
  onClose: () => void;
  onOpenPublicSheet?: (product: Product) => void;
}

export const ProductQRModal: React.FC<ProductQRModalProps> = ({
  product,
  theme,
  onClose,
  onOpenPublicSheet,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const payload = encodeProductPayload(product);
  const shareUrl = getProductShareUrl(product.id, undefined, payload);

  useEffect(() => {
    async function generateQR() {
      try {
        const darkColor = theme === 'cream' ? '#1c1917' : '#050507';
        const lightColor = '#ffffff';

        const url = await QRCode.toDataURL(shareUrl, {
          width: 320,
          margin: 2,
          color: {
            dark: darkColor,
            light: lightColor,
          },
          errorCorrectionLevel: 'M',
        });
        setQrDataUrl(url);
      } catch (err) {
        console.warn('QR Code generation error:', err);
      }
    }
    generateQR();
  }, [product, shareUrl, theme]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR_${product.brand}_${product.model.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${product.brand} ${product.model} · Specifications`,
          text: `Check out verified specifications for ${product.brand} ${product.model} (${product.capacityLitres}L ${product.category}):`,
          url: shareUrl,
        });
      } catch {
        // Ignored if dismissed
      }
    } else {
      handleCopyLink();
    }
  };

  const isDark = theme === 'black';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-2xl animate-fadeIn">
      <div
        className={`relative w-full max-w-sm sharp-card glass-card border p-6 shadow-2xl flex flex-col text-center ${
          isDark
            ? 'border-white/15 text-white'
            : 'border-stone-900/15 text-stone-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 sharp-box border transition ${
            isDark
              ? 'border-white/10 text-zinc-400 hover:text-white bg-white/[0.05]'
              : 'border-stone-900/15 text-stone-600 hover:text-stone-950 bg-stone-900/[0.04]'
          }`}
          aria-label="Close QR Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-4">
          <span
            className={`text-[10px] uppercase font-bold tracking-widest block mb-1 ${
              isDark ? 'text-amber-400' : 'text-amber-800'
            }`}
          >
            Instant Customer Share
          </span>
          <h3 className={`font-display text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-stone-900'}`}>
            {product.brand} {product.model}
          </h3>
          <p
            className={`text-xs mt-1 ${
              isDark ? 'text-zinc-400' : 'text-stone-600'
            }`}
          >
            {product.capacityLitres} Litres · {product.category}
          </p>
        </div>

        {/* QR Code Frame */}
        <div className="mx-auto my-2 p-3 bg-white sharp-box border-2 border-black/10 shadow-lg inline-block">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR code for ${product.model}`}
              className="w-52 h-52 object-contain"
            />
          ) : (
            <div className="w-52 h-52 flex items-center justify-center text-xs text-stone-400 font-mono">
              Generating QR...
            </div>
          )}
        </div>

        <p
          className={`text-[11px] mt-2 mb-4 leading-snug px-4 ${
            isDark ? 'text-zinc-400' : 'text-stone-600'
          }`}
        >
          Scan with any iPhone or Android camera to open the public product sheet instantly.
        </p>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleCopyLink}
            className={`w-full py-2.5 px-3 sharp-box text-xs font-bold transition flex items-center justify-center gap-2 border ${
              copied
                ? 'bg-emerald-600 text-white border-emerald-500'
                : isDark
                ? 'bg-white hover:bg-zinc-200 text-black border-white shadow-md'
                : 'bg-stone-900 hover:bg-stone-800 text-amber-50 border-stone-900 shadow-md'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Public Share Link'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadQR}
              className={`py-2 px-3 sharp-box text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                isDark
                  ? 'bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border-white/10'
                  : 'bg-stone-900/[0.04] hover:bg-stone-900/[0.08] text-stone-800 border-stone-900/15'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save Image</span>
            </button>

            <button
              onClick={handleNativeShare}
              className={`py-2 px-3 sharp-box text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                isDark
                  ? 'bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border-white/10'
                  : 'bg-stone-900/[0.04] hover:bg-stone-900/[0.08] text-stone-800 border-stone-900/15'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share App</span>
            </button>
          </div>

          {onOpenPublicSheet && (
            <button
              onClick={() => {
                onClose();
                onOpenPublicSheet(product);
              }}
              className={`w-full py-2 text-[11px] font-semibold underline underline-offset-4 transition ${
                isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-800 hover:text-amber-950'
              }`}
            >
              Preview Public Sheet as Customer →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
