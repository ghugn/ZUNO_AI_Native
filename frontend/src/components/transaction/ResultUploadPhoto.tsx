"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, House, Plus, ReceiptText, Sparkles, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getFunds, type Fund } from '@/lib/api/funds';
import { createTransaction, classifyMealType } from '@/lib/api/transactions';
import { bootstrapAuth } from '@/lib/api/auth';
import { SourceLogo } from './SourceLogoBanks';

const STORAGE_KEY = 'zuno:receipt-scan-result';
const imgDefaultPreview = 'https://www.figma.com/api/mcp/asset/443b3e30-a522-4a0e-a5fb-eac7f752f45a';
const imgCheck = 'https://www.figma.com/api/mcp/asset/8c172d8e-9e9c-4b9f-91cc-a641534cad47';
const imgGroup41 = 'https://www.figma.com/api/mcp/asset/8a4bfa5e-137d-4256-88ac-a8bebaaa972f';
const imgVector28 = 'https://www.figma.com/api/mcp/asset/83fba5f3-dca8-4aff-bf5a-c900b368029e';
const imgVector228 = 'https://www.figma.com/api/mcp/asset/75ce7ef6-b1b5-4d3f-87ef-54764055dedb';
const imgEllipse44 = 'https://www.figma.com/api/mcp/asset/da9d902b-ff99-4096-81d9-a2025e3b6273';
const imgVector3 = 'https://www.figma.com/api/mcp/asset/89780cd8-3b61-4d2c-9c48-1d2659280fb5';
const imgVector4 = 'https://www.figma.com/api/mcp/asset/a41e749b-85b7-424a-8062-34adc0f128f4';
const imgVector5 = 'https://www.figma.com/api/mcp/asset/362556dd-d440-438a-8bd3-7f088dc91983';
const imgVector6 = 'https://www.figma.com/api/mcp/asset/d5342023-30f9-4b61-9210-06815639edd6';
const imgVector7 = 'https://www.figma.com/api/mcp/asset/35b05609-497f-4bf2-acc0-a5fbd931d67a';
const imgVector8 = 'https://www.figma.com/api/mcp/asset/06cd6653-31dc-42fd-98e1-123a98f67e4c';
const imgGroup56 = 'https://www.figma.com/api/mcp/asset/2d7cf49c-5af2-4b94-b8e9-a7e6909368c7';
const imgGroup78 = 'https://www.figma.com/api/mcp/asset/4ef9535f-a4c7-4b62-a134-2dbf341997ee';
const imgGroup59 = 'https://www.figma.com/api/mcp/asset/fce84dd1-ffb2-437d-9a71-966d3b83e9db';
const imgGroup54 = 'https://www.figma.com/api/mcp/asset/2f748352-1a15-4fe3-88db-09f091f0ee51';
const imgGroup105 = 'https://www.figma.com/api/mcp/asset/6878fe73-6ded-414b-a969-d0ddaaf8b32c';
const imgImage3 = 'https://www.figma.com/api/mcp/asset/129d9b18-96bf-4563-9e58-85572472a03a';
const imgRectangle63 = 'https://www.figma.com/api/mcp/asset/026673e8-1d52-444d-9e24-fa83020bad63';
const imgRectangle65 = 'https://www.figma.com/api/mcp/asset/d0edc58a-54c9-4f26-bf34-7282b71ef95a';
const keyboardImg0 = 'https://www.figma.com/api/mcp/asset/2b7245e3-b2ac-4aa5-a0eb-0dc57309f211';
const keyboardImg10 = 'https://www.figma.com/api/mcp/asset/648197c1-631e-43d4-ba15-5eb4eeafc874';
const keyboardImg9 = 'https://www.figma.com/api/mcp/asset/b50aa84f-78a1-4918-827b-de9e5c7845a8';
const keyboardImgKeyBackground = 'https://www.figma.com/api/mcp/asset/b909672a-3459-40cc-ae03-d5803a5e5025';
const keyboardImg3 = 'https://www.figma.com/api/mcp/asset/34f2fbd1-d186-44f8-bea2-a600039fca9d';

type ScanImage = {
	id: string;
	url: string;
	order: number;
};

type ScanItemStatus = 'pending' | 'classified';

type ScanTransaction = {
	id: string;
	merchantName: string;
	amountValue: string;
	dateValue: string;
	timeValue?: string;
	timeOfDay?: 'Morning' | 'Noon' | 'Afternoon' | 'Evening' | 'Night';
	repeat?: string;
	category?: string | null;
	source: string;
	transactionType: 'expense' | 'income';
	selected: boolean;
	status: ScanItemStatus;
	receiptLabel?: string;
	confidence?: number;
	rawText?: string;
	note?: string;
};

type ScanSession = {
	sessionId: string;
	uploadedImages: ScanImage[];
	pendingTransactions: ScanTransaction[];
	classifiedTransactions: ScanTransaction[];
	summary?: {
		totalImages: number;
		pendingCount: number;
		classifiedCount: number;
		selectedCount: number;
	};
};

type ClassifyFormState = {
	transactionType: 'expense' | 'income';
	merchantName: string;
	amountValue: string;
	dateValue: string;
	timeValue: string;
	timeOfDay: 'Morning' | 'Noon' | 'Afternoon' | 'Evening' | 'Night';
	category: string;
	repeat: string;
	source: string;
	note: string;
};

const categoryOptions = ['Food and Drinks', 'Experience', 'Savings', 'Fixed bill', 'Developement'];
const repeatOptions = ['No repeat', 'Daily', 'Weekly', 'Monthly', 'Yearly'];
const sourceOptions = [
	{ name: 'MB Bank', shortCode: 'MB', badgeColor: '#1f3fbf', logoSrc: '/icons/MBbank.png' },
	{ name: 'Vietcombank', shortCode: 'VCB', badgeColor: '#009b77', logoSrc: '/icons/Vietcombank.png' },
	{ name: 'Techcombank', shortCode: 'TCB', badgeColor: '#d61f26', logoSrc: '/icons/techcombank.png' },
	{ name: 'SHB Bank', shortCode: 'SHB', badgeColor: '#f28c00', logoSrc: '/icons/SHB.jpg' },
	{ name: 'BIDV', shortCode: 'BIDV', badgeColor: '#0054a6', logoSrc: '/icons/Bidv.png' },
	{ name: 'Vietinbank', shortCode: 'VTB', badgeColor: '#d11a2a', logoSrc: '/icons/Vietinbank.png' },
	{ name: 'ACB', shortCode: 'ACB', badgeColor: '#00a0df', logoSrc: '/icons/ACB.png' },
];

const defaultSourceName = sourceOptions[3].name;

function formatDateForDisplay(dateValue: string) {
	if (!dateValue) {
		return '21/05/2026';
	}

	const [year, month, day] = dateValue.split('-');
	if (!year || !month || !day) {
		return dateValue;
	}

	return `${day}/${month}/${year}`;
}

function getTodayDateValue() {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
}

