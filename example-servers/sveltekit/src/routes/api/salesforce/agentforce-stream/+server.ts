import type { DeepChatTextRequestBody } from "../../../types/deepChatTextRequestBody";
import type { RequestHandler } from "@sveltejs/kit";
import AgentApiClient from "salesforce-agent-api-client";
import { writable } from 'svelte/store';

export const config = {
  runtime: "edge",
  // this is used to enable streaming
  dynamic: 'force-dynamic'
};

// Make sure to set the SALESFORCE_INSTANCE_URL, SALESFORCE_CLIENT_ID, SALESFORCE_CLIENT_SECRET and SALESFORCE_AGENT_ID environment variable

interface StreamEvent {
  data: string;
  event: string;
}

const salesforceSession = writable<string | null>(null);
let sessionStore: string | null = null;
salesforceSession.subscribe(value => {
  sessionStore = value;
});

export const POST: RequestHandler = async ({ request }) => {
  // Load config from .env file
  const config = {
    instanceUrl: process.env.SALESFORCE_INSTANCE_URL || "",
    clientId: process.env.SALESFORCE_CLIENT_ID || "",
    clientSecret: process.env.SALESFORCE_CLIENT_SECRET || "",
    agentId: process.env.SALESFORCE_AGENT_ID || "",
  };

  // Configure Agent API client
  const client = new AgentApiClient(config);
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

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
    
    // Session Management
    if (sessionStore) {
        sessionId = sessionStore;
    } else {
        sessionId = await client.createSession();
        salesforceSession.set(sessionId);
    }

    // Stream event handler
    function streamEventHandler({ data, event }: StreamEvent) {
        const eventData = JSON.parse(data);
        // console.log('Event:', event);
        
        switch (event) {
            case 'TEXT_CHUNK':
                // Handle TEXT_CHUNK event
                // Write the event data to the stream in Deep Chat format
                console.log('TEXT_CHUNK:', eventData.message?.message);
                writer.write(encoder.encode(`data: ${JSON.stringify({ text: eventData.message?.message || '' })}\n\n`));
                break;
            case 'END_OF_TURN':
                // Handle END_OF_TURN event
                writer.close();
                break;
            case 'INFORM':
                // do nothing for INFORM event
                break;
            default:
                console.log('Unknown event:', eventData);
        }
        
    }

    // Stream disconnect handler
    async function streamDisconnectHandler() {
        if (!writer.closed) {
            writer.close();
        }
    }

    // Send the streaming message
    client.sendStreamingMessage(
        sessionId,
        message,
        [], // Empty array for variables/context
        streamEventHandler,
        streamDisconnectHandler
    );

    return new Response(responseStream.readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache, no-transform',
        },
    });

  } catch (error) {
    console.error("Salesforce Agent API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    // Write error to stream and close it
    writer.write(encoder.encode(`data: ${JSON.stringify({ text: "Error: " + errorMessage })}\n\n`));
    writer.close();
    
    return new Response(responseStream.readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache, no-transform',
        },
    });
  }
};
