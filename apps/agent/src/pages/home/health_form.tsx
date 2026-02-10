import { useChatStore } from '@/stores/chat';
import { useGlobalStore } from '@/stores/global';
import { App, Select } from 'antd';

function HealthForm() {
  const healthForms = useGlobalStore((state) => state.healthForms);
  const contextData = useChatStore((state) => state.contextData);
  const setContextDataWithField = useChatStore((state) => state.setContextDataWithField);

  const { modal } = App.useApp();

  return (
    <div className="px-4 flex items-center h-[50px] gap-2">
      <Select
        value={contextData?.health_form_id}
        onChange={(value) => {
          modal.confirm({
            title: '确定要切换健康调查表吗？',
            onOk: () => {
              setContextDataWithField('health_form_id', value);
            },
          });
        }}
        options={healthForms?.map((item) => {
          return {
            label: `${item.name} - ${item.gender} - ${item.created_at}`,
            value: item.id,
          };
        })}
        className="min-w-[130px]"
        placeholder="请选择健康调查表"
        popupMatchSelectWidth={false}
        allowClear
        variant="borderless"
      />
    </div>
  );
}

export { HealthForm };