function formatDateForDisplayLong(dateValue: string) {
	const today = getTodayDateValue();
	const [year, month, day] = dateValue.split('-');
	if (!year || !month || !day) {
		return `Today, ${formatDateForDisplay(today)}`;
	}

	const display = `${day}/${month}/${year}`;
	return dateValue === today ? `Today, ${display}` : display;
}

function formatAmountDisplay(amountValue: string) {
	if (!amountValue) {
		return '0đ';
	}

	const numericValue = Number(amountValue);
	if (!Number.isFinite(numericValue) || numericValue <= 0) {
		return '0đ';
	}

	return `${numericValue.toLocaleString('vi-VN')}đ`;
}

function normalizeAmountValue(amountValue: string) {
	const digitsOnly = amountValue.replace(/[^\d.-]/g, '');
	const numericValue = Number(digitsOnly);
	if (!Number.isFinite(numericValue) || numericValue <= 0) {
		return '0';
	}

	return String(Math.round(Math.abs(numericValue)));
}

function formatSignedAmount(item: ScanTransaction) {
	const normalizedAmount = Number(normalizeAmountValue(item.amountValue));
	if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
		return '0đ';
	}

	const sign = item.transactionType === 'expense' ? '-' : '+';
	return `${sign}${normalizedAmount.toLocaleString('vi-VN')}đ`;
}

function CalendarPlus({ className }: { className?: string }) {
	return (
		<div className={className || 'relative size-[24px]'} data-name="calendar-plus">
			<div className="absolute inset-[16.67%_12.5%_12.5%_12.5%]" data-name="Vector">
				<div className="absolute inset-[-4.41%_-4.17%]">
					<img alt="" className="block max-w-none size-full" src={imgVector3} />
				</div>
			</div>
			<div className="absolute inset-[58.33%_41.67%_41.67%_41.67%]" data-name="Vector">
				<div className="absolute inset-[-0.75px_-18.75%]">
					<img alt="" className="block max-w-none size-full" src={imgVector4} />
				</div>
			</div>
			<div className="absolute bottom-[33.33%] left-1/2 right-1/2 top-1/2" data-name="Vector">
				<div className="absolute inset-[-18.75%_-0.75px]">
					<img alt="" className="block max-w-none size-full" src={imgVector5} />
				</div>
			</div>
			<div className="absolute inset-[33.33%_13.54%_66.67%_13.54%]" data-name="Vector">
				<div className="absolute inset-[-0.75px_-4.29%]">
					<img alt="" className="block max-w-none size-full" src={imgVector6} />
				</div>
			</div>
			<div className="absolute inset-[12.5%_31.25%_79.17%_68.75%]" data-name="Vector">
				<div className="absolute inset-[-37.5%_-0.75px]">
					<img alt="" className="block max-w-none size-full" src={imgVector7} />
				</div>
			</div>
			<div className="absolute inset-[12.5%_68.75%_79.17%_31.25%]" data-name="Vector">
				<div className="absolute inset-[-37.5%_-0.75px]">
					<img alt="" className="block max-w-none size-full" src={imgVector8} />
				</div>
			</div>
		</div>
	);
}

function ChevronDown({ className }: { className?: string }) {
	return (
		<div className={className || "relative size-[25px]"} data-node-id="242:357" data-name="chevron-down">
			<div className="absolute bottom-3/4 flex items-center justify-center left-[32%] right-[26.33%] top-0" style={{ containerType: "size" }}>
				<div className="-rotate-90 flex-none h-[100cqw] w-[100cqh]">
					<div className="relative size-full" data-node-id="242:358" data-name="Vector">
						<img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector228} />
					</div>
				</div>
			</div>
		</div>
	);
}

function createFallbackSession(): ScanSession {
	return {
		sessionId: 'scan_demo_session',
		uploadedImages: [],
		pendingTransactions: [],
		classifiedTransactions: [],
	};
}

function readSession(): ScanSession {
	if (typeof window === 'undefined') {
		return createFallbackSession();
	}

	const raw = window.sessionStorage.getItem(STORAGE_KEY);
	if (!raw) {
		return createFallbackSession();
	}

	try {
		const parsed = JSON.parse(raw) as Partial<ScanSession>;
		return {
			sessionId: parsed.sessionId || 'scan_session',
			uploadedImages: parsed.uploadedImages || createFallbackSession().uploadedImages,
			pendingTransactions: parsed.pendingTransactions || createFallbackSession().pendingTransactions,
			classifiedTransactions: parsed.classifiedTransactions || createFallbackSession().classifiedTransactions,
			summary: parsed.summary,
		};
	} catch {
		return createFallbackSession();
	}
}

function getInitialScanState() {
	const initialSession = readSession();
	const initialClassifiedTransactions = initialSession.classifiedTransactions || [];

	return {
		session: initialSession,
		pendingTransactions: initialSession.pendingTransactions || [],
		classifiedTransactions: initialClassifiedTransactions,
		selectedIds: initialClassifiedTransactions.filter((item) => item.selected).map((item) => item.id),
	};
}

async function fileToDataUrl(file: File): Promise<string> {
	return await new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result === 'string') {
				resolve(reader.result);
				return;
			}

			reject(new Error('Unable to read image preview'));
		};
		reader.onerror = () => reject(new Error('Unable to read image preview'));
		reader.readAsDataURL(file);
	});
}

function ResultHeader({ onClose }: { onClose: () => void }) {
	return (
		<div className="absolute left-0 top-0 flex h-[64px] w-full items-center justify-between px-[20px]">
			<button type="button" onClick={onClose} aria-label="Back" className="flex size-[40px] items-center justify-center rounded-full">
				<ChevronLeft className="size-[20px] rotate-90 text-white" strokeWidth={2.2} />
			</button>

			<div className="font-['SF Compact Rounded:Bold'] text-[24px] leading-[28px] text-[#ebeef2]">Enter via Photo</div>

			<button type="button" onClick={onClose} aria-label="Home" className="flex size-[34px] items-center justify-center rounded-full bg-[#f3f4f6] text-[#174F84] shadow-[0px_1px_1px_rgba(0,0,0,0.08)]">
				<House className="size-[18px]" strokeWidth={2.2} />
			</button>
		</div>
	);
}

