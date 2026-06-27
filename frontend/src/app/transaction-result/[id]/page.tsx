import TransactionResult from '@/components/transaction/TransactionResult';

type TransactionResultPageProps = {
	params: Promise<{
		id: string;
	}>;
};

export default async function TransactionResultPage({ params }: TransactionResultPageProps) {
	const { id } = await params;
	const fallbackTransactionType = id === 'income' ? 'income' : 'expense';

	return (
		<main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8FA]">
			<TransactionResult fallbackTransactionType={fallbackTransactionType} />
		</main>
	);
}
