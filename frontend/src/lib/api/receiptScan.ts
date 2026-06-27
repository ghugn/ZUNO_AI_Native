export type ReceiptScanResponse = {
	rawText?: string;
	amount?: number;
	category?: string;
	time?: string;
	source?: string;
	description?: string;
	confidence?: number;
	[key: string]: unknown;
};

const DEFAULT_RECEIPT_SCAN_ENDPOINT = '/api/receipt/scan';

export class ReceiptScanError extends Error {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = 'ReceiptScanError';
		this.status = status;
	}
}

function resolveReceiptScanEndpoint() {
	if (process.env.NEXT_PUBLIC_RECEIPT_SCAN_ENDPOINT) {
		return process.env.NEXT_PUBLIC_RECEIPT_SCAN_ENDPOINT;
	}
	let apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

	if (typeof window !== 'undefined' && window.location) {
		const protocol = window.location.protocol;
		const hostname = window.location.hostname;
		if (apiBase.includes('localhost')) {
			apiBase = apiBase.replace('localhost', hostname);
		} else if (!process.env.NEXT_PUBLIC_API_URL) {
			apiBase = `${protocol}//${hostname}:5000`;
		}
	}
	return `${apiBase}/api/receipt/scan`;
}

async function delay(ms: number) {
	return await new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function scanReceiptImage(file: File): Promise<ReceiptScanResponse> {
	if (process.env.NEXT_PUBLIC_RECEIPT_SCAN_MOCK === 'true') {
		const mockModule = await import('@/lib/mocks/receiptScanMock');
		await delay(mockModule.getReceiptScanMockDelayMs());
		return mockModule.getReceiptScanMockResponse(mockModule.getReceiptScanMockProfile());
	}

	const formData = new FormData();
	formData.append('image', file);

	const headers: Record<string, string> = {};
	if (typeof window !== 'undefined') {
		const token = window.sessionStorage.getItem('zuno:auth-token');
		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}
	}

	const response = await fetch(resolveReceiptScanEndpoint(), {
		method: 'POST',
		headers,
		body: formData,
	});

	if (!response.ok) {
		let errorMessage = 'Unable to send the image to AI';

		try {
			const errorBody = await response.json();
			if (typeof errorBody?.error === 'string') {
				errorMessage = errorBody.error;
			}
		} catch (error) {
			// ignore parse errors and keep default message
		}

		throw new ReceiptScanError(errorMessage, response.status);
	}

	const resJson = await response.json();
	return (resJson && typeof resJson === 'object' && 'data' in resJson ? resJson.data : resJson) as ReceiptScanResponse;
}