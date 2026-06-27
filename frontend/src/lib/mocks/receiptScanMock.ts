import type { ReceiptScanResponse } from '@/lib/api/receiptScan';

export type ReceiptScanMockProfile = 'a' | 'b';

export function isReceiptScanMockEnabled() {
	return process.env.NEXT_PUBLIC_RECEIPT_SCAN_MOCK === 'true';
}

export function getReceiptScanMockProfile(): ReceiptScanMockProfile {
	return process.env.NEXT_PUBLIC_RECEIPT_SCAN_MOCK_PROFILE === 'b' ? 'b' : 'a';
}

export function getReceiptScanMockResponse(profile: ReceiptScanMockProfile): ReceiptScanResponse {
	if (profile === 'b') {
		return {
			rawText: 'PHUC LONG COFFEE & TEA - 02/05/2026',
			amount: 186000,
			category: 'Food and Drinks',
			time: '2026-05-02',
			source: 'Receipt',
			description: 'Dinner receipt with multiple items',
			confidence: 0.91,
		};
	}

	return {
		rawText: 'NGUYEN VAN A chuyen tien.CT tu 1916...',
		amount: 75000,
		category: 'Experience',
		time: '2026-05-21',
		source: 'Receipt',
		description: 'Transfer receipt mock for scan testing',
		confidence: 0.87,
	};
}

export function getReceiptScanMockDelayMs() {
	return process.env.NEXT_PUBLIC_RECEIPT_SCAN_MOCK_DELAY_MS ? Number(process.env.NEXT_PUBLIC_RECEIPT_SCAN_MOCK_DELAY_MS) : 900;
}