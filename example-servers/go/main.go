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

	http.HandleFunc("/chat", services.Chat)

	http.HandleFunc("/chat-stream", services.ChatStream)

	http.HandleFunc("/files", services.Files)

	http.HandleFunc("/openai-chat", services.OpenAIChat)

	http.HandleFunc("/openai-chat-stream", services.OpenAIChatStream)

	http.HandleFunc("/openai-image", services.OpenAIImage)

	http.HandleFunc("/cohere-generate", services.CohereGenerate)

	http.HandleFunc("/cohere-summarize", services.CohereSummarize)

	fmt.Printf("Starting server at port 8080\n")
	if err := http.ListenAndServe(":8080", nil); err != nil {
			log.Fatal(err)
	}
}