function UploadedImagesPanel({
	images,
	activeIndex,
	onAddImage,
	onRemoveImage,
	onSelectImage,
}: {
	images: ScanImage[];
	activeIndex: number;
	onAddImage: () => void;
	onRemoveImage: (id: string) => void;
	onSelectImage: (index: number) => void;
}) {
	return (
		<div className="rounded-[16px] border border-[#f3f4f6] bg-white p-[17px] shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
			<div className="font-['SF Compact Rounded:Semibold'] text-[14px] font-semibold leading-[20px] text-[#6b7280]">Images ({images.length}/3)</div>
			<div className="mt-[16px] flex gap-[16px]">
				{images.map((image, index) => (
					<div
						key={image.id}
						onClick={() => onSelectImage(index)}
						className={`relative h-[64px] w-[64px] cursor-pointer overflow-hidden rounded-[8px] border ${activeIndex === index ? 'border-[#174F84]' : 'border-[#e5e7eb]'}`}
						role="button"
						tabIndex={0}
						onKeyDown={(event) => {
							if (event.key === 'Enter' || event.key === ' ') {
								onSelectImage(index);
							}
						}}
					>
						<img alt={`Uploaded ${index + 1}`} src={image.url} className="absolute inset-0 h-full w-full object-cover" />
						<button
							type="button"
							onClick={(event) => {
								event.stopPropagation();
								onRemoveImage(image.id);
							}}
							className="absolute right-[2px] top-[2px] flex size-[16px] items-center justify-center rounded-full bg-black/55 text-white"
							aria-label="Remove image"
						>
								<X className="size-[10px]" strokeWidth={2.5} />
							</button>
					</div>
				))}

				<button
					type="button"
					onClick={onAddImage}
					className="flex h-[64px] w-[64px] flex-col items-center justify-center gap-[4px] rounded-[8px] border-2 border-dashed border-[#e5e7eb] bg-white"
				>
					<Plus className="size-[20px] text-[#174F84]" strokeWidth={2.2} />
					<div className="font-['SF Compact Rounded:Bold'] text-[10px] font-bold uppercase leading-[15px] text-[#4b5563]">Add</div>
				</button>
			</div>
		</div>
	);
}

function PendingClassificationBanner({ count, onClassifyAll }: { count: number; onClassifyAll: () => void }) {
	return (
		<div className="overflow-hidden rounded-[16px] border border-[#fef9c3] bg-[#fff9e6] shadow-[0px_1px_1px_rgba(0,0,0,0.04)]">
			<div className="flex items-center gap-[12px] bg-[rgba(254,252,232,0.5)] p-[16px]">
				<div className="flex size-[40px] items-center justify-center rounded-[12px] border border-[#112945] bg-white">
					<Sparkles className="size-[22px] text-[#112945]" strokeWidth={2.2} />
				</div>
				<div className="flex-1 font-['SF Compact Rounded:Bold'] text-[14px] font-bold leading-[18px] text-[#1f2937]">
					{count} transaction pending classification...
				</div>
				<button type="button" onClick={onClassifyAll} className="rounded-full border border-[#112945] bg-white px-[14px] py-[7px] font-['SF Compact Rounded:Semibold'] text-[12px] font-semibold leading-[16px] text-[#112945] shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
					Classify
				</button>
			</div>
		</div>
	);
}

function TransactionBadge() {
	return (
		<div className="flex h-[21px] items-center gap-[4px] rounded-full border border-[#112945] px-[13px] py-[7px] text-[#112945]">
			<ReceiptText className="size-[12px]" strokeWidth={2.2} />
			<span className="font-['SF Compact Rounded:Semibold'] text-[12px] font-semibold leading-[15px]">Receipt</span>
		</div>
	);
}

function ClassifiedTransactionItem({
	item,
	selected,
	onToggleSelected,
}: {
	item: ScanTransaction;
	selected: boolean;
	onToggleSelected: () => void;
}) {
	return (
		<div className="flex items-center justify-between border-b border-[#f3f4f6] pb-[17px] last:border-b-0 last:pb-0">
			<div className="flex items-center gap-[12px]">
				<button
					type="button"
					onClick={onToggleSelected}
					className={`flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full border-2 ${selected ? (item.transactionType === 'expense' ? 'border-[#fca5a5] bg-white' : 'border-[#86efac] bg-white') : 'border-[#e5e7eb] bg-white'}`}
					aria-label="Toggle selection"
				>
					<div className={`h-[10px] w-[10px] rounded-full ${selected ? (item.transactionType === 'expense' ? 'bg-[#ef4444]' : 'bg-[#22c55e]') : 'bg-[#cbd5e1]'}`} />
				</button>

				<div className="flex flex-col">
					<div className="flex items-center gap-[8px]">
						<div className="font-['SF Compact Rounded:Semibold'] text-[14px] font-semibold leading-[20px] text-[#1f2937]">{item.merchantName}</div>
					</div>
					<div className="font-['SF Compact Rounded:Regular'] text-[12px] leading-[16px] text-[#9ca3af]">{formatDateForDisplay(item.dateValue)}</div>
					<div className={`font-['SF Compact Rounded:Bold'] text-[14px] font-bold leading-[20px] ${item.transactionType === 'expense' ? 'text-[#dc2626]' : 'text-[#28a745]'}`}>
						{formatSignedAmount(item)}
					</div>
				</div>
			</div>

			<TransactionBadge />
		</div>
	);
}

function PendingTransactionItem({ item, onClassify }: { item: ScanTransaction; onClassify: () => void }) {
	return (
		<div className="flex items-center justify-between border-b border-[#f3f4f6] py-[17px] last:border-b-0 last:pb-0">
			<div className="flex items-center gap-[12px]">
				<div className="flex size-[40px] items-center justify-center rounded-full border border-white bg-[#eaf2ff]">
					<ReceiptText className="size-[20px] text-[#174F84]" strokeWidth={2.2} />
				</div>
				<div className="flex flex-col">
					<div className="font-['SF Compact Rounded:Semibold'] text-[14px] font-semibold leading-[20px] text-[#1f2937]">{item.merchantName}</div>
					<div className="font-['SF Compact Rounded:Regular'] text-[12px] leading-[16px] text-[#9ca3af]">{formatDateForDisplay(item.dateValue)}</div>
					<div className="font-['SF Compact Rounded:Bold'] text-[14px] font-bold leading-[20px] text-[#111827]">+{Number(item.amountValue).toLocaleString('vi-VN')}đ</div>
				</div>
			</div>

			<button type="button" onClick={onClassify} className="rounded-full border border-[#112945] px-[13px] py-[7px] font-['SF Compact Rounded:Semibold'] text-[12px] font-semibold leading-[16px] text-[#112945]">
				Classify
			</button>
		</div>
	);
}

