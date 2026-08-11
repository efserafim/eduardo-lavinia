export function ProgressBar({
  percentRaised,
  percentRemaining,
}: {
  percentRaised: number;
  percentRemaining: number;
}) {
  return (
    <div className="space-y-2">
      <div className="relative h-px w-full overflow-visible bg-marsala/12">
        <div
          className="animate-fill-bar absolute inset-y-0 left-0 h-full bg-marsala/70"
          style={{
            width: `${Math.max(percentRaised, percentRaised > 0 ? 1 : 0)}%`,
          }}
        />
      </div>
      <div className="flex justify-between font-display text-sm text-ink-faint">
        <span>{percentRaised}% concluído</span>
        <span>{percentRemaining}% restante</span>
      </div>
    </div>
  );
}
