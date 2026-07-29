'use client';

import React, { useState, useRef } from 'react';
import { X, Copy, ChevronRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useFocusTrap } from '@/hooks/use-focus-trap';

type InstantDepositModalType = {
  onClose: () => void;
  isMobile: boolean;
};

const InstantModalDeposit: React.FC<InstantDepositModalType> = ({
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(true, onClose, modalRef);

  const walletAddress = '0x5A08FcdBEA516Cf086572157791dB12CA3beF1B32';

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
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
            {walletAddress ? (
              <div className='bg-white p-3 rounded-lg shadow-sm'>
                <QRCodeSVG
                  value={walletAddress}
                  size={152}
                  level='M'
                  marginSize={2}
                  className='block md:hidden'
                  aria-label='Wallet address QR code'
                />
                <QRCodeSVG
                  value={walletAddress}
                  size={232}
                  level='M'
                  marginSize={2}
                  className='hidden md:block'
                  aria-label='Wallet address QR code'
                />
              </div>
            ) : (
              <div className='w-38 h-38 md:w-58 md:h-58 bg-muted p-4 rounded-lg flex items-center justify-center text-center text-sm text-muted-foreground'>
                No wallet address available
              </div>
            )}
          </div>

          <div className='mb-4 bg-muted rounded-xl p-3 md:p-5 border border-border/50'>
            <label className='text-sm md:text-[18px] flex items-center text-muted-foreground mb-2 '>
              Wallet Address <ChevronRight size={20} />
            </label>
            <div className='flex items-center gap-2 p-2 md:p-3 '>
              <span className='text-sm md:text-[18px] font-semibold text-foreground break-all flex-1'>
                {walletAddress}
              </span>
              <button
                onClick={handleCopyAddress}
                className='p-1 hover:bg-background rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1'
                aria-label='Copy wallet address'
              >
                <Copy className='w-4 h-4 text-muted-foreground' />
              </button>
            </div>
          </div>

          <div className='flex gap-3  md:flex-row flex-col'>
            <button
              onClick={handleCopyAddress}
              className='flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg transition-colors md:text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2'
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
