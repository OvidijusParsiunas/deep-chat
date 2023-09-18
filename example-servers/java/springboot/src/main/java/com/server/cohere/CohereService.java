package com.server.cohere;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.util.UriComponentsBuilder;
import com.server.utils.types.CohereChatMessageHistory;
import com.server.utils.types.DeepChatRequestMessage;
import com.server.utils.types.CohereSummarizeResult;
import org.springframework.web.client.RestTemplate;
import com.server.utils.types.CohereGenerateResult;
import com.server.utils.types.CohereSummarizeBody;
import com.server.utils.types.DeepChatRequestBody;
import com.server.utils.types.DeepChatTextRespose;
import com.server.utils.types.CohereGenerateBody;
import com.server.utils.types.CohereChatResult;
import org.springframework.stereotype.Service;
import com.server.utils.types.CohereChatBody;
import com.server.utils.PrintObjectUtil;
import org.springframework.http.*;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;

// Make sure to set the COHERE_API_KEY environment variable in application.properties

@Service
public class CohereService {
  private static final Logger LOGGER = LoggerFactory.getLogger(CohereService.class);

  @Value("${COHERE_API_KEY}")
  private String cohereAPIKey;
  
  public DeepChatTextRespose chat(DeepChatRequestBody requestBody) throws Exception {
    LOGGER.info("Received request body: {}", PrintObjectUtil.toJsonString(requestBody));
    CohereChatBody chatBody = CohereService.createChatBody(requestBody.getMessages());
    RestTemplate restTemplate = new RestTemplate();
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("Authorization", "Bearer " + cohereAPIKey);
    HttpEntity<CohereChatBody> requestEntity = new HttpEntity<>(chatBody, headers);
    UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl("https://api.cohere.ai/v1/chat");

    // Send the request to cohere
    ResponseEntity<CohereChatResult> response = restTemplate.exchange(
      builder.toUriString(), HttpMethod.POST, requestEntity,CohereChatResult.class);

    CohereChatResult responseBody = response.getBody();
    if (responseBody == null) throw new Exception("Unexpected response from Cohere");
    // Sends response back to Deep Chat using the Response format:
    // https://deepchat.dev/docs/connect/#Response
    return new DeepChatTextRespose(responseBody.getText());
  }

  private static CohereChatBody createChatBody(DeepChatRequestMessage[] messages) {
    // Text messages are stored inside request body using the Deep Chat JSON format:
    // https://deepchat.dev/docs/connect
    CohereChatMessageHistory[] chatMessageHistory = new CohereChatMessageHistory[messages.length - 1];
    for (int i = 0; i < messages.length - 1; i++) {
      DeepChatRequestMessage message = messages[i];
      chatMessageHistory[i] = new CohereChatMessageHistory(message.getRole(), message.getText());
    }
    return new CohereChatBody(messages[messages.length - 1].getText(), chatMessageHistory);
  }

  public DeepChatTextRespose generateText(DeepChatRequestBody requestBody) throws Exception {
    LOGGER.info("Received request body: {}", PrintObjectUtil.toJsonString(requestBody));
    CohereGenerateBody generateBody = new CohereGenerateBody(requestBody.getMessages()[0].getText());
    RestTemplate restTemplate = new RestTemplate();
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("Authorization", "Bearer " + cohereAPIKey);
    HttpEntity<CohereGenerateBody> requestEntity = new HttpEntity<>(generateBody, headers);
    UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl("https://api.cohere.ai/v1/generate");

    // Send the request to cohere
    ResponseEntity<CohereGenerateResult> response = restTemplate.exchange(
      builder.toUriString(), HttpMethod.POST, requestEntity,CohereGenerateResult.class);

    CohereGenerateResult responseBody = response.getBody();
    if (responseBody == null) throw new Exception("Unexpected response from Cohere");
    // Sends response back to Deep Chat using the Response format:
    // https://deepchat.dev/docs/connect/#Response
    return new DeepChatTextRespose(responseBody.getGenerations()[0].getText());
  }

  public DeepChatTextRespose summarizeText(DeepChatRequestBody requestBody) throws Exception {
    LOGGER.info("Received request body: {}", PrintObjectUtil.toJsonString(requestBody));
    CohereSummarizeBody summarizeBody = new CohereSummarizeBody(requestBody.getMessages()[0].getText());
    RestTemplate restTemplate = new RestTemplate();
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("Authorization", "Bearer " + cohereAPIKey);
    HttpEntity<CohereSummarizeBody> requestEntity = new HttpEntity<>(summarizeBody, headers);
    UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl("https://api.cohere.ai/v1/summarize");

    // Send the request to cohere
    ResponseEntity<CohereSummarizeResult> response = restTemplate.exchange(
      builder.toUriString(), HttpMethod.POST, requestEntity,CohereSummarizeResult.class);

    CohereSummarizeResult responseBody = response.getBody();
    if (responseBody == null) throw new Exception("Unexpected response from Cohere");
    // Sends response back to Deep Chat using the Response format:
    // https://deepchat.dev/docs/connect/#Response
    return new DeepChatTextRespose(responseBody.getSummary());
  }
}
