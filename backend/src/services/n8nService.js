export const dispararWebhook = async (nombreWorkflow, payload) => {
  try {
    const url = `${process.env.N8N_WEBHOOK_URL}${nombreWorkflow}`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, timestamp: new Date().toISOString() }),
    });
  } catch (err) {
    console.error('Error n8n webhook:', err.message);
  }
};
