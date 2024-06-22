import { Ref, useRef } from "react"
import { convertYamlScheduleInputsV1ToScheduleSpecification, parseYamlScheduleInputsV1 } from "../lib/input/parse"

function App() {
  const inputElement: Ref<HTMLInputElement> = useRef(null)

  const changeHandler = () => {
    const file = inputElement.current?.files?.item(0)

    const reader = new FileReader()
    if (file) {
      reader.readAsText(file)
      reader.onload = (e) => {
        const fileContents = e.target?.result?.toString() ?? ""

        const scheduleInputs = parseYamlScheduleInputsV1(fileContents)
        if (scheduleInputs.success == true) {
          const scheduleSpec = convertYamlScheduleInputsV1ToScheduleSpecification(scheduleInputs.data)
          console.log(scheduleSpec)
        } else {
          alert(`Parsing failed: ${scheduleInputs.error.message}`)
        }
      }
    } else {
      alert("No file selected!")
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
