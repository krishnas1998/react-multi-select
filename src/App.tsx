import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Select from './shared/select/Select';
import MultiSelect from './shared/multiSelect/MultiSelect';

function App() {
  const [options, setOptions] = useState([
    {
      label: 'text',
      value: 'text'
    },
    {
      label: 'text2',
      value: 'text2'
    },
    {
      label: 'text3',
      value: 'text3'
    }
  ])

  const options2: string[] = [
    'Apple',
    'Banana',
    'Cherry',
    'Date',
    'Elderberry',
    'Fig',
    'Grape',
  ];
  return (
    <>
      <Select
        options={options}
      />
      <MultiSelect options={options2} placeholder="" />
    </>
  )
}

export default App
