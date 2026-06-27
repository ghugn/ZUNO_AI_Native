"use client";

import React from 'react';
import { X } from 'lucide-react';

const defaultPreview = 'https://www.figma.com/api/mcp/asset/369ca94e-34d1-4613-a5ce-11deff306f3f';

type LoadingState = 'uploading' | 'extracting' | 'error';

type LoadingProps = {
	visible: boolean;
	status?: LoadingState;
	previewSrc?: string | null;
	message?: string;
	onCancel: () => void;
	onRetry?: () => void;
	onRetake?: () => void;
};

function Spinner() {
	return (
		<div className="relative flex size-[48px] items-center justify-center">
			<div className="absolute inset-0 rounded-full border-[4px] border-[#174F84]/15" />
			<div className="absolute inset-[6px] rounded-full border-[4px] border-[#174F84] border-t-transparent animate-[spin_1s_linear_infinite] motion-safe:animate-[spin_1s_linear_infinite]" />
			<div className="absolute left-1/2 top-1/2 size-[12px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#174F84] animate-[pulse_1.8s_ease-in-out_infinite] motion-safe:animate-[pulse_1.8s_ease-in-out_infinite]" />
		</div>
	);
}

function PreviewSkeleton() {
	return (
		<div className="absolute inset-0 rounded-[16px] bg-[linear-gradient(180deg,#dfe6ee_0%,#cfd9e4_100%)] opacity-90">
			<div className="absolute left-[32px] top-[32px] h-[32px] w-[173px] rounded-[8px] bg-white/30 animate-[pulse_2.4s_ease-in-out_infinite] motion-safe:animate-[pulse_2.4s_ease-in-out_infinite]" />
			<div className="absolute left-[32px] top-[104px] h-[16px] w-[279px] rounded-full bg-white/25 animate-[pulse_2.4s_ease-in-out_infinite] motion-safe:animate-[pulse_2.4s_ease-in-out_infinite]" />
			<div className="absolute left-[32px] top-[144px] h-[1px] w-[279px] bg-[#b7c5d5]/60" />
			<div className="absolute left-[32px] top-[185px] h-[140px] w-[279px]">
				<div className="absolute left-0 top-0 h-[16px] w-[199px] rounded-full bg-white/28 animate-[pulse_2.3s_ease-in-out_infinite] motion-safe:animate-[pulse_2.3s_ease-in-out_infinite]" />
				<div className="absolute left-0 top-[24px] h-[12px] w-[43px] rounded-full bg-white/18 animate-[pulse_2.3s_ease-in-out_infinite] motion-safe:animate-[pulse_2.3s_ease-in-out_infinite]" />
				<div className="absolute right-0 top-[8px] h-[20px] w-[80px] rounded-full bg-white/26 animate-[pulse_2.3s_ease-in-out_infinite] motion-safe:animate-[pulse_2.3s_ease-in-out_infinite]" />

				<div className="absolute left-0 top-[52px] h-[16px] w-[215px] rounded-full bg-white/28 animate-[pulse_2.4s_ease-in-out_infinite] motion-safe:animate-[pulse_2.4s_ease-in-out_infinite]" />
				<div className="absolute left-0 top-[76px] h-[12px] w-[32px] rounded-full bg-white/18 animate-[pulse_2.4s_ease-in-out_infinite] motion-safe:animate-[pulse_2.4s_ease-in-out_infinite]" />
				<div className="absolute right-0 top-[60px] h-[20px] w-[64px] rounded-full bg-white/26 animate-[pulse_2.4s_ease-in-out_infinite] motion-safe:animate-[pulse_2.4s_ease-in-out_infinite]" />

				<div className="absolute left-0 top-[104px] h-[16px] w-[183px] rounded-full bg-white/28 animate-[pulse_2.5s_ease-in-out_infinite] motion-safe:animate-[pulse_2.5s_ease-in-out_infinite]" />
				<div className="absolute left-0 top-[128px] h-[12px] w-[65px] rounded-full bg-white/18 animate-[pulse_2.5s_ease-in-out_infinite] motion-safe:animate-[pulse_2.5s_ease-in-out_infinite]" />
				<div className="absolute right-0 top-[112px] h-[20px] w-[96px] rounded-full bg-white/26 animate-[pulse_2.5s_ease-in-out_infinite] motion-safe:animate-[pulse_2.5s_ease-in-out_infinite]" />
			</div>
			<div className="absolute left-[32px] top-[336px] h-[1px] w-[279px] bg-[#b7c5d5]/55" />
			<div className="absolute left-[32px] top-[360px] h-[20px] w-[96px] rounded-full bg-white/28 animate-[pulse_2.6s_ease-in-out_infinite] motion-safe:animate-[pulse_2.6s_ease-in-out_infinite]" />
			<div className="absolute right-[32px] top-[354px] h-[32px] w-[128px] rounded-full bg-white/32 animate-[pulse_2.6s_ease-in-out_infinite] motion-safe:animate-[pulse_2.6s_ease-in-out_infinite]" />
		</div>
	);
}

