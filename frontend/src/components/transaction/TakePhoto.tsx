"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/transaction/Loading';
import { scanReceiptImage, type ReceiptScanResponse } from '@/lib/api/receiptScan';

const imgCameraViewfinderPaperReceipt = 'https://www.figma.com/api/mcp/asset/369ca94e-34d1-4613-a5ce-11deff306f3f';
const imgGallery = 'https://www.figma.com/api/mcp/asset/d0352218-e049-44a1-a102-924f80e75185';
const imgClose = 'https://www.figma.com/api/mcp/asset/7ac1327e-05f2-4dd3-9912-1731f5c38173';
const imgTopBarAction1 = 'https://www.figma.com/api/mcp/asset/43ba713f-640a-4a5e-8237-461431a72aab';
const imgTopBarAction2 = 'https://www.figma.com/api/mcp/asset/d0998865-9c79-4ed4-907c-226111384776';
const imgFlipCamera = 'https://www.figma.com/api/mcp/asset/6021686e-8299-473e-bc48-dcb250b2f5b8';

const TRANSACTION_MODE_SESSION_KEY = 'zuno:transaction-mode';
const RECEIPT_SCAN_RESULT_SESSION_KEY = 'zuno:receipt-scan-result';

type ScanMode = 'scan' | 'photo' | 'card';
type CameraFacing = 'environment' | 'user';
type ProcessingState = 'idle' | 'uploading' | 'extracting' | 'error';

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

