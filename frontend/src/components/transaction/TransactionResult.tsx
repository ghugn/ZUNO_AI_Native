"use client";

import React from 'react';
import { ChevronLeft, House } from 'lucide-react';
import { useRouter } from 'next/navigation';

type TransactionType = 'expense' | 'income';

type SourceOption = {
	name: string;
	shortCode: string;
	badgeColor: string;
	logoSrc?: string;
};

type TransactionResultPayload = {
	transactionType: TransactionType;
	amountValue: string;
	category: string;
	dateValue: string;
	timeOfDay: string;
	source: SourceOption;
};

type TransactionResultProps = {
	fallbackTransactionType?: TransactionType;
};

const STORAGE_KEY = 'zuno:transaction-result';
const imgImage3 = 'https://www.figma.com/api/mcp/asset/120714df-6eaf-413b-801a-91ac2e54c2cf';
const imgIconFrame = 'https://www.figma.com/api/mcp/asset/cae6fd7b-d6b6-4316-bb3f-e935b12bfd68';
const imgArrowTrendingDown = 'https://www.figma.com/api/mcp/asset/0ebb6fb9-3575-4d5d-a9a5-27c6bc542a90';
const imgSvg1 = 'https://www.figma.com/api/mcp/asset/60b1e015-a6e9-40bc-85fb-74c041806829';
const imgContainer = 'https://www.figma.com/api/mcp/asset/bae2c7ad-936f-4b50-842a-d22a299a18db';
const imgContainer1 = 'https://www.figma.com/api/mcp/asset/05865e7b-c9e4-45f9-9432-253db772e40f';

function getTodayDateValue() {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
}

function formatDateForDisplay(dateValue: string) {
	const [year, month, day] = dateValue.split('-');
	if (!year || !month || !day) {
		return '21/05/2026';
	}

	return `${day}/${month}/${year}`;
}

function formatAmountValue(amountValue: string) {
	const numericValue = Number(amountValue);
	if (!Number.isFinite(numericValue)) {
		return '0';
	}

	return numericValue.toLocaleString('vi-VN');
}

function normalizeSource(source?: Partial<SourceOption>): SourceOption {
	return {
		name: source?.name || 'MB Bank',
		shortCode: source?.shortCode || 'MB',
		badgeColor: source?.badgeColor || '#1f3fbf',
		logoSrc: source?.logoSrc,
	};
}

function createFallbackPayload(transactionType: TransactionType): TransactionResultPayload {
	return {
		transactionType,
		amountValue: transactionType === 'income' ? '0' : '0',
		category: transactionType === 'income' ? 'Savings' : 'Food and Drinks',
		dateValue: getTodayDateValue(),
		timeOfDay: 'Morning',
		source: normalizeSource(),
	};
}

function readStoredPayload(fallback: TransactionResultPayload): TransactionResultPayload {
	if (typeof window === 'undefined') {
		return fallback;
	}

	const raw = window.sessionStorage.getItem(STORAGE_KEY);
	if (!raw) {
		return fallback;
	}

	try {
		const parsed = JSON.parse(raw) as Partial<TransactionResultPayload>;
		return {
			transactionType: parsed.transactionType === 'income' ? 'income' : 'expense',
			amountValue: parsed.amountValue || fallback.amountValue,
			category: parsed.category || fallback.category,
			dateValue: parsed.dateValue || fallback.dateValue,
			timeOfDay: parsed.timeOfDay || fallback.timeOfDay,
			source: normalizeSource(parsed.source),
		};
	} catch {
		return fallback;
	}
}

