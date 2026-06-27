"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const filterIcon = 'https://www.figma.com/api/mcp/asset/53114b7d-61e2-4ba1-b39f-c6be445a67e5';
const chevronDownIcon = 'https://www.figma.com/api/mcp/asset/4663b6f3-439f-4d29-9574-603a5f5512fa';
const selectedCheckIcon = 'https://www.figma.com/api/mcp/asset/8f0d10cd-c4e6-4168-b1af-be8195c49d53';

type GalleryItem = {
	id: string;
	src: string;
	name: string;
	selected?: boolean;
};

function GalleryThumb({ item, selected, onClick }: { item: GalleryItem; selected: boolean; onClick: () => void }) {
	return (
		<button type="button" onClick={onClick} className="relative h-[127.33px] w-full overflow-hidden bg-[#f2f4f6]" aria-label={`Select ${item.name}`}>
			<img alt="" src={item.src} className="absolute inset-0 size-full object-cover pointer-events-none" />
			{selected ? (
				<div className="absolute inset-0 border-2 border-[#1e5482] bg-[rgba(30,84,130,0.3)] p-[10px]">
					<div className="flex justify-end">
						<div className="flex size-[24px] items-center justify-center rounded-full border-2 border-white bg-[#003d66] shadow-[0px_4px_8px_rgba(0,0,0,0.12)]">
							<img alt="selected" src={selectedCheckIcon} className="size-[12px]" />
						</div>
					</div>
				</div>
			) : null}
		</button>
	);
}

