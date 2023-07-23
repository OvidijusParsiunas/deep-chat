package com.server.utils.types;

public class CohereGenerateBody {
  private String prompt;

  public CohereGenerateBody(String prompt) {
    this.prompt = prompt;
  }

  public String getPrompt() {
    return this.prompt;
  }
}
