import { putObject } from "../../lib/s3";
import type { NextApiRequest, NextApiResponse } from 'next'


async function handler(
    req: NextApiRequest,
    res: NextApiResponse) {
  if (req.method === "POST") {
    console.log(req.body)
      
    const { key,body,contentType } = req.body;
    const results = await putObject({key, body, contentType});
    return res.status(200).json("results");
  }

  return res.status(405).end();
}


export default handler;