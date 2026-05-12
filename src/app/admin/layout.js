import AdminSidebar from "@/components/admin/adminSidebar";
import AdminHeader from "@/components/admin/adminHeader";

const AdminLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
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
