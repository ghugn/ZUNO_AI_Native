export default function ProgressBarSkeleton() {
  return (
    <div className="w-full max-w-md p-5 bg-white rounded-2xl shadow-xs border border-slate-100 mb-3 animate-pulse">
      <div className="flex justify-between items-center mb-1">
        <div className="h-4 bg-slate-200 rounded-sm w-1/3"></div>
        <div className="h-4 bg-slate-200 rounded-full w-24"></div>
      </div>
      
      {/* Thanh progress bar skeleton */}
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden my-2.5"></div>

      <div className="flex justify-between items-center">
        <div className="h-3 bg-slate-200 rounded-sm w-1/4"></div>
        <div className="h-3 bg-slate-200 rounded-sm w-10"></div>
      </div>
    </div>
  );
}
