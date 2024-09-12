import { Skeleton, Card, CardBody } from "@nextui-org/react";
import React from "react";

export default function CardSkeleton() {
  return (
    <Card className="py-4 dark h-[500px] w-full sm:w-[450px] lg:w-[500px] mx-auto" radius="lg">
      <CardBody className="overflow-visible flex justify-center items-center py-2">
        <Skeleton className="w-[28rem] h-[16rem] rounded-xl bg-default-200">
          <div className="w-[28rem] h-[16rem] rounded-xl bg-default-200"></div>
        </Skeleton>
        <div className="flex justify-between space-x-6 mt-10">
          <Skeleton className="w-[120px] h-[40px] rounded-lg bg-default-300">
            <div className="w-[120px] h-[40px] rounded-lg bg-default-300"></div>
          </Skeleton>
          <Skeleton className="w-[120px] h-[40px] rounded-lg bg-default-300">
            <div className="w-[120px] h-[40px] rounded-lg bg-default-300"></div>
          </Skeleton>
        </div>
      </CardBody>
    </Card>
  );
}
