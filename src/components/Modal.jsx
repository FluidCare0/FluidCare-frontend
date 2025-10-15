import React from 'react';
import { X } from 'lucide-react'; // Optional: for close button icon

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null; // Don't render if not open

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {children}
                </div>

                {/* Footer (optional, can be removed if not needed) */}
                {/* <div className="p-4 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                        Close
                    </button>
                </div> */}
            </div>
        </div>
    );
};

export default Modal;