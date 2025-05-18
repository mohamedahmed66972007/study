import React from "react";
import { SUBJECTS } from ".data./lib/";
import { cn } from "../lib/utils";
import { FileIcon, defaultStyles } from "react-file-icon";
import prettyBytes from "pretty-bytes";

interface FileCardProps {
  file: {
    id: string;
    name: string;
    size: number;
    url: string;
    subject: string;
  };
  className?: string;
}

const FileCard: React.FC<FileCardProps> = ({ file, className }) => {
  const subject = SUBJECTS.find((s) => s.id === file.subject);

  return (
    <div
      className={cn(
        "border p-4 rounded-xl flex items-center justify-between bg-white shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="w-10">
          <FileIcon extension="pdf" {...defaultStyles.pdf} />
        </div>
        <div>
          <p className="text-sm font-medium">{file.name}</p>
          <p className="text-xs text-gray-500">
            {subject?.name || "مادة غير معروفة"} • {prettyBytes(file.size)}
          </p>
        </div>
      </div>
      <a
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline text-sm"
      >
        عرض
      </a>
    </div>
  );
};

export default FileCard;
