import React from 'react';

const NavButton = ({ active, onClick, children, isCollapsed, icon }) => {
    return (
        <div className="relative group">
            <button
                onClick={onClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-white hover:bg-gray-50'
                    } ${isCollapsed ? 'justify-center' : 'w-full'}`}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                </svg>
                {!isCollapsed && (
                    <span className={`font-medium ${active ? 'text-blue-600' : 'text-gray-600'}`}>
                        {children}
                    </span>
                )}
            </button>

            {/* Tooltip when collapsed */}
            {isCollapsed && (
                <div className="absolute left-full ml-2 bg-white text-gray-800 text-sm rounded-lg py-2 px-3 shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-nowrap min-w-max">
                    {children}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-white border border-gray-200 rotate-45"></div>
                </div>
            )}
        </div>
    );
};

export default NavButton;