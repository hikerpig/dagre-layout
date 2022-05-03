import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Checkbox, Textarea, Page, Grid } from '@geist-ui/core'
import { renderDot } from './render-dot'

interface Props {}

const v = `digraph graphname {
  a -> b -> c;
  b -> d;
}`

const Console = ({}: Props) => {
  const [content, setContent] = useState(v)
  const [enableTiming, setEnableTiming] = useState(false)
  const [enableAutoSync, setEnableAutoSync] = useState(true)
  const resultPanelRef = useRef<HTMLDivElement>(null)
  const handleContentChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      if (resultPanelRef.current && enableAutoSync) {
        renderDot({
          input: value,
          container: resultPanelRef.current,
          debugTiming: enableTiming,
        })
      }
      setContent(value)
    },
    [enableAutoSync]
  )

  const handleEnambeTimingChange = useCallback((e: any) => {
    const checked = e.target.checked
    setEnableTiming(checked)
  }, [])

  const handleAutoSyncChange = useCallback((e: any) => {
    const checked = e.target.checked
    setEnableAutoSync(checked)
    if (checked) {
      updateResult(content)
    }
  }, [content])

  const updateResult = useCallback((content: string) => {
    renderDot({
      input: content,
      container: resultPanelRef.current,
    })
  }, [resultPanelRef])

  useEffect(() => {
    updateResult(content)
  }, [])

  return (
    <Page>
      <Page.Header>
        <h2>Dagre Debug Console</h2>
      </Page.Header>
      <Page.Body>
        <Grid.Container gap={2} justify="center">
          <Grid xs={12}>
            <div id="inputPanel">
              <Textarea
                rows={20}
                cols={60}
                value={content}
                onChange={handleContentChange}
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
}

export default Console
