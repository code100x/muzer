import React, { PropsWithChildren } from "react";

export default function ErrorScreen({ children }: PropsWithChildren) {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-[rgb(10,10,10)] text-gray-200">
      {children}
    </div>
  );
}
