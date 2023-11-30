package services

import (
	"mime/multipart"
	"encoding/json"
	"net/http"
	"errors"
	"bytes"
	"fmt"
	"io"
	"os"
)

// Make sure to set the STABILITY_API_KEY environment variable in a .env file (create if does not exist) - see .env.example

func StabilityAITextToImage(w http.ResponseWriter, r *http.Request) error {
	err, skipPreflight := ProcessIncomingRequest(&w, r)
	if err != nil { return err }
	if skipPreflight { return nil }

	// Text messages are stored inside request body using the Deep Chat JSON format:
	// https://deepchat.dev/docs/connect
	userRequestBodyBytes, err := io.ReadAll(r.Body)
	if err != nil { return err }

	var deepChatRequestBody DeepChatRequestBody
	err = json.Unmarshal(userRequestBodyBytes, &deepChatRequestBody)
	if err != nil { return err }

	fmt.Println("Request Body:", deepChatRequestBody.Messages[0].Text)

	body := StabilityAITextToImageBody{
		TextPrompts: []StabilityAIPromptText{{Text: deepChatRequestBody.Messages[0].Text}},
	}

	bodyBytes, err := json.Marshal(body)
	if err != nil { return err }

	req, err := http.NewRequest("POST", "https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image", bytes.NewBuffer(bodyBytes))
	if err != nil { return err }
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer " + os.Getenv("STABILITY_API_KEY"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil { return err }
	
	defer resp.Body.Close()

	var resultData StabilityAIImageResult
	err = json.NewDecoder(resp.Body).Decode(&resultData)
	if err != nil { return err }

	if resultData.Message != "" {
    return errors.New(resultData.Message)
	}

	// Create response
	jsonResponse, err := CreateImageResponse(w, fmt.Sprintf("data:image/png;base64,%s", resultData.Artifacts[0].Base64))
	if (err != nil) { return err }

	// Send response
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
	return nil
}

// You can use an example image here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image-for-openai.png
func StabilityAIImageToImage(w http.ResponseWriter, r *http.Request) error {
	err, skipPreflight := ProcessIncomingRequest(&w, r)
	if err != nil { return err }
	if skipPreflight { return nil }
	
	// Files are stored inside a form using Deep Chat request FormData format:
	// https://deepchat.dev/docs/connect
	err = r.ParseMultipartForm(32 << 20) // 32MB maximum file size
	if err != nil { return err }
	files := r.MultipartForm.File["files"]
	
	fmt.Println(r.Form.Get("message1"))
	
	if (len(files) == 0) { return errors.New("no file was attached") }
	file, err := files[0].Open()
	if err != nil { return err }

	defer file.Close()

	var buf bytes.Buffer
	multipartWriter := multipart.NewWriter(&buf)
	
	part, err := multipartWriter.CreateFormFile("init_image", files[0].Filename)
	if err != nil { return err }

	_, err = io.Copy(part, file)
	if err != nil { return err }

	// When sending text along with files, it is stored inside the request body using the Deep Chat JSON format:
	// https://deepchat.dev/docs/connect
	var message DeepChatRequestMessage
	err = json.Unmarshal([]byte(r.Form.Get("message1")), &message)
	if err != nil { return err }

	multipartWriter.WriteField("text_prompts[0][text]", message.Text)
	multipartWriter.WriteField("text_prompts[0][weight]", "1")

	err = multipartWriter.Close()
	if err != nil { return nil }

	req, err := http.NewRequest("POST", "https://api.stability.ai/v1/generation/stable-diffusion-v1-6/image-to-image", &buf)
	if err != nil { return err }

	req.Header.Set("Content-Type", multipartWriter.FormDataContentType())
	req.Header.Set("Authorization", "Bearer " + os.Getenv("STABILITY_API_KEY"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil { return err }
	defer resp.Body.Close()

	var resultData StabilityAIImageResult
	err = json.NewDecoder(resp.Body).Decode(&resultData)
	if err != nil { return err }

	if resultData.Message != "" {
    return errors.New(resultData.Message)
	}

	// Create response
	jsonResponse, err := CreateImageResponse(w, fmt.Sprintf("data:image/png;base64,%s", resultData.Artifacts[0].Base64))
	if (err != nil) { return err }

	// Send response
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
	return nil
}

// You can use an example image here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image-for-openai.png
func StabilityAIImageToImageUpscale(w http.ResponseWriter, r *http.Request) error {
	err, skipPreflight := ProcessIncomingRequest(&w, r)
	if err != nil { return err }
	if skipPreflight { return nil }
	
	// Files are stored inside a form using Deep Chat request FormData format:
	// https://deepchat.dev/docs/connect
	err = r.ParseMultipartForm(32 << 20) // 32MB maximum file size
	if err != nil { return err }
	files := r.MultipartForm.File["files"]
	
	fmt.Println(r.Form.Get("message1"))
	
	if (len(files) == 0) { return errors.New("no file was attached") }
	file, err := files[0].Open()
	if err != nil { return err }

	defer file.Close()

	var buf bytes.Buffer
	multipartWriter := multipart.NewWriter(&buf)
	
	part, err := multipartWriter.CreateFormFile("image", files[0].Filename)
	if err != nil { return err }

	_, err = io.Copy(part, file)
	if err != nil { return err }
	
	err = multipartWriter.Close()
	if err != nil { return nil }

	req, err := http.NewRequest("POST", "https://api.stability.ai/v1/generation/esrgan-v1-x2plus/image-to-image/upscale", &buf)
	if err != nil { return err }

	req.Header.Set("Content-Type", multipartWriter.FormDataContentType())
	req.Header.Set("Authorization", "Bearer " + os.Getenv("STABILITY_API_KEY"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil { return err }
	defer resp.Body.Close()

	var resultData StabilityAIImageResult
	err = json.NewDecoder(resp.Body).Decode(&resultData)
	if err != nil { return err }

	if resultData.Message != "" {
    return errors.New(resultData.Message)
	}

	// Create response
	jsonResponse, err := CreateImageResponse(w, fmt.Sprintf("data:image/png;base64,%s", resultData.Artifacts[0].Base64))
	if (err != nil) { return err }

	// Send response
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
	return nil
}