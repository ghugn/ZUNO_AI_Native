"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { bootstrapAuth } from "@/lib/api/auth";
import { apiClient } from "@/lib/apiClient";
import {
	ArrowLeft,
	ChevronRight,
	CircleHelp,
	CreditCard,
	Globe,
	HelpCircle,
	LogOut,
	MoonStar,
	NotebookPen,
	Plus,
	Settings2,
	ShieldCheck,
	Star,
	User,
	Wallet,
	PiggyBank,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type RowItem = {
	label: string;
	icon: LucideIcon;
	value?: string;
	subtitle?: string;
	destructive?: boolean;
	onClick?: () => void;
};

const defaultProfile = {
	name: "abc1234",
	email: "abc1234@gmail.com",
	initial: "A",
};

const managementRows: RowItem[] = [
	{ label: "My Wallet", icon: Wallet },
	{ label: "Bank Integration", icon: CreditCard },
	{ label: "Smart Savings & Suggestions", icon: PiggyBank },
];

const systemRows: RowItem[] = [
	{ label: "Theme", icon: MoonStar, value: "Light" },
	{ label: "Language", icon: Globe, value: "English" },
];

const supportRows: RowItem[] = [
	{ label: "Help & Support", icon: HelpCircle },
	{ label: "Privacy Policy", icon: ShieldCheck },
	{ label: "Terms of Service", icon: NotebookPen },
];

const otherRows: RowItem[] = [
	{ label: "Rate Zuno", icon: Star },
	{ label: "About Zuno", icon: CircleHelp },
];

const dataRows: RowItem[] = [
	{ label: "Export Data to Google Sheets...", icon: Settings2 },
	{
		label: "Delete Account",
		icon: LogOut,
		destructive: true,
		subtitle: "Delete all data and reset",
	},
];

function SectionTitle({ children }: { children: ReactNode }) {
	return (
		<div className="px-1 text-[18px] font-bold leading-[24px] text-[#1e3154] font-['SF Compact Rounded:Bold']">
			{children}
		</div>
	);
}

function ArrowRow({ item }: { item: RowItem }) {
	const Icon = item.icon;

	return (
		<button
			type="button"
			onClick={item.onClick}
			className="flex w-full items-center justify-between px-4 py-[16px] text-left transition active:scale-[0.99]"
		>
			<div className="flex items-center gap-3">
				<div className="flex size-[19px] items-center justify-center text-[#112945]">
					<Icon className="size-[19px]" strokeWidth={2} />
				</div>
				<div className="flex flex-col items-start">
					<div
						className={`text-[16px] leading-[24px] font-['SF Compact Rounded:Regular'] ${item.destructive ? "text-[#fe442e]" : "text-black"}`}
					>
						{item.label}
					</div>
					{item.subtitle ? (
						<div className="text-[10px] leading-[15px] text-black font-['SF Compact Rounded:Regular']">
							{item.subtitle}
						</div>
					) : null}
				</div>
			</div>
			<ChevronRight className="size-[14px] shrink-0 text-[#546982]" strokeWidth={2.25} />
		</button>
	);
}

function ValueRow({ item }: { item: RowItem }) {
	const Icon = item.icon;

	return (
		<button
			type="button"
			onClick={item.onClick}
			className="flex w-full items-center justify-between px-4 py-[16px] text-left transition active:scale-[0.99]"
		>
			<div className="flex items-center gap-3">
				<div className="flex size-[19px] items-center justify-center text-[#112945]">
					<Icon className="size-[19px]" strokeWidth={2} />
				</div>
				<div className="text-[16px] leading-[24px] text-black font-['SF Compact Rounded:Regular']">
					{item.label}
				</div>
			</div>
			<div className="flex items-center gap-2">
				<div className="text-[16px] leading-[24px] text-black font-['SF Compact Rounded:Regular']">
					{item.value}
				</div>
				<ChevronRight className="size-[14px] shrink-0 text-[#546982]" strokeWidth={2.25} />
			</div>
		</button>
	);
}

function SimpleRow({ item }: { item: RowItem }) {
	const Icon = item.icon;

	return (
		<button
			type="button"
			onClick={item.onClick}
			className="flex w-full items-center justify-between px-4 py-[16px] text-left transition active:scale-[0.99]"
		>
			<div className="flex items-center gap-3">
				<div className="flex size-[19px] items-center justify-center text-[#112945]">
					<Icon className="size-[19px]" strokeWidth={2} />
				</div>
				<div className="text-[16px] leading-[24px] text-black font-['SF Compact Rounded:Regular']">
					{item.label}
				</div>
			</div>
			<ChevronRight className="size-[14px] shrink-0 text-[#546982]" strokeWidth={2.25} />
		</button>
	);
}

function DestructiveRow({ item }: { item: RowItem }) {
	const Icon = item.icon;

	return (
		<button
			type="button"
			onClick={item.onClick}
			className="flex w-full items-center justify-between px-4 py-[16px] text-left transition active:scale-[0.99]"
		>
			<div className="flex items-center gap-3">
				<div className="flex h-[17px] w-[17px] items-center justify-center text-[#fe442e]">
					<Icon className="size-[17px]" strokeWidth={2} />
				</div>
				<div className="flex flex-col items-start">
					<div className="text-[16px] leading-[24px] text-[#fe442e] font-['SF Compact Rounded:Regular']">
						{item.label}
					</div>
					{item.subtitle ? (
						<div className="text-[10px] leading-[15px] text-black font-['SF Compact Rounded:Regular']">
							{item.subtitle}
						</div>
					) : null}
				</div>
			</div>
			<ChevronRight className="size-[14px] shrink-0 text-[#546982]" strokeWidth={2.25} />
		</button>
	);
}

export default function ProfilePage() {
	const router = useRouter();
	const [profile, setProfile] = useState(defaultProfile);

	useEffect(() => {
		let isMounted = true;
		async function loadUserProfile() {
			try {
				const ok = await bootstrapAuth();
				if (!ok || !isMounted) return;

				let me;
				if (process.env.NEXT_PUBLIC_API_MODE === "memory-mock") {
					me = { fullName: "Zuno User", email: "default@zuno.com" };
				} else {
					me = await apiClient.get<{ fullName: string; email: string }>("/api/auth/me");
				}
				if (isMounted && me) {
					setProfile({
						name: me.fullName || defaultProfile.name,
						email: me.email || defaultProfile.email,
						initial: (me.fullName || defaultProfile.name)[0].toUpperCase(),
					});
				}
			} catch (error) {
				console.error("Failed to load user profile:", error);
			}
		}
		loadUserProfile();
		return () => {
			isMounted = false;
		};
	}, []);

	const handleLogout = () => {
		if (typeof window !== "undefined") {
			window.sessionStorage.removeItem("zuno:auth-token");
			window.sessionStorage.removeItem("zuno:user-id");
			window.sessionStorage.removeItem("zuno:bootstrap-done");
		}

		router.push("/login");
	};

	return (
		<main className="flex min-h-screen justify-center bg-[#f7f8fa]">
			<style jsx global>{`
				.profile-scrollbar-hidden {
					-ms-overflow-style: none;
					scrollbar-width: none;
				}
				.profile-scrollbar-hidden::-webkit-scrollbar {
					display: none;
				}
			`}</style>
			<div className="profile-scrollbar-hidden relative h-[852px] w-[393px] overflow-y-auto overflow-x-hidden bg-[#f7f8fa] pb-[96px] shadow-[0_0_0_1px_rgba(0,0,0,0.02)]">
				<div className="absolute inset-x-0 top-0 h-[453px] bg-gradient-to-b from-[#112945] via-[#4d78a8] via-[37.5%] to-[#f7f8fa]" />
				
				<div className="pointer-events-none absolute left-[88px] top-[48px] size-[3px] rounded-full bg-white/45 z-0" />
				<div className="pointer-events-none absolute left-[172px] top-[28px] size-[2px] rounded-full bg-white/45 z-0" />
				<div className="pointer-events-none absolute right-[56px] top-[50px] size-[2px] rounded-full bg-white/45 z-0" />
				<div className="pointer-events-none absolute right-[78px] top-[34px] size-[1.5px] rounded-full bg-white/45 z-0" />
				
				<div className="absolute left-[152px] top-[18px] h-[84px] w-[84px] rounded-full bg-white/5 blur-3xl" />
				<div className="absolute left-[250px] top-[54px] h-[96px] w-[96px] rounded-full bg-white/10 blur-3xl" />

				<header className="absolute left-0 right-0 top-[12px] z-10 flex h-[80px] items-center backdrop-blur-[6px]">
					<div className="flex w-full items-center justify-between px-5 py-6">
						<button
							type="button"
							aria-label="Back"
							onClick={() => router.back()}
							className="flex size-[40px] items-center justify-center rounded-full bg-white/10 text-white transition active:scale-95"
						>
							<ArrowLeft className="size-[18px]" strokeWidth={2.5} />
						</button>

						<span className="text-[36px] leading-none text-white font-['SF Compact Rounded:Semibold']">
							Profile
						</span>

						<button
							type="button"
							aria-label="Help"
							className="flex size-[40px] items-center justify-center rounded-full bg-white/10 text-white transition active:scale-95"
						>
							<CircleHelp className="size-[19px]" strokeWidth={2.2} />
						</button>
					</div>
				</header>

				<section className="relative z-[1] px-[23px] pt-[131px]">
					<div className="rounded-[16px] border border-[rgba(68,73,51,0.3)] bg-white p-[25px] shadow-[0px_4px_2px_rgba(0,0,0,0.25)]">
						<div className="rounded-[16px] border border-black px-4 pb-4 pt-[15px]">
							<div className="relative mx-auto mb-[14px] flex w-fit items-center justify-center">
								<div className="flex size-[96px] items-center justify-center rounded-full bg-[#facc15] shadow-[0px_20px_25px_-5px_rgba(250,204,21,0.1),0px_8px_10px_-6px_rgba(250,204,21,0.1)]">
									<span className="text-[36px] leading-[40px] text-[#313030] font-['SF Compact Rounded:Bold']">
										{profile.initial}
									</span>
								</div>
								<div className="absolute bottom-0 right-0 size-[25.769px] rounded-full border border-white bg-[#86d48b]" />
							</div>

							<div className="text-center">
								<div className="text-[20px] leading-[28px] text-black font-['Plus_Jakarta_Sans:Semibold'] font-semibold">
									{profile.name}
								</div>
								<div className="text-[16px] leading-[24px] text-black font-['SF Compact Rounded:Regular'] font-normal">
									{profile.email}
								</div>
							</div>
						</div>

						<button
							type="button"
							className="mt-6 flex w-full items-center justify-between rounded-[16px] border border-black bg-white px-4 py-4 text-left"
						>
							<div className="flex items-center gap-3">
								<div className="flex h-[15.356px] w-[18.494px] items-center justify-center text-[#112945]">
									<Settings2 className="size-[18px]" strokeWidth={2} />
								</div>
								<div>
									<div className="text-[16px] leading-[24px] text-black font-['SF Compact Rounded:Regular']">
										Account Management
									</div>
									<div className="text-[12px] leading-[16px] text-[rgba(0,0,0,0.7)] font-['SF Compact Rounded:Medium']">
										Security & Information Settings
									</div>
								</div>
							</div>
							<ChevronRight className="size-[14px] text-[#546982]" strokeWidth={2.25} />
						</button>
					</div>
				</section>

				<section className="relative z-[1] mt-[24px] space-y-6 px-[23px]">
					<div className="space-y-3">
						<SectionTitle>Management</SectionTitle>
						<div className="overflow-hidden rounded-[16px] border border-[rgba(68,73,51,0.2)] bg-white p-px">
							<div className="divide-y divide-[rgba(68,73,51,0.3)]">
								{managementRows.map((item) => (
									<ArrowRow
										key={item.label}
										item={{
											...item,
											onClick: item.label === "Smart Savings & Suggestions"
												? () => router.push('/savings')
												: item.onClick
										}}
									/>
								))}
							</div>
						</div>
					</div>

					<div className="space-y-3">
						<SectionTitle>System</SectionTitle>
						<div className="overflow-hidden rounded-[16px] border border-[rgba(68,73,51,0.2)] bg-white p-px">
							<div className="divide-y divide-[rgba(68,73,51,0.3)]">
								{systemRows.map((item) => (
									<ValueRow key={item.label} item={item} />
								))}
							</div>
						</div>
					</div>

					<div className="space-y-3">
						<SectionTitle>Support</SectionTitle>
						<div className="overflow-hidden rounded-[16px] border border-[rgba(68,73,51,0.2)] bg-white p-px">
							<div className="divide-y divide-[rgba(68,73,51,0.3)]">
								{supportRows.map((item) => (
									<SimpleRow key={item.label} item={item} />
								))}
							</div>
						</div>
					</div>

					<div className="space-y-3">
						<SectionTitle>Others</SectionTitle>
						<div className="overflow-hidden rounded-[16px] border border-[rgba(68,73,51,0.2)] bg-white p-px">
							<div className="divide-y divide-[rgba(68,73,51,0.3)]">
								{otherRows.map((item) => (
									<SimpleRow key={item.label} item={item} />
								))}
							</div>
						</div>
					</div>

					<div className="space-y-3">
						<SectionTitle>Data</SectionTitle>
						<div className="overflow-hidden rounded-[16px] border border-[rgba(68,73,51,0.2)] bg-white p-px">
							<div className="divide-y divide-[rgba(68,73,51,0.3)]">
								<SimpleRow item={dataRows[0]} />
								<DestructiveRow item={dataRows[1]} />
							</div>
						</div>
					</div>

					<button
						type="button"
						onClick={handleLogout}
						className="mx-auto mt-1 flex h-[45px] w-[280px] items-center justify-center rounded-[20px] bg-[#174f84] px-4 text-center text-[20px] leading-[24px] text-white shadow-[0px_4px_10px_rgba(17,41,69,0.25)] font-['SF Compact Rounded:Semibold'] transition active:scale-[0.99]"
					>
						Log out
					</button>
				</section>

			</div>
		</main>
	);
}
