import SellerSidebar from "@/components/seller/sellerSidebar";
import SellerHeader from "@/components/seller/sellerHeader";

const SellerLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
            <div className="flex min-h-screen">
                <SellerSidebar />

                <div className="flex-1 flex flex-col">
                    <SellerHeader />

                    <main className="flex-1 p-6">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default SellerLayout;
