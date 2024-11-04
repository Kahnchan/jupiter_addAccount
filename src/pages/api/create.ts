// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
    try {
        const response = await axios.post('https://referral.jup.ag/api/referral/HtwBxBy2gzLFPvQLykBAkA9LWV7BEw6KxAX8HbAPJq2/token-accounts/create', req.body);
       res.status(200).json(response.data)
    } catch {
        res.status(500).json({ error: 'Failed to proxy request to QuikNode' });
    }
}
