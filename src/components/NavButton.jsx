import React from 'react';

const NavButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active
            ? 'bg-blue-50 border-2 border-blue-500'
            : 'bg-white hover:bg-gray-50'
            }`}
    >
        <div className={`w-6 h-6 rounded-full border-2 ${active ? 'border-blue-500' : 'border-gray-300'
            }`}></div>
        <span className={`font-medium ${active ? 'text-blue-600' : 'text-gray-600'}`}>
            {children}
        </span>
    </button>
);

export default NavButton;