type LoadingWarningProps = {
  cableEngine: unknown;
};

export function LoadingWarning({ cableEngine }: LoadingWarningProps) {
  if (cableEngine) return null;

  return (
    <div className="mb-4 p-3 bg-yellow-900/30 rounded-lg border border-yellow-700">
      <p className="text-yellow-300 text-sm">
        ⚠️ WebAssembly module is still loading. Please wait...
      </p>
    </div>
  );
}

