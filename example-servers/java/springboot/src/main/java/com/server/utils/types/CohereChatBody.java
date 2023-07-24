package com.server.utils.types;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CohereChatBody {
  private String query;
  @JsonProperty("chat_history")
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
