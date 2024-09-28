import { Skeleton } from "@/components/ui/skeleton";

export default function CardSkeleton() {
  return (
    <div className="flex flex-col space-y-4 p-4 md:p-6">
      {/* Skeleton for the image */}
      <Skeleton className="h-48 w-full rounded-t-2xl sm:h-64 md:h-72 lg:h-80 xl:h-96" />

      {/* Skeleton for the buttons */}
      <div className="flex flex-col space-y-2 p-4 sm:p-6 md:flex-row md:justify-between md:space-x-4 md:space-y-0">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}
