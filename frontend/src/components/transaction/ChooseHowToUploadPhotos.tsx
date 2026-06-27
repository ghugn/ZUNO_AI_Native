"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, Camera, Image as ImageIcon, Info, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getReceiptScanMockProfile, getReceiptScanMockResponse, isReceiptScanMockEnabled } from '@/lib/mocks/receiptScanMock';

const previewAssets = [
	'https://www.figma.com/api/mcp/asset/327cc206-142b-4a0f-a2d3-00441d7e2c12',
	'https://www.figma.com/api/mcp/asset/7f6072e1-2b6e-4c93-95c9-d26f3ddf0e9e',
	'https://www.figma.com/api/mcp/asset/1ba32d89-2564-4973-988f-bd15b1d6ffe4',
];

const TRANSACTION_MODE_SESSION_KEY = 'zuno:transaction-mode';
const RECEIPT_SCAN_RESULT_SESSION_KEY = 'zuno:receipt-scan-result';

type ResultImage = {
	id: string;
	url: string;
	order: number;
};

type ReceiptScanSession = {
	sessionId: string;
	uploadedImages: ResultImage[];
	pendingTransactions: unknown[];
	classifiedTransactions: unknown[];
	summary: {
		totalImages: number;
		pendingCount: number;
		classifiedCount: number;
		selectedCount: number;
	};
};

type ReceiptScanResultSession = ReceiptScanSession & {
	pendingTransactions: Array<{
		id: string;
		merchantName: string;
		amountValue: string;
		dateValue: string;
		timeValue?: string;
		category?: string | null;
		source: string;
		transactionType: 'expense' | 'income';
		selected: boolean;
		status: 'pending' | 'classified';
		receiptLabel?: string;
		confidence?: number;
		rawText?: string;
	}>;
	classifiedTransactions: Array<{
		id: string;
		merchantName: string;
		amountValue: string;
		dateValue: string;
		timeValue?: string;
		category?: string | null;
		source: string;
		transactionType: 'expense' | 'income';
		selected: boolean;
		status: 'pending' | 'classified';
		receiptLabel?: string;
		confidence?: number;
		rawText?: string;
	}>;
};

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

function buildMockResultSession(profile: 'a' | 'b'): ReceiptScanResultSession {
	const response = getReceiptScanMockResponse(profile);
	const preview = profile === 'b' ? previewAssets[0] : previewAssets[1];
	const amountValue = String(response.amount || 0);
	const dateValue = response.time || '2026-05-21';

	if (profile === 'b') {
		return {
			sessionId: 'mock_b_session',
			uploadedImages: [
				{ id: 'img_b_1', url: previewAssets[0], order: 1 },
				{ id: 'img_b_2', url: previewAssets[1], order: 2 },
				{ id: 'img_b_3', url: previewAssets[2], order: 3 },
			],
			pendingTransactions: [
				{
					id: 'pending_b_1',
					merchantName: response.rawText || 'PHUC LONG COFFEE & TEA',
					amountValue,
					dateValue,
					timeValue: '09:45',
					category: null,
					source: 'Receipt',
					transactionType: 'expense',
					selected: false,
					status: 'pending',
					confidence: response.confidence || 0.84,
					rawText: response.rawText,
				},
			],
			classifiedTransactions: [
				{
					id: 'classified_b_1',
					merchantName: 'PHUC LONG COFFEE & TEA',
					amountValue,
					dateValue,
					timeValue: '09:45',
					category: 'Food and Drinks',
					source: 'Receipt',
					transactionType: 'expense',
					selected: true,
					status: 'classified',
					receiptLabel: 'Receipt',
					confidence: 0.92,
				},
				{
					id: 'classified_b_2',
					merchantName: 'PHUC LONG COFFEE & TEA',
					amountValue: '62000',
					dateValue,
					timeValue: '10:12',
					category: 'Experience',
					source: 'Receipt',
					transactionType: 'expense',
					selected: false,
					status: 'classified',
					receiptLabel: 'Receipt',
					confidence: 0.88,
				},
			],
			summary: {
				totalImages: 3,
				pendingCount: 1,
				classifiedCount: 2,
				selectedCount: 1,
			},
		};
	}

	return {
		sessionId: 'mock_a_session',
		uploadedImages: [{ id: 'img_a_1', url: preview, order: 1 }],
		pendingTransactions: [
			{
				id: 'pending_a_1',
				merchantName: response.rawText || 'NGUYEN VAN A chuyen tien',
				amountValue,
				dateValue,
				timeValue: '08:15',
				category: null,
				source: 'Receipt',
				transactionType: 'income',
				selected: false,
				status: 'pending',
				confidence: response.confidence || 0.78,
				rawText: response.rawText,
			},
		],
		classifiedTransactions: [
			{
				id: 'classified_a_1',
				merchantName: 'NGUYEN VAN A chuyen tien',
				amountValue,
				dateValue,
				timeValue: '08:15',
				category: 'Savings',
				source: 'Receipt',
				transactionType: 'income',
				selected: true,
				status: 'classified',
				receiptLabel: 'Receipt',
				confidence: 0.9,
			},
			{
				id: 'classified_a_2',
				merchantName: 'NGUYEN VAN A chuyen tien',
				amountValue: String(Math.max(45000, Math.round((response.amount || 75000) * 0.6))),
				dateValue,
				timeValue: '10:20',
				category: 'Experience',
				source: 'Receipt',
				transactionType: 'expense',
				selected: false,
				status: 'classified',
				receiptLabel: 'Receipt',
				confidence: 0.87,
			},
		],
		summary: {
			totalImages: 1,
			pendingCount: 1,
			classifiedCount: 2,
			selectedCount: 1,
		},
	};
}

