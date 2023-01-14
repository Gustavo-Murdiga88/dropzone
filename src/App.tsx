import { DragEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { initializeApp } from "firebase/app";
import { v4 as uuidV4 } from "uuid";
import {
  getStorage,
  ref,
  uploadBytes,
  deleteObject,
  getBlob,
  list,
  StorageReference,
} from "firebase/storage";

import { CloudArrowUp } from "phosphor-react";

import { File } from "./components/DesciptionFiles";

import "./styles/global.css";

type Files = {
  title: string;
  url: string;
  id: string;
  loaded: boolean;
  file?: File;
  type: string;
  sizeOut: boolean;
};

function App() {
  const app = initializeApp({
    storageBucket: import.meta.env.VITE_URL,
  });

  const [files, setFiles] = useState<Files[]>([]);
  const isInvalid = useRef<boolean>(false);
  const filesCurrent = useRef<Files[]>([]);
  const filesLoaded = useRef<Files[]>([]);

  const [dragover, setDragOver] = useState<boolean>(false);

  const storage = getStorage(app);
  const refApp = ref(storage);

  useEffect(() => {
    async function buildFiles(item: StorageReference, size: number) {
      const refFile = ref(storage, item.fullPath);
      const blob = await getBlob(refFile);
      const value = {
        id: item.name,
        loaded: true,
        sizeOut: true,
        title: item.name,
        type: item.name,
        url: URL.createObjectURL(blob),
      } as Files;
      filesLoaded.current = [...filesLoaded.current, value];

      if (filesLoaded.current.length === size) {
        setFiles(filesLoaded.current);
      }
    }

    async function getFiles() {
      const files = await list(refApp).then((files) => {
        return files;
      });
      files.items.forEach(async (item) => {
        await buildFiles(item, files.items.length);
      });
    }

    getFiles();
  }, []);

  function changeLoadedState(id: string) {
    const file = filesCurrent.current.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          loaded: true,
          ...(!item.sizeOut && { sizeOut: true }),
        };
      }
      return item;
    });

    filesCurrent.current = file;
    setFiles(file);
  }

  async function sendFirebase() {
    filesCurrent.current.forEach(async (file) => {
      if (file.sizeOut && file.file) {
        const nameFile = ref(storage, file.file.name);
        await uploadBytes(nameFile, file.file).then(() => {
          changeLoadedState(file.id);
        });
      }
    });
  }

  async function handleRemoveFiles(id: string) {
    let file: Files = {} as Files;
    const filter = files.filter((item) => {
      if (item.id === id) {
        URL.revokeObjectURL(item.url);
        file = item;
        return false;
      }
      return true;
    });
    if (file.loaded) {
      const refFile = ref(storage, file?.file?.name || file.id);
      await deleteObject(refFile);
    }

    setFiles(filter);
  }

  async function handleFiles(filesList: FileList) {
    const input = document.getElementById("files");
    const inputSize = input?.getAttribute("size") as string;

    const filesMap = Object.entries(filesList).map(
      (file: [string, File]) =>
        ({
          id: uuidV4(),
          file: file[1],
          loaded: false,
          title: file[1].name,
          url: URL.createObjectURL(file[1]),
          type: file[1].type,
          sizeOut: file[1].size <= +inputSize,
        } as Files)
    );

    setFiles((prev) => {
      let files = filesMap.filter((item) => {
        let isTrue = true;
        prev.forEach((file) => {
          if (file.title === item.title) {
            isTrue = false;
          }
        });

        return isTrue;
      });
      const filesUpdate = prev.map((file, index) => {
        const fileMap = filesMap[index];
        if (file.title === fileMap?.title && fileMap.sizeOut !== file.sizeOut) {
          return {
            ...file,
            sizeOut: fileMap.sizeOut,
          };
        }
        return file;
      });

      files = [...files, ...filesUpdate];
      filesCurrent.current = files;
      if (files !== prev) {
        sendFirebase();
      }
      return files;
    });
  }

  function onDragOver(e: DragEvent<HTMLElement>) {
    e.stopPropagation();
    e.preventDefault();
    if (!dragover) {
      setDragOver(true);
    }

    const input = document.getElementById("files");
    const inputAccept = input?.getAttribute("accept") as string;
    e.dataTransfer.dropEffect = "copy";

    const files = Object.entries(e.dataTransfer.items).map(
      (item: [string, DataTransferItem]) => ({
        kind: item[1].kind,
        type: item[1].type,
      })
    );

    isInvalid.current = !files.every((item) => inputAccept.includes(item.type));
  }

  function onDrop(e: DragEvent<HTMLElement>) {
    e.stopPropagation();
    e.preventDefault();
    if (!isInvalid.current) {
      const files = e.dataTransfer.files;
      handleFiles(files);
    }

    if (isInvalid.current) {
      isInvalid.current = false;
    }
    if (dragover) setDragOver(false);
  }

  function onDragLeave(e: DragEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (isInvalid.current) {
      isInvalid.current = false;
    }
    if (dragover) setDragOver(false);
  }

  function openSearchFiles(e: MouseEvent<HTMLElement>) {
    if (e.target) {
      const input: HTMLInputElement = document.querySelector("#files")!;
      input.click();
    }
  }

  return (
    <div id="dragover">
      <div
        style={{
          display: "flex",
          maxWidth: "750px",
          width: "100%",
          margin: "2rem",
          gap: "1rem",
          alignItems: "center",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <main
          data-state={
            isInvalid.current && dragover
              ? "invalid"
              : !isInvalid.current && dragover
              ? "valid"
              : ""
          }
          onDragOver={onDragOver}
          onDrop={onDrop}
          onDragLeave={onDragLeave}
          id="container"
          onClick={openSearchFiles}
          style={{
            position: "relative",
          }}
        >
          <div id="content">
            <CloudArrowUp
              id="text-content"
              size={80}
              color={
                isInvalid.current && dragover
                  ? "#C53030"
                  : !isInvalid.current && dragover
                  ? "#48BB78"
                  : "#c4c4c4"
              }
            />
            <span id="text-content">
              {isInvalid.current
                ? "Arquivos inválidos"
                : "Arraste seus aquivos aqui"}
            </span>
          </div>
          <input
            type="file"
            multiple
            size={ 1024 * 1024 * 3}
            id="files"
            name="file"
            accept="image/png, image/jpeg, application/pdf"
            onChange={(e) => {
              e.stopPropagation();
              handleFiles(e.target.files as any);
            }}
            style={{ display: "none" }}
          />
        </main>
        <div
          style={{
            backgroundColor: "#fff",
            padding: "1rem 0",
            borderRadius: "8px",
            width: "100%",
            textAlign: "center",
            color: "#4A5568",
          }}
        >
          {files.length > 0 ? (
            files.map(({ id, title, url, loaded, type, sizeOut }) => (
              <File
                loaded={loaded}
                title={title}
                key={id}
                sizeOut={sizeOut}
                url={url}
                type={type}
                onRemove={() => {
                  handleRemoveFiles(id);
                }}
              />
            ))
          ) : (
            <p>Não há nenhum arquivo até o momento</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
