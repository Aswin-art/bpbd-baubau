import Wrapper from "@/components/wrapper";
import { Skeleton } from "@/components/ui/skeleton";

export function HomeAboutSkeleton() {
  return (
    <section className="relative z-10 pb-16 sm:pb-20">
      <Wrapper>
        <div className="pt-14 lg:pt-20">
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6 lg:order-2 space-y-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-10">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl sm:col-span-2 xl:col-span-1" />
              </div>
            </div>
            <div className="lg:col-span-6 lg:order-1">
              <Skeleton className="mx-auto aspect-4/5 w-full max-w-md rounded-2xl sm:max-w-lg lg:mx-0 lg:max-w-none" />
            </div>
          </div>
        </div>
      </Wrapper>
    </section>
  );
}

