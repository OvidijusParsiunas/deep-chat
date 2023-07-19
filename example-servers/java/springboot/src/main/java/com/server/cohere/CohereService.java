package com.server.cohere;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.util.UriComponentsBuilder;
import com.server.utils.deepChat.CohereGenerateResult;
import com.server.utils.deepChat.CohereSummarizeBody;
import com.server.utils.deepChat.CohereSummarizeResult;
import com.server.utils.deepChat.DeepChatRequestBody;
import com.server.utils.deepChat.DeepChatTextRespose;
import com.server.utils.deepChat.CohereGenerateBody;
import org.springframework.web.client.RestTemplate;
import org.springframework.stereotype.Service;
import com.server.utils.PrintObjectUtil;
import org.springframework.http.*;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;

@Service
public class CohereService {
  private static final Logger LOGGER = LoggerFactory.getLogger(CohereService.class);

  @Value("${COHERE_API_KEY}")
  private String cohereAPIKey;
  
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
    // Sends response back to Deep Chat using the Result format:
    // https://deepchat.dev/docs/connect/#Result
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
    // Sends response back to Deep Chat using the Result format:
    // https://deepchat.dev/docs/connect/#Result
    return new DeepChatTextRespose(responseBody.getSummary());
  }
}
