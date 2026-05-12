"use client";

const AdminHeader = () => {
    return (
        <header className="border-b border-slate-800/70 bg-slate-950/95 px-6 py-4 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Admin Dashboard</p>
                    <h2 className="text-2xl font-semibold text-white">Overview</h2>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-bold">
                        A
                    </div>
                    <div className="text-right">
                        <p className="font-medium text-white">Administrator</p>
                        <p className="text-sm text-slate-400">admin@example.com</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
