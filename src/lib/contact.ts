/* ==================================================================
   CONTACT CHANNEL
   Messages land in Firestore when the project is configured, and fall
   back to the visitor's mail client when it is not — so the form is
   never a dead end, even before you wire the backend.

   The Firebase SDK is imported dynamically: unconfigured, none of it
   reaches the bundle a visitor downloads.
   ================================================================== */

import { contact } from '@/data/profile'

export interface Message {
  name: string
  email: string
  company?: string
  body: string
  /** Where the visitor came from, e.g. 'access' for a clearance request. */
  topic?: string
  /**
   * Honeypot value from a field real visitors never see or fill. Any
   * non-empty value here means a bot filled every input it could find,
   * so the caller should pretend to succeed without writing anything.
   */
  trap?: string
}

export type SendResult =
  | { ok: true; channel: 'firestore' }
  /**
   * `draft` is the composed message. A mail client that never opened
   * leaves the visitor with nothing, so the panel offers it for copying
   * rather than making them retype it.
   */
  | { ok: true; channel: 'mailto'; draft: string }
  | { ok: false; error: string }

/** Firestore calls can hang when the API is disabled — don't let them. */
const WRITE_TIMEOUT_MS = 6000

// Read here rather than from ./firebase: this module is imported
// statically, and importing that one would pull the SDK into the page.
export const isConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID,
)

/** Plain-text version of the enquiry, for the mail body and for copying. */
export function composeDraft(message: Message) {
  return [
    `Name: ${message.name}`,
    `Email: ${message.email}`,
    message.company ? `Company: ${message.company}` : null,
    '',
    message.body,
  ]
    // Not filter(Boolean): that would also drop the '' separator and run
    // the message straight into the header block.
    .filter((line) => line !== null)
    .join('\n')
}

/**
 * Hands the message to the visitor's mail client. There is no way to
 * detect whether that worked — a machine with no handler registered for
 * mailto: simply does nothing — so the caller always gets the draft back
 * and shows a copyable fallback either way.
 */
function mailto(message: Message) {
  const draft = composeDraft(message)
  const subject = encodeURIComponent(`Enquiry from ${message.name}`)
  try {
    window.location.href =
      `mailto:${contact.email}?subject=${subject}&body=${encodeURIComponent(draft)}`
  } catch {
    /* blocked or unhandled — the fallback block carries the message */
  }
  return draft
}

export async function sendMessage(message: Message): Promise<SendResult> {
  // A filled honeypot means something scripted every input on the page.
  // Report success without writing anything or opening a mail client —
  // there is no real enquiry to lose, and nothing here tips the bot off.
  if (message.trap) {
    return { ok: true, channel: 'firestore' }
  }

  if (!isConfigured) {
    return { ok: true, channel: 'mailto', draft: mailto(message) }
  }

  try {
    const [{ firestore }, { collection, addDoc, serverTimestamp }] = await Promise.all([
      import('./firebase'),
      import('firebase/firestore'),
    ])

    // Named fields, not `...message` — `trap` must never reach Firestore,
    // and the rules only allow this exact key set. `company` is omitted
    // rather than set to undefined: the SDK rejects undefined values.
    // The owner's email notification is sent server-side by a function
    // watching this collection, so nothing here can skip or forge it.
    const write = addDoc(collection(firestore(), 'enquiries'), {
      name: message.name,
      email: message.email,
      ...(message.company ? { company: message.company } : {}),
      body: message.body,
      ...(message.topic ? { topic: message.topic } : {}),
      receivedAt: serverTimestamp(),
      // Useful triage context, nothing identifying beyond what was typed.
      referrer: document.referrer || null,
      locale: navigator.language,
    })

    await Promise.race([
      write,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), WRITE_TIMEOUT_MS)),
    ])

    return { ok: true, channel: 'firestore' }
  } catch {
    // Rules rejected it, the API is off, the visitor is offline — it does
    // not matter which. An enquiry is too valuable to drop on the floor,
    // so hand it to the mail client rather than showing an error.
    return { ok: true, channel: 'mailto', draft: mailto(message) }
  }
}
