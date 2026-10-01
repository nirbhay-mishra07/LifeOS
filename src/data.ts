import type { IconKey, Service, ServiceId, Task, User } from './types'

type Row = [string, string, string, string, boolean?]
const mk = (rows: Row[]): Task[] =>
  rows.map((r, i) => ({ id: `t${i}`, title: r[0], description: r[1], documents: r[2], next: r[3], done: !!r[4] }))

export const user: User = { name: 'Demo Citizen', email: 'demo@lifeos.example' }

export const services: Record<ServiceId, Service> = {
  elec: { id: 'elec', title: 'Electricity Bill Investigation', icon: 'zap', time: '2–3 mins to start',
    description: 'Your request appears to be related to an unusually high electricity bill.', officialUrl: 'https://www.india.gov.in/',
    steps: ['Review the latest bill', 'Verify meter/consumer details', 'Check the appropriate complaint route', 'Submit the complaint through the official service', 'Track the complaint status'],
    tasks: mk([
      ['Understand the issue', 'We read your request and matched it to a bill dispute.', 'None', '—', true],
      ['Review bill', 'Compare ₹6,800 with your usual ~₹2,000.', 'Latest bill', '—', true],
      ['Prepare complaint', 'Note consumer number, billing period and meter reading.', 'Bill copy, meter photo', 'Fill the complaint details'],
      ['Submit complaint', "File through your electricity provider's official portal.", 'Consumer number', 'Open official service'],
      ['Track response', 'Note the complaint ID and check status every few days.', 'Complaint ID', 'Check status'],
    ]) },
  dl: { id: 'dl', title: 'Driving Licence Renewal', icon: 'card', time: '5–10 mins to start', dueDate: '2026-11-01',
    description: 'You want to renew a driving licence that expires next month.', officialUrl: 'https://parivahan.gov.in/',
    steps: ['Verify licence details', 'Check eligibility', 'Prepare required documents', 'Start renewal process', 'Track application'],
    required: ['Existing licence', 'Identity information', 'Address information'],
    tasks: mk([
      ['Verify licence details', 'Check number, validity date and holder name.', 'Existing licence', 'Review details'],
      ['Check eligibility', 'Confirm renewal window and any pending fines.', 'Licence number', 'Check eligibility'],
      ['Prepare required documents', 'Keep identity and address proof ready.', 'ID proof, address proof, photo', 'Gather documents'],
      ['Start renewal process', 'Begin through the official transport service.', 'All documents', 'Open official service'],
      ['Track application', 'Save the application number and track it.', 'Application number', 'Check status'],
    ]) },
  pan: { id: 'pan', title: 'PAN Service', icon: 'file', time: '5–10 mins to start',
    description: 'You need help with your PAN (Permanent Account Number).', officialUrl: 'https://www.incometax.gov.in/',
    steps: ['Identify what you need (new, correction, reprint)', 'Collect identity and address proof', 'Choose the official PAN service', 'Submit the request', 'Track the application'],
    tasks: mk([
      ['Identify the need', 'New PAN, correction or reprint?', 'None', 'Choose one'],
      ['Collect documents', 'Identity, address and date-of-birth proof.', 'ID, address proof', 'Gather documents'],
      ['Submit request', 'Use the official PAN service.', 'Documents', 'Open official service'],
      ['Track application', 'Keep acknowledgement number safe.', 'Acknowledgement no.', 'Check status'],
    ]) },
}

export const sample: Record<ServiceId, string> = {
  elec: 'My electricity bill is ₹6,800. Usually it is around ₹2,000.',
  dl: 'My driving licence expires next month. I want to renew it.',
  pan: 'I need help with my PAN',
}

export const popular: { icon: IconKey; title: string; desc: string; query: string }[] = [
  { icon: 'file', title: 'PAN Services', desc: 'Apply, correct or reprint your PAN.', query: sample.pan },
  { icon: 'card', title: 'Driving Licence', desc: 'Renew or update your licence.', query: sample.dl },
  { icon: 'zap', title: 'Electricity Complaints', desc: 'High bills, outages, meter issues.', query: sample.elec },
  { icon: 'bank', title: 'Banking Guidance', desc: 'Cards, accounts, disputes.', query: 'I lost my debit card' },
  { icon: 'file', title: 'Document Services', desc: 'Lost or damaged documents.', query: 'I lost an important document' },
]

export const chips = [
  { label: 'Electricity Bill', query: sample.elec }, { label: 'Driving Licence', query: sample.dl },
  { label: 'PAN', query: sample.pan }, { label: 'Banking', query: 'I lost my debit card' },
]

export const mockDoc = { name: 'Electricity_Bill.pdf', consumerNo: 'XXXXXX1234', amount: '₹6,800', period: 'September 2026' }

export const detect = (q: string): ServiceId | null => {
  const s = q.toLowerCase()
  if (/licen[cs]e|driving|\bdl\b/.test(s)) return 'dl'
  if (/\bpan\b/.test(s)) return 'pan'
  if (/electric|bill|bijli|बिजली/.test(s)) return 'elec'
  return null
}
