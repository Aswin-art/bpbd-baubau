import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackLinkProps {
  href: string;
  label: string;
  className?: string;
}

export default function BackLink({ href, label, className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-neutral-500 hover:text-primary transition-colors group",
        className,
      )}
    >
      <ArrowUpRight className="w-4 h-4 rotate-[-135deg] group-hover:-translate-x-1 transition-transform" />
      {label}
    </Link>
  );
}
