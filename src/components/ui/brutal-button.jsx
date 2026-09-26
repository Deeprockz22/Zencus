import * as React from "react";
import { cn } from "@/lib/utils";

export const BrutalButton = React.forwardRef(
  (
    {
      className,
      color,
      textColor,
      hasBorder = true,
      borderColor,
      hasShadow = true,
      shadowColor,
      radius = 0,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const customStyles = {
      "--btn-bg": color || "var(--background)",
      "--btn-text": textColor || "var(--foreground)",
      "--btn-border": hasBorder ? borderColor || "var(--foreground)" : "transparent",
      "--btn-shadow": shadowColor || "var(--foreground)",
      "--btn-radius": `${radius}px`,
      ...style,
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center px-6 py-3 font-bold transition-all duration-200 ease-in-out cursor-pointer",
          hasBorder ? "border-2" : "border-0",
          hasShadow
            ? "shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.18)] hover:scale-[1.02] active:scale-[0.98]"
            : "active:scale-95",
          className
        )}
        style={{
          backgroundColor: "var(--btn-bg)",
          color: "var(--btn-text)",
          borderColor: "var(--btn-border)",
          borderRadius: "var(--btn-radius)",
          ...customStyles,
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

BrutalButton.displayName = "BrutalButton";

export default BrutalButton;
