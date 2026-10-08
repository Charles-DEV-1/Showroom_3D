import type { FinishSelection, MaterialSlot, ProductInput } from '../types/product.ts'
import { formatPrice, selectedFinishes } from '../lib/configuration.ts'

export default function FinishSelector({ product, selection, onChange }: {
  product: ProductInput; selection: FinishSelection; onChange: (selection: FinishSelection) => void
}) {
  const selected = selectedFinishes(product, selection)
  return (
    <div className="finish-selectors">
      {(['primary', 'secondary'] as MaterialSlot[]).map((slot) => {
        const options = product.finishes.filter((finish) => finish.slot === slot)
        if (!options.length || !product.parts.some((part) => part.slot === slot)) return null
        return (
          <fieldset className="finish-slot" key={slot}>
            <legend>{slot === 'primary' ? 'Primary finish' : 'Secondary finish'}</legend>
            <div className="finish-options">
              {options.map((finish) => (
                <button key={finish.id} type="button" className="finish-option"
                  aria-pressed={selected.some((item) => item.id === finish.id)}
                  onClick={() => onChange({ ...selection, [slot]: finish.id })}>
                  <i className="swatch" style={{ backgroundColor: finish.color, backgroundImage: finish.textureUrl ? `url("${finish.textureUrl}")` : undefined }} aria-hidden="true" />
                  <span>{finish.name}<small>{finish.priceModifier ? `+ ${formatPrice(finish.priceModifier)}` : 'Included'}</small></span>
                </button>
              ))}
            </div>
          </fieldset>
        )
      })}
    </div>
  )
}
