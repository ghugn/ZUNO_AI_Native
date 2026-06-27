'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Building2, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

type MockBank = {
  id: string;
  name: string;
  balance: number;
  color: string;
};

export default function ConnectBankPage() {
  const router = useRouter();
  const [banks, setBanks] = useState<MockBank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBanks() {
      try {
        const data = await apiClient.get<MockBank[]>('/api/profile/mock-banks');
        setBanks(data);
      } catch (err: any) {
        setError('Unable to load bank list.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchBanks();
  }, []);

  const handleConnect = async (bankId: string) => {
    setIsConnecting(bankId);
    setError(null);
    try {
      await apiClient.post('/api/profile/mock-connect', { accountId: bankId });
      router.push('/budgets');
    } catch (err: any) {
      setError(err.message || 'An error occurred while linking the bank.');
      setIsConnecting(null);
    }
  };

  const formatBalance = (amount: number) =>
    amount.toLocaleString('vi-VN') + ' VNĐ';

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[393px] bg-[#f7f8fa]">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between bg-white px-5 py-4 shadow-sm">
        <button onClick={() => router.back()} className="text-[#112945]">
          <ChevronLeft className="size-6" />
        </button>
        <h1 className="font-['SF_Compact_Rounded',sans-serif] text-[18px] font-bold text-[#112945]">
          Link Bank Account
        </h1>
        <div className="w-6" />
      </div>

      <div className="px-5 py-6">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#edf4ff] text-[#174f84]">
            <Building2 className="size-7" />
          </div>
          <h2 className="font-['SF_Compact_Rounded',sans-serif] text-[20px] font-bold text-[#112945]">
            Link ZUNO Bank
          </h2>
          <p className="mt-2 text-[14px] text-[#546982]">
            Tap below to connect your ZUNO Bank account to ZUNO Wallet and start tracking your budget.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-[12px] bg-red-50 p-4 text-center text-[13px] text-red-600">
            {error}
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="size-8 animate-spin text-[#174f84]" />
            <p className="text-[13px] text-[#546982]">Loading bank accounts...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-8">
            {banks.map((bank) => (
              <button
                key={bank.id}
                disabled={isConnecting !== null}
                onClick={() => handleConnect(bank.id)}
                className="flex items-center justify-between rounded-[16px] bg-white p-4 shadow-[0_2px_12px_rgba(17,41,69,0.08)] transition-all hover:shadow-[0_4px_16px_rgba(17,41,69,0.12)] active:scale-[0.98] disabled:opacity-60"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex size-[40px] items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: bank.color }}
                  >
                    <span className="font-bold text-[14px]">Z</span>
                  </div>
                  <div className="text-left">
                    <p className="font-['SF_Compact_Rounded',sans-serif] text-[15px] font-bold text-[#283241]">
                      {bank.name}
                    </p>
                    <p className="font-['SF_Compact_Rounded',sans-serif] text-[13px] text-[#546982]">
                      Balance: {formatBalance(bank.balance)}
                    </p>
                  </div>
                </div>

                {isConnecting === bank.id ? (
                  <Loader2 className="size-5 animate-spin text-[#174f84]" />
                ) : (
                  <ChevronLeft className="size-5 rotate-180 text-[#9db2c6]" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
