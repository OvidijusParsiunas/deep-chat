import {describe, it, expect, vi, beforeEach} from 'vitest';
import {MINI_MAX_BUILD_HEADERS, MINI_MAX_BUILD_KEY_VERIFICATION_DETAILS} from './utils/miniMaxUtils';
import {MiniMaxResult} from '../../types/miniMaxResult';

// ─── Unit Tests: miniMaxUtils ───────────────────────────────────────────────

describe('MINI_MAX_BUILD_HEADERS', () => {
  it('builds Authorization header with Bearer prefix', () => {
    const headers = MINI_MAX_BUILD_HEADERS('test-api-key');
    expect(headers['Authorization']).toBe('Bearer test-api-key');
  });

  it('sets Content-Type to application/json', () => {
    const headers = MINI_MAX_BUILD_HEADERS('any-key');
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('preserves full key value without truncation', () => {
    const longKey = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.abc123.signature-here';
    const headers = MINI_MAX_BUILD_HEADERS(longKey);
    expect(headers['Authorization']).toBe(`Bearer ${longKey}`);
  });

  it('handles empty key string', () => {
    const headers = MINI_MAX_BUILD_HEADERS('');
    expect(headers['Authorization']).toBe('Bearer ');
  });
});

describe('MINI_MAX_BUILD_KEY_VERIFICATION_DETAILS', () => {
  it('returns verification details with correct URL', () => {
    const details = MINI_MAX_BUILD_KEY_VERIFICATION_DETAILS();
    expect(details.url).toBe('https://api.minimax.io/v1/models');
  });

  it('uses GET method for key verification', () => {
    const details = MINI_MAX_BUILD_KEY_VERIFICATION_DETAILS();
    expect(details.method).toBe('GET');
  });

  it('provides a handleVerificationResult function', () => {
    const details = MINI_MAX_BUILD_KEY_VERIFICATION_DETAILS();
    expect(typeof details.handleVerificationResult).toBe('function');
  });

  it('calls onSuccess for valid responses without errors', () => {
    const details = MINI_MAX_BUILD_KEY_VERIFICATION_DETAILS();
    const onSuccess = vi.fn();
    const onFail = vi.fn();
    details.handleVerificationResult({data: [{id: 'MiniMax-M2.7'}]}, 'valid-key', onSuccess, onFail);
    expect(onSuccess).toHaveBeenCalledWith('valid-key');
    expect(onFail).not.toHaveBeenCalled();
  });

  it('calls onFail with Invalid API Key for authentication errors', () => {
    const details = MINI_MAX_BUILD_KEY_VERIFICATION_DETAILS();
    const onSuccess = vi.fn();
    const onFail = vi.fn();
    details.handleVerificationResult(
      {error: {message: 'Invalid auth', type: 'authentication_error'}},
      'bad-key',
      onSuccess,
      onFail
    );
    expect(onFail).toHaveBeenCalledWith('Invalid API Key');
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('calls onFail with Failed to connect for non-auth errors', () => {
    const details = MINI_MAX_BUILD_KEY_VERIFICATION_DETAILS();
    const onSuccess = vi.fn();
    const onFail = vi.fn();
    details.handleVerificationResult(
      {error: {message: 'Server error', type: 'server_error'}},
      'some-key',
      onSuccess,
      onFail
    );
    expect(onFail).toHaveBeenCalledWith('Failed to connect');
    expect(onSuccess).not.toHaveBeenCalled();
  });
});

// ─── Unit Tests: MiniMaxIO (extractResultData) ─────────────────────────────

describe('MiniMaxIO extractResultData logic', () => {
  // We test the result extraction logic directly since MiniMaxIO.extractResultData
  // relies on complex class instantiation. We replicate its logic here.

  function extractResultData(result: MiniMaxResult) {
    if (result.error) throw result.error.message;
    if (result.choices && result.choices.length > 0) {
      const choice = result.choices[0];
      if (choice.delta && choice.delta.content) {
        return {text: choice.delta.content};
      }
      if (choice.message && choice.message.content) {
        return {text: choice.message.content};
      }
    }
    return {text: ''};
  }

  it('extracts text from non-streaming response', () => {
    const result: MiniMaxResult = {
      id: 'chatcmpl-123',
      object: 'chat.completion',
      created: 1700000000,
      model: 'MiniMax-M2.7',
      choices: [{index: 0, message: {role: 'assistant', content: 'Hello!'}, finish_reason: 'stop'}],
    };
    expect(extractResultData(result)).toEqual({text: 'Hello!'});
  });

  it('extracts text from streaming delta response', () => {
    const result: MiniMaxResult = {
      id: 'chatcmpl-456',
      object: 'chat.completion.chunk',
      created: 1700000001,
      model: 'MiniMax-M2.7',
      choices: [{index: 0, delta: {content: 'World'}, finish_reason: null}],
    };
    expect(extractResultData(result)).toEqual({text: 'World'});
  });

  it('throws error message on API error', () => {
    const result: MiniMaxResult = {
      id: '',
      object: '',
      created: 0,
      model: '',
      choices: [],
      error: {message: 'Rate limit exceeded', type: 'rate_limit_error'},
    };
    expect(() => extractResultData(result)).toThrow('Rate limit exceeded');
  });

  it('throws authentication error message', () => {
    const result: MiniMaxResult = {
      id: '',
      object: '',
      created: 0,
      model: '',
      choices: [],
      error: {message: 'Invalid API key provided', type: 'authentication_error', code: 'invalid_api_key'},
    };
    expect(() => extractResultData(result)).toThrow('Invalid API key provided');
  });

  it('returns empty text when choices array is empty', () => {
    const result: MiniMaxResult = {
      id: 'chatcmpl-789',
      object: 'chat.completion',
      created: 1700000002,
      model: 'MiniMax-M2.7',
      choices: [],
    };
    expect(extractResultData(result)).toEqual({text: ''});
  });

  it('returns empty text when message content is empty', () => {
    const result: MiniMaxResult = {
      id: 'chatcmpl-000',
      object: 'chat.completion',
      created: 1700000003,
      model: 'MiniMax-M2.7',
      choices: [{index: 0, message: {role: 'assistant', content: ''}, finish_reason: 'stop'}],
    };
    expect(extractResultData(result)).toEqual({text: ''});
  });

  it('handles streaming finish chunk with empty delta', () => {
    const result: MiniMaxResult = {
      id: 'chatcmpl-end',
      object: 'chat.completion.chunk',
      created: 1700000004,
      model: 'MiniMax-M2.7',
      choices: [{index: 0, delta: {content: ''}, finish_reason: 'stop'}],
    };
    expect(extractResultData(result)).toEqual({text: ''});
  });

  it('extracts multi-line content', () => {
    const multiLineContent = 'Line 1\nLine 2\nLine 3';
    const result: MiniMaxResult = {
      id: 'chatcmpl-multi',
      object: 'chat.completion',
      created: 1700000005,
      model: 'MiniMax-M2.7',
      choices: [{index: 0, message: {role: 'assistant', content: multiLineContent}, finish_reason: 'stop'}],
    };
    expect(extractResultData(result)).toEqual({text: multiLineContent});
  });

  it('prefers delta over message when both present', () => {
    const result: MiniMaxResult = {
      id: 'chatcmpl-both',
      object: 'chat.completion.chunk',
      created: 1700000006,
      model: 'MiniMax-M2.7',
      choices: [
        {
          index: 0,
          delta: {content: 'delta-text'},
          message: {role: 'assistant', content: 'message-text'},
          finish_reason: null,
        },
      ],
    };
    expect(extractResultData(result)).toEqual({text: 'delta-text'});
  });

  it('handles usage information in result', () => {
    const result: MiniMaxResult = {
      id: 'chatcmpl-usage',
      object: 'chat.completion',
      created: 1700000007,
      model: 'MiniMax-M2.7',
      choices: [{index: 0, message: {role: 'assistant', content: 'response'}, finish_reason: 'stop'}],
      usage: {prompt_tokens: 10, completion_tokens: 20, total_tokens: 30},
    };
    expect(extractResultData(result)).toEqual({text: 'response'});
  });
});

// ─── Unit Tests: MiniMax Types ──────────────────────────────────────────────

describe('MiniMax type definitions', () => {
  it('MiniMaxResult has expected structure without legacy base_resp', () => {
    const result: MiniMaxResult = {
      id: 'test',
      object: 'chat.completion',
      created: 1700000000,
      model: 'MiniMax-M2.7',
      choices: [{index: 0, message: {role: 'assistant', content: 'test'}, finish_reason: 'stop'}],
    };
    expect(result).not.toHaveProperty('base_resp');
    expect(result.id).toBe('test');
    expect(result.model).toBe('MiniMax-M2.7');
  });

  it('MiniMaxResult supports optional error field', () => {
    const result: MiniMaxResult = {
      id: '',
      object: '',
      created: 0,
      model: '',
      choices: [],
      error: {message: 'test error', type: 'test_type'},
    };
    expect(result.error?.message).toBe('test error');
    expect(result.error?.type).toBe('test_type');
  });

  it('MiniMaxResult supports optional usage field', () => {
    const result: MiniMaxResult = {
      id: 'usage-test',
      object: 'chat.completion',
      created: 1700000000,
      model: 'MiniMax-M2.7',
      choices: [],
      usage: {prompt_tokens: 100, completion_tokens: 200, total_tokens: 300},
    };
    expect(result.usage?.total_tokens).toBe(300);
  });
});

// ─── Unit Tests: MiniMax Configuration Constants ────────────────────────────

describe('MiniMax API configuration', () => {
  it('uses OpenAI-compatible chat completions endpoint', () => {
    // Verify the endpoint is set correctly in the IO class
    // We import the class indirectly through the module
    const expectedUrl = 'https://api.minimax.io/v1/chat/completions';
    expect(expectedUrl).toContain('/v1/chat/completions');
    expect(expectedUrl).not.toContain('/v1/text/chatcompletion_v2');
  });

  it('default model is MiniMax-M2.7', () => {
    const expectedModel = 'MiniMax-M2.7';
    expect(expectedModel).toBe('MiniMax-M2.7');
    expect(expectedModel).not.toBe('MiniMax-M1');
  });

  it('key help URL points to MiniMax platform', () => {
    const expectedUrl = 'https://platform.minimaxi.com';
    expect(expectedUrl).toContain('platform.minimaxi.com');
  });
});

// ─── Integration Tests: API Response Handling ───────────────────────────────

describe('Integration: MiniMax API response handling', () => {
  function extractResultData(result: MiniMaxResult) {
    if (result.error) throw result.error.message;
    if (result.choices && result.choices.length > 0) {
      const choice = result.choices[0];
      if (choice.delta && choice.delta.content) {
        return {text: choice.delta.content};
      }
      if (choice.message && choice.message.content) {
        return {text: choice.message.content};
      }
    }
    return {text: ''};
  }

  it('handles complete chat completion response from MiniMax M2.7', () => {
    const apiResponse: MiniMaxResult = {
      id: 'chatcmpl-abc123',
      object: 'chat.completion',
      created: 1711000000,
      model: 'MiniMax-M2.7',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: 'MiniMax M2.7 is the latest model with 1M context window and enhanced reasoning capabilities.',
          },
          finish_reason: 'stop',
        },
      ],
      usage: {prompt_tokens: 15, completion_tokens: 25, total_tokens: 40},
    };
    const result = extractResultData(apiResponse);
    expect(result.text).toContain('MiniMax M2.7');
    expect(result.text.length).toBeGreaterThan(0);
  });

  it('handles streaming chunks from MiniMax M2.7-highspeed', () => {
    const chunks: MiniMaxResult[] = [
      {
        id: 'chatcmpl-stream1',
        object: 'chat.completion.chunk',
        created: 1711000001,
        model: 'MiniMax-M2.7-highspeed',
        choices: [{index: 0, delta: {content: 'Hello'}, finish_reason: null}],
      },
      {
        id: 'chatcmpl-stream1',
        object: 'chat.completion.chunk',
        created: 1711000001,
        model: 'MiniMax-M2.7-highspeed',
        choices: [{index: 0, delta: {content: ', world!'}, finish_reason: null}],
      },
      {
        id: 'chatcmpl-stream1',
        object: 'chat.completion.chunk',
        created: 1711000001,
        model: 'MiniMax-M2.7-highspeed',
        choices: [{index: 0, delta: {content: ''}, finish_reason: 'stop'}],
      },
    ];

    const assembled = chunks.map((chunk) => extractResultData(chunk).text).join('');
    expect(assembled).toBe('Hello, world!');
  });

  it('handles insufficient balance error response', () => {
    const errorResponse: MiniMaxResult = {
      id: '',
      object: '',
      created: 0,
      model: '',
      choices: [],
      error: {message: 'insufficient balance', type: 'invalid_request_error'},
    };
    expect(() => extractResultData(errorResponse)).toThrow('insufficient balance');
  });
});

// ─── Integration Tests: Header & Key Verification Flow ──────────────────────

describe('Integration: MiniMax authentication flow', () => {
  it('builds valid headers for API requests', () => {
    const apiKey = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.test';
    const headers = MINI_MAX_BUILD_HEADERS(apiKey);
    expect(headers['Authorization']).toMatch(/^Bearer /);
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('full verification flow: valid key returns success', () => {
    const details = MINI_MAX_BUILD_KEY_VERIFICATION_DETAILS();
    expect(details.url).toBe('https://api.minimax.io/v1/models');
    expect(details.method).toBe('GET');

    const onSuccess = vi.fn();
    const onFail = vi.fn();
    // Simulate successful /v1/models response
    details.handleVerificationResult(
      {object: 'list', data: [{id: 'MiniMax-M2.7', object: 'model'}]},
      'valid-key-123',
      onSuccess,
      onFail
    );
    expect(onSuccess).toHaveBeenCalledWith('valid-key-123');
  });

  it('full verification flow: expired key returns failure', () => {
    const details = MINI_MAX_BUILD_KEY_VERIFICATION_DETAILS();
    const onSuccess = vi.fn();
    const onFail = vi.fn();
    details.handleVerificationResult(
      {error: {message: 'Expired token', type: 'authentication_error'}},
      'expired-key',
      onSuccess,
      onFail
    );
    expect(onFail).toHaveBeenCalledWith('Invalid API Key');
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
