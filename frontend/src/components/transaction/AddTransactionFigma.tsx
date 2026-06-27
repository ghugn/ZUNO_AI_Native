"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import TransactionModeToggle from './TransactionModeToggle';
import { SourceLogo } from './SourceLogoBanks';
import { createTransaction } from '@/lib/api/transactions';
import { getFunds, createMonthlyFunds, type Fund } from '@/lib/api/funds';
import { bootstrapAuth } from '@/lib/api/auth';
const imgVector2 = "https://www.figma.com/api/mcp/asset/75ce7ef6-b1b5-4d3f-87ef-54764055dedb";
const imgVector3 = "https://www.figma.com/api/mcp/asset/89780cd8-3b61-4d2c-9c48-1d2659280fb5";
const imgVector4 = "https://www.figma.com/api/mcp/asset/a41e749b-85b7-424a-8062-34adc0f128f4";
const imgVector5 = "https://www.figma.com/api/mcp/asset/362556dd-d440-438a-8bd3-7f088dc91983";
const imgVector6 = "https://www.figma.com/api/mcp/asset/d5342023-30f9-4b61-9210-06815639edd6";
const imgVector7 = "https://www.figma.com/api/mcp/asset/35b05609-497f-4bf2-acc0-a5fbd931d67a";
const imgVector8 = "https://www.figma.com/api/mcp/asset/06cd6653-31dc-42fd-98e1-123a98f67e4c";
const imgRectangle65 = "https://www.figma.com/api/mcp/asset/d0edc58a-54c9-4f26-bf34-7282b71ef95a";
const imgRectangle63 = "https://www.figma.com/api/mcp/asset/026673e8-1d52-444d-9e24-fa83020bad63";
const imgVector9 = "https://www.figma.com/api/mcp/asset/1f1350a7-e428-4f6c-a044-3d38c530b238";
const imgVector10 = "https://www.figma.com/api/mcp/asset/5242f5e7-65f8-4220-ac7e-04af0cc1b084";
const imgVector11 = "https://www.figma.com/api/mcp/asset/bdca907d-9ee1-4279-a0c8-5cee977bf086";
const imgVector12 = "https://www.figma.com/api/mcp/asset/cde7dcea-392c-4e62-9095-e708fa5384d0";
const imgVector13 = "https://www.figma.com/api/mcp/asset/5ccb5564-7033-4967-a62f-7275935dd70e";
const imgVector14 = "https://www.figma.com/api/mcp/asset/8886db96-1c9a-433f-8a7b-5e3beb988fec";
const imgVector15 = "https://www.figma.com/api/mcp/asset/c0cc4989-6621-4562-bc49-e050d6d1af46";
const imgVector16 = "https://www.figma.com/api/mcp/asset/1b20ef5f-cca2-4ef8-8171-15b294d1af38";
const imgVector17 = "https://www.figma.com/api/mcp/asset/3bf64274-cff1-4557-b49d-01a81bffb1cc";
const imgVector18 = "https://www.figma.com/api/mcp/asset/53328053-234a-4bac-bef4-373bd97a669a";
const imgVector19 = "https://www.figma.com/api/mcp/asset/025bc148-2ffb-47d3-9a8c-f7f998faa1c3";
const imgVector20 = "https://www.figma.com/api/mcp/asset/4143d930-841c-4d7c-bed6-f3332e5aa6a7";
const imgGroup31 = "https://www.figma.com/api/mcp/asset/a3df63c5-2e0d-40bb-b6d1-567e25dfdbe8";
const imgGroup41 = "https://www.figma.com/api/mcp/asset/8a4bfa5e-137d-4256-88ac-a8bebaaa972f";
const imgVector28 = "https://www.figma.com/api/mcp/asset/83fba5f3-dca8-4aff-bf5a-c900b368029e";
const imgEllipse44 = "https://www.figma.com/api/mcp/asset/da9d902b-ff99-4096-81d9-a2025e3b6273";
const imgVector21 = "https://www.figma.com/api/mcp/asset/8472d5bf-5447-4981-bce7-0c6961f223c8";
const imgGroup56 = "https://www.figma.com/api/mcp/asset/2d7cf49c-5af2-4b94-b8e9-a7e6909368c7";
const imgGroup78 = "https://www.figma.com/api/mcp/asset/4ef9535f-a4c7-4b62-a134-2dbf341997ee";
const imgGroup54 = "https://www.figma.com/api/mcp/asset/2f748352-1a15-4fe3-88db-09f091f0ee51";
const imgGroup59 = "https://www.figma.com/api/mcp/asset/fce84dd1-ffb2-437d-9a71-966d3b83e9db";
const imgGroup105 = "https://www.figma.com/api/mcp/asset/6878fe73-6ded-414b-a969-d0ddaaf8b32c";
function ChevronDown({ className }: { className?: string }) {
	return (
		<div className={className || "relative size-[25px]"} data-node-id="242:357" data-name="chevron-down">
			<div className="absolute bottom-3/4 flex items-center justify-center left-[32%] right-[26.33%] top-0" style={{ containerType: "size" }}>
				<div className="-rotate-90 flex-none h-[100cqw] w-[100cqh]">
					<div className="relative size-full" data-node-id="242:358" data-name="Vector">
						<img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector2} />
					</div>
				</div>
			</div>
		</div>
	);
}

