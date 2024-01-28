import { Ref, useRef } from "react"

function App() {
  const inputElement: Ref<HTMLInputElement> = useRef(null)

  const changeHandler = () => {
    const file = inputElement.current?.files?.item(0)
    console.log(file ?? 'No file')
    const reader = new FileReader()
    if (file) {
      reader.onload = (e) => {
        const fileContents = e.target?.result?.toString() ?? ""
        console.log(fileContents)
      }
      reader.readAsText(file)
    }
  }

  return (
    <article className="p-4">
      <h1 className="font-bold text-2xl">Lovelace Scheduler</h1>
      <div className="m-auto my-4">
        <input
          type="file"
          name="file"
          ref={inputElement}
          accept=".yaml"
          // style={{ display: "block", margin: "10px auto" }}
          className="
            block border border-stone-300 rounded-md shadow-smoverflow-clip
            file:border-none file:px-2 file:py-1 file:bg-stone-200 file:cursor-pointer file:font-medium
          "
        />
        <p className="text-sm text-stone-600">File must be in YAML format</p>
      </div>
      <button onClick={changeHandler} className="
        rounded-lg py-1 px-3 bg-stone-800 text-stone-50 shadow-sm font-medium
      ">Submit</button>

    </article>
  )
}

export default App
