export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, imageData, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Prepare messages array with system prompt
    const messages = [
      {
        role: 'system',
        content: 'You are Stacky, a helpful AI assistant created by ReturnStack. You are friendly, knowledgeable, and can view and analyze images when they are shared with you.'
      }
    ];

    // Add conversation history
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach(msg => {
        if (msg.sender === 'user') {
          // Handle user messages (with or without images)
          if (msg.image) {
            messages.push({
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: msg.text
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: msg.image
                  }
                }
              ]
            });
          } else {
            messages.push({
              role: 'user',
              content: msg.text
            });
          }
        } else if (msg.sender === 'assistant') {
          messages.push({
            role: 'assistant',
            content: msg.text
          });
        }
      });
    }

    // Add the current message
    if (imageData) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: message
          },
          {
            type: 'image_url',
            image_url: {
              url: imageData
            }
          }
        ]
      });
    } else {
      messages.push({
        role: 'user',
        content: message
      });
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return res.status(response.status).json({ error: 'Failed to get AI response' });
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content;

    if (!aiMessage) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    // Return in the format your app expects
    return res.status(200).json({ reply: aiMessage });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
