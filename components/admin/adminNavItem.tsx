import { IconType } from "react-icons";

interface AdminNavItemsprops{
    selected?: boolean;
    icon: IconType;
    label : string;

}

const AdminNavitem: React.FC<AdminNavItemsprops> = ({
    selected,
    icon :Icon,
    label,
}) => {
    return (
        
        
        <div className={`flex cursor-pointer items-center justify-center gap-1 border-b-2 p-2 text-center transition hover:text-[var(--color-primary)]
        ${selected ? "border-b-[var(--color-accent)] text-[var(--color-primary)]" : "border-transparent text-[var(--color-secondary)]"}
        `}>
            <Icon size={20}/>
            <div className=" font-medium text-sm text-center break-normal">{label}</div>
        </div> );
}
 
export default AdminNavitem;
