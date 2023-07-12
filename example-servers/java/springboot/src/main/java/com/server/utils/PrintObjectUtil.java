package com.server.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class PrintObjectUtil {
  private static final ObjectMapper objectMapper = new ObjectMapper();

  public static String toJsonString(Object object) {
    try {
        return objectMapper.writeValueAsString(object);
    } catch (JsonProcessingException e) {
        return "Failed to convert object to JSON string: " + e.getMessage();
    }
  }
}
