package services

import (
	"mime/multipart"
	"encoding/json"
	"net/http"
	"strings"
	"bytes"
	"bufio"
	"fmt"
	"io"
	"os"
)

func OpenAIChat(w http.ResponseWriter, r *http.Request) {
	shouldContinue := ProcessIncomingRequest(&w, r)
	if !shouldContinue { return }

	chatBodyBytes, err := createChatRequestBodyBytes(w, r, false)
	if err != nil { return }

	req, _ := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(chatBodyBytes))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer " + os.Getenv("OPENAI_API_KEY"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error when calling OpenAI API:", err)
		http.Error(w, "Error when calling OpenAI API", http.StatusInternalServerError)
		return
	}
	
	defer resp.Body.Close()

	var resultData OpenAIChatResult
	err = json.NewDecoder(resp.Body).Decode(&resultData)
	if err != nil {
		fmt.Println("Error when decoding OpenAI response:", err)
		http.Error(w, "Error when decoding OpenAI response", http.StatusInternalServerError)
		return
	}

	if resultData.OpenAIError.Message != "" {
    fmt.Println("API error:", resultData.OpenAIError.Message)
    http.Error(w, resultData.OpenAIError.Message, http.StatusInternalServerError)
    return
	}

	// Create response
	jsonResponse, err := CreateTextResponse(w, resultData.Choices[0].Message.Content)
	if (err != nil) { return }

	// Send response
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}


func OpenAIChatStream(w http.ResponseWriter, r *http.Request) {
	shouldContinue := ProcessIncomingRequest(&w, r)
	if !shouldContinue { return }

	chatBodyBytes, err := createChatRequestBodyBytes(w, r, true)
	if err != nil { return }

	req, _ := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(chatBodyBytes))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer " + os.Getenv("OPENAI_API_KEY"))

	flusher := w.(http.Flusher)
	client := &http.Client{}

	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error when calling OpenAI API:", err)
		http.Error(w, "Error when calling OpenAI API", http.StatusInternalServerError)
		return
	}

	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		line := scanner.Text()
		line = strings.TrimSpace(line)
		if line != "" {
			if strings.HasPrefix(line, "data: [DONE]") { return }
			var result OpenAIStreamResult
			err := json.Unmarshal([]byte(line[6:]), &result)
			if err != nil {
				fmt.Println("Error when unmarshalling response chunk:", err)
				http.Error(w, "Error when unmarshalling response chunk", http.StatusInternalServerError)
				return
			}
			choices := result.Choices
			if len(choices) > 0 {
				// Create response
				jsonResponse, err := CreateTextResponse(w, choices[0].Delta.Content)
				if (err != nil) { return }
				// Send response
				fmt.Fprintf(w, "data: %s\n\n", string(jsonResponse))
				flusher.Flush()
			}
		}
	}
}


func createChatRequestBodyBytes(w http.ResponseWriter, r *http.Request, stream bool) ([]byte, error) {
	// Text messages are stored inside request body using the Deep Chat JSON format:
	// https://deepchat.dev/docs/connect
	userRequestBodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		fmt.Println("Failed to read request body:", err)
		http.Error(w, "Failed to read request body", http.StatusInternalServerError)
		return userRequestBodyBytes, err
	}

	var userRequestBody UserRequestBody
	err = json.Unmarshal(userRequestBodyBytes, &userRequestBody)
	if err != nil {
		fmt.Println("Failed to unmarshal request body:", err)
		http.Error(w, "Failed to unmarshal request body", http.StatusInternalServerError)
		return userRequestBodyBytes, err
	}

	chatBody := createChatBody(userRequestBody, stream)
	return json.Marshal(chatBody)
}

func createChatBody(userRequestBody UserRequestBody, stream bool) OpenAIChatBody {
	chatBody := OpenAIChatBody{
		Messages: make([]OpenAIChatMessage, len(userRequestBody.Messages)),
		Model:    userRequestBody.Model,
	}
	for i, message := range userRequestBody.Messages {
		role := message.Role
		content := message.Text
		updatedRole := role
		if role == "ai" {
			updatedRole = "assistant"
		}
		chatBody.Messages[i] = OpenAIChatMessage{
			Role: updatedRole,
			Content: content,
		}
	}
	if stream {
		chatBody.Stream = true
	}
	return chatBody
}

// By default - the OpenAI API will accept 1024x1024 png images, however other dimensions/formats can sometimes work by default
// You can use an example image here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image-for-openai.png
func OpenAIImage(w http.ResponseWriter, r *http.Request) {
	shouldContinue := ProcessIncomingRequest(&w, r)
	if !shouldContinue { return }

	// Files are stored inside a form using Deep Chat request FormData format:
	// https://deepchat.dev/docs/connect
	err := r.ParseMultipartForm(32 << 20) // 32MB maximum file size
	if err != nil {
		fmt.Println("Failed to read request body:", err)
		http.Error(w, "Failed to read request body", http.StatusInternalServerError)
		return
	}
	files := r.MultipartForm.File["files"]

	jsonResponse := SendImageVariationRequest(w, files)
	if jsonResponse != nil {
		// Send response
		w.Header().Set("Content-Type", "application/json")
		w.Write(jsonResponse)
	}
}

func SendImageVariationRequest(w http.ResponseWriter, files []*multipart.FileHeader) []byte {
	var buf bytes.Buffer
	multipartWriter := multipart.NewWriter(&buf)

	if len(files) > 0 {
		file, err := files[0].Open()
		if err != nil {
			fmt.Println("Failed to read request body:", err)
			http.Error(w, "Failed to read request body", http.StatusInternalServerError)
			return nil
		}

		defer file.Close()

		part, err := multipartWriter.CreateFormFile("image", files[0].Filename)
		if err != nil {
			fmt.Println("Failed to read request body:", err)
			http.Error(w, "Failed to read request body", http.StatusInternalServerError)
			return nil
		}

		_, err = io.Copy(part, file)
		if err != nil {
			fmt.Println("Failed to read request body:", err)
			http.Error(w, "Failed to read request body", http.StatusInternalServerError)
			return nil
		}
	}

	err := multipartWriter.Close()
	if err != nil {
		fmt.Println("Failed to read request body:", err)
		http.Error(w, "Failed to read request body", http.StatusInternalServerError)
		return nil
	}

	req, err := http.NewRequest("POST", "https://api.openai.com/v1/images/variations", &buf)
	if err != nil {
		fmt.Println("Error when calling OpenAI API:", err)
		http.Error(w, "Error when calling OpenAI API", http.StatusInternalServerError)
		return nil
	}

	req.Header.Set("Content-Type", multipartWriter.FormDataContentType())
	req.Header.Set("Authorization", "Bearer "+ os.Getenv("OPENAI_API_KEY"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error when calling OpenAI API:", err)
		http.Error(w, "Error when calling OpenAI API", http.StatusInternalServerError)
		return nil
	}

	defer resp.Body.Close()

	var resultData OpenAIImageResult
	json.NewDecoder(resp.Body).Decode(&resultData)

	if resultData.OpenAIError.Message != "" {
    fmt.Println("API error:", resultData.OpenAIError.Message)
    http.Error(w, resultData.OpenAIError.Message, http.StatusInternalServerError)
    return nil
	}

		// Create response
		jsonResponse, err := CreateImageResponse(w, resultData.Data[0].Url)
		if (err != nil) { return nil }

		return jsonResponse
}