function CalendarPlus({ className }: { className?: string }) {
	return (
		<div className={className || "relative size-[24px]"} data-node-id="242:338" data-name="calendar-plus">
			<div className="absolute inset-[16.67%_12.5%_12.5%_12.5%]" data-node-id="242:339" data-name="Vector">
				<div className="absolute inset-[-4.41%_-4.17%]">
					<img alt="" className="block max-w-none size-full" src={imgVector3} />
				</div>
			</div>
			<div className="absolute inset-[58.33%_41.67%_41.67%_41.67%]" data-node-id="242:340" data-name="Vector">
				<div className="absolute inset-[-0.75px_-18.75%]">
					<img alt="" className="block max-w-none size-full" src={imgVector4} />
				</div>
			</div>
			<div className="absolute bottom-[33.33%] left-1/2 right-1/2 top-1/2" data-node-id="242:341" data-name="Vector">
				<div className="absolute inset-[-18.75%_-0.75px]">
					<img alt="" className="block max-w-none size-full" src={imgVector5} />
				</div>
			</div>
			<div className="absolute inset-[33.33%_13.54%_66.67%_13.54%]" data-node-id="242:342" data-name="Vector">
				<div className="absolute inset-[-0.75px_-4.29%]">
					<img alt="" className="block max-w-none size-full" src={imgVector6} />
				</div>
			</div>
			<div className="absolute inset-[12.5%_31.25%_79.17%_68.75%]" data-node-id="242:343" data-name="Vector">
				<div className="absolute inset-[-37.5%_-0.75px]">
					<img alt="" className="block max-w-none size-full" src={imgVector7} />
				</div>
			</div>
			<div className="absolute inset-[12.5%_68.75%_79.17%_31.25%]" data-node-id="242:344" data-name="Vector">
				<div className="absolute inset-[-37.5%_-0.75px]">
					<img alt="" className="block max-w-none size-full" src={imgVector8} />
				</div>
			</div>
		</div>
	);
}

