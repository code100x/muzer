import React from "react";

export default function LoadingScreen() {
  return (
    <div className=" bg-[rgb(10,10,10)] text-gray-200">
      <div className="flex space-x-2 justify-center items-center w-screen h-screen dark:invert">
        <span className="sr-only">Loading...</span>
        <div className="h-8 w-8 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-8 w-8 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-8 w-8 bg-white rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}