export default function SelectPhoto() {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const objectUrlsRef = useRef<string[]>([]);
	const autoOpenAttemptedRef = useRef(false);
	const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

	const selectedCount = useMemo(() => galleryItems.filter((item) => item.selected).length, [galleryItems]);
	const hasItems = galleryItems.length > 0;

	useEffect(() => {
		return () => {
			// Do not revoke object URLs on unmount, as they are loaded by the next page (/loading-upload-from-gallery)
			objectUrlsRef.current = [];
		};
	}, []);

	useEffect(() => {
		if (autoOpenAttemptedRef.current) {
			return;
		}

		autoOpenAttemptedRef.current = true;
		window.setTimeout(() => {
			fileInputRef.current?.click();
		}, 0);
	}, []);

	const openFilePicker = () => {
		fileInputRef.current?.click();
	};

	const handleFilesSelected = (files: FileList | null) => {
		if (!files || files.length === 0) {
			return;
		}

		const nextFiles = Array.from(files).slice(0, 3);
		const nextItems = nextFiles.map((file, index) => {
			const objectUrl = URL.createObjectURL(file);
			objectUrlsRef.current.push(objectUrl);

			return {
				id: `${file.name}-${file.lastModified}-${index}`,
				src: objectUrl,
				name: file.name,
				selected: true,
			};
		});

		setGalleryItems(nextItems);
	};

	const handleToggle = (id: string) => {
		setGalleryItems((current) => {
			const nextItems = current.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item));
			const nextSelectedCount = nextItems.filter((item) => item.selected).length;

			if (nextSelectedCount <= 3) {
				return nextItems;
			}

			return current;
		});
	};

	const handleConfirm = () => {
		const selectedItems = galleryItems.filter((item) => item.selected).slice(0, 3);
		window.sessionStorage.setItem('zuno:gallery-selected-images', JSON.stringify(selectedItems));
		router.push('/loading-upload-from-gallery');
	};

	return (
		<div className="relative h-[823px] w-[393px] overflow-hidden rounded-tl-[30px] rounded-tr-[30px] bg-white" data-node-id="336:444" data-name="Select Photo">
			<div className="absolute left-0 top-0 flex h-[22px] w-[390px] items-start justify-center py-[8px]" data-node-id="336:445" data-name="Modal Handle Bar">
				<div className="h-[6px] w-[48px] rounded-[9999px] bg-[#d1d5db]" data-node-id="336:446" data-name="Background" />
			</div>

			<div className="absolute left-0 right-0 top-[64px] bottom-[113px] overflow-y-auto bg-[#f2f4f6]" data-node-id="336:449" data-name="Main Content Area">
				<div className="flex h-[45px] items-center justify-between border-b border-[rgba(194,199,208,0.3)] bg-white px-[20px] pb-[13px] pt-[12px]" data-node-id="336:450" data-name="Album Selector Bar">
					<button type="button" className="flex items-center gap-[8px] text-left" aria-label="Choose photos from device" onClick={openFilePicker}>
						<span className="font-['SF Compact Rounded:Regular'] text-[14px] font-normal leading-[20px] text-[#42474f]">Recent</span>
						<img alt="" src={chevronDownIcon} className="h-[5.55px] w-[9px]" />
					</button>
					<button type="button" className="h-[12px] w-[18px]" onClick={openFilePicker} aria-label="Open device photo library">
						<img alt="" src={filterIcon} className="size-full" />
					</button>
				</div>

				{hasItems ? (
					<div className="grid grid-cols-3 gap-x-[2px] gap-y-[2px] p-[2px]" data-node-id="336:458" data-name="Photo Grid">
						{galleryItems.map((item) => (
							<GalleryThumb key={item.id} item={item} selected={Boolean(item.selected)} onClick={() => handleToggle(item.id)} />
						))}
					</div>
				) : (
					<div className="flex min-h-[calc(100%-45px)] items-center justify-center px-[24px] text-center">
						<div className="max-w-[280px] space-y-[12px]">
							<p className="font-['SF Compact Rounded:Semibold'] text-[20px] font-semibold leading-[28px] text-[#112945]">Chọn ảnh từ thiết bị của bạn</p>
							<p className="font-['SF Compact Rounded:Regular'] text-[14px] leading-[20px] text-[#5a6472]">Mở thư viện ảnh để chọn tối đa 3 ảnh rồi bấm Confirm.</p>
							<button type="button" onClick={openFilePicker} className="h-[48px] rounded-[9999px] bg-[#003d66] px-[20px] text-white shadow-[0px_10px_15px_-3px_rgba(0,61,102,0.2),0px_4px_6px_-4px_rgba(0,61,102,0.2)]">
								<span className="font-['SF Compact Rounded:Semibold'] text-[18px] font-semibold leading-[24px]">Mở thư viện ảnh</span>
							</button>
						</div>
					</div>
				)}
			</div>

			<div className="absolute bottom-0 left-0 right-0 rounded-tl-[12px] rounded-tr-[12px] border border-[rgba(255,255,255,0.8)] bg-white px-[21px] pb-[33px] pt-[13px] drop-shadow-[0px_4px_5px_rgba(0,0,0,0.05)]" data-node-id="336:493" data-name="Footer / Confirmation Bar">
				<div className="flex items-center justify-between">
					<div className="rounded-full bg-[#a5e3ff] px-[12px] py-[4px]">
						<span className="font-['SF Compact Rounded:Regular'] text-[14px] font-normal leading-[20px] text-[#191c1e]">{selectedCount} photos selected</span>
					</div>
					<div className="h-[16px] w-[61.06px]" data-node-id="336:499" data-name="Button" />
				</div>

				<button type="button" onClick={handleConfirm} className="mt-[16px] h-[56px] w-full rounded-[9999px] bg-[#003d66] text-center text-white shadow-[0px_10px_15px_-3px_rgba(0,61,102,0.2),0px_4px_6px_-4px_rgba(0,61,102,0.2)]" data-node-id="336:500" data-name="Button">
					<span className="font-['SF Compact Rounded:Semibold'] text-[20px] font-semibold leading-[28px]">Confirm</span>
				</button>
			</div>

			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				multiple
				className="hidden"
				onChange={(event) => handleFilesSelected(event.target.files)}
			/>
		</div>
	);
}