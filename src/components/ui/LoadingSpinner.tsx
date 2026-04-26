export default function LoadingSpinner({ text = 'LOADING...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-iron border-t-ember animate-spin" />
      <span className="font-mono text-xs text-ash tracking-widest">{text}</span>
    </div>
  );
}
