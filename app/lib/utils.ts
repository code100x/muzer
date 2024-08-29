import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const YT_REGEX = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
