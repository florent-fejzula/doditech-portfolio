/* ==================================================================
   ENQUIRY NOTIFICATIONS
   Every document the contact form writes to `enquiries` produces one
   email to the owner. Server-side on purpose: the browser cannot skip
   it, forge it, or see the credentials it sends with.

   Config (none of it in the repo):
     GMAIL_APP_PASSWORD  secret — `firebase functions:secrets:set`
     MAIL_USER           functions/.env — the Gmail account sending
     MAIL_TO             functions/.env — where notifications land
   ================================================================== */

import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { defineSecret, defineString } from 'firebase-functions/params'
import { logger } from 'firebase-functions'
import nodemailer from 'nodemailer'

const GMAIL_APP_PASSWORD = defineSecret('GMAIL_APP_PASSWORD')
const MAIL_USER = defineString('MAIL_USER')
const MAIL_TO = defineString('MAIL_TO')

const PROJECT = 'doditech-83a92'
const CONSOLE = `https://console.firebase.google.com/project/${PROJECT}/firestore/databases/-default-/data`

export const notifyEnquiry = onDocumentCreated(
  {
    document: 'enquiries/{id}',
    // Same region as the database, so the trigger never crosses regions.
    region: 'europe-west3',
    secrets: [GMAIL_APP_PASSWORD],
    // One email per enquiry is cheap; a retry storm on a bad password is
    // not. A failed send is logged and the enquiry stays in Firestore.
    retry: false,
    maxInstances: 2,
  },
  async (event) => {
    const data = event.data?.data()
    if (!data) return

    const access = data.topic === 'access'
    const name = String(data.name ?? '').slice(0, 120)
    const email = String(data.email ?? '').slice(0, 200)

    const lines = [
      access ? 'ACCESS REQUEST — restricted records' : 'New enquiry from the portfolio',
      '',
      `Name:     ${name}`,
      `Email:    ${email}`,
      `Company:  ${data.company || '—'}`,
      `Locale:   ${data.locale || '—'}`,
      `Referrer: ${data.referrer || '—'}`,
      '',
      String(data.body ?? ''),
      '',
      '—',
      `Stored as: ${CONSOLE}/~2Fenquiries~2F${event.params.id}`,
    ]

    if (access) {
      lines.push(
        '',
        'To grant access: open the clearance collection and add a document',
        `whose ID is exactly "${email.toLowerCase()}" (any field, e.g. grantedAt).`,
        `${CONSOLE}/~2Fclearance`,
        'Then tell them to use "Have clearance? Sign in" on the projects page.',
      )
    }

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: MAIL_USER.value(), pass: GMAIL_APP_PASSWORD.value() },
    })

    try {
      await transport.sendMail({
        from: `DodiTech Portfolio <${MAIL_USER.value()}>`,
        to: MAIL_TO.value(),
        // Hitting reply answers the visitor, not the sending account.
        replyTo: email || undefined,
        subject: access ? `[ACCESS] ${name} wants clearance` : `[Enquiry] ${name}`,
        text: lines.join('\n'),
      })
      logger.info('notified', { id: event.params.id, access })
    } catch (error) {
      logger.error('notification failed', { id: event.params.id, error: String(error) })
    }
  },
)
