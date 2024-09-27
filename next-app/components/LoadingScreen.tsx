import React from "react";

export default function LoadingScreen() {
  return (
    <div className="bg-[rgb(10,10,10)] text-gray-200">
      <div className="flex h-screen w-screen items-center justify-center space-x-2 dark:invert">
        <span className="sr-only">Loading...</span>
        <div className="h-8 w-8 animate-bounce rounded-full bg-white [animation-delay:-0.3s]"></div>
        <div className="h-8 w-8 animate-bounce rounded-full bg-white [animation-delay:-0.15s]"></div>
        <div className="h-8 w-8 animate-bounce rounded-full bg-white"></div>
      </div>
    </div>
  );
}
