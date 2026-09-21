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
}

export type SendResult =
  | { ok: true; channel: 'firestore' }
  | { ok: true; channel: 'mailto' }
  | { ok: false; error: string }

/** Firestore calls can hang when the API is disabled — don't let them. */
const WRITE_TIMEOUT_MS = 6000

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isConfigured = Boolean(config.apiKey && config.projectId && config.appId)

function mailto(message: Message) {
  const subject = encodeURIComponent(`Enquiry from ${message.name}`)
  const body = encodeURIComponent(
    [
      `Name: ${message.name}`,
      `Email: ${message.email}`,
      message.company ? `Company: ${message.company}` : null,
      '',
      message.body,
    ]
      .filter(Boolean)
      .join('\n'),
  )
  window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`
}

export async function sendMessage(message: Message): Promise<SendResult> {
  if (!isConfigured) {
    mailto(message)
    return { ok: true, channel: 'mailto' }
  }

  try {
    const [{ initializeApp, getApps }, { getFirestore, collection, addDoc, serverTimestamp }] =
      await Promise.all([import('firebase/app'), import('firebase/firestore')])

    const app = getApps()[0] ?? initializeApp(config)
    const write = addDoc(collection(getFirestore(app), 'enquiries'), {
      ...message,
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
    mailto(message)
    return { ok: true, channel: 'mailto' }
  }
}