function TransactionTypeToggle({ value, onChange }: { value: 'expense' | 'income'; onChange: (next: 'expense' | 'income') => void }) {
	return (
		<div className="bg-[rgba(229,229,230,0.71)] content-stretch flex h-[44px] items-center overflow-hidden pb-[4px] pl-[4px] pr-[37px] pt-[3px] rounded-[30px] shadow-[2px_2px_10px_0px_rgba(0,0,0,0.2)] relative mx-auto w-[280px]">
			<div className={`absolute left-[4px] top-[3px] h-[37px] w-[136px] rounded-[20px] bg-white transition-transform duration-200 ease-out ${value === 'expense' ? 'translate-x-0' : 'translate-x-[136px]'}`} />
			<button
				type="button"
				onClick={() => onChange('expense')}
				aria-pressed={value === 'expense'}
				className={`absolute left-[4px] top-[3px] z-10 flex h-[37px] w-[136px] items-center justify-start gap-[12px] rounded-[20px] px-[26px] transition-colors ${value === 'expense' ? 'text-[#174f84]' : 'text-black/80'}`}
			>
				<div className="size-[23.961px] shrink-0">
					<img alt="" className="block max-w-none size-full" src={imgGroup41} />
				</div>
				<p className={`font-['SF Compact Rounded:Regular'] leading-[23.961px] not-italic text-[12px] text-center whitespace-nowrap ${value === 'expense' ? 'text-[#174f84]' : 'text-black/80'}`}>Expenses</p>
			</button>
			<button
				type="button"
				onClick={() => onChange('income')}
				aria-pressed={value === 'income'}
				className={`absolute right-[4px] top-[3px] z-10 flex h-[37px] w-[136px] items-center justify-start gap-[12px] rounded-[20px] px-[26px] transition-colors ${value === 'income' ? 'text-[rgba(23,79,132,0.8)]' : 'text-black/80'}`}
			>
				<div className="absolute left-[35px] top-[13px] flex h-[10px] w-[8px] items-center justify-center">
					<div className="-rotate-90 flex-none">
						<div className="h-[8px] relative w-[10px]">
							<div className="absolute inset-[-12.5%_-14.38%_-12.5%_-10%]">
								<img alt="" className="block max-w-none size-full" src={imgVector28} />
							</div>
						</div>
					</div>
				</div>
				<div className="flex items-center justify-center relative shrink-0 size-[24px]">
					<div className="-rotate-90 flex-none translate-x-[1px] translate-y-[0px]">
						<div className="relative size-[24px]">
							<img alt="" className="absolute block inset-0 max-w-none object-contain size-full" src={imgEllipse44} />
						</div>
					</div>
				</div>
				<p className={`[word-break:break-word] font-['SF Compact Rounded:Regular'] leading-[24px] not-italic relative shrink-0 text-[12px] text-center whitespace-nowrap ${value === 'income' ? 'text-[rgba(23,79,132,0.8)]' : 'text-black/80'}`}>Income</p>
			</button>
		</div>
	);
}

function CategoryChip({
	label,
	active,
	onClick,
}: {
	label: string;
	active: boolean;
	onClick: () => void;
}) {
	const meta = getCategoryMeta(label);

	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={active}
			className={`flex flex-col items-center justify-start w-[64px] transition-colors ${active ? 'text-black' : 'text-black/90'}`}
		>
			<span className={`relative flex h-[40px] w-[40px] items-center justify-center rounded-full transition-colors ${active ? `bg-[${meta.activeBg}]` : `bg-[${meta.inactiveBg}]`}` as string} style={{ backgroundColor: active ? meta.activeBg : meta.inactiveBg }}>
				<span className="absolute inset-[4px] rounded-full" style={{ backgroundColor: active ? meta.innerActiveBg : meta.innerInactiveBg }} />
				<img alt="" className="pointer-events-none relative size-[36px]" src={meta.icon} />
			</span>
			<span className="mt-[6px] text-[10px] leading-[normal] text-center whitespace-nowrap" style={{ fontFamily: 'var(--font-sf-rounded)', fontWeight: 400 }}>
				{label === 'Food and Drinks' ? <><span>Food and</span><br /><span>Drinks</span></> : label}
			</span>
		</button>
	);
}

function HomeIndicatorIPhone({ className }: { className?: string }) {
	return (
		<div className={className || 'h-[34px] relative w-[390px]'}>
			<div className="-translate-x-1/2 absolute bg-black bottom-[8px] h-[5px] left-1/2 rounded-[100px] w-[134px]" />
		</div>
	);
}

function AmountKeyboard({
	amountValue,
	onDigitPress,
	onDeletePress,
	onSuggestionPress,
}: {
	amountValue: string;
	onDigitPress: (digit: string) => void;
	onDeletePress: () => void;
	onSuggestionPress: (nextAmountValue: string) => void;
}) {
	const numericAmountValue = Number(amountValue);
	const quickSuggestionMultipliers = [1000, 10000, 100000];
	const quickSuggestions = Number.isFinite(numericAmountValue) && numericAmountValue > 0
		? quickSuggestionMultipliers.map((multiplier) => {
			const nextAmountValue = String(Math.round(numericAmountValue * multiplier));
			return { label: `${Number(nextAmountValue).toLocaleString('vi-VN')}đ`, nextAmountValue };
		})
		: [];

	const digitBackground = (digit: string) => {
		if (digit === '0') {
			return keyboardImg0;
		}

		if (digit === '5') {
			return keyboardImgKeyBackground;
		}

		return digit === '1' || digit === '2' || digit === '3' ? keyboardImg3 : keyboardImg9;
	};

	const renderDigitKey = (digit: string, secondary: string, insetClassName: string) => (
		<button
			key={digit}
			type="button"
			aria-label={`Key ${digit}`}
			className={`absolute block cursor-pointer inset-0 ${insetClassName}`}
			onClick={() => onDigitPress(digit)}
		>
			<div className="absolute inset-[0_0_-2.13%_0]">
				<img alt="" className="block max-w-none size-full" src={digitBackground(digit)} />
			</div>
			<p className="[word-break:break-word] absolute bottom-[17px] font-['SF Compact Rounded:Bold'] font-bold leading-[normal] left-0 right-[-0.23px] text-[10px] text-black text-center translate-y-full" style={{ fontVariationSettings: "'wdth' 100" }}>
				{secondary}
			</p>
			<p className="[word-break:break-word] absolute bottom-[45px] font-['SF Compact Rounded:Regular'] font-normal leading-[normal] left-0 right-[-0.23px] text-[25px] text-black text-center translate-y-full" style={{ fontVariationSettings: "'wdth' 100" }}>
				{digit}
			</p>
		</button>
	);

	return (
		<div className="bg-[#e8eaed] content-stretch flex flex-col gap-[44px] items-start relative rounded-[3px] size-full">
			<div className="content-stretch flex flex-col items-center px-[3px] relative shrink-0 w-full" data-name="Key and suggestions">
				<div className="relative h-[52px] w-full">
					{quickSuggestions.length > 0 ? (
						<div className="absolute inset-0 content-stretch flex items-center justify-center gap-[24px] px-[16px] pt-[12px] w-full z-10">
							{quickSuggestions.map((suggestion) => (
								<button
									key={suggestion.nextAmountValue}
									type="button"
									className="border-0 border-black border-solid content-stretch flex gap-[10px] h-[24px] items-center justify-center px-[20px] py-[5px] relative shrink-0 w-[88px]"
									aria-label={`Use ${suggestion.label}`}
									onClick={() => onSuggestionPress(suggestion.nextAmountValue)}
								>
									<div className="absolute bg-[#ffffff] border-0 border-black border-solid h-[24px] left-0 rounded-[20px] top-0 w-[88px]" />
									<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Medium'] font-medium justify-end leading-[0] not-italic relative shrink-0 text-[11px] text-black text-center tracking-[0.066px] whitespace-nowrap">
										<p className="leading-[20px]">{suggestion.label}</p>
									</div>
								</button>
							))}
						</div>
					) : null}
				</div>
				<div className="content-stretch flex flex-col items-start pt-[6px] relative shrink-0 w-full" data-name="Key">
					<div className="h-[210px] relative shrink-0 w-full" data-name="Keys">
						<button type="button" aria-label="Key 0" className="absolute block cursor-pointer inset-[77.78%_33.88%_0_33.88%]" onClick={() => onDigitPress('0')}>
							<div className="absolute inset-[0_0_-2.17%_0]">
								<img alt="" className="block max-w-none size-full" src={keyboardImg0} />
							</div>
							<p className="[word-break:break-word] absolute bottom-[39px] font-['SF Compact Rounded:Regular'] font-normal leading-[normal] left-0 right-[-0.23px] text-[25px] text-black text-center translate-y-full" style={{ fontVariationSettings: "'wdth' 100" }}>
								0
							</p>
						</button>
						<button type="button" aria-label="Delete" className="absolute block cursor-pointer inset-[77.78%_0.08%_0_67.69%]" onClick={onDeletePress}>
							<img alt="" className="absolute block inset-0 max-w-none size-full" src={keyboardImg10} />
						</button>
						{renderDigitKey('9', 'WXYZ', 'inset-[51.69%_0.08%_25.6%_67.69%]')}
						{renderDigitKey('8', 'TUV', 'inset-[51.69%_33.88%_25.6%_33.88%]')}
						{renderDigitKey('7', 'PQRS', 'inset-[51.69%_67.77%_25.6%_0]')}
						{renderDigitKey('6', 'MNO', 'inset-[25.6%_0.08%_51.69%_67.69%]')}
						{renderDigitKey('5', 'JKL', 'inset-[25.6%_33.88%_51.69%_33.88%]')}
						{renderDigitKey('4', 'GHI', 'inset-[25.6%_67.77%_51.69%_0]')}
						{renderDigitKey('3', 'DEF', 'inset-[0_0.08%_77.78%_67.69%]')}
						{renderDigitKey('2', 'ABC', 'inset-[0_33.88%_77.78%_33.88%]')}
						{renderDigitKey('1', '', 'inset-[0_67.77%_77.78%_0]')}
					</div>
				</div>
			</div>
			<HomeIndicatorIPhone className="h-[34px] relative shrink-0 w-full" />
		</div>
	);
}

