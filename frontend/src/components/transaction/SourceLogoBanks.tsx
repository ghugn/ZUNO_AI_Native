import React from 'react';

type SourceLogoProps = {
	logoSrc?: string;
	badgeColor: string;
	shortCode: string;
	className?: string;
};

const DEFAULT_FRAME_CLASS = 'flex h-[20px] w-[52px] shrink-0 items-center justify-center rounded-[6px] overflow-hidden bg-white/80 px-[2px]';

export function SourceLogo({ logoSrc, badgeColor, shortCode, className }: SourceLogoProps) {
	if (logoSrc) {
		return (
			<span className={`${DEFAULT_FRAME_CLASS} ${className || ''}`.trim()}>
				<img alt="" className="block size-full max-w-none object-contain pointer-events-none" src={logoSrc} />
			</span>
		);
	}

	return (
		<span className={`${DEFAULT_FRAME_CLASS} ${className || ''}`.trim()} style={{ backgroundColor: badgeColor }}>
			<span className="text-[10px] font-semibold leading-none text-white">{shortCode}</span>
		</span>
	);
}