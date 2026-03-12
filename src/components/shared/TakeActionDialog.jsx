import { useState } from 'react'
import { Btn } from './Toast'
import { useApp } from '../../App'

export default function TakeActionDialog({ part, customer, onClose, onSaved }) {
    const { saveAction } = useApp()
    const [steps, setSteps] = useState([''])

    const handleAddStep = () => setSteps([...steps, ''])

    const handleStepChange = (index, value) => {
        const newSteps = [...steps]
        newSteps[index] = value
        setSteps(newSteps)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const validSteps = steps.filter(s => s.trim() !== '')
        if (validSteps.length === 0) return

        saveAction({
            type: 'ActionSteps',
            label: `Take Action: ${part.itemCode}`,
            partCode: part.itemCode,
            partDesc: part.desc,
            customer: customer.name,
            affectedParts: validSteps,
        })
        onSaved?.()
        onClose()
    }

    return (
        <div style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 8,
            width: 340, background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
            padding: '16px', zIndex: 1000,
            animation: 'fadeInScale 0.2s ease-out',
        }}>
            <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-1)' }}>
                <span>Take Action: {part.itemCode}</span>
                <button
                    onClick={onClose}
                    type="button"
                    style={{ background: 'var(--surface-2)', border: 'none', cursor: 'pointer', color: 'var(--text-3)', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}
                >
                    ✕
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 240, overflowY: 'auto', marginBottom: 16, paddingRight: 4 }}>
                    {steps.map((step, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--indigo)', width: 14 }}>{i + 1}.</span>
                            <input
                                autoFocus={i === steps.length - 1}
                                value={step}
                                onChange={(e) => handleStepChange(i, e.target.value)}
                                placeholder={`Enter action step...`}
                                style={{
                                    flex: 1, padding: '9px 12px', borderRadius: 8,
                                    border: '1px solid var(--border)', background: 'var(--surface-2)',
                                    fontSize: 12, color: 'var(--text-1)', outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--indigo)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                            />
                            {steps.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setSteps(steps.filter((_, idx) => idx !== i))}
                                    style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 12, padding: 4 }}
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border-2)' }}>
                    <button type="button" onClick={handleAddStep} style={{
                        background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--indigo)',
                        fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: '6px 12px', borderRadius: 8
                    }}>
                        + Add Another Step
                    </button>

                    <Btn variant="primary" style={{ padding: '8px 18px', fontSize: 12, borderRadius: 8 }}>
                        Submit Action
                    </Btn>
                </div>
            </form>
        </div>
    )
}
