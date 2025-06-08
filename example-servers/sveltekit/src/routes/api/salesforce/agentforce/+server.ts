import type { DeepChatTextRequestBody } from "../../../types/deepChatTextRequestBody";
import type { RequestHandler } from "@sveltejs/kit";
import AgentApiClient from "salesforce-agent-api-client";
import { writable } from 'svelte/store';

export const config = {
  runtime: "edge",
};

// Make sure to set the SALESFORCE_INSTANCE_URL, SALESFORCE_CLIENT_ID, SALESFORCE_CLIENT_SECRET and SALESFORCE_AGENT_ID environment variable

// Create a writable store to manage Salesforce session state
// This store holds the session ID for maintaining conversation context
// Initial value is null, indicating no active session
const salesforceSession = writable<string | null>(null);
let sessionStore: string | null = null;
salesforceSession.subscribe(value => {
  sessionStore = value;
});

export const POST: RequestHandler = async ({ request }) => {
  // Load config from env
  const config = {
    instanceUrl: process.env.SALESFORCE_INSTANCE_URL || "",
    clientId: process.env.SALESFORCE_CLIENT_ID || "",
    clientSecret: process.env.SALESFORCE_CLIENT_SECRET || "",
    agentId: process.env.SALESFORCE_AGENT_ID || "",
  };

  // Configure Agent API client
  const client = new AgentApiClient(config);

  try {
    // Authenticate
    await client.authenticate();

    // Get the message from the request
    const messageRequestBody = (await request.json()) as DeepChatTextRequestBody;
    const message = messageRequestBody.messages[messageRequestBody.messages.length - 1].text;

    // Validate that a message was provided in the request
    if (!message) {
      throw new Error("No message provided");
    }

    let sessionId: string;
    
    // Session Management:
    // We either reuse an existing session from the store or create a new one.
    // This helps maintain conversation context and reduces unnecessary session creation.
    if (sessionStore) {
        // Reuse the existing session ID from the store
        sessionId = sessionStore;
    } else {
        // If no session exists, create a new one and store it
        sessionId = await client.createSession();
        salesforceSession.set(sessionId);
    }

    // Send the message to Salesforce Agent API and wait for the synchronous response
    // The empty array parameter is for additional context that might be needed in future
    const syncResponse = await client.sendSyncMessage(sessionId, message, []);

    // Format and return the agent's response
    // If no message is received, provide a fallback response
    return new Response(JSON.stringify({
        text: syncResponse.messages[0].message || "No response received from the Salesforce agent",
    }), {
        headers: { "content-type": "application/json" },
    });

  } catch (error) {
    // Log the full error for debugging purposes
    console.error("Salesforce Agent API Error:", error);
    // Extract error message safely, providing a fallback for non-Error objects
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
        JSON.stringify({
            text: "Error communicating with Salesforce Agent API: " + errorMessage,
        }),
        {
            status: 500,
            headers: {
                "content-type": "application/json",
            },
        }
    );
  }
};
