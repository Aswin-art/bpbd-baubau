import Wrapper from "@/components/wrapper";
import { Skeleton } from "@/components/ui/skeleton";

export function HomeNewsSkeleton() {
  return (
    <Wrapper className="py-16 sm:py-20">
      <div className="flex items-end justify-between mb-10">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="hidden sm:block h-5 w-24" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
        <Skeleton className="h-[420px] w-full rounded-2xl" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 py-5 border-b border-border/60 last:border-0">
              <Skeleton className="h-9 w-10" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </Wrapper>
  );
}

