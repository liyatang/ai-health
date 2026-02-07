export interface StreamChunk {
  message: string;
}

export interface FetchStreamOptions {
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  callbacks?: {
    onUpdate?: (chunk: StreamChunk) => void;
    onError?: (error: Error) => void;
  };
}

/**
 * 发起流式请求，解析连续的 {"message":"xxx"} JSON 块并回调
 */
export async function fetchStream(url: string, options: FetchStreamOptions = {}): Promise<void> {
  const { params, headers = {}, callbacks = {} } = options;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: params ? JSON.stringify(params) : undefined,
    });
  } catch (err) {
    callbacks.onError?.(err instanceof Error ? err : new Error(String(err)));
    return;
  }

  if (!response.ok) {
    callbacks.onError?.(new Error(`HTTP ${response.status}: ${response.statusText}`));
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.onError?.(new Error('Response body is not readable'));
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    let done = false;
    while (!done) {
      const result = await reader.read();
      done = result.done;
      const value = result.value;
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // 按 }{ 边界切分，得到完整 JSON 对象
      let boundary: number;
      while ((boundary = buffer.indexOf('}{')) !== -1) {
        const jsonStr = buffer.slice(0, boundary + 1);
        buffer = buffer.slice(boundary + 1);
        try {
          const parsed = JSON.parse(jsonStr) as StreamChunk;
          if (parsed?.message !== undefined) {
            callbacks.onUpdate?.(parsed);
          }
        } catch {
          // 单块非合法 JSON 时忽略
        }
      }
    }

    // 剩余 buffer 可能为最后一个完整对象（无后续 }{）
    if (buffer.trim()) {
      try {
        const parsed = JSON.parse(buffer) as StreamChunk;
        if (parsed?.message !== undefined) {
          callbacks.onUpdate?.(parsed);
        }
      } catch {
        // 忽略尾部不完整片段
      }
    }
  } catch (err) {
    callbacks.onError?.(err instanceof Error ? err : new Error(String(err)));
  } finally {
    reader.releaseLock();
  }
}
