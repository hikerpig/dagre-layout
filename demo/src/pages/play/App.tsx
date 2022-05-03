import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { GeistProvider, CssBaseline, Textarea, Page } from '@geist-ui/core'
import {
  HashRouter,
  Routes,
  Route,
  Outlet,
  useSearchParams,
} from 'react-router-dom'
import Console from './containers/Console'
import { observer } from 'mobx-react'
import { reaction } from 'mobx'
import { Model, model } from './store'
import './App.css'

function App() {
  return (
    <div className="App">
      <HashRouter>
        <Routes>
          <Route path="/" element={<AppLayout model={model} />}>
            <Route index element={<Console model={model} />}></Route>
          </Route>
        </Routes>
      </HashRouter>
    </div>
  )
}

export default App

const AppLayout = observer((props: { model: Model }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { model } = props

  useEffect(() => {
    const exampleId = searchParams.get('example')
    if (exampleId) {
      model.selectExample(exampleId)
    }

    const dispose = reaction(
      () => {
        return model.exampleId
      },
      (id) => {
        const params = new URLSearchParams(location.search)
        params.set('example', id)
        setSearchParams(params, { replace: true })
      }
    )
    return () => {
      dispose()
    }
  }, [])

  return (
    <div className="App__layout">
      <Outlet />
    </div>
  )
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GeistProvider>
      <CssBaseline />
      <App />
    </GeistProvider>
  </React.StrictMode>
)
