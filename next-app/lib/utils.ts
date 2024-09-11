import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const YT_REGEX =
  /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com\/(?:watch\?(?!.*\blist=)(?:.*&)?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&]\S+)?$/;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
