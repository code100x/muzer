import { Skeleton } from "@/components/ui/skeleton"
import React from "react";

export default function CardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
    <Skeleton className="h-[450px] w-[500px] rounded-3xl" />
    <div className="space-x-5 flex justify-center">
      <Skeleton className="h-[40px] w-[110px]" />
      <Skeleton className="h-[40px] w-[152px]" />
    </div>
  </div>
  );
}
