import { Skeleton } from "@/components/ui/skeleton";

export function HomeHeroSkeleton() {
  return (
    <section className="relative flex h-screen md:h-[calc(100vh-1rem)] w-full items-center justify-center md:px-4 md:pt-4">
      <div className="relative h-full w-full overflow-hidden md:rounded-[2rem] bg-black">
        <Skeleton className="absolute inset-0 h-full w-full rounded-none md:rounded-[2rem]" />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/20" />
        <div className="absolute inset-0 z-10 flex flex-col justify-end p-8 sm:p-12 lg:p-20">
          <div className="max-w-3xl space-y-5">
            <Skeleton className="h-10 w-3/4 bg-white/10" />
            <Skeleton className="h-5 w-2/3 bg-white/10" />
            <Skeleton className="h-12 w-40 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </section>
  );
}