type ReceiptScanSession = {
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

function getTodayDateValue() {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
}

function formatDateForSession(dateValue: string) {
	if (!dateValue) {
		return getTodayDateValue();
	}

	return dateValue;
}

function buildReceiptScanSession(response: ReceiptScanResponse, previewUrl: string): ReceiptScanSession {
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
	dateValue = formatDateForSession(dateValue);

	const merchantName = response.description || response.rawText || 'Receipt';
	const validCategories = ['Food and Drinks', 'Experience', 'Savings', 'Fixed bill', 'Developement'];
	const category = response.category && validCategories.includes(response.category) ? response.category : 'Food and Drinks';

	return {
		sessionId: `scan_${Date.now()}`,
		uploadedImages: [
			{
				id: 'img_1',
				url: previewUrl,
				order: 1,
			},
		],
		pendingTransactions: [
			{
				id: 'pending_1',
				merchantName,
				rawText: response.rawText,
				amountValue: amountString,
				dateValue,
				timeValue,
				category: null,
				source: 'Receipt',
				transactionType: 'expense',
				selected: false,
				status: 'pending',
				confidence: response.confidence || 0.72,
			},
		],
		classifiedTransactions: [
			{
				id: 'classified_1',
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
				confidence: response.confidence || 0.96,
			},
			{
				id: 'classified_2',
				merchantName,
				amountValue: String(Math.max(45000, Math.round(amountValue * 0.6))),
				dateValue,
				timeValue: '11:05',
				category: category === 'Food and Drinks' ? 'Experience' : 'Food and Drinks',
				source: 'Receipt',
				transactionType: 'expense',
				selected: false,
				status: 'classified',
				receiptLabel: 'Receipt',
				confidence: 0.94,
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

async function persistScanResultSession(file: File, response: ReceiptScanResponse) {
	const previewUrl = await fileToDataUrl(file);
	const session = buildReceiptScanSession(response, previewUrl);
	window.sessionStorage.setItem(RECEIPT_SCAN_RESULT_SESSION_KEY, JSON.stringify(session));
}

function ModePill({
	label,
	active,
	onClick,
}: {
	label: string;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={active}
			className="flex items-start justify-center px-[8px]"
		>
			<span
				className={`font-['SF Compact Rounded:Bold'] text-[12px] font-bold leading-[16px] tracking-[0.6px] uppercase ${active ? 'text-[#fffbfb]' : 'text-[rgba(255,255,255,0.4)]'}`}
			>
				{label}
			</span>
		</button>
	);
}

function ActionButton({
	onClick,
	ariaLabel,
	children,
	className = '',
}: {
	onClick: () => void;
	ariaLabel: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={ariaLabel}
			className={`flex items-center justify-center transition-transform active:scale-95 ${className}`}
		>
			{children}
		</button>
	);
}

function InfoToast({ visible, message }: { visible: boolean; message: string }) {
	return (
		<div
			className={`absolute left-[108.65px] top-[80px] w-[172.7px] rounded-[9999px] bg-[#21667f] px-[24px] py-[12px] transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
			data-node-id="343:547"
			data-name="Feedback Message (Toast)"
		>
			<div className="absolute bottom-0 left-0 top-0 w-[172.7px] rounded-[9999px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]" data-node-id="343:548" data-name="Feedback Message (Toast):shadow" />
			<div className="relative font-['SF Compact Rounded:Medium'] text-[12px] font-medium leading-[16px] text-white whitespace-nowrap" data-node-id="343:549" data-name="Text">
				{message}
			</div>
		</div>
	);
}

export default function TakePhoto() {
	const router = useRouter();
	const cameraInputRef = useRef<HTMLInputElement | null>(null);
	const galleryInputRef = useRef<HTMLInputElement | null>(null);
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const [selectedMode, setSelectedMode] = useState<ScanMode>('scan');
	const [cameraFacing, setCameraFacing] = useState<CameraFacing>('environment');
	const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
	const [capturedFile, setCapturedFile] = useState<File | null>(null);
	const [processingState, setProcessingState] = useState<ProcessingState>('idle');
	const [processingErrorMessage, setProcessingErrorMessage] = useState('');
	const [isFlashOn, setIsFlashOn] = useState(false);
	const [toastMessage, setToastMessage] = useState('');
	const [isToastVisible, setIsToastVisible] = useState(false);
	const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
	const [scanResult, setScanResult] = useState<ReceiptScanResponse | null>(null);
	const processingTransitionRef = useRef<number | null>(null);

	useEffect(() => {
		try {
			window.sessionStorage.setItem(TRANSACTION_MODE_SESSION_KEY, 'scan');
		} catch (error) {
			// ignore
		}
	}, []);

	useEffect(() => {
		if (!isToastVisible) {
			return undefined;
		}

		const timeoutId = window.setTimeout(() => setIsToastVisible(false), 1800);
		return () => window.clearTimeout(timeoutId);
	}, [isToastVisible]);

	useEffect(() => {
		return () => {
			// Do not revoke object URL on unmount, as it is loaded by the next page (/result-upload-photo)
		};
	}, [selectedPreview]);

	useEffect(() => {
		let cancelled = false;

		const startCamera = async () => {
			if (!navigator.mediaDevices?.getUserMedia) {
				setHasCameraPermission(false);
				setToastMessage('This device does not support camera access');
				setIsToastVisible(true);
				return;
			}

			try {
				const mediaStream = await navigator.mediaDevices.getUserMedia({
					video: {
						facingMode: cameraFacing,
						width: { ideal: 1280 },
						height: { ideal: 720 },
					},
					audio: false,
				});

				if (cancelled) {
					mediaStream.getTracks().forEach((track) => track.stop());
					return;
				}

				if (streamRef.current) {
					streamRef.current.getTracks().forEach((track) => track.stop());
				}

				streamRef.current = mediaStream;
				setHasCameraPermission(true);

				if (videoRef.current) {
					videoRef.current.srcObject = mediaStream;
					await videoRef.current.play();
				}
			} catch (error) {
				if (cancelled) {
					return;
				}

				setHasCameraPermission(false);
				setToastMessage('Unable to open the camera');
				setIsToastVisible(true);
			}
		};

		void startCamera();

		return () => {
			cancelled = true;
		};
	}, [cameraFacing]);

	useEffect(() => {
		return () => {
			if (streamRef.current) {
				streamRef.current.getTracks().forEach((track) => track.stop());
				streamRef.current = null;
			}

			if (processingTransitionRef.current) {
				window.clearTimeout(processingTransitionRef.current);
				processingTransitionRef.current = null;
			}
		};
	}, []);

	const beginProcessing = (file: File) => {
		setCapturedFile(file);
		setScanResult(null);
		setProcessingErrorMessage('');
		setProcessingState('uploading');
		showToast('Uploading image');

		if (processingTransitionRef.current) {
			window.clearTimeout(processingTransitionRef.current);
		}

		processingTransitionRef.current = window.setTimeout(() => {
			setProcessingState((current) => (current === 'idle' ? current : 'extracting'));
		}, 650);
	};

	const showToast = (message: string) => {
		setToastMessage(message);
		setIsToastVisible(true);
	};

	const handleFilesSelected = (files: FileList | null) => {
		if (!files || files.length === 0) {
			return;
		}

		const nextFile = files[0];
		beginProcessing(nextFile);
		const nextPreview = URL.createObjectURL(nextFile);
		setSelectedPreview((current) => {
			if (current) {
				URL.revokeObjectURL(current);
			}
			return nextPreview;
		});

		void (async () => {
			try {
				const response = await scanReceiptImage(nextFile);
				setScanResult(response);
				setProcessingState('idle');
				await persistScanResultSession(nextFile, response);
				showToast('Image sent for AI analysis');
				router.push('/result-upload-photo');
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unable to send the image to AI';
				setProcessingErrorMessage(errorMessage);
				setProcessingState('error');
				showToast(errorMessage);
			} finally {
				if (processingTransitionRef.current) {
					window.clearTimeout(processingTransitionRef.current);
					processingTransitionRef.current = null;
				}
			}
		})();
	};

	const captureCurrentFrame = async () => {
		const video = videoRef.current;
		if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
			showToast('Camera is not ready yet');
			return;
		}

		const canvas = captureCanvasRef.current || document.createElement('canvas');
		captureCanvasRef.current = canvas;
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;

		const context = canvas.getContext('2d');
		if (!context) {
			showToast('Unable to capture the photo');
			return;
		}

		if (cameraFacing === 'user') {
			context.save();
			context.translate(canvas.width, 0);
			context.scale(-1, 1);
		}

		context.drawImage(video, 0, 0, canvas.width, canvas.height);

		if (cameraFacing === 'user') {
			context.restore();
		}

		const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((nextBlob) => resolve(nextBlob), 'image/jpeg', 0.92));

		if (!blob) {
			showToast('Unable to create the captured image');
			return;
		}

		const file = new File([blob], `receipt-${Date.now()}.jpg`, { type: 'image/jpeg' });
		beginProcessing(file);
		const nextPreview = URL.createObjectURL(blob);
		setSelectedPreview((current) => {
			if (current) {
				URL.revokeObjectURL(current);
			}
			return nextPreview;
		});

		void (async () => {
			try {
				const response = await scanReceiptImage(file);
				setScanResult(response);
				setProcessingState('idle');
				await persistScanResultSession(file, response);
				showToast('Image sent for AI analysis');
				router.push('/result-upload-photo');
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unable to send the image to AI';
				setProcessingErrorMessage(errorMessage);
				setProcessingState('error');
				showToast(errorMessage);
			} finally {
				if (processingTransitionRef.current) {
					window.clearTimeout(processingTransitionRef.current);
					processingTransitionRef.current = null;
				}
			}
		})();
	};

	const resetProcessing = () => {
		if (processingTransitionRef.current) {
			window.clearTimeout(processingTransitionRef.current);
			processingTransitionRef.current = null;
		}
		setProcessingState('idle');
		setProcessingErrorMessage('');
		setScanResult(null);
	};

	const handleRetry = () => {
		if (capturedFile) {
			const retryFile = capturedFile;
			beginProcessing(retryFile);
			void (async () => {
				try {
					const response = await scanReceiptImage(retryFile);
					setScanResult(response);
					setProcessingState('idle');
					await persistScanResultSession(retryFile, response);
					showToast('Image sent for AI analysis');
					router.push('/result-upload-photo');
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : 'Unable to send the image to AI';
					setProcessingErrorMessage(errorMessage);
					setProcessingState('error');
					showToast(errorMessage);
				} finally {
					if (processingTransitionRef.current) {
						window.clearTimeout(processingTransitionRef.current);
						processingTransitionRef.current = null;
					}
				}
			})();
			return;
		}

		resetProcessing();
	};

	const handleRetake = () => {
		resetProcessing();
		cameraInputRef.current?.click();
	};

	const handleCancelLoading = () => {
		resetProcessing();
		showToast('Processing canceled');
		router.push('/choose-how-to-upload-photos');
	};

	const handleCapture = () => {
		if (hasCameraPermission) {
			void captureCurrentFrame();
			return;
		}

		cameraInputRef.current?.click();
	};

	const handleGalleryOpen = () => galleryInputRef.current?.click();

	const handleFlipCamera = () => {
		setCameraFacing((current) => (current === 'environment' ? 'user' : 'environment'));
		showToast('Camera switched');
	};

	const handleFlashToggle = () => {
		setIsFlashOn((current) => {
			const nextValue = !current;
				showToast(nextValue ? 'Flash on' : 'Flash off');
			return nextValue;
		});
	};

	return (
		<div className="relative h-[852px] w-full overflow-hidden bg-[#f7f8fa]" data-node-id="343:505" data-name="Scan">
			<div className="absolute inset-0 flex flex-col bg-black" data-node-id="343:506" data-name="Main Camera Container">
				<div className="relative flex h-[692px] w-full items-center justify-center overflow-hidden bg-black" data-node-id="343:507" data-name="Camera Viewfinder">
					<div className="absolute inset-0 opacity-90" data-node-id="343:508" data-name="Camera Viewfinder - Paper Receipt">
						{selectedPreview ? (
							<img alt="" src={selectedPreview} className="absolute left-[-42.82%] top-0 h-full w-[185.64%] max-w-none object-cover" />
						) : hasCameraPermission ? (
							<video
								ref={videoRef}
								autoPlay
								muted
								playsInline
								className={`absolute left-[-42.82%] top-0 h-full w-[185.64%] max-w-none object-cover ${cameraFacing === 'user' ? '-scale-x-100' : ''}`}
							/>
						) : (
							<img alt="" src={imgCameraViewfinderPaperReceipt} className="absolute left-[-42.82%] top-0 h-full w-[185.64%] max-w-none object-cover" />
						)}
					</div>

					<div className="absolute left-[40.5px] top-[138px] h-[416px] w-[312px] rounded-[12px] border-2 border-solid border-[rgba(255,255,255,0.5)]" data-node-id="343:509" data-name="Scanning Guide Overlay">
						<div className="absolute inset-[-2px] rounded-[12px] bg-[rgba(255,255,255,0)] shadow-[0px_0px_0px_1000px_rgba(0,0,0,0.4)]" data-node-id="343:510" data-name="Scanning Guide Overlay:shadow" />
						<div className="absolute left-[-4px] top-[-4px] size-[32px] rounded-tl-[8px] border-l-4 border-t-4 border-solid border-white" data-node-id="343:511" data-name="Corner Accents" />
						<div className="absolute right-[-4px] top-[-4px] size-[32px] rounded-tr-[8px] border-r-4 border-t-4 border-solid border-white" data-node-id="343:512" data-name="Border" />
						<div className="absolute bottom-[-4px] left-[-4px] size-[32px] rounded-bl-[8px] border-b-4 border-l-4 border-solid border-white" data-node-id="343:513" data-name="Border" />
						<div className="absolute bottom-[-4px] right-[-4px] size-[32px] rounded-br-[8px] border-b-4 border-r-4 border-solid border-white" data-node-id="343:514" data-name="Border" />

						<div className="absolute bottom-[-55px] left-0 right-0 flex flex-col items-center" data-node-id="343:515" data-name="Text Hint">
							<div className="relative flex items-center justify-center rounded-full bg-[rgba(0,0,0,0.4)] px-[16px] py-[7.5px] backdrop-blur-[6px]" data-node-id="343:516" data-name="Overlay+OverlayBlur">
								<div className="font-['SF Compact Rounded:Medium'] text-[12px] font-medium leading-[16px] text-center text-white whitespace-nowrap" data-node-id="343:517" data-name="Align receipt within the frame">
									Align receipt within the frame
								</div>
							</div>
						</div>
					</div>

					<div className="absolute left-0 top-0 flex h-[64px] w-full items-center justify-between px-[20px]" data-node-id="343:518" data-name="Header - Top App Bar (Shared Component Logic)">
						<ActionButton onClick={() => window.location.assign('/')} ariaLabel="Close" className="rounded-full p-[8px]">
							<div className="relative size-[16.333px]">
								<img alt="" src={imgClose} className="absolute inset-0 size-full max-w-none" />
							</div>
						</ActionButton>

						<div className="flex items-center gap-[15.99px]">
							<ActionButton onClick={handleFlashToggle} ariaLabel="Toggle flash" className="rounded-full p-[8px]">
								<div className="relative h-[20.625px] w-[19.825px]">
									<img alt="" src={imgTopBarAction1} className="absolute inset-0 size-full max-w-none" />
								</div>
							</ActionButton>
							<ActionButton onClick={() => showToast('Open scan settings')} ariaLabel="Scan settings" className="rounded-full p-[8px]">
								<div className="relative h-[20px] w-[20.1px]">
									<img alt="" src={imgTopBarAction2} className="absolute inset-0 size-full max-w-none" />
								</div>
							</ActionButton>
						</div>
					</div>

					<div className={`pointer-events-none absolute inset-0 bg-white transition-opacity duration-150 ${isFlashOn ? 'opacity-10' : 'opacity-0'}`} data-node-id="343:546" data-name="Flash Effect Overlay" />

					{hasCameraPermission === false ? (
						<div className="absolute left-1/2 top-[336px] -translate-x-1/2 rounded-full bg-black/45 px-[14px] py-[8px] text-[12px] font-medium text-white backdrop-blur-[6px]">
							Using a static image because the live camera is not ready yet
						</div>
					) : null}
				</div>

				<div className="flex h-[160px] w-full items-center justify-between rounded-tl-[32px] rounded-tr-[32px] bg-[rgba(0,0,0,0.6)] px-[20px] pb-[48px] pt-[32px] backdrop-blur-[12px]" data-node-id="343:529" data-name="Camera Controls Bottom Sheet">
					<ActionButton onClick={handleGalleryOpen} ariaLabel="Open gallery" className="size-[56px] rounded-full border-2 border-solid border-[rgba(255,255,255,0.2)] p-[2px]">
						<div className="relative size-[52px] overflow-hidden rounded-[12px]">
							<img alt="Gallery" src={imgGallery} className="absolute inset-0 size-full max-w-none object-cover" />
						</div>
					</ActionButton>

					<ActionButton onClick={handleCapture} ariaLabel="Capture photo" className="relative size-[80px] rounded-full">
						<div className="flex size-[80px] items-center justify-center rounded-full border-4 border-solid border-white p-[8px]">
							<div className="relative h-full w-full rounded-full bg-white">
								<div className="relative h-[64px] w-full rounded-full bg-[rgba(255,255,255,0)] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" data-node-id="343:535" data-name="Button:shadow" />
							</div>
						</div>
					</ActionButton>

					<ActionButton onClick={handleFlipCamera} ariaLabel="Flip camera" className="size-[56px] rounded-full bg-[rgba(255,255,255,0.1)]">
						<div className="relative h-[24px] w-[26.667px]">
							<img alt="Flip camera" src={imgFlipCamera} className="absolute inset-0 size-full max-w-none" />
						</div>
					</ActionButton>
				</div>

				{capturedFile ? (
					<div className="absolute left-[20px] right-[20px] top-[500px] rounded-[16px] bg-white/10 px-[16px] py-[10px] text-[12px] text-white backdrop-blur-[8px]">
						<div className="font-['SF Compact Rounded:Medium']">Captured file kept in state: {capturedFile.name}</div>
						{scanResult ? (
							<div className="mt-[6px] font-['SF Compact Rounded:Regular'] text-white/90">
								AI has returned a preliminary result.
							</div>
						) : (
							<div className="mt-[6px] font-['SF Compact Rounded:Regular'] text-white/70">
								Ready to send the image to the backend.
							</div>
						)}
					</div>
				) : null}

				<div className="absolute bottom-[16px] left-0 flex w-full justify-center pb-[8px]" data-node-id="343:539" data-name="Mode Selector (New Component)">
					<div className="flex items-start gap-[24px]">
						<ModePill label="SCAN" active={selectedMode === 'scan'} onClick={() => setSelectedMode('scan')} />
						<ModePill label="PHOTO" active={selectedMode === 'photo'} onClick={() => setSelectedMode('photo')} />
						<ModePill label="CARD" active={selectedMode === 'card'} onClick={() => setSelectedMode('card')} />
					</div>
				</div>
			</div>

			<Loading
				visible={processingState !== 'idle'}
				status={processingState === 'error' ? 'error' : processingState === 'uploading' ? 'uploading' : 'extracting'}
				previewSrc={selectedPreview}
				message={processingState === 'error' ? processingErrorMessage : processingState === 'uploading' ? 'Uploading photo...' : 'Extracting data...'}
				onCancel={handleCancelLoading}
				onRetry={handleRetry}
				onRetake={handleRetake}
			/>

			<InfoToast visible={isToastVisible} message={toastMessage} />

			<input ref={cameraInputRef} type="file" accept="image/*" capture={cameraFacing} className="hidden" onChange={(event) => handleFilesSelected(event.target.files)} />
			<input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(event) => handleFilesSelected(event.target.files)} />

		</div>
	);
}
