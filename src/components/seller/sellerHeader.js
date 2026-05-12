"use client";

const SellerHeader = () => {
    return (
        <header className="border-b border-slate-800/70 bg-slate-950/95 px-6 py-4 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Seller Dashboard</p>
                    <h2 className="text-2xl font-semibold text-white">Welcome Back</h2>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-bold">
                        S
                    </div>

                    <div className="text-right">
                        <p className="font-medium text-white">Seller</p>
                        <p className="text-sm text-slate-400">seller@gmail.com</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
export default SellerHeader;
