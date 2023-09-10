package services

type DeepChatRequestBody struct {
	Messages []DeepChatRequestMessage `json:"messages"`
	Model string `json:"model"`
	Stream bool `json:"stream"`
}

type DeepChatRequestMessage struct {
	Role string `json:"role"`
	Text string `json:"text"`
}

type DeepChatTextResponse struct {
	Text string `json:"text"`
}

type DeepChatFileResponse struct {
	Files []File `json:"files"`
}

type File struct {
	Type string `json:"type"`
	Src  string `json:"src"`
}

type DeepChatErrorResponse struct {
	Error string `json:"error"`
}

type OpenAIChatBody struct {
	Messages []OpenAIChatMessage `json:"messages"`
	Model string `json:"model"`
	Stream bool `json:"stream"`
}

type OpenAIChatMessage struct {
	Role string `json:"role"`
	Content string `json:"content"`
}

type OpenAIChatResult struct {
	Choices []OpenAIChatResultChoice `json:"choices"`
	OpenAIError OpenAIError `json:"error"`
}

type OpenAIChatResultChoice struct {
	Message OpenAIChatResultMessage `json:"message"`
}

type OpenAIChatResultMessage struct {
	Content string `json:"content"`
}

type OpenAIStreamResult struct {
	Choices []OpenAIStreamResultChoice `json:"choices"`
	OpenAIError OpenAIError `json:"error"`
}

type OpenAIStreamResultChoice struct {
	Delta OpenAIStreamResultMessage `json:"delta"`
}

type OpenAIStreamResultMessage struct {
	Content string `json:"content"`
}

type OpenAIImageResult struct {
	Data []OpenAIResultFileData `json:"data"`
	OpenAIError OpenAIError `json:"error"`
}

type OpenAIResultFileData struct {
	Url string `json:"url"`
}

type OpenAIError struct {
	Message string `json:"message"`
}

type CohereChatBody struct {
	Query string `json:"query"`
	ChatHistory []CohereChatHistoryMessage `json:"chat_history"`
}

type CohereChatHistoryMessage struct {
	UserName string `json:"user_name"`
	Text string `json:"text"`
}

type CohereChatResult struct {
	Text string `json:"text"`
	Message string `json:"message"`
}

type CohereGenerateBody struct {
	Prompt string `json:"prompt"`
}

type CohereGenerateResult struct {
	Generations []CohereGenerationResult `json:"generations"`
	Message string `json:"message"`
}

type CohereGenerationResult struct {
	Text string `json:"text"`
}

type CohereSummarizeBody struct {
	Text string `json:"text"`
}

type CohereSummarizeResult struct {
	Summary string `json:"summary"`
	Message string `json:"message"`
}

type HuggingFaceConversationBody struct {
	Inputs HuggingFaceConversationInputs `json:"inputs"`
	WaitForModel bool `json:"wait_for_model"`
}

type HuggingFaceConversationInputs struct {
	PastUserInputs []string `json:"past_user_inputs"`
	GeneratedResponses []string `json:"generated_responses"`
	Text string `json:"text"`
}

type HuggingFaceConversationResult struct {
	GeneratedText string `json:"generated_text"`
	Error string `json:"error"`
}

type HugginFaceImageResultLabel struct {
	Label string `json:"label"`
}

type HugginFaceSpeechResult struct {
	Text string `json:"text"`
}

type HugginFaceFileError struct {
	Error string `json:"error"`
}

type StabilityAITextToImageBody struct {
	TextPrompts []StabilityAIPromptText `json:"text_prompts"`
}

type StabilityAIPromptText struct {
	Text string `json:"text"`
}

type StabilityAIImageResult struct {
	Artifacts []StabilityAIImageArtifact `json:"artifacts"`
	Message string `json:"message"`
}

type StabilityAIImageArtifact struct {
	Base64 string `json:"base64"`
}