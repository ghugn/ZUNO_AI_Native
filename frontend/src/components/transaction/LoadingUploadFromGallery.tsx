"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/transaction/Loading';
import { scanReceiptImage, type ReceiptScanResponse } from '@/lib/api/receiptScan';

const GALLERY_SELECTION_KEY = 'zuno:gallery-selected-images';
const RESULT_SESSION_KEY = 'zuno:receipt-scan-result';

type GallerySelection = {
	id: string;
	src: string;
	selected?: boolean;
};

type ResultImage = {
	id: string;
	url: string;
	order: number;
};

type ResultTransaction = {
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
};

type ResultSession = {
	sessionId: string;
	uploadedImages: ResultImage[];
	pendingTransactions: ResultTransaction[];
	classifiedTransactions: ResultTransaction[];
	summary: {
		totalImages: number;
		pendingCount: number;
		classifiedCount: number;
		selectedCount: number;
	};
};

function readGallerySelection(): GallerySelection[] {
	if (typeof window === 'undefined') {
		return [];
	}

	const raw = window.sessionStorage.getItem(GALLERY_SELECTION_KEY);
	if (!raw) {
		return [];
	}

	try {
		const parsed = JSON.parse(raw) as GallerySelection[];
		return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
	} catch {
		return [];
	}
}

function getTodayDateValue() {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
}

async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
	if (dataUrl.startsWith('data:')) {
		const response = await fetch(dataUrl);
		const blob = await response.blob();
		return new File([blob], fileName, { type: blob.type });
	}
	// Fallback for non‑data URLs (e.g., blob URLs)
	const response = await fetch(dataUrl);
	const blob = await response.blob();
	return new File([blob], fileName, { type: blob.type });
}

function buildTransactionBundle(response: ReceiptScanResponse, imageUrl: string, index: number) {
	const amountValue = Number(response.amount || 75000);
	const amountString = Number.isFinite(amountValue) ? String(amountValue) : '75000';

	let dateValue = getTodayDateValue();
	let timeValue = '09:15';
	if (response.time) {
		if (response.time.includes('T')) {
			const [dPart, tPart] = response.time.split('T');
			if (dPart) dateValue = dPart;
			if (tPart) timeValue = tPart.slice(0, 5);
		} else if (response.time.includes(' ')) {
			const [dPart, tPart] = response.time.split(' ');
			if (dPart) dateValue = dPart;
			if (tPart) timeValue = tPart.slice(0, 5);
		} else {
			dateValue = response.time;
		}
	}

	const merchantName = response.description || response.rawText || `Gallery photo ${index + 1}`;
	const validCategories = ['Food and Drinks', 'Experience', 'Savings', 'Fixed bill', 'Developement'];
	const category = response.category && validCategories.includes(response.category) ? response.category : 'Food and Drinks';
	const baseId = `gallery_${Date.now()}_${index}`;

	const pendingItem: ResultTransaction = {
		id: `${baseId}_pending`,
		merchantName,
		amountValue: amountString,
		dateValue,
		timeValue,
		category: null,
		source: 'Receipt',
		transactionType: 'expense',
		selected: false,
		status: 'pending',
		confidence: response.confidence || 0.8,
		rawText: response.rawText,
	};

	const classifiedPrimary: ResultTransaction = {
		id: `${baseId}_classified_1`,
		merchantName,
		amountValue: amountString,
		dateValue,
		timeValue,
		category,
		source: 'Receipt',
		transactionType: 'expense',
		selected: true,
		status: 'classified',
		receiptLabel: 'Receipt',
		confidence: 0.92,
	};

	const classifiedSecondary: ResultTransaction = {
		id: `${baseId}_classified_2`,
		merchantName,
		amountValue: String(Math.max(45000, Math.round(Number(amountString) * 0.6))),
		dateValue,
		timeValue: '11:05',
		category: category === 'Food and Drinks' ? 'Experience' : 'Food and Drinks',
		source: 'Receipt',
		transactionType: 'expense',
		selected: false,
		status: 'classified',
		receiptLabel: 'Receipt',
		confidence: 0.87,
	};

	return {
		uploadedImage: { id: `${baseId}_image`, url: imageUrl, order: index + 1 },
		pendingItem,
		classifiedItems: [classifiedPrimary, classifiedSecondary],
	};
}

