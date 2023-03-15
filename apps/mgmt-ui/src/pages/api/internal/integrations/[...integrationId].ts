import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST, APPLICATION_ID, SG_INTERNAL_TOKEN } from '../..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const result = await fetch(`${API_HOST}/internal/v1/integrations/${req.query.integrationId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': APPLICATION_ID,
      'x-sg-internal-token': SG_INTERNAL_TOKEN,
    },
  });

  const r = await result.json();

  return res.status(200).json(r);
}
