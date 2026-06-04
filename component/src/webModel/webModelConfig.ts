/* eslint-disable max-len */
// Curated fallback model list (new @mlc-ai/web-llm ModelRecord shape: model / model_id / model_lib).
// At runtime, getConfig() prefers window.webLLM.prebuiltAppConfig.model_list (the full, always
// up-to-date set shipped with deep-chat-web-llm) and only falls back to this list if unavailable.
export default {
  model_list: [
    {
      model: 'https://huggingface.co/mlc-ai/Llama-3.2-1B-Instruct-q4f16_1-MLC',
      model_id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
      model_lib:
        'https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_84/base/Llama-3.2-1B-Instruct-q4f16_1_cs1k-webgpu.wasm',
      vram_required_MB: 879.04,
      low_resource_required: true,
      overrides: {context_window_size: 4096},
    },
    {
      model: 'https://huggingface.co/mlc-ai/Llama-3.2-3B-Instruct-q4f16_1-MLC',
      model_id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
      model_lib:
        'https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_84/base/Llama-3.2-3B-Instruct-q4f16_1_cs1k-webgpu.wasm',
      vram_required_MB: 2263.69,
      low_resource_required: true,
      overrides: {context_window_size: 4096},
    },
    {
      model: 'https://huggingface.co/mlc-ai/Llama-3.1-8B-Instruct-q4f16_1-MLC',
      model_id: 'Llama-3.1-8B-Instruct-q4f16_1-MLC',
      model_lib:
        'https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_84/base/Llama-3_1-8B-Instruct-q4f16_1_cs1k-webgpu.wasm',
      vram_required_MB: 5001,
      low_resource_required: false,
      overrides: {context_window_size: 4096},
    },
    {
      model: 'https://huggingface.co/mlc-ai/Phi-3.5-mini-instruct-q4f16_1-MLC',
      model_id: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
      model_lib:
        'https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_84/base/Phi-3.5-mini-instruct-q4f16_1_cs1k-webgpu.wasm',
      vram_required_MB: 3672.07,
      low_resource_required: false,
      overrides: {context_window_size: 4096},
    },
    {
      model: 'https://huggingface.co/mlc-ai/Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
      model_id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
      model_lib:
        'https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_84/base/Qwen2-1.5B-Instruct-q4f16_1_cs1k-webgpu.wasm',
      vram_required_MB: 1629.75,
      low_resource_required: true,
      overrides: {context_window_size: 4096},
    },
    {
      model: 'https://huggingface.co/mlc-ai/gemma-2-2b-it-q4f16_1-MLC',
      model_id: 'gemma-2-2b-it-q4f16_1-MLC',
      model_lib:
        'https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_84/base/gemma-2-2b-it-q4f16_1_cs1k-webgpu.wasm',
      vram_required_MB: 1895.3,
      low_resource_required: false,
      required_features: ['shader-f16'],
      overrides: {context_window_size: 4096},
    },
    {
      model: 'https://huggingface.co/mlc-ai/TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC',
      model_id: 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC',
      model_lib:
        'https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_84/base/TinyLlama-1.1B-Chat-v1.0-q4f16_1_cs1k-webgpu.wasm',
      vram_required_MB: 697.24,
      low_resource_required: true,
      required_features: ['shader-f16'],
      overrides: {context_window_size: 2048},
    },
    {
      model: 'https://huggingface.co/mlc-ai/Mistral-7B-Instruct-v0.3-q4f16_1-MLC',
      model_id: 'Mistral-7B-Instruct-v0.3-q4f16_1-MLC',
      model_lib:
        'https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_84/base/Mistral-7B-Instruct-v0.3-q4f16_1_cs1k-webgpu.wasm',
      vram_required_MB: 4573.39,
      low_resource_required: false,
      required_features: ['shader-f16'],
      overrides: {context_window_size: 4096, sliding_window_size: -1},
    },
  ],
  use_web_worker: true,
};
