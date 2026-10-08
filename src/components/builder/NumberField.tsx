import { useId, useState } from 'react'

interface Props {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number | 'any'
}

export default function NumberField({ label, value, onChange, min = 0.1, max = 1000, step = 'any' }: Props) {
  const id = useId()
  const [entry, setEntry] = useState({ value, text: String(value) })
  if (entry.value !== value) setEntry({ value, text: String(value) })
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id} type="number" inputMode="decimal" value={entry.text}
        min={min} max={max} step={step} required
        onChange={(event) => {
          const number = event.target.valueAsNumber
          const valid = Number.isFinite(number) && number >= min && number <= max
          setEntry({ value: valid ? number : value, text: event.target.value })
          if (valid) onChange(number)
        }}
        onBlur={() => setEntry({ value, text: String(value) })}
      />
    </label>
  )
}
