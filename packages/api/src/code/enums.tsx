import type { TagProps } from 'antd';
import { Tag } from 'antd';
import { t } from 'i18next';

// --- MessageRole

export enum EnumMessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export const valueEnumMessageRole = {
  [EnumMessageRole.USER]: {
    text: t('enum.MessageRole.USER', '用户'),
    value: 'user',
  },
  [EnumMessageRole.ASSISTANT]: {
    text: t('enum.MessageRole.ASSISTANT', '助手'),
    value: 'assistant',
  },
};

export const listMessageRole = Object.keys(valueEnumMessageRole).map((key) => {
  const item = valueEnumMessageRole[key];

  return {
    value: item.value !== undefined ? item.value : key,
    label: item.text,
    originData: item.data,
  };
});

export function TagMessageRole(props: { value?: EnumMessageRole | string } & TagProps) {
  const item = props.value && valueEnumMessageRole[props.value];

  if (item) {
    return (
      <Tag color={item.color} {...props}>
        {item.text}
      </Tag>
    );
  }

  return null;
}

export function TextMessageRole(props: { value?: EnumMessageRole | string } & TagProps) {
  const item = props.value && valueEnumMessageRole[props.value];

  return <>{item?.text ?? props.value}</>;
}

// --- CodeType

export enum EnumCodeType {
  FreeThinking = 'free_thinking',
  Paid = 'paid',
}

export const valueEnumCodeType = {
  [EnumCodeType.FreeThinking]: {
    text: t('enum.CodeType.FreeThinking', '免费'),
    value: 'free_thinking',
  },
  [EnumCodeType.Paid]: {
    text: t('enum.CodeType.Paid', '付费'),
    value: 'paid',
  },
};

export const listCodeType = Object.keys(valueEnumCodeType).map((key) => {
  const item = valueEnumCodeType[key];

  return {
    value: item.value !== undefined ? item.value : key,
    label: item.text,
    originData: item.data,
  };
});

export function TagCodeType(props: { value?: EnumCodeType | string } & TagProps) {
  const item = props.value && valueEnumCodeType[props.value];

  if (item) {
    return (
      <Tag color={item.color} {...props}>
        {item.text}
      </Tag>
    );
  }

  return null;
}

export function TextCodeType(props: { value?: EnumCodeType | string } & TagProps) {
  const item = props.value && valueEnumCodeType[props.value];

  return <>{item?.text ?? props.value}</>;
}

// --- Gender

export enum EnumGender {
  Male = '男',
  Female = '女',
}

export const valueEnumGender = {
  [EnumGender.Male]: {
    text: t('enum.Gender.Male', '男'),
    value: '男',
  },
  [EnumGender.Female]: {
    text: t('enum.Gender.Female', '女'),
    value: '女',
  },
};

export const listGender = Object.keys(valueEnumGender).map((key) => {
  const item = valueEnumGender[key];

  return {
    value: item.value !== undefined ? item.value : key,
    label: item.text,
    originData: item.data,
  };
});

export function TagGender(props: { value?: EnumGender | string } & TagProps) {
  const item = props.value && valueEnumGender[props.value];

  if (item) {
    return (
      <Tag color={item.color} {...props}>
        {item.text}
      </Tag>
    );
  }

  return null;
}

export function TextGender(props: { value?: EnumGender | string } & TagProps) {
  const item = props.value && valueEnumGender[props.value];

  return <>{item?.text ?? props.value}</>;
}
