package com.server.utils.types;

public class OpenAIChatMessage {
  private String role;
  private String content;

  public OpenAIChatMessage(String role, String content) {
    this.role = role.equals("ai") ? "assistant" : role;
    this.content = content;
  }

  public String getRole() {
    return this.role;
  }

  public String getContent() {
    return this.content;
  }
}
