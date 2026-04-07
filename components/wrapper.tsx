import { cn } from "@/lib/utils";
import React from "react";

interface WrapperProps {
  children: React.ReactNode;
  className?: string;
}

const Wrapper = ({ children, className }: WrapperProps) => {
  return (
    <div className={cn("container mx-auto px-4 md:px-8 xl:px-12", className)}>
      {children}
    </div>
  );
};

export default Wrapper;
