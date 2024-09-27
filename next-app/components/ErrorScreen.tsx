import React, { PropsWithChildren } from "react";

export default function ErrorScreen({ children }: PropsWithChildren) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[rgb(10,10,10)] text-gray-200">
      {children}
    </div>
  );
}
