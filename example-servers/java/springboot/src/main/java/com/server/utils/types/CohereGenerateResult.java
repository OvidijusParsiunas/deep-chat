package com.server.utils.types;

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
