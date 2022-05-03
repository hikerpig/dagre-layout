import { GraphData } from '#dagre-layout'
import dedent from 'dedent'
import { RenderDotOpts } from '../utils/render-dot'

export type Example = {
  source: string
  description: string
  prepareDagreLayout?: RenderDotOpts['prepareDagreLayout']
}

export const EXAMPLES: Record<string, Example> = {
  simple: {
    description: 'first example',
    source: dedent`
    digraph example_graph {
      a -> b -> c;
      b -> d [label="good"];
    }
    `,
  },
  margin_example: {
    description: 'margin example',
    source: dedent`
    digraph margin_example {
      a [marginb=0]
      c [marginr=30]

      a -> b;
      b -> c;
      b -> d;
    }
    `,
  },

  ortho: {
    description: 'ortho example',
    source: dedent`
    digraph ortho_example {
      a -> b;
      b -> c;
      b -> d;
      b -> e;
      b -> f;
    }
    `,
    prepareDagreLayout(g) {
      g.setGraph({
        splines: 'ortho'
      } as GraphData)
    }
  },
}