function getCategoryMeta(category: string) {
	switch (category) {
		case 'Food and Drinks':
			return { label: 'Food and Drinks', icon: imgSvg1, bg: '#FFFFFF' };
		case 'Experience':
			return { label: 'Experience', icon: imgSvg1, bg: '#FFFFFF' };
		case 'Developement':
			return { label: 'Developement', icon: imgSvg1, bg: '#FFFFFF' };
		case 'Fixed bill':
			return { label: 'Fixed bill', icon: imgSvg1, bg: '#FFFFFF' };
		case 'Savings':
			return { label: 'Saving', icon: imgSvg1, bg: '#FFFFFF' };
		default:
			return { label: category, icon: imgSvg1, bg: '#FFFFFF' };
	}
}

function DetailIcon({ type }: { type: 'category' | 'time' | 'source' }) {
	if (type === 'category') {
		return <img alt="" className="absolute block inset-0 max-w-none size-full" src="/icons/category.png" />;
	}

	if (type === 'time') {
		return <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgContainer} />;
	}

	return <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgContainer1} />;
}

export default function TransactionResult({ fallbackTransactionType = 'expense' }: TransactionResultProps) {
	const router = useRouter();
	const payload = readStoredPayload(createFallbackPayload(fallbackTransactionType));

	const isIncome = payload.transactionType === 'income';
	const amountPrefix = isIncome ? '+' : '-';
	const amountColor = isIncome ? '#74FF82' : '#FF7E7E';
	const heroIconBg = isIncome ? '#D4F0D8' : '#F7D4D4';
	const heroIconInnerBg = isIncome ? '#D4F0D8' : '#F7D4D4';
	const categoryMeta = getCategoryMeta(payload.category);
	const displayDate = payload.dateValue === getTodayDateValue() ? `Today, ${formatDateForDisplay(payload.dateValue)}` : formatDateForDisplay(payload.dateValue);
	const amountValue = formatAmountValue(payload.amountValue);

	const handleClose = () => {
		window.location.assign('/');
	};

	return (
		<div className="relative mx-auto h-[852px] w-[393px] overflow-hidden bg-[#F7F8FA]">
			<div className="absolute left-0 top-0 h-[453px] w-[393px] bg-gradient-to-b from-[#112945] via-[#4d78a8] to-[#f7f8fa] backdrop-blur-[2px]" />

			<button type="button" aria-label="Close result screen" onClick={handleClose} className="absolute left-[32px] top-[23px] z-20 flex size-[20.686px] items-center justify-center text-white">
				<ChevronLeft className="size-[20px] rotate-90" strokeWidth={2.2} />
			</button>

			<div className="absolute left-0 top-[64px] z-10 flex w-[393px] flex-col items-center text-center text-white">
				<div className="flex h-[120px] w-[96px] flex-col items-center pb-[24px]">
					<div className="flex size-[96px] items-center justify-center rounded-full bg-white shadow-[0px_4px_5px_rgba(0,0,0,0.05)]">
						<div className="flex size-[70px] items-center justify-center rounded-full" style={{ backgroundColor: heroIconBg }}>
								<div className="flex size-[52px] items-center justify-center rounded-full" style={{ backgroundColor: heroIconInnerBg }}>
									{/* Use Figma-provided arrow icon for expense, keep existing frame for income */}
									<img
										alt={isIncome ? 'income icon' : 'expense icon'}
										className="block size-[36px] max-w-none"
										src={isIncome ? imgIconFrame : imgArrowTrendingDown}
									/>
								</div>
						</div>
					</div>
				</div>

				<div className="pb-[8px]">
					<p className="font-['SF Compact Rounded:Regular'] text-[28px] font-bold leading-[34px] text-white">Success</p>
				</div>
				<p className="font-['SF Compact Rounded:Regular'] text-[14px] font-normal leading-[20px] text-white/80">Transaction Added</p>
			</div>

			<div className="absolute left-0 top-[299px] w-[393px] rounded-tl-[40px] rounded-tr-[40px] bg-white pb-[96px] pt-[30px] shadow-[0px_-10px_15px_rgba(0,0,0,0.1)]">
				<div className="flex flex-col gap-[24px] px-[20px]">
						<div className="flex w-full flex-col items-center justify-center pb-[12px]">
							<p className="font-['SF Compact Rounded:Regular'] text-[32px] font-bold leading-[40px] tracking-[-0.64px]" style={{ color: amountColor }}>
								{amountPrefix}{amountValue}đ
							</p>
						</div>

					<div className="flex h-[254px] w-full flex-col gap-[16px] pt-[8px]">
						<div className="flex h-[80px] w-full items-center rounded-[12px] bg-[#f2f4f6] p-[16px] shadow-[0px_4px_5px_rgba(0,0,0,0.05)]">
							<div className="flex gap-[16px] items-center">
								<div className="flex size-[48px] items-center justify-center rounded-[16px] bg-white shadow-[0px_4px_5px_rgba(0,0,0,0.05)]">
									<div className="relative size-[40px]">
										<DetailIcon type="category" />
									</div>
								</div>
								<div className="flex h-[42px] flex-col items-start justify-center">
									<p className="font-['SF Compact Rounded:Regular'] text-[12px] font-medium leading-[18px] text-black">Category</p>
									<p className="font-['SF Compact Rounded:Regular'] text-[16px] font-semibold leading-[24px] text-[#191c1e]">{categoryMeta.label}</p>
								</div>
							</div>
						</div>

						<div className="flex h-[80px] w-full items-center rounded-[12px] bg-[#f2f4f6] p-[16px] shadow-[0px_4px_5px_rgba(0,0,0,0.05)]">
							<div className="flex gap-[16px] items-center">
								<div className="flex size-[48px] items-center justify-center rounded-[16px] bg-white shadow-[0px_4px_5px_rgba(0,0,0,0.05)]">
									<div className="relative h-[20px] w-[18px]">
										<DetailIcon type="time" />
									</div>
								</div>
								<div className="flex h-[40px] flex-col items-start justify-center">
									<p className="font-['SF Compact Rounded:Regular'] text-[12px] font-medium leading-[16px] text-[#42474f]">Time</p>
									<p className="font-['SF Compact Rounded:Regular'] text-[16px] font-semibold leading-[24px] text-[#191c1e]">{displayDate}</p>
								</div>
							</div>
						</div>

						<div className="flex h-[80px] w-full items-center rounded-[12px] bg-[#f2f4f6] p-[16px] shadow-[0px_4px_5px_rgba(0,0,0,0.05)]">
							<div className="flex gap-[16px] items-center">
								<div className="flex size-[48px] items-center justify-center rounded-[16px] bg-white shadow-[0px_4px_5px_rgba(0,0,0,0.05)] overflow-hidden">
									<div className="relative h-[18px] w-[19px]">
										<DetailIcon type="source" />
									</div>
								</div>
								<div className="flex h-[39px] flex-col items-start justify-center">
									<p className="font-['SF Compact Rounded:Regular'] text-[12px] font-medium leading-[15px] text-black">Source</p>
									<div className="flex items-start gap-[5px]">
										<img alt={payload.source.name} className="h-[18px] w-[44px] object-cover" src={payload.source.logoSrc || imgImage3} />
										<p className="font-['SF Compact Rounded:Regular'] text-[16px] font-semibold leading-[18px] text-[#191c1e]">{payload.source.name}</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="flex w-full flex-col gap-[16px] pt-[32px]">
						<button type="button" onClick={() => router.push('/')} className="flex h-[56px] w-full items-center justify-center rounded-[9999px] bg-[#003d66] font-['SF Compact Rounded:Regular'] text-[16px] font-bold leading-[24px] text-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
							<House className="mr-[10px] size-[18px]" strokeWidth={2.2} />
							Go to Dashboard
						</button>
						<button type="button" onClick={() => router.push('/add-transaction')} className="flex h-[56px] w-full items-center justify-center rounded-[9999px] border-2 border-[#c2c7d0] bg-white font-['SF Compact Rounded:Regular'] text-[16px] font-semibold leading-[24px] text-[#42474f]">
							Add Another Transaction
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