function ClassifySheet({
	item,
	onClose,
	onSave,
}: {
	item: ScanTransaction | null;
	onClose: () => void;
	onSave: (form: ClassifyFormState) => void;
}) {
	const initialSource = item?.source && item.source !== 'Receipt' ? item.source : defaultSourceName;
	const [form, setForm] = useState<ClassifyFormState>({
		transactionType: item?.transactionType || 'expense',
		merchantName: item?.merchantName || '',
		amountValue: item?.amountValue || '',
		dateValue: item?.dateValue || '2026-05-21',
		timeValue: item?.timeValue || '09:15',
		timeOfDay: 'Morning',
		category: item?.category || 'Food and Drinks',
		repeat: 'No repeat',
		source: initialSource,
		note: item?.rawText || '',
	});
	const [showAmountKeyboard, setShowAmountKeyboard] = useState(false);
	const [isRepeatDropdownOpen, setIsRepeatDropdownOpen] = useState(false);
	const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);
	const repeatDropdownRef = useRef<HTMLDivElement | null>(null);
	const sourceDropdownRef = useRef<HTMLDivElement | null>(null);
	const dateInputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		const nextSource = item?.source && item.source !== 'Receipt' ? item.source : defaultSourceName;
		setForm({
			transactionType: item?.transactionType || 'expense',
			merchantName: item?.merchantName || '',
			amountValue: item?.amountValue || '',
			dateValue: item?.dateValue || '2026-05-21',
			timeValue: item?.timeValue || '09:15',
			timeOfDay: 'Morning',
			category: item?.category || 'Food and Drinks',
			repeat: 'No repeat',
			source: nextSource,
			note: item?.rawText || '',
		});
	}, [item]);

	useEffect(() => {
		if (!isRepeatDropdownOpen && !isSourceDropdownOpen && !showAmountKeyboard) {
			return undefined;
		}

		const handlePointerDown = (event: MouseEvent) => {
			const targetNode = event.target as Node;
			if (isRepeatDropdownOpen && repeatDropdownRef.current && !repeatDropdownRef.current.contains(targetNode)) {
				setIsRepeatDropdownOpen(false);
			}

			if (isSourceDropdownOpen && sourceDropdownRef.current && !sourceDropdownRef.current.contains(targetNode)) {
				setIsSourceDropdownOpen(false);
			}
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setIsRepeatDropdownOpen(false);
				setIsSourceDropdownOpen(false);
				setShowAmountKeyboard(false);
			}
		};

		document.addEventListener('mousedown', handlePointerDown);
		document.addEventListener('keydown', handleEscape);

		return () => {
			document.removeEventListener('mousedown', handlePointerDown);
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isRepeatDropdownOpen, isSourceDropdownOpen, showAmountKeyboard]);

	const openDatePicker = () => {
		const dateInput = dateInputRef.current;
		if (!dateInput) {
			return;
		}

		const inputWithPicker = dateInput as HTMLInputElement & { showPicker?: () => void };
		if (inputWithPicker.showPicker) {
			inputWithPicker.showPicker();
			return;
		}

		dateInput.click();
	};

	const handleAmountDigitPress = (digit: string) => {
		setShowAmountKeyboard(true);
		setForm((current) => {
			if (digit === '0' && !current.amountValue) {
				return { ...current, amountValue: '0' };
			}

			if (current.amountValue === '0') {
				return { ...current, amountValue: digit };
			}

			return { ...current, amountValue: `${current.amountValue}${digit}` };
		});
	};

	const handleAmountDelete = () => {
		setForm((current) => ({ ...current, amountValue: current.amountValue.slice(0, -1) }));
	};

	const handleAmountSuggestionPress = (nextAmountValue: string) => {
		setForm((current) => ({ ...current, amountValue: nextAmountValue }));
		setShowAmountKeyboard(true);
	};

	if (!item) {
		return null;
	}

	return (
		<div className="absolute inset-0 z-30 bg-black/30">
			<div className="absolute inset-x-0 bottom-0 max-h-[92%] overflow-y-auto rounded-t-[24px] bg-[#f7f8fa] shadow-[0px_-10px_30px_rgba(0,0,0,0.15)] hide-scrollbar">
				<div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e5e7eb] bg-[#f7f8fa] px-[20px] py-[16px]">
					<div>
						<div className="font-['SF Compact Rounded:Bold'] text-[18px] font-bold text-[#112945]">Classify transaction</div>
						<div className="font-['SF Compact Rounded:Regular'] text-[12px] text-[#6b7280]">Styled like Add Transaction</div>
					</div>
					<button type="button" onClick={onClose} aria-label="Close classify sheet" className="flex size-[34px] items-center justify-center rounded-full bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.08)]">
						<X className="size-[16px] text-[#174F84]" strokeWidth={2.4} />
					</button>
				</div>

				<div className="space-y-[16px] px-[20px] py-[16px] pb-[120px]">
					<TransactionTypeToggle value={form.transactionType} onChange={(next) => setForm((current) => ({ ...current, transactionType: next }))} />

					<div>
						<div className="mb-[8px] font-['SF Compact Rounded:Medium'] text-[12px] text-black">Amount<span className="text-[red]">*</span></div>
						<button type="button" onClick={() => setShowAmountKeyboard(true)} className="flex h-[70px] w-full items-center rounded-[10px] border-2 border-[rgba(224,224,224,0.9)] bg-white px-[16px] text-left shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
							<div className="font-['SF Compact Rounded:Bold'] text-[32px] leading-[38px] text-black">{formatAmountDisplay(form.amountValue)}</div>
						</button>
					</div>

					<div>
						<div className="mb-[8px] font-['SF Compact Rounded:Semibold'] text-[12px] font-semibold text-black">Category<span className="text-[red]">*</span></div>
						<div className="grid grid-cols-5 gap-[8px]">
							{categoryOptions.map((option) => (
								<CategoryChip key={option} label={option} active={form.category === option} onClick={() => setForm((current) => ({ ...current, category: option }))} />
							))}
						</div>
					</div>

					<div>
						<div className="mb-[8px] font-['SF Compact Rounded:Semibold'] text-[12px] font-semibold text-black">When did it happen<span className="text-[red]">*</span></div>
						<div className="flex flex-wrap gap-[8px]">
							{(['Morning', 'Noon', 'Afternoon', 'Evening', 'Night'] as const).map((option) => (
								<button
									key={option}
									type="button"
									onClick={() => setForm((current) => ({ ...current, timeOfDay: option }))}
									aria-pressed={form.timeOfDay === option}
									className={`inline-flex min-w-[62px] items-center justify-center rounded-[10px] px-[12px] font-['SF Compact Rounded:Regular'] text-[10px] transition-colors ${option === 'Noon' ? 'h-[22px]' : 'h-[21px]'} ${form.timeOfDay === option ? 'bg-[#7CAF9F] text-white' : 'bg-[#F5F7FB] text-black'}`}
								>
									{option}
								</button>
							))}
						</div>
						<div className="mt-[10px] relative h-[42px] w-full rounded-[10px] border-2 border-[rgba(224,224,224,0.9)] bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
							<button type="button" onClick={openDatePicker} className="absolute right-[12px] top-1/2 flex size-[24px] -translate-y-1/2 items-center justify-center">
								<CalendarPlus className="size-[24px]" />
							</button>
							<span className="absolute left-[18px] top-1/2 -translate-y-1/2 font-['SF Compact Rounded:Regular'] text-[14px] text-black">
								{formatDateForDisplayLong(form.dateValue)}
							</span>
							<input ref={dateInputRef} type="date" value={form.dateValue} onChange={(event) => setForm((current) => ({ ...current, dateValue: event.target.value }))} className="sr-only" />
						</div>
					</div>

					<div>
						<div className="mb-[8px] font-['SF Compact Rounded:Semibold'] text-[12px] font-semibold text-black">Repeat</div>
						<div className="relative" ref={repeatDropdownRef}>
							<button type="button" onClick={() => setIsRepeatDropdownOpen((current) => !current)} className="flex h-[42px] w-full items-center justify-between rounded-[10px] border-2 border-[rgba(224,224,224,0.9)] bg-white px-[18px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
								<span className="font-['SF Compact Rounded:Regular'] text-[14px] text-black">{form.repeat}</span>
								<ChevronDown className="absolute left-[305px] size-[25px] top-[18px]" />
							</button>
							{isRepeatDropdownOpen ? (
								<div className="absolute left-0 top-[46px] z-20 w-full overflow-hidden rounded-[10px] border border-[rgba(224,224,224,0.9)] bg-white shadow-[0px_6px_16px_rgba(0,0,0,0.2)]">
									{repeatOptions.map((option) => (
										<button key={option} type="button" onClick={() => { setForm((current) => ({ ...current, repeat: option })); setIsRepeatDropdownOpen(false); }} className={`block w-full px-[16px] py-[10px] text-left font-['SF Compact Rounded:Regular'] text-[14px] ${form.repeat === option ? 'bg-[#F5F7FB] text-[#112945]' : 'bg-white text-black hover:bg-[#F5F7FB]'}`}>
											{option}
										</button>
									))}
								</div>
							) : null}
						</div>
					</div>

					<div>
						<div className="mb-[8px] font-['SF Compact Rounded:Semibold'] text-[12px] font-semibold text-black">Source<span className="text-[red]">*</span></div>
						<div className="relative" ref={sourceDropdownRef}>
							<button type="button" onClick={() => setIsSourceDropdownOpen((current) => !current)} className="flex h-[42px] w-full items-center justify-between rounded-[10px] border-2 border-[rgba(224,224,224,0.9)] bg-white px-[18px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
								<span className="flex items-center gap-[8px]">
									{(() => {
										const selectedSourceMeta = sourceOptions.find((option) => option.name === form.source) || sourceOptions[3];
										return <SourceLogo badgeColor={selectedSourceMeta.badgeColor} logoSrc={selectedSourceMeta.logoSrc} shortCode={selectedSourceMeta.shortCode} />;
									})()}
									<span className="font-['SF Compact Rounded:Regular'] text-[14px] text-black">{form.source}</span>
								</span>
								<ChevronDown className="absolute left-[305px] size-[25px] top-[18px]" />
							</button>
							{isSourceDropdownOpen ? (
								<div className="absolute left-0 top-[46px] z-20 w-full overflow-hidden rounded-[10px] border border-[rgba(224,224,224,0.9)] bg-white shadow-[0px_6px_16px_rgba(0,0,0,0.2)]">
									{sourceOptions.map((option) => (
										<button key={option.name} type="button" onClick={() => { setForm((current) => ({ ...current, source: option.name })); setIsSourceDropdownOpen(false); }} className={`flex w-full items-center gap-[10px] px-[16px] py-[10px] text-left font-['SF Compact Rounded:Regular'] text-[14px] ${form.source === option.name ? 'bg-[#F5F7FB] text-[#112945]' : 'bg-white text-black hover:bg-[#F5F7FB]'}`}>
											<SourceLogo badgeColor={option.badgeColor} logoSrc={option.logoSrc} shortCode={option.shortCode} />
											<span>{option.name}</span>
										</button>
									))}
								</div>
							) : null}
						</div>
					</div>

					<div>
						<div className="mb-[8px] font-['SF Compact Rounded:Semibold'] text-[12px] font-semibold text-black">Note</div>
						<textarea value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} className="min-h-[96px] w-full rounded-[10px] border-2 border-[rgba(224,224,224,0.9)] bg-white px-[18px] py-[12px] font-['SF Compact Rounded:Regular'] text-[14px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] outline-none" placeholder="Description" />
					</div>

				</div>

				<div className="sticky bottom-0 z-10 flex gap-[12px] border-t border-[#e5e7eb] bg-[#f7f8fa] px-[20px] py-[16px]">
					<button type="button" onClick={onClose} className="h-[45px] flex-1 rounded-[20px] border border-[#c2c7d0] bg-white font-['SF Compact Rounded:Semibold'] text-[16px] font-semibold text-[#42474f]">Cancel</button>
					<button type="button" onClick={() => onSave(form)} className="h-[45px] flex-1 rounded-[20px] bg-[#174F84] font-['SF Compact Rounded:Semibold'] text-[16px] font-semibold text-white shadow-[2px_2px_10px_rgba(0,0,0,0.2)]">Save</button>
				</div>
			</div>

			{showAmountKeyboard ? (
				<div className="absolute inset-0 z-40">
					<button aria-label="Close amount keyboard" className="absolute inset-0 cursor-default border-0 bg-transparent p-0" onClick={() => setShowAmountKeyboard(false)} type="button" />
					<div className="absolute bottom-0 left-0 right-0 z-10">
						<AmountKeyboard amountValue={form.amountValue} onDigitPress={handleAmountDigitPress} onDeletePress={handleAmountDelete} onSuggestionPress={handleAmountSuggestionPress} />
					</div>
				</div>
			) : null}
		</div>
	);
}

