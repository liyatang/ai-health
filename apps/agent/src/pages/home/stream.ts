import { fetchStream } from '@fe-free/ai';

/**
 * 发起流式请求，解析连续的 {"message":"xxx"} JSON 块并回调
 */

function getTransformStream() {
  return new TransformStream<string, { message: string }>({
    transform(chunk, controller) {
      try {
        if (chunk) {
          const json = `[${chunk.replace(/}{/g, '},{')}]`;
          JSON.parse(json).forEach((item: { message: string }) => {
            controller.enqueue(item);
          });
        }
      } catch (error) {
        console.error('error', error, chunk);
      }
    },
  });
}

// 后端协议非标准的 stream 协议，需要自定义处理
function customFetchStream(url: string, options: any) {
  return fetchStream(url, {
    ...options,
    transformStream: getTransformStream(),
  });
}

export { customFetchStream };
