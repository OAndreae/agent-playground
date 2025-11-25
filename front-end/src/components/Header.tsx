export function Header() {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-slate-900 rounded-sm" />
            </div>
            <span className="font-semibold tracking-tight">PODCAST PREP</span>
          </div>
        </div>
      </div>
    </header>
  );
}
