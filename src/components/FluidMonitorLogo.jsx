import React from "react";

export function FluidMonitorLogo({ className }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary-foreground"
          >
            <path
              d="M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2Z"
              fill="currentColor"
            />
            {/* The v0 SVG had an extra path that was out of view, it can be removed or kept */}
          </svg>
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Fluid Monitor</h1>
        <p className="text-sm text-muted-foreground">Healthcare Management</p>
      </div>
    </div>
  );
}
export default FluidMonitorLogo;