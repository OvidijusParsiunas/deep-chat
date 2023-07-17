package services

import (
	"encoding/json"
	"net/http"
	"bytes"
	"fmt"
	"io"
	"os"
)

func CohereGenerate(w http.ResponseWriter, r *http.Request) {
	shouldContinue := ProcessIncomingRequest(&w, r)
	if !shouldContinue { return }

	// Text messages are stored inside request body using the Deep Chat JSON format:
	// https://deepchat.dev/docs/connect
	userRequestBodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		fmt.Println("Failed to read request body:", err)
		http.Error(w, "Failed to read request body", http.StatusInternalServerError)
		return
	}

	var userRequestBody UserRequestBody
	err = json.Unmarshal(userRequestBodyBytes, &userRequestBody)
	if err != nil {
		fmt.Println("Failed to unmarshal request body:", err)
		http.Error(w, "Failed to unmarshal request body", http.StatusInternalServerError)
		return
	}
	fmt.Println("Request Body:", userRequestBody.Messages[0].Text)

	generateBody := CohereGenerateBody{
		Prompt: userRequestBody.Messages[0].Text,
	}

	generateBodyBytes, err := json.Marshal(generateBody)
	if (err != nil) { return }

	req, _ := http.NewRequest("POST", "https://api.cohere.ai/v1/generate", bytes.NewBuffer(generateBodyBytes))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer " + os.Getenv("COHERE_API_KEY"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error when calling Cohere API:", err)
		http.Error(w, "Error when calling Cohere API", http.StatusInternalServerError)
		return
	}
	
	defer resp.Body.Close()

	var resultData CohereGenerateResult
	err = json.NewDecoder(resp.Body).Decode(&resultData)
	if err != nil {
		fmt.Println("Error when decoding Cohere response:", err)
		http.Error(w, "Error when decoding Cohere response", http.StatusInternalServerError)
		return
	}

	if resultData.Message != "" {
    fmt.Println("API error:", resultData.Message)
    http.Error(w, resultData.Message, http.StatusInternalServerError)
    return
	}

	// Create response
	jsonResponse, err := CreateTextResponse(w, resultData.Generations[0].Text)
	if (err != nil) { return }

	// Send response
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}


func CohereSummarize(w http.ResponseWriter, r *http.Request) {
	shouldContinue := ProcessIncomingRequest(&w, r)
	if !shouldContinue { return }

	// Text messages are stored inside request body using the Deep Chat JSON format:
	// https://deepchat.dev/docs/connect
	userRequestBodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		fmt.Println("Failed to read request body:", err)
		http.Error(w, "Failed to read request body", http.StatusInternalServerError)
		return
	}

	var userRequestBody UserRequestBody
	err = json.Unmarshal(userRequestBodyBytes, &userRequestBody)
	if err != nil {
		fmt.Println("Failed to unmarshal request body:", err)
		http.Error(w, "Failed to unmarshal request body", http.StatusInternalServerError)
		return
	}
	fmt.Println("Request Body:", userRequestBody.Messages[0].Text)

	summarizeBody := CohereSummarizeBody{
		Text: userRequestBody.Messages[0].Text,
	}

	summarizeBodyBytes, err := json.Marshal(summarizeBody)
	if (err != nil) { return }

	req, _ := http.NewRequest("POST", "https://api.cohere.ai/v1/summarize", bytes.NewBuffer(summarizeBodyBytes))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer " + os.Getenv("COHERE_API_KEY"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error when calling Cohere API:", err)
		http.Error(w, "Error when calling Cohere API", http.StatusInternalServerError)
		return
	}
	
	defer resp.Body.Close()

	var resultData CohereSummarizeResult
	err = json.NewDecoder(resp.Body).Decode(&resultData)
	if err != nil {
		fmt.Println("Error when calling Cohere API:", err)
		http.Error(w, "Error when calling Cohere API", http.StatusInternalServerError)
		return
	}

	if resultData.Message != "" {
    fmt.Println("API error:", resultData.Message)
    http.Error(w, resultData.Message, http.StatusInternalServerError)
    return
	}

	// Create response
	jsonResponse, err := CreateTextResponse(w, resultData.Summary)
	if (err != nil) { return }

	// Send response
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}