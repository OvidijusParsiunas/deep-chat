package com.server.utils.deepChat;

public class CohereGenerateResult {
  private CohereGenerationResult[] generations;
  private String message;

  public CohereGenerationResult[] getGenerations() {
    return this.generations;
  }

  public String getMessage() {
    return this.message;
  }
}
