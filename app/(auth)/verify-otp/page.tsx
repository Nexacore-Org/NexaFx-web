'use client';

import { login, verifyLoginOtp } from '@/lib/api/auth';
import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/hooks/use-auth-store';
import { useRouter } from 'next/navigation';

export default function VerifyOtpPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    setEmail(sessionStorage.getItem('login-email'));
  }, []);
  const [password, setPassword] = useState<string>('');
  useEffect(() => {
    setPassword(sessionStorage.getItem('login-password') || '');
  }, []);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    const lastFilledIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    if (!email) {
      setError('No email found. Please sign in again.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = (await verifyLoginOtp({ email, otp: otpCode })) as any;
      // { accessToken, refreshToken, expiresIn, user }
      setAuth(res.user, res.accessToken, res.refreshToken);
      setIsLoading(false);
      router.push('/dashboard');
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Invalid or expired OTP');
    }
  };

  const handleResend = async () => {
    setOtp(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
    if (!email || !password) {
      setError('Missing email or password. Please sign in again.');
      return;
    }
    try {
      await login({ email, password });
    } catch (err: any) {
      setError('Failed to resend code');
    }
  };

  const isComplete = otp.every((digit) => digit !== '');

  return (
    <div className="min-h-screen bg-linear-to-br from-[#A0C3FD] to-[#FFE79C]">
      {/* Desktop Header */}
      <div className="hidden md:block">
        <div className="flex justify-between items-center px-8 py-6 backdrop-blur-sm bg-white/10">
          <Image
            src="/logo.png"
            alt="NexaFX"
            width={120}
            height={40}
            priority
          />
        </div>
      </div>

      {/* Desktop View */}
      <div
        className="hidden md:flex items-center justify-center px-4"
        style={{ minHeight: 'calc(100vh - 88px)' }}
      >
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-12">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-4 text-center">
              VERIFY CODE
            </h1>
            <p className="text-gray-500 text-sm text-center">
              Confirmation code sent. Check inbox or spam folder for the code
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex gap-2.5 justify-between">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center text-xl font-semibold bg-[#F5F5F5] border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F39A00] transition-all"
                  disabled={isLoading}
                />
              ))}
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                className="text-xs text-gray-600 hover:text-gray-800"
                disabled={isLoading}
              >
                Resend code
              </button>
            </div>

            <button
              type="submit"
              disabled={!isComplete || isLoading}
              className="w-full py-2.5 bg-[#F39A00] hover:bg-[#da8a00] text-black font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-6"
            >
              {isLoading ? 'Processing...' : 'Proceed'}
            </button>
          </form>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden min-h-screen bg-linear-to-br from-[#A0C3FD] to-[#FFE79C] p-4">
        {/* Mobile Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <Link
            href="/request-access"
            className="px-4 py-2 bg-[#00A651] text-white text-sm font-medium rounded-md hover:bg-[#009147] transition-colors"
          >
            Request access
          </Link>
        </div>

        <div
          className="flex items-center justify-center"
          style={{ minHeight: 'calc(100vh - 120px)' }}
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-center mb-4">
                VERIFY CODE
              </h1>
              <p className="text-gray-500 text-center text-xs">
                Confirmation code sent. Check inbox or spam folder for the code
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex gap-2 justify-between">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-11 h-11 text-center text-lg font-semibold bg-[#F5F5F5] border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F39A00] transition-all"
                    disabled={isLoading}
                  />
                ))}
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-xs text-gray-600 hover:text-gray-800"
                  disabled={isLoading}
                >
                  Resend code
                </button>
              </div>

              <button
                type="submit"
                disabled={!isComplete || isLoading}
                className="w-full py-2.5 bg-[#F39A00] hover:bg-[#da8a00] text-black font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-6"
              >
                {isLoading ? 'Processing...' : 'Proceed'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
