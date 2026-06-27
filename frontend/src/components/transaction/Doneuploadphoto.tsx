"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'zuno:receipt-scan-result';
const SELECTED_STORAGE_KEY = 'zuno:receipt-scan-selected';

const imgReceipt = 'https://www.figma.com/api/mcp/asset/02273fb7-edab-4867-bc6a-0b39395f863c';
const imgGroup31 = 'https://www.figma.com/api/mcp/asset/3d120a3b-4e0a-4f18-9a34-790697a98838';
const imgSvg = 'https://www.figma.com/api/mcp/asset/d73a7a67-c0a0-45d3-8b7f-44f86d4c158c';
const imgContainer = 'https://www.figma.com/api/mcp/asset/3281f9b0-998c-405f-b4b3-e0c8074bd671';
const imgSvg1 = 'https://www.figma.com/api/mcp/asset/b87ef29c-4096-4b32-b899-372877e0e94c';
const imgSvg2 = 'https://www.figma.com/api/mcp/asset/1f7017b6-d532-4c16-963e-124433d69dd8';
const imgSvg3 = 'https://www.figma.com/api/mcp/asset/0f019345-f727-4a46-a9c2-9c259ae6ba81';

type ScanTransaction = {
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
	note?: string;
};

type ReceiptScanSession = {
	classifiedTransactions?: ScanTransaction[];
};

function readSessionTransactions(): ScanTransaction[] {
	if (typeof window === 'undefined') {
		return [];
	}

	const rawSelected = window.sessionStorage.getItem(SELECTED_STORAGE_KEY);
	if (rawSelected) {
		try {
			const parsed = JSON.parse(rawSelected) as ScanTransaction[];
			if (Array.isArray(parsed) && parsed.length > 0) {
				return parsed;
			}
		} catch {
			// fall through to the main session payload
		}
	}

	const rawSession = window.sessionStorage.getItem(STORAGE_KEY);
	if (rawSession) {
		try {
			const parsed = JSON.parse(rawSession) as ReceiptScanSession;
			if (Array.isArray(parsed.classifiedTransactions) && parsed.classifiedTransactions.length > 0) {
				return parsed.classifiedTransactions;
			}
		} catch {
			// ignore malformed storage and fall back below
		}
	}

	return [];
}

function formatDisplayDate(dateValue: string) {
	if (!dateValue) {
		return '';
	}

	const parts = dateValue.split('-');
	if (parts.length !== 3) {
		return dateValue;
	}

	const [year, month, day] = parts;
	return `${Number(day)}/${Number(month)}/${year}`;
}

function formatAmount(transaction: ScanTransaction) {
	const numericValue = Number(transaction.amountValue || 0);
	const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
	const formatted = `${Math.abs(safeValue).toLocaleString('vi-VN')}đ`;
	const prefix = transaction.transactionType === 'income' ? '+' : '-';

	return `${prefix}${formatted}`;
}

function formatSuccessCount(transactions: ScanTransaction[]) {
	const count = transactions.length;
	return `Successfully added ${count}/${count} transactions`;
}

function getBadgeLabel(transaction: ScanTransaction) {
	return transaction.receiptLabel || transaction.source || 'Receipt';
}

