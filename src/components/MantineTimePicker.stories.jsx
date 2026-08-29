import { useState } from 'react';
import { MantineTimePicker } from './MantineTimePicker';

export default {
  component: MantineTimePicker,
  title: 'Components/MantineTimePicker',
  tags: ['ai-generated'],
};

const availableTimes = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
];

function Stateful(args) {
  const [value, setValue] = useState('');
  return (
    <div className="p-6">
      <MantineTimePicker {...args} value={value} onChange={setValue} />
      <p className="mt-4 text-sm text-ink/70">Selected: {value || 'none'}</p>
    </div>
  );
}

export const Default = {
  render: () => <Stateful withDropdown presets={availableTimes} min="09:00" max="20:30" minutesStep={30} />,
};

export const WithPresetSelection = {
  render: () => (
    <div className="p-6">
      <MantineTimePicker
        withDropdown
        presets={['12:00', '15:30', '18:00']}
        min="09:00"
        max="20:30"
        minutesStep={30}
      />
    </div>
  ),
};
