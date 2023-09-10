package com.server.utils.types;

import java.util.List;

public class DeepChatFileResponse {
  private List<DeepChatFile> files;

  public DeepChatFileResponse(List<DeepChatFile> files) {
    if (files != null) {
      this.files = files;
    }
  }

  public List<DeepChatFile> getFiles() {
    return files;
  }
}