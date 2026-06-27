
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import TransactionModeToggle from "./TransactionModeToggle";

const imgQrCode = "https://www.figma.com/api/mcp/asset/1fcedc1a-e8d9-49bc-aa5a-c7fc9d7ea433";
const imgCheck = "https://www.figma.com/api/mcp/asset/63dd6767-d680-4d30-9ab6-043dab62149f";
const imgVector2 = "https://www.figma.com/api/mcp/asset/ffc73357-11fb-4eaa-816d-1a310718ac40";
const imgVector6 = "https://www.figma.com/api/mcp/asset/e6a1e8fb-8fdf-409f-83a8-ac5dbeb09d58";
const imgVector7 = "https://www.figma.com/api/mcp/asset/0ee533b2-53aa-4b97-bbb9-3c48aa21b16a";
const imgVector8 = "https://www.figma.com/api/mcp/asset/7d1e3bd6-a36d-4f36-a509-cb3b8feb52ca";
const imgVector9 = "https://www.figma.com/api/mcp/asset/28f56ce8-403c-474d-830f-beaec62344cc";
const imgVector10 = "https://www.figma.com/api/mcp/asset/d6e4762c-4001-472b-8ae3-fc9be275233a";
const imgVector11 = "https://www.figma.com/api/mcp/asset/96774844-b4ae-4ca2-9516-80562022d243";
const imgVector13 = "https://www.figma.com/api/mcp/asset/faba73ef-15d2-459c-b998-e783dcaf7fd7";
const imgVector14 = "https://www.figma.com/api/mcp/asset/fef47513-a08b-49fe-9f45-782959f44129";
const imgVector15 = "https://www.figma.com/api/mcp/asset/62df905e-1352-4c41-829a-19d54f4b50f8";
const imgVector16 = "https://www.figma.com/api/mcp/asset/5c46829b-10a4-4be9-9b5e-2cbd1e779341";
const imgVector17 = "https://www.figma.com/api/mcp/asset/acdee602-3d1c-42f6-8336-e87bab4f10da";
const imgVector18 = "https://www.figma.com/api/mcp/asset/90b982ab-89aa-46f3-83ba-4507ea1de3ce";
const imgGroup31 = "https://www.figma.com/api/mcp/asset/7ac1327e-05f2-4dd3-9912-1731f5c38173";
const imgSvg = "https://www.figma.com/api/mcp/asset/4cf05ce0-c056-4393-afe5-5090ec71ba93";
const imgSvg1 = "https://www.figma.com/api/mcp/asset/24062499-cf5b-4ae1-96e4-a073d4b9936d";
const imgSvg2 = "https://www.figma.com/api/mcp/asset/e369a7d8-3202-4065-8212-f06ee1a952b5";
const imgSvg3 = "https://www.figma.com/api/mcp/asset/037f8113-f07f-4728-8c20-4f67d979806e";

function QrCode({ className }: { className?: string }) {
	return (
		<div className={className || "relative size-[16px]"} data-node-id="109:109" data-name="qr-code">
			<img alt="" className="absolute block inset-0 max-w-none size-full" src={imgQrCode} />
		</div>
	);
}

function Check({ className }: { className?: string }) {
	return (
		<div className={className || "overflow-clip relative size-[24px]"} data-node-id="110:421" data-name="check">
			<img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck} />
			<div className="absolute inset-[23.29%_12.5%_20.83%_14.21%]" data-node-id="110:423" data-name="Vector">
				<img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector2} />
			</div>
		</div>
	);
}