function TransactionRow({ transaction }: { transaction: ScanTransaction }) {
	const isIncome = transaction.transactionType === 'income';

	return (
		<div className="bg-white h-[84px] flex items-center justify-between relative rounded-[12px] shrink-0 w-full shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
			<div className="flex gap-[12px] items-center relative shrink-0 w-[232px] pl-[0px]">
				<div className={`border-2 ${isIncome ? 'border-[#bbf7d0]' : 'border-[#fbcfe8]'} border-solid content-stretch flex items-center justify-center p-[2px] relative rounded-[9999px] shrink-0 size-[28px]`}>
					<div className="relative shrink-0 size-[16px]">
						<img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSvg2} />
					</div>
				</div>

				<div className="content-stretch flex flex-col items-start relative shrink-0">
					<div className="content-stretch flex items-center relative shrink-0 w-full">
						<div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-[192px]">
							<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Semibold'] font-semibold justify-center leading-[0] not-italic overflow-hidden relative shrink-0 text-[#1f2937] text-[14px] text-ellipsis whitespace-nowrap">
								<p className="leading-[20px]">{transaction.merchantName}</p>
							</div>
						</div>
					</div>

					<div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
						<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Regular'] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[12px] whitespace-nowrap">
							<p className="leading-[16px]">{formatDisplayDate(transaction.dateValue)}</p>
						</div>
					</div>

					<div className="content-stretch flex items-center pt-[4px] relative shrink-0 w-full">
						<div className="content-stretch flex flex-col items-start relative shrink-0">
							<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Bold'] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#1f2937] text-[14px] whitespace-nowrap">
								<p className="leading-[20px]">{formatAmount(transaction)}</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="bg-[#f0fdf4] border border-[#dcfce7] border-solid relative rounded-[4px] shrink-0 mr-[0px]">
				<div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center px-[9px] py-[3px] relative size-full">
					<div className="relative shrink-0 size-[12px]">
						<img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSvg3} />
					</div>
					<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Bold'] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#15803d] text-[10px] whitespace-nowrap">
						<p className="leading-[15px]">{getBadgeLabel(transaction)}</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function Doneuploadphoto() {
	const router = useRouter();
	const [transactions] = useState<ScanTransaction[]>(() => readSessionTransactions());

	return (
		<div className="bg-[#f7f8fa] relative size-full overflow-hidden" data-node-id="452:673" data-name="iPhone 14 & 15 Pro - 30">
			<div className="absolute backdrop-blur-[2px] bg-gradient-to-b from-[#112945] h-[453px] left-0 to-[#f7f8fa] top-[-4px] via-[#4d78a8] via-[37.5%] w-[393px]" data-node-id="452:674" />

			<div className="absolute content-stretch flex gap-[12px] items-center left-[21px] top-[47px]" data-node-id="452:675" data-name="Container">
				<button type="button" onClick={() => router.back()} className="content-stretch cursor-pointer flex flex-col items-start p-[4px] relative shrink-0" data-node-id="452:676" data-name="Button" aria-label="Back">
					<div className="flex items-center justify-center relative shrink-0 size-[20.686px]">
						<div className="-rotate-90 flex-none">
							<div className="relative size-[20.686px]" data-node-id="452:800">
								<div className="absolute inset-[-0.2%_-0.21%_-0.21%_-0.21%]">
									<img alt="" className="block max-w-none size-full" src={imgGroup31} />
								</div>
							</div>
						</div>
					</div>
				</button>
				<div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="452:679" data-name="Heading 1">
					<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Bold'] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#ebeef2] text-[24px] whitespace-nowrap" data-node-id="452:680">
						<p className="leading-[28px]">Zuno</p>
					</div>
				</div>
			</div>

			<button type="button" onClick={() => router.push('/')} className="absolute bg-[#f3f4f6] border border-[#e5e7eb] border-solid content-stretch cursor-pointer flex items-center left-[332px] px-[13px] py-[7px] rounded-[9999px] top-[46px] w-[46px]" data-node-id="452:681" data-name="Background+Border" aria-label="Go to dashboard">
				<div className="relative shrink-0" data-node-id="452:682" data-name="Button">
					<div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
						<div className="relative shrink-0 size-[20px]" data-node-id="452:683" data-name="SVG">
							<img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSvg} />
						</div>
					</div>
				</div>
			</button>

			<div className="absolute left-0 top-[114px] flex h-[735px] w-[388px] flex-col gap-[24px] items-start overflow-auto px-[20px] py-[16px]" data-node-id="452:707" data-name="Main - Content Canvas">
				<div className="bg-white border border-[rgba(114,177,158,0.2)] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[21px] relative rounded-[24px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.05)] shrink-0 w-full" data-node-id="452:708" data-name="Section - Success Banner (Bento Style Sheet)">
					<div className="absolute bg-[#72b19e] bottom-0 left-0 top-0 w-[4px]" data-node-id="452:709" data-name="Background" />
					<div className="relative shrink-0 w-full" data-node-id="452:710" data-name="Container">
						<div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-start relative size-full">
							<div className="bg-[#eceef0] content-stretch flex h-[80px] items-center justify-center overflow-clip relative rounded-[8px] shrink-0 w-[64px]" data-node-id="452:711" data-name="Background">
								<div className="flex-[1_0_0] h-full min-w-px opacity-60 relative" data-node-id="452:712" data-name="Receipt">
									<div className="absolute inset-0 overflow-hidden pointer-events-none">
										<img alt="" className="absolute h-full left-[-12.5%] max-w-none top-0 w-[125%]" src={imgReceipt} />
									</div>
								</div>
								<div className="absolute bg-[#72b19e] bottom-[4px] content-stretch flex items-center justify-center right-[4px] rounded-[6px] size-[24px]" data-node-id="452:713" data-name="Background">
									<div className="h-[8.017px] relative shrink-0 w-[10.867px]" data-node-id="452:714" data-name="Container">
										<img alt="" className="absolute block inset-0 max-w-none size-full" src={imgContainer} />
									</div>
								</div>
							</div>
							<div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px relative self-stretch" data-node-id="452:716" data-name="Container">
								<div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="452:717" data-name="Heading 2">
									<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Regular'] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#191c1e] text-[16px] w-full" data-node-id="452:718">
										<p className="leading-[24px]">{formatSuccessCount(transactions)}</p>
									</div>
								</div>
								<div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="452:719" data-name="Container">
									<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Regular'] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#42474f] text-[14px] w-full" data-node-id="452:720">
										<p className="leading-[20px]">Your report has been successfully updated</p>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="bg-[#eceef0] h-[6px] relative rounded-[9999px] shrink-0 w-full" data-node-id="452:721" data-name="Progress Line Indicator">
						<div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center overflow-clip relative rounded-[inherit] size-full">
							<div className="bg-[#72b19e] flex-[1_0_0] min-h-px relative w-full" data-node-id="452:722" data-name="Background" />
						</div>
					</div>
				</div>

				<div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="452:723" data-name="Heading 3 - Transaction List Title">
					<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Regular'] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-black w-full" data-node-id="452:724">
						<p className="leading-[24px]">Added transactions</p>
					</div>
				</div>

				<div className="content-stretch flex flex-col items-start relative rounded-[24px] shrink-0 w-full" data-node-id="452:725" data-name="Transactions Grouped by Date">
					<div className="content-stretch flex flex-col gap-[16px] items-start pt-[4px] relative rounded-tl-[24px] rounded-tr-[24px] shrink-0 w-full" data-node-id="452:726" data-name="Transaction List Items">
						{transactions.map((transaction) => (
							<TransactionRow key={transaction.id} transaction={transaction} />
						))}
					</div>
				</div>
			</div>

			<div className="-translate-x-1/2 absolute content-stretch flex flex-col gap-[16px] items-center justify-end left-1/2 pt-[32px] top-[646px] w-[353px]" data-node-id="452:698" data-name="Action Buttons">
				<button type="button" onClick={() => router.push('/')} className="bg-[#003d66] content-stretch flex h-[56px] items-center justify-center relative rounded-[9999px] shrink-0 w-full" data-node-id="452:699" data-name="Button">
					<div className="absolute bg-[rgba(255,255,255,0)] h-[56px] left-0 right-0 rounded-[9999px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] top-0" data-node-id="452:700" data-name="Button:shadow" />
					<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Bold'] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap" data-node-id="452:701">
						<p className="leading-[24px]">Go to Dashboard</p>
					</div>
				</button>
				<button type="button" onClick={() => router.push('/add-transaction')} className="border-2 border-[#c2c7d0] border-solid content-stretch cursor-pointer flex h-[56px] items-center justify-center p-[2px] relative rounded-[9999px] shrink-0 w-full" data-node-id="452:702" data-name="Button">
					<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Semibold'] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#42474f] text-[16px] text-center whitespace-nowrap" data-node-id="452:703">
						<p className="leading-[24px]">Add Another Transaction</p>
					</div>
				</button>
			</div>
		</div>
	);
}
