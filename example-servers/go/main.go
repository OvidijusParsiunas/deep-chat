package main

import (
	"github.com/joho/godotenv"
	"server/services"
	"net/http"
	"fmt"
	"log"
)


func main() {
	err := godotenv.Load(".env")

  if err != nil {
    log.Fatalf("Error loading .env file")
  }

	http.HandleFunc("/chat", services.ErrorHandler(services.Chat))

	http.HandleFunc("/chat-stream", services.ErrorHandler(services.ChatStream))

	http.HandleFunc("/files", services.ErrorHandler(services.Files))

	http.HandleFunc("/openai-chat", services.ErrorHandler(services.OpenAIChat))

	http.HandleFunc("/openai-chat-stream", services.ErrorHandler(services.OpenAIChatStream))

	http.HandleFunc("/openai-image", services.ErrorHandler(services.OpenAIImage))

	http.HandleFunc("/huggingface-conversation", services.ErrorHandler(services.HuggingFaceConversation))

	http.HandleFunc("/huggingface-image", services.ErrorHandler(services.HuggingFaceImage))

	http.HandleFunc("/huggingface-speech", services.ErrorHandler(services.HuggingFaceSpeech))

	http.HandleFunc("/stability-text-to-image", services.ErrorHandler(services.StabilityAITextToImage))

	http.HandleFunc("/stability-image-to-image", services.ErrorHandler(services.StabilityAIImageToImage))

	http.HandleFunc("/stability-image-upscale", services.ErrorHandler(services.StabilityAIImageToImageUpscale))

	http.HandleFunc("/cohere-chat", services.ErrorHandler(services.CohereChat))

	http.HandleFunc("/cohere-generate", services.ErrorHandler(services.CohereGenerate))

	http.HandleFunc("/cohere-summarize", services.ErrorHandler(services.CohereSummarize))

	fmt.Printf("Starting server at port 8080\n")
	if err := http.ListenAndServe(":8080", nil); err != nil {
			log.Fatal(err)
	}
}