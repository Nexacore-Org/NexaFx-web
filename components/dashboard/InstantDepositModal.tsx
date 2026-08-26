'use client';

import React, { useEffect, useState, useRef } from 'react';
import { X, Copy, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { CopyButton } from '@/components/ui/copy-button';
import { haptics } from '@/lib/utils/haptics';
import { getProfile } from '@/lib/api/users';

const QRCodeSVG = dynamic(() => import('qrcode.react').then(mod => mod.QRCodeSVG), {
  ssr: false,
  loading: () => (
    <div className="w-38 h-38 md:w-58 md:h-58 bg-muted p-4 rounded-lg flex items-center justify-center text-center text-sm text-muted-foreground">
      Loading QR code...
    </div>
  ),
});

type InstantDepositModalType = {
  onClose: () => void;
  isMobile: boolean;
};

const InstantModalDeposit: React.FC<InstantDepositModalType> = ({
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(true, onClose, modalRef);

  // Load the signed-in user's real wallet address. Never fall back to a
  // hardcoded literal — a wrong deposit address risks lost funds.
  useEffect(() => {
    let cancelled = false;
    getProfile()
      .then((profile) => {
        if (cancelled) return;
        const addr = profile?.walletAddress?.trim() ?? '';
        if (addr) {
          setWalletAddress(addr);
          setStatus('ready');
        } else {
          setWalletAddress(null);
          setStatus('error');
        }
      })
      .catch(() => {
        if (cancelled) return;
        setWalletAddress(null);
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Sanity check so an obviously-broken address is never shown as a real
  // deposit destination.
  const isPlausibleAddress = (addr: string) =>
    /^0x[a-fA-F0-9]{40}$/.test(addr) || /^[A-Za-z0-9]{25,60}$/.test(addr);

  const looksMalformed =
    status === 'ready' && !!walletAddress && !isPlausibleAddress(walletAddress);
  const addressReady =
    status === 'ready' && !!walletAddress && !looksMalformed;

  const handleCopyAddress = () => {
    if (!addressReady || !walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    haptics.light();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className=''>
        <div
          ref={modalRef}
          role='dialog'
          aria-modal='true'
          aria-labelledby='deposit-modal-title'
          className='bg-card text-card-foreground rounded-xl p-6 shadow-sm border border-border/50 relative'
        >
          <button
            onClick={onClose}
            className='absolute right-1 top-1 p-1.5 rounded-md hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2'
            aria-label='Close deposit modal'
          >
            <X className='w-4 h-4 text-muted-foreground' />
          </button>
          <h3
            id='deposit-modal-title'
            className='text-lg font-semibold text-center mb-3 md:mb-6'
          >
            NEXA FX - Deposit
          </h3>

          <div className='p-6 rounded-lg mb-3 md:mb-6 flex items-center justify-center'>
            {addressReady ? (
              <div className='bg-white p-3 rounded-lg shadow-sm'>
                <QRCodeSVG
                  value={walletAddress!}
                  size={152}
                  level='M'
                  marginSize={2}
                  className='block md:hidden'
                  aria-label='Wallet address QR code'
                />
                <QRCodeSVG
                  value={walletAddress!}
                  size={232}
                  level='M'
                  marginSize={2}
                  className='hidden md:block'
                  aria-label='Wallet address QR code'
                />
              </div>
            ) : status === 'loading' ? (
              <div className='w-38 h-38 md:w-58 md:h-58 bg-muted p-4 rounded-lg flex items-center justify-center text-center text-sm text-muted-foreground animate-pulse'>
                Loading wallet address…
              </div>
            ) : (
              <div className='w-38 h-38 md:w-58 md:h-58 bg-muted p-4 rounded-lg flex items-center justify-center text-center text-sm text-muted-foreground'>
                {looksMalformed
                  ? 'Wallet address unavailable'
                  : 'No wallet address available'}
              </div>
            )}
          </div>

          <div className='mb-4 bg-muted rounded-xl p-3 md:p-5 border border-border/50'>
            <label className='text-sm md:text-[18px] flex items-center text-muted-foreground mb-2 '>
              Wallet Address <ChevronRight size={20} />
            </label>
            {status === 'loading' ? (
              <div className='h-6 w-full animate-pulse rounded bg-muted-foreground/20' />
            ) : addressReady ? (
              <div className='flex items-center gap-2 p-2 md:p-3 '>
                <span className='text-sm md:text-[18px] font-semibold text-foreground break-all flex-1'>
                  {walletAddress}
                </span>
                <CopyButton value={walletAddress!} label='Copy wallet address' size='sm' />
              </div>
            ) : (
              <p className='text-sm text-destructive p-2 md:p-3'>
                {looksMalformed
                  ? 'The wallet address returned looks invalid, so it has been hidden for your safety. Please contact support.'
                  : 'We couldn’t load your wallet address. Please close and try again.'}
              </p>
            )}
          </div>

          <div className='flex gap-3  md:flex-row flex-col'>
            <button
              onClick={handleCopyAddress}
              disabled={!addressReady}
              className='flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg transition-colors md:text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
              aria-label='Copy wallet address button'
            >
              {copied ? 'Copied!' : 'Copy Address'}
            </button>
            <button
              onClick={onClose}
              className='flex-1 py-3 border-2 border-border hover:bg-muted text-foreground font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2'
              aria-label='Cancel and close deposit modal'
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstantModalDeposit;
