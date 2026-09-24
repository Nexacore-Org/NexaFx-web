// Next.js API route - simple client-side log ingest for admin actions (temporary)
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // For now, just echo and accept. In future persist to backend or DB.
      // TODO: forward to /admin/activity backend endpoint when available.
      console.log('Admin action log:', req.body);
      return res.status(201).json({ status: 'ok' });
    } catch (err) {
      return res.status(500).json({ error: 'failed' });
    }
  }
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
