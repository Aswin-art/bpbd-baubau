import { Skeleton } from "@/components/ui/skeleton";

export function HomeHeroSkeleton() {
  return (
    <section className="relative w-full pt-16 sm:pt-[76px]">
      <div className="relative h-[calc(92vh-4rem)] min-h-[680px] w-full overflow-hidden bg-black md:h-[calc(100vh-4rem)]">
        <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent" />
        <div className="absolute inset-0 z-10 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="px-6 pt-6 sm:px-10 sm:pt-8 lg:px-14 lg:pt-10">
              <Skeleton className="h-4 w-44 bg-white/10" />
            </div>
            <div className="hidden sm:block px-6 pt-6 sm:px-10 sm:pt-8 lg:px-14 lg:pt-10">
              <Skeleton className="h-8 w-24 rounded-full bg-white/10" />
            </div>
          </div>

          <div className="flex flex-1 items-center px-6 sm:px-10 lg:px-14">
            <div className="mx-auto w-full max-w-5xl space-y-6 text-center">
              <Skeleton className="mx-auto h-12 w-4/5 bg-white/10 sm:h-14" />
              <Skeleton className="mx-auto h-5 w-3/5 bg-white/10" />
              <div className="flex justify-center gap-3">
                <Skeleton className="h-12 w-40 rounded-full bg-white/10" />
                <Skeleton className="hidden sm:block h-12 w-36 rounded-full bg-white/10" />
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 sm:px-10 sm:pb-8 lg:px-14 lg:pb-10">
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-24 bg-white/10" />
              <Skeleton className="h-px flex-1 bg-white/10" />
              <Skeleton className="h-3 w-16 bg-white/10" />
            </div>
            <div className="mt-4 flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-16 w-28 rounded-xl bg-white/10 sm:h-20 sm:w-36"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

