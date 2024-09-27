export const YT_REGEX =
  /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com\/(?:watch\?(?!.*\blist=)(?:.*&)?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&]\S+)?$/;

export const isValidYoutubeURL = (data: string) => {
  return data.match(YT_REGEX);
};

export const getVideoId = (url: string) => {
  return url.match(YT_REGEX)?.[1];
};