const CATEGORY_TO_FUND_TYPE: Record<string, string> = {
	'Food and Drinks': 'food',
	'Experience': 'experience',
	'Developement': 'growth',
	'Fixed bill': 'living',
	'Savings': 'future',
};

function getFundIdForCategory(category: string, funds: Fund[]): string | null {
	const fundType = CATEGORY_TO_FUND_TYPE[category] ?? 'food';
	const match = funds.find((f) => f.fundType === fundType);
	return match?.id ?? (funds[0]?.id ?? null);
}

export default function ResultUploadPhoto() {
	const router = useRouter();
	const [session, setSession] = useState<ScanSession>(() => getInitialScanState().session);
	const [activeImageIndex, setActiveImageIndex] = useState(0);
	const [selectedIds, setSelectedIds] = useState<string[]>(() => getInitialScanState().selectedIds);
	const [pendingTransactions, setPendingTransactions] = useState<ScanTransaction[]>(() => getInitialScanState().pendingTransactions);
	const [classifiedTransactions, setClassifiedTransactions] = useState<ScanTransaction[]>(() => getInitialScanState().classifiedTransactions);
	const [editingPendingId, setEditingPendingId] = useState<string | null>(null);
	const [toastMessage, setToastMessage] = useState('');
	const [isToastVisible, setIsToastVisible] = useState(false);
	const [funds, setFunds] = useState<Fund[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const hiddenFileInputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		bootstrapAuth().then(() => {
			getFunds().then((res) => {
				if (res.ok) {
					setFunds(res.data);
				}
			});
		});
	}, []);

	useEffect(() => {
		if (!isToastVisible) {
			return undefined;
		}

		const timeoutId = window.setTimeout(() => setIsToastVisible(false), 1800);
		return () => window.clearTimeout(timeoutId);
	}, [isToastVisible]);

	const selectedCount = useMemo(() => selectedIds.length, [selectedIds]);
	const pendingCount = pendingTransactions.length;
	const classifiedCount = classifiedTransactions.length;

	const showToast = (message: string) => {
		setToastMessage(message);
		setIsToastVisible(true);
	};

	const updateStoredSession = (nextSession: ScanSession) => {
		if (typeof window === 'undefined') {
			return;
		}

		window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
		setSession(nextSession);
	};

	const handleAddImage = () => {
		router.push('/take-photo');
	};

	const handleImagesSelected = (files: FileList | null) => {
		if (!files || files.length === 0) {
			return;
		}

		void (async () => {
			const nextImages = [...session.uploadedImages];
			const selectedFiles = Array.from(files).slice(0, 3 - nextImages.length);
			const nextUrls = await Promise.all(selectedFiles.map((file) => fileToDataUrl(file)));

			nextUrls.forEach((url, index) => {
				nextImages.push({
					id: `img_${Date.now()}_${index}`,
					url,
					order: nextImages.length + index + 1,
				});
			});

			updateStoredSession({ ...session, uploadedImages: nextImages });
			showToast('Image added');
		})();
	};

	const handleRemoveImage = (id: string) => {
		const nextImages = session.uploadedImages.filter((image) => image.id !== id);
		const nextIndex = Math.max(0, Math.min(activeImageIndex, nextImages.length - 1));
		updateStoredSession({ ...session, uploadedImages: nextImages });
		setActiveImageIndex(nextIndex);
		showToast('Image removed');
	};

	const handleClassifyPending = (id: string) => {
		setEditingPendingId(id);
	};

	const handleSaveClassification = (form: ClassifyFormState) => {
		if (!editingPendingId) {
			return;
		}

		const pendingItem = pendingTransactions.find((item) => item.id === editingPendingId);
		if (!pendingItem) {
			setEditingPendingId(null);
			return;
		}

		const classifiedItem: ScanTransaction = {
			...pendingItem,
			transactionType: form.transactionType,
			merchantName: form.merchantName,
			amountValue: normalizeAmountValue(form.amountValue),
			dateValue: form.dateValue,
			timeValue: form.timeValue,
			timeOfDay: form.timeOfDay,
			repeat: form.repeat,
			category: form.category,
			source: form.source,
			selected: true,
			status: 'classified',
			receiptLabel: 'Receipt',
			rawText: form.note || pendingItem.rawText,
			note: form.note,
		};

		const nextPending = pendingTransactions.filter((item) => item.id !== editingPendingId);
		const nextClassified = [classifiedItem, ...classifiedTransactions];
		const nextSelected = Array.from(new Set([...selectedIds, classifiedItem.id]));

		updateStoredSession({
			...session,
			pendingTransactions: nextPending,
			classifiedTransactions: nextClassified,
			summary: {
				totalImages: session.uploadedImages.length,
				pendingCount: nextPending.length,
				classifiedCount: nextClassified.length,
				selectedCount: nextSelected.length,
			},
		});

		setPendingTransactions(nextPending);
		setClassifiedTransactions(nextClassified);
		setSelectedIds(nextSelected);
		setEditingPendingId(null);
		showToast('Transaction classified');
	};

	const handleToggleSelected = (id: string) => {
		setSelectedIds((current) => (current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]));
	};

	const handleCancelAllSelections = () => {
		setSelectedIds([]);
		showToast('Selections cleared');
	};

	const handleSubmit = async () => {
		if (isSubmitting) return;

		const selectedItems = classifiedTransactions.filter((item) => selectedIds.includes(item.id));
		if (selectedItems.length === 0) {
			showToast('Please select at least 1 classified transaction');
			return;
		}

		setIsSubmitting(true);
		try {
			await Promise.all(
				selectedItems.map(async (item) => {
					const category = item.category || 'Food and Drinks';
					const fundId = getFundIdForCategory(category, funds);
					if (!fundId) {
						throw new Error(`Fund not found for category ${category}`);
					}

					const description = item.merchantName + (item.note ? ` - ${item.note}` : '');
					const mealType = category === 'Food and Drinks' 
						? classifyMealType(description) 
						: undefined;

					const amount = Math.abs(Number(item.amountValue)) || 0;

					const res = await createTransaction({
						fundId,
						amount,
						transactionType: item.transactionType,
						category,
						description,
						inputMethod: 'ai_image',
						mealType,
						transactionDate: item.dateValue,
					});

					if (!res.ok) {
						throw new Error(res.error || 'Failed to save transaction');
					}
				})
			);

			window.sessionStorage.removeItem(STORAGE_KEY);
			window.sessionStorage.setItem('zuno:receipt-scan-selected', JSON.stringify(selectedItems));
			showToast(`${selectedItems.length} transactions saved successfully`);
			router.push('/done-upload-photo');
		} catch (err: any) {
			showToast(err.message || 'Failed to save transactions');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="relative mx-auto h-[852px] w-[393px] overflow-hidden bg-[#f7f8fa]">
			<div className="absolute left-0 top-0 h-[453px] w-[393px] bg-gradient-to-b from-[#112945] via-[#4d78a8] to-[#f7f8fa] backdrop-blur-[2px]" />
			<ResultHeader onClose={() => window.location.assign('/')} />

			<div className="absolute left-0 top-[104px] flex h-[805px] w-[393px] flex-col gap-[16px] px-[16px] pb-[111px] pt-[16px]">
				<UploadedImagesPanel
					images={session.uploadedImages}
					activeIndex={activeImageIndex}
					onAddImage={handleAddImage}
					onRemoveImage={handleRemoveImage}
					onSelectImage={setActiveImageIndex}
				/>

				{pendingCount > 0 ? (
					<PendingClassificationBanner count={pendingCount} onClassifyAll={() => pendingTransactions[0] && handleClassifyPending(pendingTransactions[0].id)} />
				) : null}

				<div className="min-h-[400px] overflow-hidden rounded-[16px] border border-[#f3f4f6] bg-white shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
					<div className="flex items-center justify-between px-[16px] py-[16px]">
						<div>
							<div className="font-['SF Compact Rounded:Bold'] text-[18px] font-bold leading-[28px] text-[#1f2937]">{classifiedCount} classified transactions</div>
							<button type="button" onClick={handleCancelAllSelections} className="mt-[4px] flex items-center gap-[8px] text-[#374151]">
								<div className="flex size-[20px] items-center justify-center rounded-[4px] bg-[#bfe6c3]">
									<Plus className="size-[12px] rotate-45 text-[#112945]" strokeWidth={2.4} />
								</div>
								<span className="font-['SF Compact Rounded:Regular'] text-[14px] leading-[20px]">Cancel all selections</span>
							</button>
						</div>
					</div>

					<div className="px-[16px] pb-[16px]">
						<div className="flex flex-col gap-[16px] pt-[4px]">
							{pendingTransactions.map((item) => (
								<PendingTransactionItem key={item.id} item={item} onClassify={() => handleClassifyPending(item.id)} />
							))}
							{classifiedTransactions.map((item) => (
								<ClassifiedTransactionItem key={item.id} item={item} selected={selectedIds.includes(item.id)} onToggleSelected={() => handleToggleSelected(item.id)} />
							))}
						</div>
					</div>
				</div>
			</div>

			<div className="absolute left-[57px] top-[795px] z-20">
				<button
					type="button"
					onClick={handleSubmit}
					disabled={isSubmitting}
					className={`h-[45px] w-[280px] rounded-[20px] font-['SF Compact Rounded:Semibold'] text-[20px] font-semibold leading-[24px] text-white shadow-[2px_2px_10px_0px_rgba(0,0,0,0.2)] transition-colors ${isSubmitting ? 'bg-[#a7adb7] cursor-not-allowed' : 'bg-[#174F84]'}`}
				>
					{isSubmitting ? 'Saving...' : `Add ${selectedCount} transactions`}
				</button>
			</div>

			<div className="pointer-events-none absolute left-[165px] top-[512px] size-[22px] opacity-0">
				<img alt="" src={imgDefaultPreview} className="size-full" />
			</div>

			<input ref={hiddenFileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(event) => handleImagesSelected(event.target.files)} />

			{editingPendingId ? (
				<ClassifySheet key={editingPendingId} item={pendingTransactions.find((entry) => entry.id === editingPendingId) || null} onClose={() => setEditingPendingId(null)} onSave={handleSaveClassification} />
			) : null}

			{isToastVisible ? (
				<div className="absolute left-1/2 top-[80px] z-30 -translate-x-1/2 rounded-full bg-[#21667f] px-[20px] py-[10px] font-['SF Compact Rounded:Medium'] text-[12px] text-white shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1)]">
					{toastMessage}
				</div>
			) : null}

			<style jsx global>{`
				.hide-scrollbar {
					scrollbar-width: none;
					-ms-overflow-style: none;
				}

				.hide-scrollbar::-webkit-scrollbar {
					display: none;
				}
			`}</style>
		</div>
	);
}

