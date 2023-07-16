package com.server.utils.deepChat;

public class CohereGenerateBody {
  private String prompt;

  public CohereGenerateBody(String prompt) {
    this.prompt = prompt;
  }

  public String getPrompt() {
    return this.prompt;
  }
}
