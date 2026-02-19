export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { from, subject, message } = req.body;

  if (!from || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Website <hello@brandonpenn.com>',
      to: 'hello@brandonpenn.com',
      reply_to: from,
      subject: subject || 'New message from brandonpenn.com',
      text: message + '\n\nFrom: ' + from
    })
  });

  if (!response.ok) {
    const error = await response.json();
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}