export default function LoadingUploadFromGallery() {
	const router = useRouter();
	const cancelRequestedRef = useRef(false);
	// ⚠️ Always start with [] to match server render — read sessionStorage in useEffect after hydration
	const [selectedImages, setSelectedImages] = useState<GallerySelection[]>([]);
	const [isMounted, setIsMounted] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [status, setStatus] = useState<'uploading' | 'extracting' | 'error'>('uploading');
	const [errorMessage, setErrorMessage] = useState('');
	const [currentPreview, setCurrentPreview] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);

	// Read sessionStorage AFTER hydration to avoid server/client mismatch
	useEffect(() => {
		const images = readGallerySelection();
		setSelectedImages(images);
		setIsMounted(true);
	}, []);

	useEffect(() => {
		if (!isMounted || selectedImages.length === 0) {
			return;
		}

		let mounted = true;

		const run = async () => {
			setIsProcessing(true);
			const uploadedImages: ResultImage[] = [];
			const pendingTransactions: ResultTransaction[] = [];
			const classifiedTransactions: ResultTransaction[] = [];

			for (let index = 0; index < selectedImages.length; index += 1) {
				if (!mounted || cancelRequestedRef.current) {
					return;
				}

				const item = selectedImages[index];
				setCurrentIndex(index);
				setCurrentPreview(item.src);
				setStatus('uploading');
				setErrorMessage('');

				try {
					const file = await dataUrlToFile(item.src, `gallery-${index + 1}.jpg`);
					const response = await scanReceiptImage(file);
					setStatus('extracting');

					const bundle = buildTransactionBundle(response, item.src, index);
					uploadedImages.push(bundle.uploadedImage);
					pendingTransactions.push(bundle.pendingItem);
					classifiedTransactions.push(...bundle.classifiedItems);

					const nextSession: ResultSession = {
						sessionId: `gallery_${Date.now()}`,
						uploadedImages: [...uploadedImages],
						pendingTransactions: [...pendingTransactions],
						classifiedTransactions: [...classifiedTransactions],
						summary: {
							totalImages: selectedImages.length,
							pendingCount: pendingTransactions.length,
							classifiedCount: classifiedTransactions.length,
							selectedCount: classifiedTransactions.filter((transaction) => transaction.selected).length,
						},
					};

					window.sessionStorage.setItem(RESULT_SESSION_KEY, JSON.stringify(nextSession));
					await new Promise((resolve) => window.setTimeout(resolve, 250));
				} catch (error) {
					if (!mounted || cancelRequestedRef.current) {
						return;
					}

					setStatus('error');
					setErrorMessage(error instanceof Error ? error.message : 'Unable to send gallery image to AI');
					setIsProcessing(false);
					return;
				}
			}

			if (!mounted || cancelRequestedRef.current) {
				return;
			}

			setIsProcessing(false);
			router.push('/result-upload-photo');
		};

		void run();

		return () => {
			mounted = false;
		};
	}, [router, selectedImages, isMounted]);

	const onCancel = () => {
		cancelRequestedRef.current = true;
		setIsProcessing(false);
		router.push('/choose-how-to-upload-photos');
	};

	const statusText = useMemo(() => {
		if (status === 'error') {
			return errorMessage;
		}

		const total = selectedImages.length || 1;
		const current = Math.min(currentIndex + 1, total);
		return status === 'uploading' ? `Uploading photo ${current}/${total}...` : `Extracting data ${current}/${total}...`;
	}, [currentIndex, errorMessage, selectedImages.length, status]);

	// Before hydration: render same shell as server to avoid mismatch
	if (!isMounted) {
		return <div className="relative h-[852px] w-full overflow-hidden bg-[#f7f8fa]" />;
	}

	if (selectedImages.length === 0) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#f7f8fa] font-['SF Compact Rounded:Regular'] text-[#112945]">
				<div className="rounded-[16px] bg-white px-[20px] py-[16px] shadow-[0px_10px_30px_-5px_rgba(22,78,133,0.08)]">
					No gallery selection found.
				</div>
			</div>
		);
	}

	return (
		<div className="relative h-[852px] w-full overflow-hidden bg-[#f7f8fa]">
			<Loading
				visible={isProcessing || status === 'error'}
				status={status}
				previewSrc={currentPreview}
				message={statusText}
				onCancel={onCancel}
				onRetry={undefined}
				onRetake={undefined}
			/>
		</div>
	);
}