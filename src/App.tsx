import {
  DragEvent,
  FormEvent,
  MouseEvent,
  MouseEventHandler,
  useEffect,
} from "react";
import "./styles/global.css";

function App() {
  function onDragOver(e: DragEvent<HTMLElement>) {
    e.stopPropagation();
    e.preventDefault();
    const inputAccept = document.getElementById("files")?.getAttribute('accept') as string;
    console.log(inputAccept, 'oiii');
    e.dataTransfer.dropEffect = "copy";
    const files = Object.entries(e.dataTransfer.items).map((item: [string, DataTransferItem]) => ({
      kind: item[1].kind, 
      type: item[1].type,
    }) )

    const isInvalid = files.every((item) => inputAccept.includes(item.type) ) 

    console.log(files, isInvalid)
  }

  function onDrop(e: DragEvent<HTMLElement>) {
    e.stopPropagation();
    e.preventDefault();
    const input: HTMLInputElement = document.querySelector("#files")!;
    const files = e.dataTransfer.files;
    input.files = files;

    // console.log(input.files);
    const file = new FileReader();

    file.addEventListener("load", (e) => {
      const img: HTMLImageElement = document.querySelector("#img")!;
      // img.src = e.target?.result as string;
    });
    file.addEventListener("progress", (e) => {
      console.log(Math.round((e.loaded / e.total) * 100));
    });
    const main = document.querySelector("#container");
    console.log("submit", e);
    // const values = new FormData(e.currentTarget);

    const documents: HTMLInputElement = document.querySelector("#files")!;
    const filesLoad: { name: string; url: string }[] = [];

    function teste(item: File) {
      const filer = new FileReader();
      filer.readAsDataURL(item);

      filer.addEventListener("load", () => {
        filesLoad.push({
          name: item.name,
          url: filer.result as string,
        });

        const div = document.createElement("a");
        div.style.backgroundImage = `url(${filer.result})`;
        div.style.backgroundColor = "black";
        div.style.backgroundSize = `cover`;
        div.style.backgroundRepeat = "no-repeat";

        div.style.height = "60px";
        div.style.width = "60px";
        div.style.borderRadius = "8px";
        div.href = URL.createObjectURL(
          new Blob([item.slice()], {
            type: item.type,
          })
        );
        div.download ='teste'
        div.target = "_blank";

        div.addEventListener('click', (e) => e.stopPropagation() )

        main?.appendChild(div);
        console.log(files, "oi files");
      });
    }

    Object.entries(documents.files as Object).forEach(
      (item: [string, File]) => {
        teste(item[1]);
      }
    );

    file.readAsDataURL(files[0]);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const main = document.querySelector("#container");
    const documents: HTMLInputElement = document.querySelector("#files")!;
    const files: { name: string; url: string }[] = [];
    function teste(item: File) {
      const filer = new FileReader();
      filer.readAsDataURL(item);

      filer.addEventListener("load", () => {
        files.push({
          name: item.name,
          url: filer.result as string,
        });

        const div = document.createElement("div");
        div.style.backgroundImage = `url(${filer.result})`;
        div.style.backgroundColor = "black";
        div.style.backgroundSize = `cover`;
        div.style.backgroundRepeat = "no-repeat";

        div.style.height = "60px";
        div.style.width = "60px";
        div.style.borderRadius = "8px";

        main?.appendChild(div);
        console.log(files, "oi files");
      });
    }
    Object.entries(documents.files as Object).forEach(
      (item: [string, File]) => {
        teste(item[1]);
      }
    );

    // const filer = new FileReader()
    // files.forEach((item, index ) => {
    //   console.log(item[index])

    //   // filer.addEventListener('load',( file ) => {

    //   // })

    //   filer.readAsDataURL(item[index])

    // })
  }

  function openSearchFiles(e: MouseEvent<HTMLElement>) {
    if (e.target) {
      const input: HTMLInputElement = document.querySelector("#files")!;
      input.click();
    }
  }

  return (
    <div id="dragover">
      <form id="form" onSubmit={onSubmit}>
        <main
          onDragOver={onDragOver}
          onDrop={onDrop}
          id="container"
          onClick={openSearchFiles}
        >
          <input
            type="file"
            multiple
            id="files"
            name="file"
            accept="image/png, image/jpeg"
            onChange={(e) => {
              console.log(e, 'oi input  ')
            }}
            style={{ display: "none" }}
          />
          {/* <img src="" alt="" id="img" height={60} width={60} /> */}
        </main>
      </form>
      <button form="form"> enviar</button>
    </div>
  );
}

export default App;
