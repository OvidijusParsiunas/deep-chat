package com.server.openAI;

import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.bind.annotation.RequestPart;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.buffer.DataBuffer;
import com.server.utils.types.DeepChatRequestMessage;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.server.utils.types.DeepChatFileResponse;
import com.server.utils.types.DeepChatRequestBody;
import com.server.utils.types.DeepChatTextRespose;
import com.server.utils.types.OpenAIChatMessage;
import com.server.utils.types.OpenAIImageResult;
import com.server.utils.types.OpenAIChatResult;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import com.server.utils.types.OpenAIChatBody;
import com.server.utils.types.DeepChatFile;
import java.nio.charset.StandardCharsets;
import com.server.utils.PrintObjectUtil;
import reactor.core.publisher.Flux;
import org.springframework.http.*;
import org.slf4j.LoggerFactory;
import java.util.Collections;
import java.util.Arrays;
import org.slf4j.Logger;
import java.util.List;
import java.util.Map;

// Make sure to set the OPENAI_API_KEY environment variable in application.properties

@Service
public class OpenAIService {
  private static final Logger LOGGER = LoggerFactory.getLogger(OpenAIService.class);

  @Value("${OPENAI_API_KEY}")
  private String openAIAPIKey;
  
  public DeepChatTextRespose chat(DeepChatRequestBody requestBody) throws Exception {
    LOGGER.info("Received request body: {}", PrintObjectUtil.toJsonString(requestBody));
    OpenAIChatBody chatBody = OpenAIService.createOpenAIChatBody(requestBody, false);

    RestTemplate restTemplate = new RestTemplate();
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("Authorization", "Bearer " + openAIAPIKey);
    HttpEntity<OpenAIChatBody> requestEntity = new HttpEntity<>(chatBody, headers);
    UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl("https://api.openai.com/v1/chat/completions");

    // Send the request to openAI
    ResponseEntity<OpenAIChatResult> response = restTemplate.exchange(
      builder.toUriString(), HttpMethod.POST, requestEntity,OpenAIChatResult.class);
    OpenAIChatResult responseBody = response.getBody();
    if (responseBody == null) throw new Exception("Unexpected response from OpenAI");
    // Sends response back to Deep Chat using the Response format:
    // https://deepchat.dev/docs/connect/#Response
    return new DeepChatTextRespose(responseBody.getChoices()[0].getMessage().getContent());
  }

  @SuppressWarnings("unchecked")
  public Flux<DeepChatTextRespose> chatStream(DeepChatRequestBody requestBody) {
    LOGGER.info("Received request body: {}", PrintObjectUtil.toJsonString(requestBody));
    OpenAIChatBody chatRequest = OpenAIService.createOpenAIChatBody(requestBody, true);
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setBearerAuth(openAIAPIKey);
    WebClient client = WebClient.create("https://api.openai.com/v1");
    // Send the request to openAI
    return client.post()
      .uri("/chat/completions")
      .headers(httpHeaders -> httpHeaders.addAll(headers))
      .bodyValue(chatRequest)
      .retrieve()
      .bodyToFlux(DataBuffer.class)
      .map(dataBuffer -> dataBuffer.toString(StandardCharsets.UTF_8))
      .concatMap(chunk -> {
        String[] lines = chunk.split("\n");
        return Flux.fromArray(lines)
          .filter(line -> !line.trim().isEmpty())
          .map(line -> line.replace("data:", "")
            .replace("[DONE]", "")
            .replace("data: [DONE]", "")
            .trim());
      })
      .filter(data -> !data.isEmpty())
      .concatMap(data -> {
        try {
          Map<String, Object> resultObject = null;
          try {
            resultObject = new ObjectMapper().readValue(data, Map.class);
          } catch (JsonProcessingException e) {
            // sometimes OpenAI responds with an incomplete JSON that you don't need to use
            return Flux.just(new DeepChatTextRespose(""));
          }
          StringBuilder delta = new StringBuilder();
          for (Map<String, Object> choice : (List<Map<String, Object>>) resultObject.get("choices")) {
            Map<String, Object> deltaObj = (Map<String, Object>) choice.getOrDefault("delta", Collections.emptyMap());
            delta.append(deltaObj.getOrDefault("content", ""));
          }
          // Sends response back to Deep Chat using the Response format:
          // https://deepchat.dev/docs/connect/#Response
          return Flux.just(new DeepChatTextRespose(delta.toString()));
        } catch (RuntimeException e) {
          LOGGER.error("Error when processing a stream chunk: ", e);
          return null;
        }
    });
  }

  private static OpenAIChatBody createOpenAIChatBody(DeepChatRequestBody requestBody, Boolean stream) {
    // Text messages are stored inside request body using the Deep Chat JSON format:
    // https://deepchat.dev/docs/connect
    DeepChatRequestMessage[] requestMessages = requestBody.getMessages();
    OpenAIChatMessage[] opneAIChatMessages = new OpenAIChatMessage[requestMessages.length];
    for (int i = 0; i < requestMessages.length; i ++) {
      DeepChatRequestMessage requestMessage = requestMessages[i];
      opneAIChatMessages[i] = new OpenAIChatMessage(requestMessage.getRole(), requestMessage.getText());
    }
    return new OpenAIChatBody(opneAIChatMessages, requestBody.getModel(), stream);
  }
  
  // By default - the OpenAI API will accept 1024x1024 png images, however other dimensions/formats can sometimes work by default
  // You can use an example image here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png
  public DeepChatFileResponse imageVariation(@RequestPart("files") List<MultipartFile> files) throws Exception {
    // Files are stored inside a form using Deep Chat request FormData format:
    // https://deepchat.dev/docs/connect
    MultiValueMap<String, Object> formData = new LinkedMultiValueMap<>();
    if (files.size() > 0) {
      org.springframework.web.multipart.MultipartFile imageFile = files.get(0);
      formData.add("image", imageFile.getResource());
    }

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.MULTIPART_FORM_DATA);
    headers.set("Authorization", "Bearer " + openAIAPIKey);
    HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(formData, headers);
    RestTemplate restTemplate = new RestTemplate();
    String url = "https://api.openai.com/v1/images/variations";

    // Send the request to openAI
    ResponseEntity<OpenAIImageResult> responseEntity = restTemplate.exchange(url, HttpMethod.POST, requestEntity, OpenAIImageResult.class);

    OpenAIImageResult responseData = responseEntity.getBody();
    if (responseData == null) throw new Exception("Unexpected response from OpenAI");
    // Sends response back to Deep Chat using the Response format:
    // https://deepchat.dev/docs/connect/#Response
    return new DeepChatFileResponse(Arrays.asList(new DeepChatFile(responseData.getData()[0].getUrl(), "image")));
  }
}