function UploadBadge() {
	return (
		<div className="inline-flex items-center gap-2 rounded-full bg-[#dce9ff] px-[12px] py-[4px] text-[#003765] shadow-[0px_1px_0px_rgba(255,255,255,0.35)]">
			<Info className="size-[15px]" strokeWidth={2.5} />
			<span className="font-['SF Compact Rounded:Semibold'] text-[12px] font-semibold tracking-[0.12px] leading-[16px] whitespace-nowrap">
				Select up to 3 photos
			</span>
		</div>
	);
}

function UploadCard({
	icon,
	title,
	description,
	onClick,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex h-[120px] w-full items-center rounded-[12px] bg-white px-[25px] text-left shadow-[0px_10px_30px_-5px_rgba(22,78,133,0.08)]"
		>
			<div className="flex h-[64px] w-[84px] items-center justify-start pr-[20px]">
				<div className="flex size-[64px] items-center justify-center rounded-full bg-[#164e85] shadow-[0px_10px_15px_-3px_rgba(0,55,101,0.2),0px_4px_6px_-4px_rgba(0,55,101,0.2)]">
					{icon}
				</div>
			</div>
			<div className="min-w-0 flex-1 pr-[12px]">
				<div className="font-['SF Compact Rounded:Semibold'] text-[22px] font-semibold tracking-[-0.22px] leading-[28px] text-[#003765]">
					{title}
				</div>
				<div className="mt-[2px] font-['SF Compact Rounded:Regular'] text-[14px] leading-[20px] text-[#424750]">
					{description}
				</div>
			</div>
			<ChevronRight className="size-[18px] shrink-0 text-[#8b95a7]" strokeWidth={2.2} />
		</button>
	);
}

