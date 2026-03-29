import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

let groq = null;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
}

export const handleChat = async (req, res) => {
  const { message, history } = req.body;

  if (!groq) {
    return res.status(503).json({ 
      message: "Assistant is currently offline. (Missing API Key)" 
    });
  }

  const safeHistory = Array.isArray(history) ? history : [];

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a friendly and helpful Smart assistant for a Reimbursement Management System called ExpenseOS. 
          Your goal is to help users understand expense policies, check status, and navigate the app. 
          Keep your tone warm, professional but approachable. 
          Example: "Hi Ajay, let's get those expenses sorted!" or "I can definitely help you with that travel claim."
          If asked about specific user data, mention that you can help them navigate to the Dashboard to see real-time updates.`
        },
        ...safeHistory,
        {
          role: "user",
          content: message,
        },
      ],
      model: "llama-3.1-8b-instant",
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process that.";
    res.json({
      message: aiResponse,
      response: aiResponse // Added for compatibility with Dashboard
    });
  } catch (error) {
    console.error("Groq API Error:", error);
    res.status(500).json({ message: "AI assistant is taking a short break. Please try again later!" });
  }
};
