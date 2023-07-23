package com.server.utils.types;

public class CohereChatBody {
  private String query;
  private CohereChatMessageHistory[] chatHistory;

  public CohereChatBody(String query, CohereChatMessageHistory[] chatHistory) {
    this.query = query;
    this.chatHistory = chatHistory;
  }

  public String getQuery() {
    return this.query;
  }

  public CohereChatMessageHistory[] getChatHistory() {
    return this.chatHistory;
  }
}
