export default async function handler(req: any, res: any) {
  // Set CORS and high-efficiency cache headers
  if (res?.setHeader) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  }

  if (req?.method === 'OPTIONS') {
    return res.status ? res.status(200).end() : null;
  }

  try {
    return res.status ? res.status(200).json({ success: true, articles: [] }) : null;
  } catch (err: any) {
    return res.status ? res.status(200).json({ success: true, articles: [] }) : null;
  }
}
