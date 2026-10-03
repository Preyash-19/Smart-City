export default function SignalWaveform() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 flex items-center justify-center space-x-1">
      {/* Generate 40 bars for the oscilloscope effect */}
      {[...Array(40)].map((_, i) => (
        <div
          key={i}
          className="w-1.5 bg-neonCyan rounded-full animate-pulse"
          style={{
            height: `${Math.max(10, Math.random() * 100)}%`,
            animationDuration: `${0.5 + Math.random()}s`,
            animationDelay: `${Math.random()}s`
          }}
        ></div>
      ))}
    </div>
  );
}
