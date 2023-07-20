package services

import (
	"encoding/json"
	"net/http"
	"errors"
	"bytes"
	"fmt"
	"io"
	"os"
)

// Make sure to set the COHERE_API_KEY environment variable in a .env file (create if does not exist) - see .env.example

func CohereGenerate(w http.ResponseWriter, r *http.Request) error {
	err := ProcessIncomingRequest(&w, r)
	if err != nil { return err }

	// Text messages are stored inside request body using the Deep Chat JSON format:
	// https://deepchat.dev/docs/connect
	userRequestBodyBytes, err := io.ReadAll(r.Body)
	if err != nil { return err }

	var userRequestBody UserRequestBody
	err = json.Unmarshal(userRequestBodyBytes, &userRequestBody)
	if err != nil { return err }

	fmt.Println("Request Body:", userRequestBody.Messages[0].Text)

	generateBody := CohereGenerateBody{
		Prompt: userRequestBody.Messages[0].Text,
	}

	generateBodyBytes, err := json.Marshal(generateBody)
	if err != nil { return err }

	req, _ := http.NewRequest("POST", "https://api.cohere.ai/v1/generate", bytes.NewBuffer(generateBodyBytes))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer " + os.Getenv("COHERE_API_KEY"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil { return err }
	
	defer resp.Body.Close()

	var resultData CohereGenerateResult
	err = json.NewDecoder(resp.Body).Decode(&resultData)
	if err != nil { return err }

	if resultData.Message != "" {
    return errors.New(resultData.Message)
	}

	// Create response
	jsonResponse, err := CreateTextResponse(w, resultData.Generations[0].Text)
	if err != nil { return err }

	// Send response
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
	return nil
}


func CohereSummarize(w http.ResponseWriter, r *http.Request) error {
	err := ProcessIncomingRequest(&w, r)
	if err != nil { return err }

	// Text messages are stored inside request body using the Deep Chat JSON format:
	// https://deepchat.dev/docs/connect
	userRequestBodyBytes, err := io.ReadAll(r.Body)
	if err != nil { return err }

	var userRequestBody UserRequestBody
	err = json.Unmarshal(userRequestBodyBytes, &userRequestBody)
	if err != nil { return err }
	fmt.Println("Request Body:", userRequestBody.Messages[0].Text)

	summarizeBody := CohereSummarizeBody{
		Text: userRequestBody.Messages[0].Text,
	}

	summarizeBodyBytes, err := json.Marshal(summarizeBody)
	if err != nil { return err }

	req, _ := http.NewRequest("POST", "https://api.cohere.ai/v1/summarize", bytes.NewBuffer(summarizeBodyBytes))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer " + os.Getenv("COHERE_API_KEY"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil { return err }

	defer resp.Body.Close()

	var resultData CohereSummarizeResult
	err = json.NewDecoder(resp.Body).Decode(&resultData)
	if err != nil { return err }

	if resultData.Message != "" {
    return errors.New(resultData.Message)
	}

	// Create response
	jsonResponse, err := CreateTextResponse(w, resultData.Summary)
	if err != nil { return err }

	// Send response
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
	return nil
}