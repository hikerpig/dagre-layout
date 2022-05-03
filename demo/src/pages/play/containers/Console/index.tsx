import { Checkbox, Grid, Page, Select, Textarea } from '@geist-ui/core'
import { reaction } from 'mobx'
import { observer } from 'mobx-react'
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { EXAMPLES } from 'src/pages/play/data/examples'
import type { Model } from '../../store'
import { renderDot, RenderDotOpts } from '../../utils/render-dot'

interface Props {
  model: Model
}

const Console = observer(({ model }: Props) => {
  const [content, setContent] = useState(EXAMPLES.simple.source)
  const [enableTiming, setEnableTiming] = useState(false)
  const [enableAutoSync, setEnableAutoSync] = useState(true)
  const resultPanelRef = useRef<HTMLDivElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const handleContentChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      updateContent(value)
      if (resultPanelRef.current && enableAutoSync) {
        const currentExample = model.currentExample
        renderDot({
          input: value,
          container: resultPanelRef.current,
          debugTiming: enableTiming,
          prepareDagreLayout: currentExample?.prepareDagreLayout,
        })
      }
    },
    [enableAutoSync]
  )

  const handleEnambeTimingChange = useCallback((e: any) => {
    const checked = e.target.checked
    setEnableTiming(checked)
  }, [])

  const updateContent = useCallback(
    (v: string) => {
      textAreaRef.current.value = v
      setContent(v)
    },
    [textAreaRef]
  )

  const handleAutoSyncChange = useCallback(
    (e: any) => {
      const checked = e.target.checked
      setEnableAutoSync(checked)
      if (checked) {
        updateResult(content)
      }
    },
    [content]
  )

  const updateResult = useCallback(
    (content: string, opts: Partial<RenderDotOpts> = {}) => {
      renderDot({
        input: content,
        container: resultPanelRef.current,
        ...opts,
      })
    },
    [resultPanelRef]
  )

  useEffect(() => {
    const dispose = reaction(
      () => {
        return model.currentExample
      },
      (currentExample) => {
        if (currentExample) {
          updateContent(currentExample.source)
          updateResult(currentExample.source, currentExample)
        }
      },
      { fireImmediately: true }
    )
    return () => {
      dispose()
    }
  }, [])

  const handleSelectExample = useCallback((exampleId) => {
    model.selectExample(exampleId)
  }, [])

  return (
    <Page>
      <Page.Header>
        <h2>Dagre Debug Console</h2>
      </Page.Header>
      <Page.Body>
        <div>
          <label>
            <b>Choose an example </b>
          </label>
          <Select
            placeholder="example"
            value={model.exampleId}
            onChange={handleSelectExample}
          >
            {Object.entries(EXAMPLES).map(([k, example]) => {
              return (
                <Select.Option key={k} value={k}>
                  {example.description}
                </Select.Option>
              )
            })}
          </Select>
        </div>
        <Grid.Container gap={2} justify="center">
          <Grid xs={12}>
            <div id="inputPanel">
              <Textarea
                rows={20}
                cols={60}
                onChange={handleContentChange}
                ref={textAreaRef}
              />
              <div>
                <Checkbox
                  checked={enableAutoSync}
                  onChange={handleAutoSyncChange}
                >
                  Auto Sync
                </Checkbox>
              </div>
              <div>
                <Checkbox
                  checked={enableTiming}
                  onChange={handleEnambeTimingChange}
                >
                  Enable timing instrumentation
                </Checkbox>
              </div>
            </div>
          </Grid>
          <Grid xs={12}>
            <div id="resultPanel" ref={resultPanelRef}></div>
          </Grid>
        </Grid.Container>
      </Page.Body>
    </Page>
  )
})

export default Console
