import { Home, Users, PlusCircle, UserCog, History, Send } from 'lucide-react';
const NavButton = ({ active, onClick, children, isCollapsed, icon: Icon }) => {
    return (
        <div className="relative group">
            <button
                onClick={onClick}
                className={`flex items-center gap-3 px-4 py-3 transition-all border-l-4 ${active
                        ? 'bg-blue-50 border-blue-600 shadow-sm'
                        : 'bg-white border-transparent hover:bg-slate-50 hover:text-blue-600'
                    } ${isCollapsed ? 'justify-center' : 'w-full'}`}
            >
                <div className={`shrink-0 transition-colors ${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`}>
                    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                </div>
                {!isCollapsed && (
                    <span className={`font-semibold text-sm transition-colors ${active ? 'text-blue-700' : 'text-slate-600'}`}>
                        {children}
                    </span>
                )}
            </button>
            {isCollapsed && (
                <div className="absolute left-full ml-4 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest py-1.5 px-3 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 whitespace-nowrap min-w-max pointer-events-none transform translate-x-[-10px] group-hover:translate-x-0">
                    {children}
                </div>
            )}
        </div>
    );
};
export default NavButton;