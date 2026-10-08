import type { Part } from '../../types/product.ts'
import { draftId } from '../../lib/id.ts'
import NumberField from './NumberField'

function shapePart(shape: Part['shape'], base: Pick<Part, 'id' | 'slot' | 'position'>): Part {
  if (shape === 'box') return { ...base, shape, size: [40, 4, 40] }
  if (shape === 'cylinder') return { ...base, shape, size: [4, 40] }
  return { ...base, shape, size: [10] }
}

export default function PartEditor({ parts, onChange }: { parts: Part[]; onChange: (parts: Part[]) => void }) {
  const update = (id: string, replacement: Part) => onChange(parts.map((part) => part.id === id ? replacement : part))
  return (
    <section className="editor-section" aria-labelledby="parts-title">
      <div className="section-heading"><h2 id="parts-title">Parts <small>{parts.length}</small></h2>
        <button className="button-small" type="button" disabled={parts.length >= 100}
          onClick={() => onChange([...parts, shapePart('box', { id: draftId('part'), slot: 'primary', position: [0, 80, 0] })])}>Add part</button>
      </div>
      <p className="hint">Sizes and center positions are in centimeters. Y points upward.</p>
      {parts.map((part, index) => (
        <details className="editor-item" key={part.id} open={index === 0}>
          <summary>Part {index + 1} <span>{part.shape} / {part.slot}</span></summary>
          <div className="editor-fields">
            <div className="field-grid two">
              <label className="field"><span>Shape</span><select value={part.shape}
                onChange={(event) => update(part.id, shapePart(event.target.value as Part['shape'], part))}>
                <option value="box">Box</option><option value="cylinder">Cylinder</option><option value="sphere">Sphere</option>
              </select></label>
              <label className="field"><span>Material slot</span><select value={part.slot}
                onChange={(event) => update(part.id, { ...part, slot: event.target.value as Part['slot'] })}>
                <option value="primary">Primary</option><option value="secondary">Secondary</option>
              </select></label>
            </div>
            <div className="field-grid three">
              {part.size.map((value, axis) => (
                <NumberField key={`${part.shape}-${axis}`}
                  label={part.shape === 'box' ? ['Width', 'Height', 'Depth'][axis] : ['Radius', 'Height'][axis]}
                  value={value} onChange={(number) => update(part.id, {
                    ...part, size: part.size.map((old, i) => i === axis ? number : old),
                  } as Part)} />
              ))}
            </div>
            <div className="field-grid three">
              {part.position.map((value, axis) => (
                <NumberField key={axis} label={['Position X', 'Position Y', 'Position Z'][axis]} min={-1000}
                  value={value} onChange={(number) => update(part.id, {
                    ...part, position: part.position.map((old, i) => i === axis ? number : old) as Part['position'],
                  })} />
              ))}
            </div>
            <button type="button" className="text-button danger" disabled={parts.length <= 1}
              onClick={() => onChange(parts.filter((item) => item.id !== part.id))}>Remove part</button>
          </div>
        </details>
      ))}
    </section>
  )
}
