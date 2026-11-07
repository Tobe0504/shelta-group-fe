import { data, http } from "@/lib/http"
import type { ChatMessage, Conversation, StartChatInput, Thread } from "@/lib/types"

export type ChatScope = "mine" | "support"

export const conversationsService = {
  list: (scope: ChatScope = "mine") => http.get("/conversations", { params: { scope } }).then(data<Conversation[]>),
  unread: () => http.get("/conversations/unread").then(data<{ mine: number; support: number }>),
  thread: (id: string) => http.get(`/conversations/${id}`).then(data<Thread>),
  start: (body: StartChatInput) => http.post("/conversations", body).then(data<{ conversation: Conversation; message: ChatMessage }>),
  send: (id: string, body: string) => http.post(`/conversations/${id}/messages`, { body }).then(data<{ conversation: Conversation; message: ChatMessage }>),
  setStatus: (id: string, status: Conversation["status"]) => http.patch(`/conversations/${id}`, { status }).then(data<Conversation>),
}
