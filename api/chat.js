// api/chat.js - Vercel Serverless Function
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history = [] } = req.body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Azure OpenAI configuration
    const AZURE_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
    const API_KEY = process.env.AZURE_OPENAI_API_KEY;

    if (!AZURE_ENDPOINT || !API_KEY) {
      console.error('Missing Azure OpenAI configuration');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Prepare system message for university context
    const systemMessage = {
      role: 'system',
      content: `You are a helpful AI assistant for a university. You specialize in providing information about:

🎓 ACADEMIC INFORMATION:
- Admission requirements and application processes
- Course catalogs, program descriptions, and degree requirements
- Academic policies, grading systems, and graduation requirements
- Class schedules, registration procedures, and enrollment information
- Academic support services and tutoring resources

💰 FINANCIAL INFORMATION:
- Tuition fees and payment plans
- Scholarships, grants, and financial aid opportunities
- Work-study programs and student employment
- Payment deadlines and financial policies

🏛️ CAMPUS LIFE:
- Student services and support resources
- Campus facilities, libraries, and laboratories
- Student organizations and extracurricular activities
- Housing and dining options
- Health and wellness services

📋 ADMINISTRATIVE SUPPORT:
- Registration and enrollment procedures
- Academic calendar and important dates
- Student records and transcript requests
- Contact information for departments and offices
- General university policies and procedures

Always provide accurate, helpful, and friendly responses. If you don't know specific information, direct students to contact the appropriate university department. Keep responses concise but comprehensive, and use a warm, professional tone that reflects the university's commitment to student success.

Use emojis sparingly and appropriately to make responses more engaging. Focus on being genuinely helpful and informative.`
    };

    // Prepare conversation messages
    const messages = [
      systemMessage,
      ...history,
      { role: 'user', content: message }
    ];

    // Make request to Azure OpenAI
    const response = await fetch(AZURE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY,
      },
      body: JSON.stringify({
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI Error:', response.status, errorText);
      
      if (response.status === 401) {
        return res.status(500).json({ error: 'Authentication failed with AI service' });
      } else if (response.status === 429) {
        return res.status(429).json({ error: 'AI service is busy. Please try again in a moment.' });
      } else {
        return res.status(500).json({ error: 'AI service temporarily unavailable' });
      }
    }

    const data = await response.json();

    // Extract the response message
    const aiMessage = data.choices?.[0]?.message?.content;

    if (!aiMessage) {
      console.error('Invalid response structure:', data);
      return res.status(500).json({ error: 'Invalid response from AI service' });
    }

    // Log successful interaction (without sensitive data)
    console.log('✅ Successful AI interaction:', {
      messageLength: message.length,
      responseLength: aiMessage.length,
      timestamp: new Date().toISOString()
    });

    // Return the AI response
    return res.status(200).json({
      message: aiMessage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Route Error:', error);
    
    // Return generic error to client
    return res.status(500).json({
      error: 'Internal server error. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
}