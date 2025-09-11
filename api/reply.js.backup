// ============================================================================
// OPENAI API HANDLER - VERCEL SERVERLESS FUNCTION
// ============================================================================
// Handles chat completions with GPT-4o-mini including vision capabilities
// Supports conversation history and image analysis

export default async function handler(req, res) {
  
  // ==========================================================================
  // REQUEST VALIDATION
  // ==========================================================================
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract request data
    const { message, imageData, conversationHistory } = req.body;

    // Validate required message field
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // ==========================================================================
    // MESSAGE PREPARATION FOR OPENAI API
    // ==========================================================================
    
    // Initialize messages array with system prompt
    const messages = [
      {
        role: 'system',
        content: 'You are Stacky, a helpful AI assistant created by ReturnStack. You are friendly, knowledgeable, and can view and analyze images when they are shared with you.'
      }
    ];

    // ==========================================================================
    // CONVERSATION HISTORY PROCESSING
    // ==========================================================================
    
    // Add conversation history to maintain context
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach(msg => {
        if (msg.sender === 'user') {
          // Handle user messages (text only or with images)
          if (msg.image) {
            // User message with image - use vision format
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
            // User message with text only
            messages.push({
              role: 'user',
              content: msg.text
            });
          }
        } else if (msg.sender === 'assistant') {
          // Assistant message - always text only
          messages.push({
            role: 'assistant',
            content: msg.text
          });
        }
      });
    }

    // ==========================================================================
    // CURRENT MESSAGE PROCESSING
    // ==========================================================================
    
    // Add the current message to the conversation
    if (imageData) {
      // Current message includes an image - use vision format
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
      // Current message is text only
      messages.push({
        role: 'user',
        content: message
      });
    }

    // ==========================================================================
    // OPENAI API CALL
    // ==========================================================================
    
    // Make request to OpenAI Chat Completions API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',          // Vision-enabled model
        messages: messages,            // Conversation with system prompt and history
        max_tokens: 1000,             // Response length limit
        temperature: 0.7,             // Creativity/randomness level
        stream: false,                // Non-streaming response
      }),
    });

    // ==========================================================================
    // RESPONSE HANDLING
    // ==========================================================================
    
    // Check for API errors
    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return res.status(response.status).json({ error: 'Failed to get AI response' });
    }

    // Parse successful response
    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content;

    // Validate response content
    if (!aiMessage) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    // ==========================================================================
    // SUCCESS RESPONSE
    // ==========================================================================
    
    // Return formatted response to client
    return res.status(200).json({ reply: aiMessage });

  } catch (error) {
    // ==========================================================================
    // ERROR HANDLING
    // ==========================================================================
    
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