function formatDateForDisplay(dateValue: string) {
	const [year, month, day] = dateValue.split('-');
	if (!year || !month || !day) {
		return '21/05/2026';
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

function HomeIndicatorIPhone({ className }: { className?: string }) {
	return (
		<div className={className || 'h-[34px] relative w-[390px]'} data-node-id="93:93">
			<div className="-translate-x-1/2 absolute bg-black bottom-[8px] h-[5px] left-1/2 rounded-[100px] w-[134px]" data-node-id="93:94" data-name="Home Indicator" />
		</div>
	);
}

type AmountKeyboardProps = {
	amountValue: string;
	onDigitPress: (digit: string) => void;
	onDeletePress: () => void;
	onSuggestionPress: (nextAmountValue: string) => void;
	onClose: () => void;
};

export function AmountKeyboard({ amountValue, onDeletePress, onDigitPress, onSuggestionPress }: AmountKeyboardProps) {
	const keyboardImg0 = "https://www.figma.com/api/mcp/asset/2b7245e3-b2ac-4aa5-a0eb-0dc57309f211";
	const keyboardImg10 = "https://www.figma.com/api/mcp/asset/648197c1-631e-43d4-ba15-5eb4eeafc874";
	const keyboardImg9 = "https://www.figma.com/api/mcp/asset/b50aa84f-78a1-4918-827b-de9e5c7845a8";
	const keyboardImgKeyBackground = "https://www.figma.com/api/mcp/asset/b909672a-3459-40cc-ae03-d5803a5e5025";
	const keyboardImg3 = "https://www.figma.com/api/mcp/asset/34f2fbd1-d186-44f8-bea2-a600039fca9d";

	const numericAmountValue = Number(amountValue);
	const hasQuickSuggestions = Number.isFinite(numericAmountValue) && numericAmountValue > 0;
	const quickSuggestionMultipliers = [1000, 10000, 100000];
	const quickSuggestions = hasQuickSuggestions
		? quickSuggestionMultipliers.map((multiplier) => {
			const nextAmountValue = String(Math.round(numericAmountValue * multiplier));
			return {
				label: `${Number(nextAmountValue).toLocaleString('vi-VN')}đ`,
				nextAmountValue,
			};
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
		<div className="bg-[#e8eaed] content-stretch flex flex-col gap-[44px] items-start relative rounded-[3px] size-full" data-node-id="256:369" data-name="🌓 Dark Mode=Off">
			<div className="content-stretch flex flex-col items-center px-[3px] relative shrink-0 w-full" data-node-id="I256:369;1649:33906" data-name="Key and suggestions">
				{/* <div className="backdrop-blur-[54.366px] content-stretch flex gap-[132px] items-center mb-[-6px] px-[30px] py-[13px] relative shrink-0 w-full" data-node-id="I256:369;47:15228" data-name="🧰/Keyboard suggestion (iPhone)">
					<div className="content-stretch flex flex-[1_0_0] flex-col gap-px h-[25px] items-center justify-center min-w-px relative" data-node-id="I256:369;47:15228;1861:21368" data-name="text" />
				</div> */}
				<div className="relative h-[52px] w-full">
					{quickSuggestions.length > 0 ? (
						<div className="absolute inset-0 content-stretch flex items-center justify-center gap-[24px] px-[16px] pt-[12px] w-full z-10" data-node-id="296:534">
							{quickSuggestions.map((suggestion: { label: string; nextAmountValue: string }) => (
								<button
									key={suggestion.nextAmountValue}
									type="button"
									className="border-0 border-black border-solid content-stretch flex gap-[10px] h-[24px] items-center justify-center px-[20px] py-[5px] relative shrink-0 w-[88px]"
									aria-label={`Use ${suggestion.label}`}
									onClick={() => onSuggestionPress(suggestion.nextAmountValue)}
								>
									<div className="absolute contents left-0 top-0" data-node-id="296:536" data-name="Mask group">
										<div className="absolute bg-[#ffffff] border-0 border-black border-solid h-[24px] left-0 rounded-[20px] top-0 w-[88px]" data-node-id="296:537" />
									</div>
									<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Medium'] font-medium justify-end leading-[0] not-italic relative shrink-0 text-[11px] text-black text-center tracking-[0.066px] whitespace-nowrap" data-node-id="296:538">
										<p className="leading-[20px]">{suggestion.label}</p>
									</div>
								</button>
							))}
						</div>
					) : null}
				</div>
				<div className="content-stretch flex flex-col items-start pt-[6px] relative shrink-0 w-full" data-node-id="I256:369;1861:21394" data-name="Key">
					<div className="h-[210px] relative shrink-0 w-full" data-node-id="I256:369;47:13605" data-name="Keys">
						<button type="button" aria-label="Key 0" className="absolute block cursor-pointer inset-[77.78%_33.88%_0_33.88%]" onClick={() => onDigitPress('0')} data-node-id="I256:369;47:13734" data-name="0">
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

const repeatOptions = ['No repeat', 'Daily', 'Weekly', 'Monthly', 'Yearly'] as const;
type RepeatOption = (typeof repeatOptions)[number];

type SourceOption = {
	name: string;
	shortCode: string;
	badgeColor: string;
	logoSrc?: string;
};

type TransactionType = 'expense' | 'income';

type AddTransactionResultPayload = {
	transactionType: TransactionType;
	amountValue: string;
	note: string;
	category: string;
	dateValue: string;
	timeOfDay: 'Morning' | 'Noon' | 'Afternoon' | 'Evening' | 'Night';
	source: SourceOption;
};

const TRANSACTION_RESULT_SESSION_KEY = 'zuno:transaction-result';

const sourceOptions: SourceOption[] = [
	{ name: 'MB Bank', shortCode: 'MB', badgeColor: '#1f3fbf', logoSrc: '/icons/MBbank.png' },
	{ name: 'Vietcombank', shortCode: 'VCB', badgeColor: '#009b77', logoSrc: '/icons/Vietcombank.png' },
	{ name: 'Techcombank', shortCode: 'TCB', badgeColor: '#d61f26', logoSrc: '/icons/techcombank.png' },
	{ name: 'SHB Bank', shortCode: 'SHB', badgeColor: '#f28c00', logoSrc: '/icons/SHB.jpg' },
	{ name: 'BIDV', shortCode: 'BIDV', badgeColor: '#0054a6', logoSrc: '/icons/Bidv.png' },
	{ name: 'Vietinbank', shortCode: 'VTB', badgeColor: '#d11a2a', logoSrc: '/icons/Vietinbank.png' },
	{ name: 'ACB', shortCode: 'ACB', badgeColor: '#00a0df', logoSrc: '/icons/ACB.png' },
];

export default function AddTransactionFigma() {
	const router = useRouter();
	const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<'Morning' | 'Noon' | 'Afternoon' | 'Evening' | 'Night'>('Morning');
	const [selectedCategory, setSelectedCategory] = useState<'Food and Drinks' | 'Experience' | 'Developement' | 'Fixed bill' | 'Savings'>('Food and Drinks');
	const [selectedTransactionType, setSelectedTransactionType] = useState<TransactionType>('expense');
	const [selectedDate, setSelectedDate] = useState(getTodayDateValue());
	const [selectedRepeat, setSelectedRepeat] = useState<RepeatOption>('No repeat');
	const [isRepeatDropdownOpen, setIsRepeatDropdownOpen] = useState(false);
	const [selectedSource, setSelectedSource] = useState<SourceOption>(sourceOptions[3]);
	const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);
	const [amountValue, setAmountValue] = useState('');
	const [note, setNote] = useState('');
	const [isAmountKeyboardOpen, setIsAmountKeyboardOpen] = useState(false);
	const [funds, setFunds] = useState<Fund[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const dateInputRef = useRef<HTMLInputElement>(null);
	const repeatDropdownRef = useRef<HTMLDivElement>(null);
	const sourceDropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		bootstrapAuth().then(() => {
			const now = new Date();
			const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
			getFunds(currentMonth).then((res) => {
				if (res.ok && res.data && res.data.length > 0) {
					setFunds(res.data);
				}
				// If no funds exist yet, wait for user to add their first income
			});
		});
	}, []);
	const todayDateValue = getTodayDateValue();
	const formattedSelectedDate = formatDateForDisplay(selectedDate);
	const dateDisplayText = selectedDate === todayDateValue ? `Today, ${formattedSelectedDate}` : formattedSelectedDate;
	const amountDisplayText = formatAmountDisplay(amountValue);

	const openAmountKeyboard = () => {
		setIsAmountKeyboardOpen(true);
	};

	const closeAmountKeyboard = () => {
		setIsAmountKeyboardOpen(false);
	};

	const handleAmountDigitPress = (digit: string) => {
		setIsAmountKeyboardOpen(true);
		setAmountValue((currentValue) => {
			if (digit === '0' && !currentValue) {
				return '0';
			}

			if (currentValue === '0') {
				return digit;
			}

			return `${currentValue}${digit}`;
		});
	};

	const handleAmountDelete = () => {
		setAmountValue((currentValue) => currentValue.slice(0, -1));
	};

	const handleAmountSuggestionPress = (nextAmountValue: string) => {
		setAmountValue(nextAmountValue);
		setIsAmountKeyboardOpen(true);
	};

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

	const handleClose = () => {
		window.location.assign('/');
	};

	const handleAddTransaction = async () => {
		if (isSubmitting) return;

		const amount = Math.abs(Number(amountValue)) || 0;
		if (amount <= 0) {
			alert('Vui lòng nhập số tiền giao dịch hợp lệ!');
			return;
		}

		setIsSubmitting(true);
		let activeFunds = funds;

		try {
			// Nếu chưa có quỹ và đây là giao dịch thu nhập → tạo quỹ từ số tiền income này
			if (activeFunds.length === 0 && selectedTransactionType === 'income') {
				const now = new Date();
				const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
				const createRes = await createMonthlyFunds({
					month: currentMonth,
					bankBalance: amount,
					residenceType: 'dorm',
				});
				if (!createRes.ok || !createRes.data || createRes.data.length === 0) {
					alert('Không thể khởi tạo quỹ. Vui lòng thử lại!');
					setIsSubmitting(false);
					return;
				}
				activeFunds = createRes.data;
				setFunds(createRes.data);
			}

			// Nếu chưa có quỹ và đây là chi tiêu → yêu cầu nhập income trước
			if (activeFunds.length === 0 && selectedTransactionType === 'expense') {
				alert('Bạn chưa có quỹ tháng này. Hãy thêm thu nhập (Income) trước để khởi tạo ngân sách!');
				setIsSubmitting(false);
				return;
			}

			// Ánh xạ danh mục sang loại quỹ tương ứng
			const CATEGORY_TO_FUND_TYPE: Record<string, string> = {
				'Food and Drinks': 'food',
				'Experience': 'experience',
				'Developement': 'growth',
				'Fixed bill': 'living',
				'Savings': 'future',
			};

			const fundType = CATEGORY_TO_FUND_TYPE[selectedCategory] || 'food';
			const matchedFund = activeFunds.find((f) => f.fundType === fundType) || activeFunds[0];

			if (!matchedFund) {
				alert('Không tìm thấy quỹ hợp lệ cho giao dịch này!');
				setIsSubmitting(false);
				return;
			}

			const res = await createTransaction({
				fundId: matchedFund.id,
				amount,
				transactionType: selectedTransactionType,
				category: selectedCategory,
				description: note || selectedCategory,
				inputMethod: 'manual',
				transactionDate: `${selectedDate}T12:00:00.000Z`,
			});

			if (!res.ok) {
				alert(res.error || 'Failed to save transaction to backend');
				setIsSubmitting(false);
				return;
			}

			const payload: AddTransactionResultPayload = {
				transactionType: selectedTransactionType,
				amountValue,
				note,
				category: selectedCategory,
				dateValue: selectedDate,
				timeOfDay: selectedTimeOfDay,
				source: selectedSource,
			};

			window.sessionStorage.setItem(TRANSACTION_RESULT_SESSION_KEY, JSON.stringify(payload));
			router.push(`/transaction-result/${selectedTransactionType}`);
		} catch (err: any) {
			alert(err.message || 'Lỗi lưu giao dịch');
			setIsSubmitting(false);
		}
	};

	useEffect(() => {
		if (!isRepeatDropdownOpen && !isSourceDropdownOpen) {
			return;
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
				setIsAmountKeyboardOpen(false);
			}
		};

		document.addEventListener('mousedown', handlePointerDown);
		document.addEventListener('keydown', handleEscape);

		return () => {
			document.removeEventListener('mousedown', handlePointerDown);
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isRepeatDropdownOpen, isSourceDropdownOpen, isAmountKeyboardOpen]);

	return (
		<div className="bg-[#f7f8fa] relative h-[852px] overflow-x-hidden overflow-y-auto w-[393px]" data-node-id="242:246" data-name="iPhone 14 & 15 Pro - 6">
			<div className="absolute backdrop-blur-[2px] bg-gradient-to-b from-[#112945] h-[453px] left-0 to-[#f7f8fa] top-[-2px] via-[#4d78a8] via-[37.5%] w-[393px]" data-node-id="242:247" />
			<div className="absolute inset-0 overflow-y-auto overscroll-contain z-10 hide-scrollbar">
				<div className="relative min-h-[1150px] w-full">
				<div className="relative bg-white  min-h-[751px] left-[0px] rounded-tl-[30px] rounded-tr-[30px] top-[157px] w-[393px]" data-node-id="242:248" />	
			<div className="absolute h-[84px] left-[23px] top-[732px] w-[350px]" data-node-id="242:249">
				<div className="absolute inset-[0_-1.14%_-9.52%_-1.14%]">
					<img alt="" className="block max-w-none size-full" src={imgRectangle65} />
				</div>
			</div>
			<div className="absolute bg-white h-[31px] left-[42px] top-[719px] w-[35px]" data-node-id="242:250" />
			<p className="-translate-x-1/2 [word-break:break-word] absolute font-['SF Compact Rounded:Medium'] font-medium leading-[normal] left-[59.5px] not-italic text-[12px] text-black text-center top-[723px] w-[39px]" data-node-id="242:251">
				Note
			</p>
			<textarea
				aria-label="Note"
				autoFocus
				className="absolute bg-transparent border-0 [word-break:break-word] font-['SF Compact Rounded:Regular'] font-normal leading-[18px] left-[40px] not-italic outline-none p-0 resize-none text-[14px] text-black top-[744px] w-[310px]"
				onChange={(event) => setNote(event.target.value)}
				placeholder="Description"
				value={note}
			/>
			<div className="absolute h-[42px] left-[23px] top-[669px] w-[350px]" data-node-id="242:253">
				<div className="absolute inset-[0_-1.14%_-19.05%_-1.14%]">
					<img alt="" className="block max-w-none size-full" src={imgRectangle63} />
				</div>
			</div>
			<div className="absolute bg-white h-[31px] left-[41px] top-[668px] w-[53px]" data-node-id="242:255" />
			<div className="absolute left-[23px] top-[669px] w-[350px]" ref={sourceDropdownRef}>
				<button
					aria-expanded={isSourceDropdownOpen}
					aria-haspopup="listbox"
					className="absolute appearance-none bg-transparent border-0 cursor-pointer h-[42px] inset-0 outline-none w-full"
					onClick={() => setIsSourceDropdownOpen((current) => !current)}
					type="button"
				>
					<span className="absolute content-stretch flex gap-[5px] items-center left-[18px] top-[11px]">
						<SourceLogo badgeColor={selectedSource.badgeColor} logoSrc={selectedSource.logoSrc} shortCode={selectedSource.shortCode} />
						<span className="[word-break:break-word] font-['SF Compact Rounded:Regular'] font-normal leading-[18px] not-italic shrink-0 text-[14px] text-black whitespace-nowrap" data-node-id="328:386">
							{selectedSource.name}
						</span>
					</span>
					<ChevronDown className="absolute left-[305px] size-[25px] top-[18px]" />
				</button>
				{isSourceDropdownOpen ? (
					<div className="absolute bg-white border border-[rgba(224,224,224,0.9)] border-solid left-0 overflow-hidden rounded-[10px] shadow-[0px_6px_16px_0px_rgba(0,0,0,0.2)] top-[46px] w-[350px] z-20">
						{sourceOptions.map((option) => (
							<button
								aria-selected={selectedSource.name === option.name}
								className={`cursor-pointer flex gap-[10px] items-center px-[16px] py-[10px] text-left w-full ${selectedSource.name === option.name ? 'bg-[#F5F7FB] text-[#112945]' : 'bg-white text-black hover:bg-[#F5F7FB]'}`}
								onClick={() => {
									setSelectedSource(option);
									setIsSourceDropdownOpen(false);
								}}
								role="option"
								type="button"
								key={option.name}
							>
									<SourceLogo badgeColor={option.badgeColor} logoSrc={option.logoSrc} shortCode={option.shortCode} />
								<span className="font-['SF Compact Rounded:Regular'] text-[14px]">{option.name}</span>
							</button>
						))}
					</div>
				) : null}
			</div>
			<p className="-translate-x-1/2 [word-break:break-word] absolute font-['SF Compact Rounded:Medium'] font-medium leading-[0] left-[68px] not-italic text-[12px] text-black text-center top-[662px] w-[50px]" data-node-id="242:256">
				<span className="leading-[normal]">Source</span>
				<span className="leading-[normal] text-[#ff0707]">*</span>
			</p>
			<div className="absolute h-[42px] left-[23px] top-[606px] w-[350px]" data-node-id="242:258">
				<div className="absolute inset-[0_-1.14%_-19.05%_-1.14%]">
					<img alt="" className="block max-w-none size-full" src={imgRectangle63} />
				</div>
			</div>
			<button aria-label="Open amount keyboard" className="absolute bg-white block border-2 border-[rgba(224,224,224,0.9)] border-solid cursor-pointer h-[70px] left-[30px] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[279px] w-[350px]" data-node-id="242:259" onClick={openAmountKeyboard} type="button" />
			<p className="[word-break:break-word] absolute font-['SF Compact Rounded:Regular'] h-[24px] leading-[0] left-[45px] not-italic text-[0px] text-black top-[374px] w-[69px]" data-node-id="242:261">
				<span className="font-['SF Compact Rounded:Medium'] font-medium leading-[18px] text-[12px]">Category</span>
				<span className="font-['SF Compact Rounded:Medium'] font-medium leading-[18px] text-[12px] text-[red]">*</span>
			</p>
			<div className="absolute bg-white h-[28px] left-[47px] top-[270px] w-[64px]" data-node-id="242:262" />
			<button aria-label="Edit amount" className="absolute bg-transparent border-0 cursor-pointer left-[50px] outline-none p-0 text-left top-[265px]" onClick={openAmountKeyboard} type="button">
				<span className="font-['SF Compact Rounded:Medium'] font-medium leading-[18px] text-[12px] text-black">Amount</span>
				<span className="font-['SF Compact Rounded:Medium'] font-medium leading-[18px] text-[12px] text-[#ff0707]">*</span>
			</button>
			<button aria-label="Amount value" className="absolute bg-transparent border-0 cursor-pointer h-[29px] left-[50px] outline-none p-0 text-left top-[305px] w-[360px]" onClick={openAmountKeyboard} type="button">
				<p className="[word-break:break-word] font-['SF Compact Rounded:Bold'] leading-[18px] not-italic text-[32px] text-black">{amountDisplayText}</p>
			</button>
			<div className="absolute left-[152.94px] size-[0.064px] top-[2.67px]" data-node-id="242:265">
				<div className="absolute inset-[-780.28%]">
					<img alt="" className="block max-w-none size-full" src={imgVector9} />
				</div>
			</div>
			<div className="absolute h-[0.041px] left-[158.1px] top-[2.54px] w-0" data-node-id="242:266">
				<div className="absolute inset-[-1207.41%_-0.5px]">
					<img alt="" className="block max-w-none size-full" src={imgVector10} />
				</div>
			</div>
			<div className="absolute h-0 left-[147.54px] top-[13.5px] w-[0.041px]" data-node-id="242:267">
				<div className="absolute inset-[-0.5px_-1207.41%]">
					<img alt="" className="block max-w-none size-full" src={imgVector11} />
				</div>
			</div>
			<div className="absolute h-0 left-[162.37px] top-[11.63px] w-[0.043px]" data-node-id="242:268">
				<div className="absolute inset-[-0.5px_-1169.68%]">
					<img alt="" className="block max-w-none size-full" src={imgVector12} />
				</div>
			</div>
			<div className="absolute h-[0.047px] left-[90.22px] top-[44.33px] w-[0.144px]" data-node-id="242:269">
				<div className="absolute inset-[-1069.71%_-346.67%]">
					<img alt="" className="block max-w-none size-full" src={imgVector13} />
				</div>
			</div>
			<div className="absolute h-0 left-[91.45px] top-[47.29px] w-[0.04px]" data-node-id="242:270">
				<div className="absolute inset-[-0.5px_-1247.66%]">
					<img alt="" className="block max-w-none size-full" src={imgVector14} />
				</div>
			</div>
			<div className="absolute h-0 left-[86.15px] top-[43.95px] w-[0.043px]" data-node-id="242:271">
				<div className="absolute inset-[-0.5px_-1169.68%]">
					<img alt="" className="block max-w-none size-full" src={imgVector12} />
				</div>
			</div>
			<div className="absolute h-0 left-[82.49px] top-[51.67px] w-[0.041px]" data-node-id="242:272">
				<div className="absolute inset-[-0.5px_-1207.41%]">
					<img alt="" className="block max-w-none size-full" src={imgVector15} />
				</div>
			</div>
			<div className="absolute h-[0.212px] left-[255.13px] top-[3.63px] w-[0.106px]" data-node-id="242:273">
				<div className="absolute inset-[-236.39%_-472.78%]">
					<img alt="" className="block max-w-none size-full" src={imgVector16} />
				</div>
			</div>
			<div className="absolute h-0 left-[261.98px] top-[3.38px] w-[0.096px]" data-node-id="242:274">
				<div className="absolute inset-[-0.5px_-518.42%]">
					<img alt="" className="block max-w-none size-full" src={imgVector17} />
				</div>
			</div>
			<div className="absolute h-[0.088px] left-[312.77px] top-[19.47px] w-0" data-node-id="242:275">
				<div className="absolute inset-[-565.59%_-0.5px]">
					<img alt="" className="block max-w-none size-full" src={imgVector18} />
				</div>
			</div>
			<div className="absolute h-[0.061px] left-[323.31px] top-[50.06px] w-[0.06px]" data-node-id="242:276">
				<div className="absolute inset-[-815.87%_-828.05%]">
					<img alt="" className="block max-w-none size-full" src={imgVector19} />
				</div>
			</div>
			<div className="absolute left-[312.89px] size-[0.029px] top-[8.25px]" data-node-id="242:277">
				<div className="absolute inset-[-1733.73%]">
					<img alt="" className="block max-w-none size-full" src={imgVector20} />
				</div>
			</div>
			<div className="absolute flex items-center justify-center left-[32px] size-[20.686px] top-[23px]">
				<div className="-rotate-90 flex-none">
					<button
						aria-label="Close add transaction"
						className="block cursor-pointer relative size-[20.686px]"
						data-node-id="242:278"
						onClick={handleClose}
						type="button"
					>
						<div className="absolute inset-[-0.2%_-0.21%_-0.21%_-0.21%]">
							<img alt="" className="block max-w-none size-full" src={imgGroup31} />
						</div>
					</button>
				</div>
			</div>
			<p className="-translate-x-1/2 [word-break:break-word] absolute font-['SF Compact Rounded:Medium'] leading-[normal] left-[122px] not-italic text-[25px] text-center text-white top-[64px] whitespace-nowrap" data-node-id="242:290">
				Add Transaction
			</p>
			<div className="absolute bg-[rgba(229,229,230,0.71)] content-stretch flex h-[44px] items-center left-[57px] overflow-hidden pb-[4px] pl-[4px] pr-[37px] pt-[3px] rounded-[30px] shadow-[2px_2px_10px_0px_rgba(0,0,0,0.2)] top-[207px] w-[280px]" data-node-id="242:291">
				<div className={`absolute left-[4px] top-[3px] h-[37px] w-[136px] rounded-[20px] bg-white transition-transform duration-200 ease-out ${selectedTransactionType === 'expense' ? 'translate-x-0' : 'translate-x-[136px]'}`} data-node-id="242:292" />
				<button
					type="button"
					onClick={() => setSelectedTransactionType('expense')}
					aria-pressed={selectedTransactionType === 'expense'}
					className={`absolute left-[4px] top-[3px] z-10 flex h-[37px] w-[136px] items-center justify-start gap-[12px] rounded-[20px] px-[26px] transition-colors ${selectedTransactionType === 'expense' ? 'text-[#174f84]' : 'text-black/80'}`}
					data-node-id="242:295"
				>
					<div className="size-[23.961px] shrink-0">
						<img alt="" className="block max-w-none size-full" src={imgGroup41} />
					</div>
					<p className="font-['SF Compact Rounded:Regular'] leading-[23.961px] not-italic text-[#174f84] text-[12px] text-center whitespace-nowrap" data-node-id="242:298">
						Expenses
					</p>
				</button>
				<button
					type="button"
					onClick={() => setSelectedTransactionType('income')}
					aria-pressed={selectedTransactionType === 'income'}
					className={`absolute right-[4px] top-[3px] z-10 flex h-[37px] w-[136px] items-center justify-start gap-[12px] rounded-[20px] px-[26px] transition-colors ${selectedTransactionType === 'income' ? 'text-[#174f84]' : 'text-black/80'}`}
					data-node-id="296:395"
				>
					<div className="absolute flex h-[10px] items-center justify-center left-[35px] top-[13px] w-[8px]">
						<div className="-rotate-90 flex-none">
							<div className="h-[8px] relative w-[10px]" data-node-id="296:396">
								<div className="absolute inset-[-12.5%_-14.38%_-12.5%_-10%]">
									<img alt="" className="block max-w-none size-full" src={imgVector28} />
								</div>
							</div>
						</div>
					</div>
					<div className="flex items-center justify-center relative shrink-0 size-[24px]">
						<div className="-rotate-90 flex-none translate-x-[1px] translate-y-[0px]">
							<div className="relative size-[24px]" data-node-id="296:397">
								<img alt="" className="absolute block inset-0 max-w-none object-contain size-full" src={imgEllipse44} />
							</div>
						</div>
					</div>
					<p className="[word-break:break-word] font-['SF Compact Rounded:Regular'] leading-[24px] not-italic relative shrink-0 text-[12px] text-[rgba(23,79,132,0.8)] text-center whitespace-nowrap" data-node-id="296:398">
						Income
					</p>
				</button>
			</div>
			<div className="absolute h-[201px] left-[14px] overflow-clip top-[393px] w-[366px]" data-node-id="242:300">
				<p className="-translate-x-1/2 [word-break:break-word] absolute font-['SF Compact Rounded:Semibold'] leading-[0] left-[77px] not-italic text-[12px] text-black text-center top-[83px] whitespace-nowrap" data-node-id="242:302">
					<span className="leading-[normal]">When did it happen</span>
					<span className="leading-[normal] text-[red]">*</span>
				</p>
				<div className="absolute h-0 left-[12px] top-[-41px] w-[317.5px]" data-node-id="242:303">
					<div className="absolute inset-[-0.5px_0]">
						<img alt="" className="block max-w-none size-full" src={imgVector21} />
					</div>
				</div>
				<div className="absolute contents left-[6px] top-[106px]" data-node-id="242:304">
					<div className="absolute h-[18.605px] left-[6px] top-[212.4px] w-[338px]" data-node-id="242:305" />
						<button
							type="button"
							onClick={() => setSelectedTimeOfDay('Morning')}
							aria-pressed={selectedTimeOfDay === 'Morning'}
							className={`absolute flex h-[21px] items-center justify-center left-[6px] px-[12px] rounded-[10px] top-[106px] w-auto min-w-[62px] transition-colors ${selectedTimeOfDay === 'Morning' ? 'bg-[#7CAF9F] text-white' : 'bg-[#F5F7FB] text-black'}`}
							data-node-id="242:308"
						>
							<span className="[word-break:break-word] leading-[21px] not-italic relative shrink-0 text-[10px] text-center whitespace-nowrap" style={{ fontWeight: 400, fontFamily: 'var(--font-sf-rounded)' }} data-node-id="242:309">
								Morning
							</span>
						</button>
						<button
							type="button"
							onClick={() => setSelectedTimeOfDay('Noon')}
							aria-pressed={selectedTimeOfDay === 'Noon'}
							className={`absolute flex h-[22px] items-center justify-center left-[79px] px-[12px] rounded-[10px] top-[106px] w-auto min-w-[62px] transition-colors ${selectedTimeOfDay === 'Noon' ? 'bg-[#7CAF9F] text-white' : 'bg-[#F5F7FB] text-black'}`}
							data-node-id="242:310"
						>
							<span className="[word-break:break-word] leading-[21px] not-italic relative shrink-0 text-[10px] text-center whitespace-nowrap" style={{ fontWeight: 400, fontFamily: 'var(--font-sf-rounded)' }} data-node-id="242:311">
								Noon
							</span>
						</button>
						<button
							type="button"
							onClick={() => setSelectedTimeOfDay('Afternoon')}
							aria-pressed={selectedTimeOfDay === 'Afternoon'}
							className={`absolute flex h-[21px] items-center justify-center left-[152px] px-[12px] rounded-[10px] top-[106px] w-auto min-w-[62px] transition-colors ${selectedTimeOfDay === 'Afternoon' ? 'bg-[#7CAF9F] text-white' : 'bg-[#F5F7FB] text-black'}`}
							data-node-id="242:312"
						>
							<span className="[word-break:break-word] leading-[21px] not-italic relative shrink-0 text-[10px] text-center whitespace-nowrap" style={{ fontWeight: 400, fontFamily: 'var(--font-sf-rounded)' }} data-node-id="242:313">
								Afternoon
							</span>
						</button>
						<button
							type="button"
							onClick={() => setSelectedTimeOfDay('Evening')}
							aria-pressed={selectedTimeOfDay === 'Evening'}
							className={`absolute flex h-[21px] items-center justify-center left-[225px] px-[12px] rounded-[10px] top-[106px] w-auto min-w-[62px] transition-colors ${selectedTimeOfDay === 'Evening' ? 'bg-[#7CAF9F] text-white' : 'bg-[#F5F7FB] text-black'}`}
							data-node-id="242:314"
						>
							<span className="[word-break:break-word] leading-[21px] not-italic relative shrink-0 text-[10px] text-center whitespace-nowrap" style={{ fontWeight: 400, fontFamily: 'var(--font-sf-rounded)' }} data-node-id="242:315">
								Evening
							</span>
						</button>
						<button
							type="button"
							onClick={() => setSelectedTimeOfDay('Night')}
							aria-pressed={selectedTimeOfDay === 'Night'}
							className={`absolute flex h-[21px] items-center justify-center left-[298px] px-[12px] rounded-[10px] top-[106px] w-auto min-w-[62px] transition-colors ${selectedTimeOfDay === 'Night' ? 'bg-[#7CAF9F] text-white' : 'bg-[#F5F7FB] text-black'}`}
							data-node-id="242:306"
						>
							<span className="[word-break:break-word] leading-[21px] not-italic relative shrink-0 text-[10px] text-center whitespace-nowrap" style={{ fontWeight: 400, fontFamily: 'var(--font-sf-rounded)' }} data-node-id="242:307">
								Night
							</span>
						</button>
				</div>
				<div className="absolute contents left-[11px] top-[49px]" data-node-id="242:316">
					<button
						type="button"
						onClick={() => setSelectedCategory('Food and Drinks')}
						aria-pressed={selectedCategory === 'Food and Drinks'}
						className={`absolute flex flex-col items-center justify-start left-[0px] top-[0px] w-[64px] transition-colors ${selectedCategory === 'Food and Drinks' ? 'text-black' : 'text-black/90'}`}
						data-node-id="242:329"
					>
						<span className={`relative flex h-[40px] w-[40px] items-center justify-center rounded-full transition-colors ${selectedCategory === 'Food and Drinks' ? 'bg-[#A8D76A]' : 'bg-[#CAE8A3]'}`}>
							<span className={`absolute inset-[4px] rounded-full ${selectedCategory === 'Food and Drinks' ? 'bg-[#CAE8A3]' : 'bg-[#DFF1BF]'}`} />
							<img alt="" className="pointer-events-none relative size-[36px]" src={imgGroup56} />
						</span>
						<span className="mt-[6px] text-[10px] leading-[normal] text-center whitespace-nowrap" style={{ fontFamily: 'var(--font-sf-rounded)', fontWeight: 400 }}>
							Food and
						</span>
						<span className="text-[10px] leading-[normal] text-center whitespace-nowrap" style={{ fontFamily: 'var(--font-sf-rounded)', fontWeight: 400 }}>
							Drinks
						</span>
					</button>
					<button
						type="button"
						onClick={() => setSelectedCategory('Experience')}
						aria-pressed={selectedCategory === 'Experience'}
						className={`absolute flex flex-col items-center justify-start left-[76px] top-[0px] w-[64px] transition-colors ${selectedCategory === 'Experience' ? 'text-black' : 'text-black/90'}`}
						data-node-id="242:330"
					>
						<span className={`relative flex h-[40px] w-[40px] items-center justify-center rounded-full transition-colors ${selectedCategory === 'Experience' ? 'bg-[#F29AB7]' : 'bg-[#F8D7E2]'}`}>
							<span className={`absolute inset-[4px] rounded-full ${selectedCategory === 'Experience' ? 'bg-[#F8D7E2]' : 'bg-[#FBE7EE]'}`} />
							<img alt="" className="pointer-events-none relative size-[36px]" src={imgGroup78} />
						</span>
						<span className="mt-[6px] text-[10px] leading-[normal] text-center whitespace-nowrap" style={{ fontFamily: 'var(--font-sf-rounded)', fontWeight: 400 }}>
							Experience
						</span>
					</button>
					<button
						type="button"
						onClick={() => setSelectedCategory('Developement')}
						aria-pressed={selectedCategory === 'Developement'}
						className={`absolute flex flex-col items-center justify-start left-[150px] top-[0px] w-[64px] transition-colors ${selectedCategory === 'Developement' ? 'text-black' : 'text-black/90'}`}
						data-node-id="242:331"
					>
						<span className={`relative flex h-[40px] w-[40px] items-center justify-center rounded-full transition-colors ${selectedCategory === 'Developement' ? 'bg-[#8AC9E8]' : 'bg-[#B4E5F5]'}`}>
							<span className={`absolute inset-[4px] rounded-full ${selectedCategory === 'Developement' ? 'bg-[#B4E5F5]' : 'bg-[#D5F0FA]'}`} />
							<img alt="" className="pointer-events-none relative size-[36px]" src={imgGroup59} />
						</span>
						<span className="mt-[6px] text-[10px] leading-[normal] text-center whitespace-nowrap" style={{ fontFamily: 'var(--font-sf-rounded)', fontWeight: 400 }}>
							Developement
						</span>
					</button>
					<button
						type="button"
						onClick={() => setSelectedCategory('Fixed bill')}
						aria-pressed={selectedCategory === 'Fixed bill'}
						className={`absolute flex flex-col items-center justify-start left-[226px] top-[0px] w-[64px] transition-colors ${selectedCategory === 'Fixed bill' ? 'text-black' : 'text-black/90'}`}
						data-node-id="242:332"
					>
						<span className={`relative flex h-[40px] w-[40px] items-center justify-center rounded-full transition-colors ${selectedCategory === 'Fixed bill' ? 'bg-[#9FC0FF]' : 'bg-[#DDE9FC]'}`}>
							<span className={`absolute inset-[4px] rounded-full ${selectedCategory === 'Fixed bill' ? 'bg-[#DDE9FC]' : 'bg-[#EDF3FE]'}`} />
							<img alt="" className="pointer-events-none relative size-[36px]" src={imgGroup54} />
						</span>
						<span className="mt-[6px] text-[10px] leading-[normal] text-center whitespace-nowrap" style={{ fontFamily: 'var(--font-sf-rounded)', fontWeight: 400 }}>
							Fixed bill
						</span>
					</button>
					<button
						type="button"
						onClick={() => setSelectedCategory('Savings')}
						aria-pressed={selectedCategory === 'Savings'}
						className={`absolute flex flex-col items-center justify-start left-[302px] top-[0px] w-[64px] transition-colors ${selectedCategory === 'Savings' ? 'text-black' : 'text-black/90'}`}
						data-node-id="242:333"
					>
						<span className={`relative flex h-[40px] w-[40px] items-center justify-center rounded-full transition-colors ${selectedCategory === 'Savings' ? 'bg-[#71CFA7]' : 'bg-[#A6E4CB]'}`}>
							<span className={`absolute inset-[4px] rounded-full ${selectedCategory === 'Savings' ? 'bg-[#A6E4CB]' : 'bg-[#CEF1E2]'}`} />
							<img alt="" className="pointer-events-none relative size-[36px]" src={imgGroup105} />
						</span>
						<span className="mt-[6px] text-[10px] leading-[normal] text-center whitespace-nowrap" style={{ fontFamily: 'var(--font-sf-rounded)', fontWeight: 400 }}>
							Savings
						</span>
					</button>
				</div>
				<div className="absolute bg-white border-2 border-[rgba(224,224,224,0.9)] border-solid h-[42px] left-[6px] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[143px] w-[350px]" data-node-id="242:336" />
				<p className="-translate-x-1/2 [word-break:break-word] absolute font-['SF Compact Rounded:Regular'] font-normal leading-[normal] left-[85.5px] not-italic text-[14px] text-black text-center top-[156px] whitespace-nowrap" data-node-id="242:337">{`${dateDisplayText} `}</p>
				<button aria-label="Choose date" className="absolute cursor-pointer left-[311px] size-[24px] top-[152px]" onClick={openDatePicker} type="button">
					<CalendarPlus className="size-[24px]" />
				</button>
				<input
					aria-hidden
					className="absolute h-0 left-[311px] opacity-0 pointer-events-none top-[152px] w-0"
					onChange={(event) => setSelectedDate(event.target.value)}
					ref={dateInputRef}
					tabIndex={-1}
					type="date"
					value={selectedDate}
				/>
			</div>
			<button
				type="button"
				onClick={handleAddTransaction}
				disabled={isSubmitting}
				className={`absolute left-[59px] top-[843px] h-[45px] w-[280px] rounded-[20px] shadow-[2px_2px_10px_0px_rgba(0,0,0,0.2)] transition-colors ${isSubmitting ? 'bg-[#a7adb7] cursor-not-allowed' : 'bg-[#174f84]'}`}
				data-node-id="242:351"
			>
				<span className="font-['SF Compact Rounded:Semibold'] text-[20px] font-semibold leading-[24px] text-white">
					{isSubmitting ? 'Saving...' : 'Add Transaction'}
				</span>
			</button>
			<div className="absolute bg-white h-[31px] left-[41px] top-[598px] w-[48px]" data-node-id="242:354" />
			<p className="-translate-x-1/2 [word-break:break-word] absolute font-['SF Compact Rounded:Medium'] font-medium leading-[normal] left-[63.5px] not-italic text-[12px] text-black text-center top-[599px] w-[51px]">
				Repeat
			</p>
			<div className="absolute left-[23px] top-[606px] w-[350px]" ref={repeatDropdownRef}>
				<button
					aria-expanded={isRepeatDropdownOpen}
					aria-haspopup="listbox"
					className="absolute appearance-none bg-transparent border-0 cursor-pointer h-[42px] inset-0 outline-none w-full"
					onClick={() => setIsRepeatDropdownOpen((current) => !current)}
					type="button"
				>
					<span className="[word-break:break-word] absolute font-['SF Compact Rounded:Regular'] font-normal leading-[18px] left-[18px] not-italic text-[14px] text-black top-[12px] whitespace-nowrap">
						{selectedRepeat}
					</span>
					<ChevronDown className="absolute left-[305px] size-[25px] top-[18px]" />
				</button>
				{isRepeatDropdownOpen ? (
					<div className="absolute bg-white border border-[rgba(224,224,224,0.9)] border-solid left-0 overflow-hidden rounded-[10px] shadow-[0px_6px_16px_0px_rgba(0,0,0,0.2)] top-[46px] w-[350px] z-20">
						{repeatOptions.map((option) => (
							<button
								aria-selected={selectedRepeat === option}
								className={`block cursor-pointer font-['SF Compact Rounded:Regular'] px-[16px] py-[10px] text-[14px] text-left w-full ${selectedRepeat === option ? 'bg-[#F5F7FB] text-[#112945]' : 'bg-white text-black hover:bg-[#F5F7FB]'}`}
								onClick={() => {
									setSelectedRepeat(option);
									setIsRepeatDropdownOpen(false);
								}}
								role="option"
								type="button"
								key={option}
							>
								{option}
							</button>
						))}
					</div>
				) : null}
			</div>
			<div className="absolute left-[57px] top-[108px]">
				<TransactionModeToggle value="manual" scanHref="/scan-receipt" />
			</div>
				</div>
			</div>
			{isAmountKeyboardOpen ? (
				<div className="absolute inset-0 z-30">
					<button aria-label="Close amount keyboard" className="absolute inset-0 cursor-default border-0 bg-transparent p-0" onClick={closeAmountKeyboard} type="button" />
					<div className="absolute bottom-0 left-0 right-0 z-10">
						<AmountKeyboard amountValue={amountValue} onClose={closeAmountKeyboard} onDeletePress={handleAmountDelete} onDigitPress={handleAmountDigitPress} onSuggestionPress={handleAmountSuggestionPress} />
					</div>
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
