import { Router, type IRouter } from "express";
import { db, conversationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AiChatBody } from "@workspace/api-zod";
import { generateAiInsights, generateAiChatResponse } from "../lib/ai-analysis";
import { randomUUID } from "crypto";

const router: IRouter = Router();

router.post("/ai/chat", async (req, res): Promise<void> => {
  const parsed = AiChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { message, conversationId } = parsed.data;

  // Get or create conversation
  let convId = conversationId ?? randomUUID();
  let existingMessages: { role: string; content: string }[] = [];

  if (conversationId) {
    const [conv] = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.conversationId, conversationId));
    if (conv) {
      existingMessages = conv.messages as { role: string; content: string }[];
    }
  }

  const { response, suggestedPrompts } = generateAiChatResponse(message);

  const newMessages = [
    ...existingMessages,
    { role: "user", content: message },
    { role: "assistant", content: response },
  ];

  // Upsert conversation
  const existing = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.conversationId, convId));

  if (existing.length > 0) {
    await db
      .update(conversationsTable)
      .set({ messages: newMessages, updatedAt: new Date() })
      .where(eq(conversationsTable.conversationId, convId));
  } else {
    await db.insert(conversationsTable).values({
      conversationId: convId,
      messages: newMessages,
    });
  }

  res.json({ response, conversationId: convId, suggestedPrompts });
});

router.get("/ai/insights", async (_req, res): Promise<void> => {
  res.json(generateAiInsights());
});

export default router;
