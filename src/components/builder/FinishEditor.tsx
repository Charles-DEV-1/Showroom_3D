import type { Finish } from '../../types/product.ts'
import { draftId } from '../../lib/id.ts'
import NumberField from './NumberField'

export default function FinishEditor({ finishes, onChange, onUploadTexture }: {
  finishes: Finish[]; onChange: (finishes: Finish[]) => void
  onUploadTexture: (id: string, file: File) => Promise<void>
}) {
  const update = (id: string, patch: Partial<Finish>) => onChange(finishes.map((finish) => finish.id === id ? { ...finish, ...patch } : finish))
  return (
    <section className="editor-section" aria-labelledby="finishes-title">
      <div className="section-heading"><h2 id="finishes-title">Finishes <small>{finishes.length}</small></h2>
        <button className="button-small" type="button" disabled={finishes.length >= 24} onClick={() => onChange([...finishes, {
          id: draftId('finish'), slot: 'primary', name: 'New finish', color: '#7B4A2E', priceModifier: 0,
        }])}>Add finish</button>
      </div>
      <p className="hint">One finish per slot. Its price modifier is charged once.</p>
      {finishes.map((finish) => (
        <details className="editor-item" key={finish.id}>
          <summary><i className="swatch" style={{ backgroundColor: finish.color, backgroundImage: finish.textureUrl ? `url("${finish.textureUrl}")` : undefined }} aria-hidden="true" />{finish.name || 'Unnamed finish'}<span>{finish.slot}</span></summary>
          <div className="editor-fields">
            <label className="field"><span>Finish name</span><input value={finish.name} required maxLength={80}
              onChange={(event) => update(finish.id, { name: event.target.value })} /></label>
            <div className="field-grid two">
              <label className="field"><span>Material slot</span><select value={finish.slot}
                onChange={(event) => update(finish.id, { slot: event.target.value as Finish['slot'] })}>
                <option value="primary">Primary</option><option value="secondary">Secondary</option>
              </select></label>
              <label className="field"><span>Color / fallback</span><input type="color" value={finish.color}
                onChange={(event) => update(finish.id, { color: event.target.value })} /></label>
            </div>
            <label className="field"><span>Texture image (optional, up to 2 MiB)</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (file) void onUploadTexture(finish.id, file)
              }} />
            </label>
            <p className="hint">Use a close-up of the material. It covers each part in this slot; the color is used if the image cannot load.</p>
            {finish.textureUrl && <div className="texture-preview">
              <img src={finish.textureUrl} alt={`${finish.name} texture`} />
              <button className="text-button" type="button" onClick={() => update(finish.id, { textureUrl: null })}>Remove texture</button>
            </div>}
            <NumberField label="Price modifier (NGN)" value={finish.priceModifier} min={0} max={1000000000} step={1}
              onChange={(priceModifier) => update(finish.id, { priceModifier })} />
            <button className="text-button danger" type="button" onClick={() => onChange(finishes.filter((item) => item.id !== finish.id))}>Remove finish</button>
          </div>
        </details>
      ))}
    </section>
  )
}
