import React, { ChangeEvent, useCallback, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { GeistProvider, CssBaseline, Textarea } from '@geist-ui/core'
import './App.css'
import { parseDot } from './utils/dot'

const v = `digraph graphname {
  a -> b -> c;
  b -> d;
}`
function App() {
  const [content, setContent] = useState(v)
  const handleContentChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      const result = parseDot(value)
      setContent(value)
    },
    []
  )

  return (
    <div className="App">
      <h1>Dagre Debug Console</h1>
      <div id="inputPanel">
        <Textarea rows={20} value={content} onChange={handleContentChange} />
        <input type="checkbox" id="timing" name="timing"></input>
        <label>Enable timing instrumentation </label>
      </div>

      <div id="resultPanel">
        {/* <svg id="svg" width="550px" height="550px">
      <defs>
        <marker id="arrowhead" viewBox="0 0 10 10" refx=8 refy=5
                markerUnits="strokeWidth" markerWidth=8 markerHeight=5
                orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z"/>
        </marker>
      </defs>
    </svg> */}
      </div>
    </div>
  )
}

export default App

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GeistProvider>
      <CssBaseline />
      <App />
    </GeistProvider>
  </React.StrictMode>
)
