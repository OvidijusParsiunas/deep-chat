package com.server.utils.deepChat;

public class OpenAIImageResult {
  private OpenAIImageResultData[] data;
  private OpenAIError error;

  public OpenAIImageResultData[] getData() {
    return this.data;
  }

  public OpenAIError getError() {
    return this.error;
  }
}
