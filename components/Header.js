function Header() {
    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm flex-shrink-0" data-name="header" data-file="components/Header.js">
            <div className="container max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                        R
                    </div>
                    <div>
                        <h1 className="font-bold text-md text-slate-800">ربات صورتحساب</h1>
                        <p className="text-xs text-blue-500">آنلاین</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                    <div className="icon-search w-5 h-5"></div>
                    <div className="icon-more-vertical w-5 h-5"></div>
                </div>
            </div>
        </header>
    );
}