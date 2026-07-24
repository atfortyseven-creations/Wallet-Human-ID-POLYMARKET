import type { NextApiRequest, NextApiResponse } from 'next';
import * as cheerio from 'cheerio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const fetchRes = await fetch(url, {
      headers: {
        'User-Agent': 'WhaleChatBot/1.0 (+https://whale.network)',
      },
    });

    if (!fetchRes.ok) {
      return res.status(fetchRes.status).json({ error: 'Failed to fetch URL' });
    }

    const html = await fetchRes.text();
    const $ = cheerio.load(html);

    const getMetaTag = (name: string) => 
      $(`meta[property="og:${name}"]`).attr('content') || 
      $(`meta[name="twitter:${name}"]`).attr('content') || 
      $(`meta[name="${name}"]`).attr('content');

    const title = getMetaTag('title') || $('title').text() || url;
    const description = getMetaTag('description') || '';
    const image = getMetaTag('image') || '';

    // Cache the preview data for 24 hours
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=43200');
    
    return res.status(200).json({
      title,
      description,
      image,
      url,
    });
  } catch (error) {
    console.error('Link preview error:', error);
    return res.status(500).json({ error: 'Failed to generate link preview' });
  }
}
