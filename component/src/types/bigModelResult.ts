export type BigModelNormalResult = {
  message: {
    role: string
    content: string
    tool_calls?: []
    tool_call_id?: string
  }
}

export type BigModelStreamEvent = {
  delta: {
    role: string
    content: string
    tool_calls?: []
  },
  finish_reason: string
}

export type BigModelResult = {
  choices: (BigModelNormalResult | BigModelStreamEvent)[]
  error?: {
    message: string
  }
}

export type BigModelImagesResult = {
  data: [
    {
      url?: string
    },
  ]
}