export default function Loading({
	visible,
	status = 'extracting',
	previewSrc,
	message,
	onCancel,
	onRetry,
	onRetake,
}: LoadingProps) {
	if (!visible) {
		return null;
	}

	const statusText =
		message ||
		(status === 'uploading' ? 'Uploading photo...' : status === 'error' ? 'Unable to analyze receipt' : 'Extracting data...');

	return (
		<div className="absolute inset-0 z-30 flex h-full w-full flex-col bg-gradient-to-b from-[#14355a] via-[#89a8c8] via-[55%] to-[#eef3f8]">
			<div className="absolute left-[20px] top-[48px]">
				<button type="button" onClick={onCancel} aria-label="Close processing view" className="flex size-[40px] items-center justify-center rounded-full">
					<X className="size-[14px] text-white" strokeWidth={2.4} />
				</button>
			</div>

			<div className="flex flex-1 flex-col items-center px-[24px] pt-[112px]">
				<div className="relative h-[435px] w-[345px] overflow-hidden rounded-[16px] border border-white/20 bg-white/12 shadow-[0px_14px_32px_rgba(12,38,71,0.22)] backdrop-blur-[10px]">
					{previewSrc ? (
						<img alt="Receipt preview" src={previewSrc} className="absolute inset-0 size-full object-cover opacity-95 blur-[0.5px]" />
					) : (
						<img alt="" src={defaultPreview} className="absolute inset-0 size-full object-cover opacity-95 blur-[0.5px]" />
					)}

					<div className="absolute inset-0 bg-white/4" />
					<PreviewSkeleton />

					<div className="absolute left-0 right-0 top-[50%] h-[2px] bg-[#5f87b5]/80 shadow-[0px_0px_18px_rgba(23,79,132,0.55)] animate-[pulse_1.8s_ease-in-out_infinite] motion-safe:animate-[pulse_1.8s_ease-in-out_infinite]" />
				</div>

				<div className="mt-[40px] flex flex-col items-center">
					<Spinner />
					<div className="mt-[18px] font-['SF Compact Rounded:Medium'] text-[18px] leading-[24px] text-[#174F84]">
						{statusText}
					</div>
					{status === 'error' ? (
						<div className="mt-[10px] max-w-[240px] text-center font-['SF Compact Rounded:Regular'] text-[12px] leading-[16px] text-[#4c6b8b]">
							{message || 'The backend is slow or unavailable. You can retry or retake the photo.'}
						</div>
					) : null}
				</div>
			</div>

			<div className="absolute bottom-[28px] left-[25px] right-[25px] flex gap-[12px]">
				<button
					type="button"
					onClick={onCancel}
					className="h-[45px] flex-1 rounded-[20px] bg-[#174F84] px-[18px] font-['SF Compact Rounded:Semibold'] text-[20px] font-semibold text-white shadow-[2px_2px_10px_rgba(0,0,0,0.2)]"
				>
					Cancel
				</button>

				{status === 'error' ? (
					<>
						{onRetry ? (
							<button
								type="button"
								onClick={onRetry}
								className="h-[45px] rounded-[20px] border border-[#174F84] bg-white px-[18px] font-['SF Compact Rounded:Semibold'] text-[16px] font-semibold text-[#174F84]"
							>
								Retry
							</button>
						) : null}
						{onRetake ? (
							<button
								type="button"
								onClick={onRetake}
								className="h-[45px] rounded-[20px] border border-[#174F84] bg-white px-[18px] font-['SF Compact Rounded:Semibold'] text-[16px] font-semibold text-[#174F84]"
							>
								Retake
							</button>
						) : null}
					</>
				) : null}
			</div>
		</div>
	);
}