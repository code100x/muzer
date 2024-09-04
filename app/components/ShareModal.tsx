import React from "react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareableLink: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  shareableLink,
}) => {
  if (!isOpen) return null;

  const platforms = ["Twitter", "LinkedIn", "WhatsApp"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-lg w-full relative">
        <h2 className="text-lg font-bold text-gray-900">Share this link</h2>
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="space-y-4 mt-4">
          {platforms.map((platform) => (
            <button
              key={platform}
              onClick={() =>
                window.open(
                  `https://www.${platform.toLowerCase()}.com/share?url=${encodeURIComponent(
                    shareableLink
                  )}`,
                  "_blank"
                )
              }
              className="w-full bg-purple-700 hover:bg-purple-800 text-white py-2 rounded-lg"
            >
              Share on {platform}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
