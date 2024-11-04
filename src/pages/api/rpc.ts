// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
    try {
        const response = await axios.post('https://bold-empty-dust.solana-mainnet.quiknode.pro/fb4dbdb7413a6d2b55811bc0164e0db8e7ba767d/', req.body);
       res.status(200).json(response.data)
    } catch {
        res.status(500).json({ error: 'Failed to proxy request to QuikNode' });
    }
}
