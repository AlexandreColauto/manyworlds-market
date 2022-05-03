import { getAWS } from "../../lib/s3";
import type { NextApiRequest, NextApiResponse } from 'next'


async function handler(
    req: NextApiRequest,
    res: NextApiResponse) {
  if (req.method === "GET") {
    const result = getAWS()
    return res.status(200).json(result);
  }

  return res.status(405).end();
}


export default handler;