import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Brackets, Readout } from '@/components/hud/primitives'
import { PanelShell } from '@/components/stage/PanelShell'
import { Waveform } from '@/components/canvas/Waveform'
import { contact, identity } from '@/data/profile'
import { isConfigured, sendMessage } from '@/lib/contact'

type State = 'idle' | 'sending' | 'sent' | 'error'

const field =
  'w-full bg-[color-mix(in_oklab,var(--color-cy-400)_6%,transparent)] border border-[var(--line)] px-3 py-2 font-[var(--font-ui)] text-[15px] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink-faint)] focus:border-[var(--line-hot)]'

/**
 * Copy button with a short confirmation. Falls back to selecting the
 * text when the Clipboard API is unavailable or blocked — which it is
 * over plain HTTP and in some embedded browsers.
 */
function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setState('copied')
    } catch {
      setState('failed')
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setState('idle'), 2400)
  }

  return (
    <button type="button" className="hud-btn !px-3 !py-1.5" onClick={copy}>
      {state === 'copied' ? '✓ Copied' : state === 'failed' ? '⃠ Select it manually' : `⧉ ${label}`}
    </button>
  )
}

export function ContactPanel() {
  const [state, setState] = useState<State>('idle')
  const [error, setError] = useState('')
  // Held so a visitor whose mail client never opened can copy what they
  // wrote instead of losing it.
  const [draft, setDraft] = useState<string | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)

    setState('sending')
    const result = await sendMessage({
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      company: String(form.get('company') ?? '') || undefined,
      body: String(form.get('body') ?? ''),
      trap: String(form.get('website') ?? ''),
    })

    if (result.ok) {
      setDraft(result.channel === 'mailto' ? result.draft : null)
      setState('sent')
    } else {
      setError(result.error)
      setState('error')
    }
  }

  return (
    <PanelShell code="04" title="Open a channel" subtitle="direct line">
      <div className="grid gap-6 p-5 lg:grid-cols-[1fr_1fr]">
        {/* ---- direct ---- */}
        <div>
          <p className="t-body mb-5 max-w-[52ch] text-[var(--color-ink-dim)]">
            Tell me what you are building and what is in the way. I answer every serious enquiry
            within one working day.
          </p>

          <a
            href={`mailto:${contact.email}`}
            className="hud-frame block transition-[filter] duration-200 hover:brightness-125"
          >
            <div className="hud-frame__in relative p-4">
              <Brackets inset={4} />
              <div className="t-label mb-1.5">primary</div>
              <div className="t-head glow text-[clamp(15px,1.7vw,21px)] lowercase">
                {contact.email}
              </div>
            </div>
          </a>

          <a
            href={`tel:${contact.phone.replace(/\s/g, '')}`}
            className="hud-frame mt-2.5 block transition-[filter] duration-200 hover:brightness-125"
          >
            <div className="hud-frame__in relative p-4">
              <Brackets inset={4} />
              <div className="t-label mb-1.5">voice</div>
              <div className="t-head glow text-[clamp(14px,1.4vw,18px)]">{contact.phone}</div>
            </div>
          </a>

          <div className="mt-3 h-[46px]">
            <Waveform bars={88} />
          </div>

          <ul className="mt-3">
            {contact.links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hud-nav-item"
                >
                  <span className="t-label w-[62px] shrink-0">{link.label}</span>
                  <span className="t-datum flex-1 text-[var(--color-cy-200)]">{link.handle}</span>
                  <span className="t-label">↗</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="hud-plate mt-4 p-3.5">
            <Readout label="location" value={identity.location} />
            <Readout label="timezone" value={identity.timezone} />
            <Readout label="response" value="< 24h" tone="online" />
            <Readout label="status" value={identity.availability} tone="online" />
          </div>
        </div>

        {/* ---- form ---- */}
        <div className="hud-frame" data-tone="hot">
          <div className="hud-frame__in relative p-4">
            <Brackets inset={4} />

            {state === 'sent' ? (
              <div className="flex h-full min-h-[320px] flex-col justify-center">
                <div className="text-center">
                  <div className="t-datum glow mb-3 !text-[28px] text-[var(--color-online)]">◈</div>
                  <h3 className="t-head text-[15px]">
                    {draft ? 'Handed to your mail client' : 'Transmission received'}
                  </h3>
                  <p className="t-body mx-auto mt-2 max-w-[40ch] text-[var(--color-ink-dim)]">
                    {draft
                      ? 'A draft should have opened, already addressed and filled in. Send it and it reaches me.'
                      : 'Logged and queued. You will hear from me shortly.'}
                  </p>
                </div>

                {/* Nothing can detect a mailto: that silently did nothing,
                    so the escape hatch is always offered rather than
                    waiting for the visitor to report a dead button. */}
                {draft && (
                  <div className="hud-plate mt-5 p-3.5">
                    <div className="t-label mb-2">If no draft appeared</div>
                    <p className="t-body mb-3 text-[13.5px] text-[var(--color-ink-dim)]">
                      Some browsers have no mail client to hand it to. Copy both and send it from
                      wherever you read mail — nothing you typed is lost.
                    </p>
                    <div className="mb-3 border border-[var(--line-soft)] px-3 py-2">
                      <div className="t-label !text-[8.5px]">address</div>
                      <div className="t-datum mt-0.5 select-all break-all text-[var(--color-cy-200)]">
                        {contact.email}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <CopyButton text={contact.email} label="Copy address" />
                      <CopyButton text={draft} label="Copy message" />
                    </div>
                  </div>
                )}

                <div className="mt-5 text-center">
                  <button type="button" className="hud-btn" onClick={() => setState('idle')}>
                    ↺ New message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-3">
                <div className="mb-1 flex items-center gap-2">
                  <span className="t-label">compose</span>
                  <span className="hud-ticks h-2 flex-1 opacity-40" />
                  <span className="t-datum text-[var(--color-cy-600)]">
                    {isConfigured ? 'SECURE' : 'MAIL'}
                  </span>
                </div>

                {/* Honeypot: off-screen rather than display:none, which
                    some bots skip. Real visitors never tab to it or see
                    it; a filled value means something scripted the form. */}
                <label
                  className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
                  aria-hidden="true"
                >
                  Leave this field blank
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>

                <label className="block">
                  <span className="t-label">name *</span>
                  <input name="name" required autoComplete="name" className={`${field} mt-1`} />
                </label>

                <label className="block">
                  <span className="t-label">email *</span>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className={`${field} mt-1`}
                  />
                </label>

                <label className="block">
                  <span className="t-label">company</span>
                  <input name="company" autoComplete="organization" className={`${field} mt-1`} />
                </label>

                <label className="block">
                  <span className="t-label">message *</span>
                  <textarea name="body" required rows={6} className={`${field} mt-1 resize-none`} />
                </label>

                {state === 'error' && (
                  <p className="t-datum !text-[10px] text-[var(--color-alert)]">
                    ▲ {error || 'Transmission failed. Try email instead.'}
                  </p>
                )}

                <button type="submit" className="hud-btn w-full justify-center" disabled={state === 'sending'}>
                  {state === 'sending' ? '◌ Transmitting…' : '▸ Transmit'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PanelShell>
  )
}
