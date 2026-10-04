/* ==================================================================
   SEED THE VAULT
   Uploads the restricted records from design/private/restricted/
   records.mjs into Firestore `vault/*`, inlining each screenshot as a
   data URL. Clients cannot write the vault (rules deny it), so this
   goes through the REST API as you, with your gcloud credentials —
   IAM, not rules, authorises it.

     node scripts/seed-vault.mjs              production
     node scripts/seed-vault.mjs --emulator   local emulator
     add --clear <email> to also put an email on the allowlist

   Records are replaced whole; ids not in the file are left alone.
   ================================================================== */

import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const PROJECT = 'doditech-83a92'
const DIR = join(import.meta.dirname, '..', 'design', 'private', 'restricted')
const args = process.argv.slice(2)
const emulator = args.includes('--emulator')
const clearIndex = args.indexOf('--clear')
const clearEmail = clearIndex >= 0 ? args[clearIndex + 1]?.toLowerCase() : undefined

const base = emulator
  ? `http://127.0.0.1:8080/v1/projects/${PROJECT}/databases/(default)/documents`
  : `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`

// The emulator accepts "owner" as an admin token; production uses yours.
const token = emulator
  ? 'owner'
  : execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim()

/** Plain JS value → Firestore REST value. */
function encode(value) {
  if (value === null || value === undefined) return { nullValue: null }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value }
  }
  if (typeof value === 'boolean') return { booleanValue: value }
  if (typeof value === 'object') {
    return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, encode(v)])) } }
  }
  return { stringValue: String(value) }
}

async function put(path, data) {
  const fields = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, encode(v)]))
  const res = await fetch(`${base}/${path}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(emulator ? {} : { 'x-goog-user-project': PROJECT }),
    },
    body: JSON.stringify({ fields }),
  })
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`)
}

const { records } = await import(pathToFileURL(join(DIR, 'records.mjs')).href)

for (const { id, image, ...record } of records) {
  const doc = { ...record }
  if (image) {
    doc.image = `data:image/webp;base64,${readFileSync(join(DIR, image)).toString('base64')}`
  }
  const size = JSON.stringify(doc).length
  if (size > 900_000) throw new Error(`${id} is ${size} bytes — over the safe document size`)
  await put(`vault/${id}`, doc)
  console.log(`vault/${id}  ${(size / 1024).toFixed(0)} kB`)
}

if (clearEmail) {
  await put(`clearance/${clearEmail}`, { grantedAt: new Date().toISOString(), note: 'seeded' })
  console.log(`clearance/${clearEmail}`)
}

console.log(emulator ? 'emulator seeded' : 'production seeded')
