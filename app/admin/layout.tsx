import AdminNav from "@/components/admin/adminNav";
import AdminHistoryControls from "@/components/admin/AdminHistoryControls";
import { getCurrentUser } from "@/actions/getCurrentUser";
import { redirect } from "next/navigation";

export const metadata = {
    title:"MT-SHOP Admin",
    description : "MT-Shop Admin Dashboard"
}



const AdminLayout = async ({children}:{children: React.ReactNode}) => {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "ADMIN") {
        redirect("/");
    }

    return ( 

        <div>
            <div>
                <AdminNav/>
            </div>
            {children}
            <AdminHistoryControls />
        </div>
     );
}
 
export default AdminLayout;
