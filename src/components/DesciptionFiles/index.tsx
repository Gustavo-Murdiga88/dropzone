import {
  CheckCircle,
  DownloadSimple,
  Monitor,
  XCircle,
  FilePdf,
  ThumbsDown,
} from "phosphor-react";
import { ClipLoader } from "react-spinners";

type FileProps = {
  url: string;
  title: string;
  onRemove: () => void;
  loaded: boolean;
  type: string;
  sizeOut: boolean;
};

const img =
  "data:image/jpeg;base64,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";

export function File({
  title,
  url = img,
  onRemove,
  loaded,
  type,
  sizeOut,
}: FileProps) {
  return (
    <div
      id="line"
      onClick={(e) => {
        e.stopPropagation();
      }}
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 3rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        {type.includes("pdf") ? (
          <FilePdf size={60} />
        ) : (
          <span
            title={title}
            style={{
              display: "inline-block",
              height: 60,
              width: 60,
              borderRadius: 8,
              backgroundImage: `url(${url || img})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }}
          />
        )}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        {!sizeOut ? (
          <ThumbsDown size={24} color="#E53E3E" />
        ) : loaded ? (
          <CheckCircle size={24} color="#48BB78" />
        ) : (
          <ClipLoader size={24} color="#0f1312" />
        )}
        {loaded && (
          <a download={title} href={url} target={"_blank"}>
            <DownloadSimple size={24} color="#76E4F7" />
          </a>
        )}
        
        {loaded && (
          <a
            href={url}
            target="_blank"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Monitor size={24} color="#76E4F7" />
          </a>
        )}

        <button
          type="button"
          style={{
            lineHeight: 0,
            border: 0,
            padding: 0,
            backgroundColor: "transparent",
            cursor: "pointer",
          }}
          onClick={onRemove}
        >
          <XCircle size={24} color="#E53E3E" />
        </button>
      </div>
    </div>
  );
}
