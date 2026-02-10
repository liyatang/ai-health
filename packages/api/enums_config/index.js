const enums = {
  MessageRole: {
    USER: {
      value: 'user',
      text: '用户',
    },
    ASSISTANT: {
      value: 'assistant',
      text: '助手',
    },
  },
  CodeType: {
    FreeThinking: {
      value: 'free_thinking',
      text: '免费',
    },
    Paid: {
      value: 'paid',
      text: '付费',
    },
  },
  Gender: {
    Male: {
      value: '男',
      text: '男',
    },
    Female: {
      value: '女',
      text: '女',
    },
  },
};

module.exports = { enums };
