import AdminSidebar from "@/components/admin/adminSidebar";
import AdminHeader from "@/components/admin/adminHeader";

const AdminLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-slate-100 to-white text-black">
            <div className="flex min-h-screen">
                <AdminSidebar />
                <div className="flex-1 flex flex-col">
                    <AdminHeader />
                    <main className="flex-1 p-6">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default AdminLayout;
