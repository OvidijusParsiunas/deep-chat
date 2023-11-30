package com.server.stabilityAI;

import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.util.UriComponentsBuilder;
import com.server.utils.types.StabilityAITextToImageBody;
import org.springframework.web.multipart.MultipartFile;
import com.server.utils.types.StabilityAIImageResult;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestTemplate;
import com.server.utils.types.DeepChatFileResponse;
import com.server.utils.types.DeepChatRequestBody;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import com.server.utils.types.DeepChatFile;
import com.server.utils.PrintObjectUtil;
import org.springframework.http.*;
import org.slf4j.LoggerFactory;
import java.util.ArrayList;
import java.util.Arrays;
import org.slf4j.Logger;
import java.util.List;
import java.util.Map;

// Make sure to set the STABILITY_API_KEY environment variable in application.properties

@Service
public class StabilityAIService {
  private static final Logger LOGGER = LoggerFactory.getLogger(StabilityAIService.class);

  @Value("${STABILITY_API_KEY}")
  private String stabilityAIAPIKey;
  
  public DeepChatFileResponse textToImage(DeepChatRequestBody requestBody) throws Exception {
    LOGGER.info("Received request body: {}", PrintObjectUtil.toJsonString(requestBody));
    StabilityAITextToImageBody body = new StabilityAITextToImageBody(requestBody.getMessages()[0].getText());

    RestTemplate restTemplate = new RestTemplate();
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    List<MediaType> acceptableMediaTypes = new ArrayList<>();
    acceptableMediaTypes.add(MediaType.APPLICATION_JSON);
    headers.setAccept(acceptableMediaTypes);
    headers.set("Authorization", "Bearer " + stabilityAIAPIKey);
    HttpEntity<StabilityAITextToImageBody> requestEntity = new HttpEntity<>(body, headers);
    UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl("https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image");

    // Send the request to Stability AI
    ResponseEntity<StabilityAIImageResult> response = restTemplate.exchange(
      builder.toUriString(), HttpMethod.POST, requestEntity,StabilityAIImageResult.class);
    StabilityAIImageResult responseBody = response.getBody();
    if (responseBody == null) throw new Exception("Unexpected response from Stability AI");
    // Sends response back to Deep Chat using the Response format:
    // https://deepchat.dev/docs/connect/#Response
    String base64 = "data:image/png;base64," + responseBody.getArtifacts()[0].getBase64();
    return new DeepChatFileResponse(Arrays.asList(new DeepChatFile(base64, "image")));
  }
  
  // You can use an example image here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png
  public DeepChatFileResponse imageToImage(@RequestPart("files") List<MultipartFile> files, Map<String, String> formDataProperties) throws Exception {
    // Files are stored inside a form using Deep Chat request FormData format:
    // https://deepchat.dev/docs/connect    
    MultiValueMap<String, Object> formData = new LinkedMultiValueMap<>();
    if (files.size() > 0) {
      org.springframework.web.multipart.MultipartFile imageFile = files.get(0);
      formData.add("init_image", imageFile.getResource());
      // When sending text along with files, it is stored inside the request body using the Deep Chat JSON format:
      // https://deepchat.dev/docs/connect
      formData.add("text_prompts[0][text]", formDataProperties.get("message1"));
      formData.add("text_prompts[0][weight]", 1);
    }
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.MULTIPART_FORM_DATA);
    List<MediaType> acceptableMediaTypes = new ArrayList<>();
    acceptableMediaTypes.add(MediaType.APPLICATION_JSON);
    headers.setAccept(acceptableMediaTypes);
    headers.set("Authorization", "Bearer " + stabilityAIAPIKey);
    HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(formData, headers);
    RestTemplate restTemplate = new RestTemplate();
    String url = "https://api.stability.ai/v1/generation/stable-diffusion-v1-6/image-to-image";

    // Send the request to Stability AI
    ResponseEntity<StabilityAIImageResult> responseEntity = restTemplate.exchange(url, HttpMethod.POST, requestEntity, StabilityAIImageResult.class);

    StabilityAIImageResult responseBody = responseEntity.getBody();
    if (responseBody == null) throw new Exception("Unexpected response from Stability AI");
    // Sends response back to Deep Chat using the Response format:
    // https://deepchat.dev/docs/connect/#Response
    String base64 = "data:image/png;base64," + responseBody.getArtifacts()[0].getBase64();
    return new DeepChatFileResponse(Arrays.asList(new DeepChatFile(base64, "image")));
  }

  // You can use an example image here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png
  public DeepChatFileResponse imageToImageUpscale(@RequestPart("files") List<MultipartFile> files) throws Exception {
    // Files are stored inside a form using Deep Chat request FormData format:
    // https://deepchat.dev/docs/connect    
    MultiValueMap<String, Object> formData = new LinkedMultiValueMap<>();
    if (files.size() > 0) {
      org.springframework.web.multipart.MultipartFile imageFile = files.get(0);
      formData.add("image", imageFile.getResource());
    }
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.MULTIPART_FORM_DATA);
    List<MediaType> acceptableMediaTypes = new ArrayList<>();
    acceptableMediaTypes.add(MediaType.APPLICATION_JSON);
    headers.setAccept(acceptableMediaTypes);
    headers.set("Authorization", "Bearer " + stabilityAIAPIKey);
    HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(formData, headers);
    RestTemplate restTemplate = new RestTemplate();
    String url = "https://api.stability.ai/v1/generation/esrgan-v1-x2plus/image-to-image/upscale";

    // Send the request to Stability AI
    ResponseEntity<StabilityAIImageResult> responseEntity = restTemplate.exchange(url, HttpMethod.POST, requestEntity, StabilityAIImageResult.class);

    StabilityAIImageResult responseBody = responseEntity.getBody();
    if (responseBody == null) throw new Exception("Unexpected response from Stability AI");
    // Sends response back to Deep Chat using the Response format:
    // https://deepchat.dev/docs/connect/#Response
    String base64 = "data:image/png;base64," + responseBody.getArtifacts()[0].getBase64();
    return new DeepChatFileResponse(Arrays.asList(new DeepChatFile(base64, "image")));
  }
}