export default function ScanReceiptScreen() {
	const router = useRouter();

	return (
		<div className="bg-[#f7f8fa] relative size-full" data-node-id="110:381" data-name="iPhone 14 & 15 Pro - 9">
			<div className="absolute backdrop-blur-[2px] bg-gradient-to-b from-[#112945] h-[453px] left-0 to-[#f7f8fa] top-0 via-[#4d78a8] via-[37.5%] w-[393px]" data-node-id="110:382" />
			<div className="absolute bg-white h-[611px] left-[0px] rounded-[30px] top-[157px] w-[393px]" data-node-id="110:383" />
			<div className="absolute left-[152.94px] size-[0.064px] top-[2.67px]" data-node-id="110:384">
				<div className="absolute inset-[-780.28%]">
					<img alt="" className="block max-w-none size-full" src={imgVector6} />
				</div>
			</div>
			<div className="absolute h-[0.041px] left-[158.1px] top-[2.54px] w-0" data-node-id="110:385">
				<div className="absolute inset-[-1207.41%_-0.5px]">
					<img alt="" className="block max-w-none size-full" src={imgVector7} />
				</div>
			</div>
			<div className="absolute h-0 left-[147.54px] top-[13.5px] w-[0.041px]" data-node-id="110:386">
				<div className="absolute inset-[-0.5px_-1207.41%]">
					<img alt="" className="block max-w-none size-full" src={imgVector8} />
				</div>
			</div>
			<div className="absolute h-0 left-[162.37px] top-[11.63px] w-[0.043px]" data-node-id="110:387">
				<div className="absolute inset-[-0.5px_-1169.68%]">
					<img alt="" className="block max-w-none size-full" src={imgVector9} />
				</div>
			</div>
			<div className="absolute h-[0.047px] left-[90.22px] top-[44.33px] w-[0.144px]" data-node-id="110:388">
				<div className="absolute inset-[-1069.71%_-346.67%]">
					<img alt="" className="block max-w-none size-full" src={imgVector10} />
				</div>
			</div>
			<div className="absolute h-0 left-[91.45px] top-[47.29px] w-[0.04px]" data-node-id="110:389">
				<div className="absolute inset-[-0.5px_-1247.66%]">
					<img alt="" className="block max-w-none size-full" src={imgVector11} />
				</div>
			</div>
			<div className="absolute h-0 left-[86.15px] top-[43.95px] w-[0.043px]" data-node-id="110:390">
				<div className="absolute inset-[-0.5px_-1169.68%]">
					<img alt="" className="block max-w-none size-full" src={imgVector9} />
				</div>
			</div>
			<div className="absolute h-0 left-[82.49px] top-[51.67px] w-[0.041px]" data-node-id="110:391">
				<div className="absolute inset-[-0.5px_-1207.41%]">
					<img alt="" className="block max-w-none size-full" src={imgVector13} />
				</div>
			</div>
			<div className="absolute h-[0.212px] left-[255.13px] top-[3.63px] w-[0.106px]" data-node-id="110:392">
				<div className="absolute inset-[-236.39%_-472.78%]">
					<img alt="" className="block max-w-none size-full" src={imgVector14} />
				</div>
			</div>
			<div className="absolute h-0 left-[261.98px] top-[3.38px] w-[0.096px]" data-node-id="110:393">
				<div className="absolute inset-[-0.5px_-518.42%]">
					<img alt="" className="block max-w-none size-full" src={imgVector15} />
				</div>
			</div>
			<div className="absolute h-[0.088px] left-[312.77px] top-[19.47px] w-0" data-node-id="110:394">
				<div className="absolute inset-[-565.59%_-0.5px]">
					<img alt="" className="block max-w-none size-full" src={imgVector16} />
				</div>
			</div>
			<div className="absolute h-[0.061px] left-[323.31px] top-[50.06px] w-[0.06px]" data-node-id="110:395">
				<div className="absolute inset-[-815.87%_-828.05%]">
					<img alt="" className="block max-w-none size-full" src={imgVector17} />
				</div>
			</div>
			<div className="absolute left-[312.89px] size-[0.029px] top-[8.25px]" data-node-id="110:396">
				<div className="absolute inset-[-1733.73%]">
					<img alt="" className="block max-w-none size-full" src={imgVector18} />
				</div>
			</div>
			<div className="absolute flex items-center justify-center left-[32px] size-[20.686px] top-[23px]">
				<div className="-rotate-90 flex-none">
					<button aria-label="Close scan receipt" className="block cursor-pointer relative size-[20.686px]" data-node-id="110:397" onClick={() => window.location.assign('/')} type="button">
						<div className="absolute inset-[-0.2%_-0.21%_-0.21%_-0.21%]">
							<img alt="" className="block max-w-none size-full" src={imgGroup31} />
						</div>
					</button>
				</div>
			</div>
			<div className="absolute left-[57px] top-[108px]">
				<TransactionModeToggle value="scan" onChange={(mode) => mode === 'manual' && router.push('/add-transaction')} />
			</div>
			<p className="-translate-x-1/2 [word-break:break-word] absolute font-['SF Compact Rounded:Medium'] leading-[normal] left-[122px] not-italic text-[25px] text-center text-white top-[64px] whitespace-nowrap" data-node-id="110:410">
				Add Transaction
			</p>
			<button className="absolute contents cursor-pointer left-[57px] top-[795px]" data-node-id="110:411" type="button" onClick={() => router.push('/choose-how-to-upload-photos')}>
				<div className="absolute bg-[#174f84] h-[45px] left-[57px] rounded-[20px] shadow-[2px_2px_10px_0px_rgba(0,0,0,0.2)] top-[795px] w-[280px]" data-node-id="110:412" />
				<p className="-translate-x-1/2 [word-break:break-word] absolute font-['SF Compact Rounded:Semibold'] h-[24.224px] leading-[normal] left-[205.9px] not-italic text-[20px] text-center text-white top-[806px] w-[193.796px]" data-node-id="110:413">
					Upload Photo
				</p>
			</button>
			<div className="[word-break:break-word] absolute content-stretch flex flex-col gap-[10px] items-center leading-[normal] left-[25px] not-italic top-[200px] w-[345px]" data-node-id="110:414">
				<p className="font-['SF Compact Rounded:Regular'] min-w-full relative shrink-0 text-[20px] text-black text-center w-[min-content]" data-node-id="110:415">
					Bulk Add Transactions from Images
				</p>
				<p className="font-['SF Compact Rounded:Light'] h-[60px] relative shrink-0 text-[#5b5b5b] text-[16px] w-[331px]" data-node-id="110:416">
					Select up to 3 screenshots of transaction history or receipts (Bank, Grab, Shopee, etc.).
				</p>
			</div>
			<div className="absolute bg-[#e6ffe8] h-[190px] left-[15px] rounded-[8px] top-[301px] w-[172px]" data-node-id="110:417">
				<div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['SF Compact Rounded:Bold'] font-bold justify-center leading-[0] left-[12px] not-italic right-[43px] text-[12px] text-black text-center top-[16.5px]" data-node-id="110:418">
					<p className="leading-[normal]">Transaction History</p>
				</div>
				<div className="absolute bg-[#fffefe] h-[143px] left-[18px] rounded-tl-[6px] rounded-tr-[6px] shadow-[0px_4px_1.6px_7px_rgba(129,129,129,0.13)] top-[36px] w-[133px]" data-node-id="110:419" />
				<div className="absolute bg-[#19fa00] h-[24px] right-0 rounded-bl-[8px] rounded-tr-[8px] top-0 w-[26px]" data-node-id="110:420" />
				<Check className="absolute overflow-clip right-0 size-[24px] top-0" />
				<div className="absolute bg-white content-stretch drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col gap-[8px] h-[134px] items-start left-[18px] pb-[15px] pt-[8px] px-[8px] right-[29px] rounded-tl-[8px] rounded-tr-[8px] top-[45px]" data-node-id="110:424" data-name="Mockup content inside card">
					<div className="content-stretch flex h-[19px] items-start relative shrink-0 w-full" data-node-id="110:425" data-name="Container">
						<div className="content-stretch flex gap-[4px] items-start justify-center relative shrink-0 w-[75px]" data-node-id="110:426" data-name="Container">
							<div className="bg-[#f3f4f6] content-stretch flex h-[12px] items-center justify-center relative rounded-[4px] shrink-0 w-[11px]" data-node-id="110:427" data-name="Background">
								<div className="relative shrink-0 size-[12px]" data-node-id="110:428" data-name="SVG">
									<img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSvg} />
								</div>
							</div>
							<div className="content-stretch flex flex-col items-start pr-[0.85px] relative shrink-0 w-[62px]" data-node-id="110:431" data-name="Container">
								<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Regular'] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#1f1f1f] text-[8px] whitespace-nowrap" data-node-id="110:432">
									<p className="leading-[12px]">{`Transaction mount `}</p>
								</div>
							</div>
						</div>
						<div className="content-stretch flex flex-col h-[19px] items-end justify-end relative shrink-0 w-[42px]" data-node-id="110:433" data-name="Container">
							<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Bold'] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#1f2937] text-[8px] whitespace-nowrap" data-node-id="110:434">
								<p className="leading-[12px]">-40.000đ</p>
							</div>
						</div>
					</div>
					<div className="content-stretch flex h-[19px] items-start relative shrink-0 w-full" data-node-id="110:435" data-name="Container">
						<div className="content-stretch flex gap-[4px] items-start justify-center relative shrink-0 w-[75px]" data-node-id="110:436" data-name="Container">
							<div className="bg-[#f3f4f6] content-stretch flex h-[12px] items-center justify-center relative rounded-[4px] shrink-0 w-[11px]" data-node-id="110:437" data-name="Background">
								<div className="relative shrink-0 size-[12px]" data-node-id="110:438" data-name="SVG">
									<img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSvg1} />
								</div>
							</div>
							<div className="content-stretch flex flex-col items-start pr-[0.85px] relative shrink-0 w-[62px]" data-node-id="110:441" data-name="Container">
								<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Regular'] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#1f1f1f] text-[8px] whitespace-nowrap" data-node-id="110:442">
									<p className="leading-[12px]">{`Transaction mount `}</p>
								</div>
							</div>
						</div>
						<div className="content-stretch flex flex-col h-[19px] items-end justify-end relative shrink-0 w-[42px]" data-node-id="110:443" data-name="Container">
							<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Bold'] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#3b82f6] text-[8px] whitespace-nowrap" data-node-id="110:444">
								<p className="leading-[12px]">+240.000đ</p>
							</div>
						</div>
					</div>
					<div className="content-stretch flex h-[19px] items-start relative shrink-0 w-full" data-node-id="110:445" data-name="Container">
						<div className="content-stretch flex gap-[4px] items-start justify-center relative shrink-0 w-[75px]" data-node-id="110:446" data-name="Container">
							<div className="bg-[#f3f4f6] content-stretch flex h-[12px] items-center justify-center relative rounded-[4px] shrink-0 w-[11px]" data-node-id="110:447" data-name="Background">
								<div className="relative shrink-0 size-[12px]" data-node-id="110:448" data-name="SVG">
									<img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSvg1} />
								</div>
							</div>
							<div className="content-stretch flex flex-col items-start pr-[0.85px] relative shrink-0 w-[62px]" data-node-id="110:451" data-name="Container">
								<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Regular'] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#1f1f1f] text-[8px] whitespace-nowrap" data-node-id="110:452">
									<p className="leading-[12px]">{`Transaction mount `}</p>
								</div>
							</div>
						</div>
						<div className="content-stretch flex flex-col h-[19px] items-end justify-end relative shrink-0 w-[42px]" data-node-id="110:453" data-name="Container">
							<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Bold'] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#3b82f6] text-[8px] whitespace-nowrap" data-node-id="110:454">
								<p className="leading-[12px]">+60.000đ</p>
							</div>
						</div>
					</div>
					<div className="content-stretch flex h-[19px] items-start relative shrink-0 w-full" data-node-id="110:455" data-name="Container">
						<div className="content-stretch flex gap-[4px] items-start justify-center relative shrink-0 w-[75px]" data-node-id="110:456" data-name="Container">
							<div className="bg-[#f3f4f6] content-stretch flex h-[12px] items-center justify-center relative rounded-[4px] shrink-0 w-[9px]" data-node-id="110:457" data-name="Background">
								<div className="relative shrink-0 size-[12px]" data-node-id="110:458" data-name="SVG">
									<img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSvg} />
								</div>
							</div>
							<div className="content-stretch flex flex-col items-start pr-[0.85px] relative shrink-0 w-[62px]" data-node-id="110:461" data-name="Container">
								<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Regular'] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#1f1f1f] text-[8px] whitespace-nowrap" data-node-id="110:462">
									<p className="leading-[12px]">{`Transaction mount `}</p>
								</div>
							</div>
						</div>
						<div className="content-stretch flex flex-col h-[19px] items-end justify-end relative shrink-0 w-[42px]" data-node-id="110:463" data-name="Container">
							<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Bold'] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#1f2937] text-[8px] whitespace-nowrap" data-node-id="110:464">
								<p className="leading-[12px]">-45.000đ</p>
							</div>
						</div>
					</div>
					<div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-node-id="110:465" data-name="Container">
						<div className="h-[12px] relative shrink-0 w-0" data-node-id="110:466" data-name="Container" />
					</div>
				</div>
			</div>
			<div className="absolute bg-[#ffecd8] h-[190px] left-[15px] rounded-[8px] top-[509px] w-[172px]" data-node-id="110:467">
				<div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['SF Compact Rounded:Bold'] font-bold justify-center leading-[0] left-[28px] not-italic right-[52px] text-[12px] text-black text-center top-[16.5px]" data-node-id="110:468">
					<p className="leading-[normal]">QR Code</p>
				</div>
				<div className="absolute bg-[#ff0004] h-[24px] right-0 rounded-bl-[8px] rounded-tr-[8px] top-0 w-[26px]" data-node-id="110:469" />
				<div className="absolute left-[156px] overflow-clip size-[24px] top-0" data-node-id="110:470" data-name="check">
					<img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck} />
				</div>
			</div>
			<div className="absolute bg-[#ffecd8] h-[190px] right-[26px] rounded-[8px] top-[508px] w-[165px]" data-node-id="110:471">
				<div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['SF Compact Rounded:Bold'] font-bold justify-center leading-[0] left-[28px] not-italic right-[52px] text-[12px] text-black text-center top-[16.5px]" data-node-id="110:472">
					<p className="leading-[normal]">Blurry Photo</p>
				</div>
				<div className="absolute bg-[#ff0004] h-[24px] right-0 rounded-bl-[8px] rounded-tr-[8px] top-0 w-[26px]" data-node-id="110:473" />
				<div className="absolute overflow-clip right-0 size-[24px] top-0" data-node-id="110:474" data-name="check">
					<img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck} />
				</div>
				<div className="absolute right-[-1px] size-[22px] top-[4px]" data-node-id="110:475" data-name="SVG">
					<img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSvg2} />
				</div>
				<div className="-translate-x-1/2 absolute bg-white blur-[3px] h-[150px] left-[calc(50%-3px)] rounded-[24px] top-[31px] w-[135px]" data-node-id="110:478" data-name="Section - Transaction Result Card">
					<div className="absolute content-stretch flex flex-col items-start left-[55.5px] pb-[4px] top-[12px]" data-node-id="110:479" data-name="Success Icon:margin">
						<div className="bg-[#10b981] content-stretch flex flex-col items-start p-[4px] relative rounded-[9999px] shrink-0" data-node-id="110:480" data-name="Success Icon">
							<div className="relative shrink-0 size-[16px]" data-node-id="110:481" data-name="SVG">
								<img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSvg3} />
							</div>
						</div>
					</div>
					<div className="absolute content-stretch flex flex-col h-[35px] items-start left-[31px] pb-[4px] top-[40px]" data-node-id="110:483" data-name="Amount and Status:margin">
						<div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="110:484" data-name="Amount and Status">
							<div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-node-id="110:485" data-name="Container">
								<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Bold'] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[14px] text-center whitespace-nowrap" data-node-id="110:486">
									<p className="leading-[20px]">-100.000đ</p>
								</div>
							</div>
							<div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-node-id="110:487" data-name="Container">
								<div className="[word-break:break-word] flex flex-col font-['Nimbus_Sans:Bold'] justify-center leading-[0] not-italic relative shrink-0 text-[#10b981] text-[10px] text-center whitespace-nowrap" data-node-id="110:488">
									<p className="leading-[15px]">Thành công</p>
								</div>
							</div>
						</div>
					</div>
					<div className="absolute content-stretch flex flex-col gap-[2px] items-start left-[12px] right-[12px] top-[88px]" data-node-id="110:489" data-name="Transaction Details">
						<div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-node-id="110:490" data-name="Container">
							<div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="110:491" data-name="Container">
								<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Regular'] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[8px] whitespace-nowrap" data-node-id="110:492">
									<p className="leading-[12px]">Mã giao dịch</p>
								</div>
							</div>
							<div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="110:493" data-name="Container">
								<div className="[word-break:break-word] flex flex-col font-['Nimbus_Sans:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#1f2937] text-[8px] whitespace-nowrap" data-node-id="110:494">
									<p className="leading-[12px]">XXX</p>
								</div>
							</div>
						</div>
						<div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-node-id="110:495" data-name="Container">
							<div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="110:496" data-name="Container">
								<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Regular'] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[8px] whitespace-nowrap" data-node-id="110:497">
									<p className="leading-[12px]">Người nhận</p>
								</div>
							</div>
							<div className="content-stretch flex flex-col items-start pl-[4px] relative shrink-0" data-node-id="110:498" data-name="Margin">
								<div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0" data-node-id="110:499" data-name="Container">
									<div className="[word-break:break-word] flex flex-col font-['Nimbus_Sans:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#1f2937] text-[8px] whitespace-nowrap" data-node-id="110:500">
										<p className="leading-[12px]">ABC</p>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="absolute content-stretch flex flex-col items-start left-[12px] pb-[8px] right-[12px] top-[79px]" data-node-id="110:501" data-name="Dash Separator:margin">
						<div className="border-[#e5e7eb] border-dashed border-t h-px relative shrink-0 w-full" data-node-id="110:502" data-name="Dash Separator" />
					</div>
					<div className="absolute bg-[#ecfdf5] bottom-[38.33%] left-[-5px] rounded-[5px] top-[55%] w-[10px]" data-node-id="110:503" data-name="Background" />
					<div className="absolute bg-[#ecfdf5] bottom-[38.33%] right-[-5px] rounded-[5px] top-[55%] w-[10px]" data-node-id="110:504" data-name="Background" />
				</div>
			</div>
			<div className="absolute bg-[#e6ffe8] h-[190px] right-[26px] rounded-[8px] top-[301px] w-[165px]" data-node-id="110:505">
				<div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['SF Compact Rounded:Bold'] font-bold justify-center leading-[0] left-[12px] not-italic right-[35px] text-[12px] text-black text-center top-[16.5px]" data-node-id="110:506">
					<p className="leading-[normal]">Transaction Receipt</p>
				</div>
				<div className="absolute bg-[#19fa00] h-[24px] right-0 rounded-bl-[8px] rounded-tr-[8px] top-0 w-[26px]" data-node-id="110:507" />
				<div className="absolute overflow-clip right-0 size-[24px] top-0" data-node-id="110:508" data-name="check">
					<img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck} />
					<div className="absolute inset-[23.29%_12.5%_20.83%_14.21%]" data-node-id="I110:508;110:423" data-name="Vector">
						<img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector2} />
					</div>
				</div>
			</div>
			<div className="-translate-x-1/2 absolute bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] h-[150px] left-[calc(50%+85px)] rounded-[24px] top-[333px] w-[135px]" data-node-id="110:509" data-name="Section - Transaction Result Card">
				<div className="absolute content-stretch flex flex-col items-start left-[55.5px] pb-[4px] top-[12px]" data-node-id="110:510" data-name="Success Icon:margin">
					<div className="bg-[#10b981] content-stretch flex flex-col items-start p-[4px] relative rounded-[9999px] shrink-0" data-node-id="110:511" data-name="Success Icon">
						<div className="relative shrink-0 size-[16px]" data-node-id="110:512" data-name="SVG">
							<img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSvg3} />
						</div>
					</div>
				</div>
				<div className="absolute content-stretch flex flex-col h-[35px] items-start left-[31px] pb-[4px] top-[40px]" data-node-id="110:514" data-name="Amount and Status:margin">
					<div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="110:515" data-name="Amount and Status">
						<div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-node-id="110:516" data-name="Container">
							<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Bold'] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#111827] text-[14px] text-center whitespace-nowrap" data-node-id="110:517">
								<p className="leading-[20px]">-100.000đ</p>
							</div>
						</div>
						<div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-node-id="110:518" data-name="Container">
							<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Bold'] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#10b981] text-[10px] text-center whitespace-nowrap" data-node-id="110:519">
								<p className="leading-[15px]">Success!</p>
							</div>
						</div>
					</div>
				</div>
				<div className="absolute content-stretch flex flex-col gap-[2px] items-start left-[12px] right-[12px] top-[88px]" data-node-id="110:520" data-name="Transaction Details">
					<div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-node-id="110:521" data-name="Container">
						<div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="110:522" data-name="Container">
							<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Regular'] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[8px] whitespace-nowrap" data-node-id="110:523">
								<p className="leading-[12px]">{`Transaction code `}</p>
							</div>
						</div>
						<div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="110:524" data-name="Container">
							<div className="[word-break:break-word] flex flex-col font-['Nimbus_Sans:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#1f2937] text-[8px] whitespace-nowrap" data-node-id="110:525">
								<p className="leading-[12px]">XXX</p>
							</div>
						</div>
					</div>
					<div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-node-id="110:526" data-name="Container">
						<div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="110:527" data-name="Container">
							<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Regular'] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[8px] whitespace-nowrap" data-node-id="110:528">
								<p className="leading-[12px]">Recipient</p>
							</div>
						</div>
						<div className="content-stretch flex flex-col items-start pl-[4px] relative shrink-0" data-node-id="110:529" data-name="Margin">
							<div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0" data-node-id="110:530" data-name="Container">
								<div className="[word-break:break-word] flex flex-col font-['Nimbus_Sans:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#1f2937] text-[8px] whitespace-nowrap" data-node-id="110:531">
									<p className="leading-[12px]">ABC</p>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="absolute content-stretch flex flex-col items-start left-[12px] pb-[8px] right-[12px] top-[79px]" data-node-id="110:532" data-name="Dash Separator:margin">
					<div className="border-[#e5e7eb] border-dashed border-t h-px relative shrink-0 w-full" data-node-id="110:533" data-name="Dash Separator" />
				</div>
				<div className="absolute bg-[#ecfdf5] bottom-[38.33%] left-[-5px] rounded-[5px] top-[55%] w-[10px]" data-node-id="110:534" data-name="Background" />
				<div className="absolute bg-[#ecfdf5] bottom-[38.33%] right-[-5px] rounded-[5px] top-[55%] w-[10px]" data-node-id="110:535" data-name="Background" />
			</div>
			<div className="absolute right-[206px] size-[22px] top-[512px]" data-node-id="110:536" data-name="SVG">
				<img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSvg2} />
			</div>
			<div className="absolute bg-white content-stretch drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col h-[130px] items-center justify-center left-[30px] px-[12px] py-[13.5px] right-[225px] rounded-[8px] top-[544px]" data-node-id="110:539" data-name="Mockup QR">
				<QrCode className="relative shrink-0 size-[86px]" />
				<div className="content-stretch flex flex-col items-start pt-[4px] relative shrink-0" data-node-id="110:541" data-name="Margin">
					<div className="[word-break:break-word] flex flex-col font-['SF Compact Rounded:Regular'] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[8px] whitespace-nowrap" data-node-id="110:542">
						<p className="leading-[12px]">QR code</p>
					</div>
				</div>
			</div>
		</div>
	);
}