export default function ChooseHowToUploadPhotos() {
	const router = useRouter();
	const cameraInputRef = useRef<HTMLInputElement | null>(null);
	const [selectedPreviews, setSelectedPreviews] = useState<string[]>([]);
	const mockEnabled = process.env.NODE_ENV !== 'production' || isReceiptScanMockEnabled();

	useEffect(() => {
		try {
			window.sessionStorage.setItem(TRANSACTION_MODE_SESSION_KEY, 'scan');
		} catch (error) {
			// ignore
		}
	}, []);

	useEffect(() => {
		return () => {
			selectedPreviews.forEach((url) => URL.revokeObjectURL(url));
		};
	}, [selectedPreviews]);

	const displayPreviews = useMemo(() => {
		if (selectedPreviews.length > 0) {
			return selectedPreviews.slice(0, 3);
		}

		return previewAssets;
	}, [selectedPreviews]);

	const handleLoadMockSession = (profile: 'a' | 'b') => {
		const session = buildMockResultSession(profile);
		window.sessionStorage.setItem(RECEIPT_SCAN_RESULT_SESSION_KEY, JSON.stringify(session));
		router.push('/result-upload-photo');
	};

	return (
		<div className="relative min-h-[852px] w-full overflow-hidden bg-[#f7f8fa] font-['SF Compact Rounded:Regular']" data-node-id="130:637" data-name="iPhone 14 & 15 Pro - 11">
			<div className="absolute left-0 top-0 h-[453px] w-full bg-gradient-to-b from-[#112945] via-[#4d78a8] via-[37.5%] to-[#f7f8fa] backdrop-blur-[2px]" />


			<div className="absolute left-[20px] top-[48px] flex size-[40px] items-center justify-center">
				<button
					type="button"
					onClick={() => window.location.assign('/')}
					className="flex size-[40px] items-center justify-center rounded-full"
					aria-label="Close"
				>
					<X className="size-[14px] text-[#e8e9e9]" strokeWidth={2.4} />
				</button>
			</div>

				<div className="absolute left-[60px] top-[52px] font-['SF Compact Rounded:Bold'] text-[26px] font-bold leading-[32px] text-[#e8e9e9]">
				Add Photos
			</div>

			<div className="absolute left-0 right-0 top-[92px] flex flex-col px-[20px] pt-[32px]">
				<div className="max-w-full">
					<div className="font-['SF Compact Rounded:Medium'] text-[16px] font-medium leading-[24px] text-[#dcdcdc]">
						Choose how you want to add photos for this transaction.
					</div>
					<div className="mt-[8px]"><UploadBadge /></div>
				</div>

				<div className="mt-[32px] flex flex-col gap-[16px]">
					<UploadCard
						icon={<Camera className="size-[25px] text-white" strokeWidth={2.3} />}
						title="Take Photo"
						description="Use your camera to take a photo directly"
						onClick={() => router.push('/take-photo')}
					/>
					<UploadCard
						icon={<ImageIcon className="size-[25px] text-white" strokeWidth={2.3} />}
						title="Upload from Gallery"
						description="Access your photo library"
						onClick={() => router.push('/select-photo')}
					/>
				</div>

				{mockEnabled ? (
					<div className="mt-[16px] rounded-[16px] border border-dashed border-[#7aa3d6] bg-white/85 p-[12px] shadow-[0px_10px_30px_-5px_rgba(22,78,133,0.08)]">
						<div className="mb-[10px] font-['SF Compact Rounded:Semibold'] text-[12px] font-semibold uppercase tracking-[0.12px] text-[#174F84]">
							Mock test presets
						</div>
						<div className="grid grid-cols-2 gap-[10px]">
							<button type="button" onClick={() => handleLoadMockSession('a')} className="h-[44px] rounded-[12px] bg-[#174F84] font-['SF Compact Rounded:Semibold'] text-[14px] font-semibold text-white">
								Load Mock A
							</button>
							<button type="button" onClick={() => handleLoadMockSession('b')} className="h-[44px] rounded-[12px] border border-[#174F84] bg-white font-['SF Compact Rounded:Semibold'] text-[14px] font-semibold text-[#174F84]">
								Load Mock B
							</button>
						</div>
					</div>
				) : null}

				<div className="mt-[72px] flex justify-center text-white/40 font-['SF Compact Rounded:Regular']">
					<span className="text-[22px] leading-none">×</span>
				</div>

				<div className="mt-[32px] rounded-[12px] border border-dashed border-[#c2c6d1] bg-[#eff4ff] p-[17px]">
					<div className="flex items-start justify-center gap-[2px] overflow-hidden">
						{displayPreviews.map((src, index) => (
							<div
								key={`${src}-${index}`}
								className={`overflow-hidden rounded-[8px] border-2 border-white bg-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] ${index === 0 ? 'rotate-[-6deg] size-[80px]' : index === 1 ? 'translate-y-[-4px] size-[80px]' : 'rotate-[6deg] size-[80px]'}`}
								style={index === 1 ? { marginLeft: '-12px', marginRight: '-12px' } : undefined}
							>
								<img alt={`preview-${index + 1}`} src={src} className="block size-full object-cover" />
							</div>
						))}
					</div>
					<div className="mt-[16px] flex justify-center text-center font-['SF Compact Rounded:Semibold'] text-[12px] font-semibold leading-[16px] tracking-[0.12px] text-[#727781]">
						Note: Clear photos ensure more accurate transaction classification
					</div>
				</div>
			</div>

		</div>
	);
}