function getCategoryMeta(category: string) {
	switch (category) {
		case 'Food and Drinks':
			return { icon: imgGroup56, activeBg: '#A8D76A', inactiveBg: '#CAE8A3', innerActiveBg: '#CAE8A3', innerInactiveBg: '#DFF1BF' };
		case 'Experience':
			return { icon: imgGroup78, activeBg: '#F29AB7', inactiveBg: '#F8D7E2', innerActiveBg: '#F8D7E2', innerInactiveBg: '#FBE7EE' };
		case 'Developement':
			return { icon: imgGroup59, activeBg: '#8AC9E8', inactiveBg: '#B4E5F5', innerActiveBg: '#B4E5F5', innerInactiveBg: '#D5F0FA' };
		case 'Fixed bill':
			return { icon: imgGroup54, activeBg: '#9FC0FF', inactiveBg: '#DDE9FC', innerActiveBg: '#DDE9FC', innerInactiveBg: '#EDF3FE' };
		case 'Savings':
			return { icon: imgGroup105, activeBg: '#71CFA7', inactiveBg: '#A6E4CB', innerActiveBg: '#A6E4CB', innerInactiveBg: '#CEF1E2' };
		default:
			return { icon: imgGroup56, activeBg: '#A8D76A', inactiveBg: '#CAE8A3', innerActiveBg: '#CAE8A3', innerInactiveBg: '#DFF1BF' };
	}
}
