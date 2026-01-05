"""
Chat routes for DGA Qiyas Copilot
Handles Deep Chat integration, file uploads, and LLM interactions
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import json
import uuid
from datetime import datetime

from backend.core.config import get_settings
from backend.core.database import get_db
from backend.core.factory import get_llm_service, get_search_service, get_storage_service
from backend.api.auth_routes import get_current_user
from backend.models.user import User
from backend.models.chat import ChatSession, ChatMessage

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    """Chat request model"""
    message: str
    session_id: Optional[str] = None
    stream: bool = False
    temperature: float = 0.7
    max_tokens: Optional[int] = None


class ChatResponse(BaseModel):
    """Chat response model"""
    role: str
    content: str
    session_id: str
    attachments: List[dict] = []
    metadata: dict = {}


def get_or_create_session(
    session_id: Optional[str],
    user: User,
    db: Session
) -> ChatSession:
    """
    Get existing chat session or create new one

    Args:
        session_id: Optional session ID
        user: Current user
        db: Database session

    Returns:
        ChatSession: Chat session object
    """
    if session_id:
        # Try to get existing session
        session = db.query(ChatSession).filter(
            ChatSession.session_id == session_id,
            ChatSession.user_id == user.id
        ).first()

        if session:
            return session

    # Create new session
    new_session = ChatSession(
        session_id=str(uuid.uuid4()),
        user_id=user.id,
        title="New Chat"
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return new_session


def build_conversation_history(session: ChatSession, db: Session) -> List[dict]:
    """
    Build conversation history from chat session

    Args:
        session: Chat session
        db: Database session

    Returns:
        List[dict]: List of messages in OpenAI format
    """
    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session.id
    ).order_by(ChatMessage.timestamp.asc()).all()

    return [
        {"role": msg.role, "content": msg.content}
        for msg in messages
    ]


async def process_file_uploads(
    files: List[UploadFile],
    user: User
) -> List[dict]:
    """
    Process uploaded files using storage service

    Args:
        files: List of uploaded files
        user: Current user

    Returns:
        List[dict]: List of file metadata dicts
    """
    storage = get_storage_service()
    uploaded_files = []

    for file in files:
        # Read file content
        file_content = await file.read()

        if storage:
            # Upload to cloud storage
            try:
                uploaded = await storage.upload_file(
                    file_data=file_content,
                    filename=file.filename,
                    content_type=file.content_type,
                    metadata={
                        "uploaded_by": user.username,
                        "upload_time": datetime.utcnow().isoformat()
                    }
                )

                uploaded_files.append({
                    "filename": uploaded.filename,
                    "url": uploaded.url,
                    "size": uploaded.size_bytes,
                    "content_type": uploaded.content_type
                })

            except Exception as e:
                # Log error but don't fail the request
                print(f"File upload error: {str(e)}")
                uploaded_files.append({
                    "filename": file.filename,
                    "error": f"Upload failed: {str(e)}"
                })
        else:
            # Storage not configured - return file info without upload
            uploaded_files.append({
                "filename": file.filename,
                "size": len(file_content),
                "content_type": file.content_type,
                "note": "Storage not configured - file not persisted"
            })

    return uploaded_files


async def enhance_with_rag(query: str, conversation: List[dict]) -> List[dict]:
    """
    Enhance conversation with RAG search results

    Args:
        query: User query
        conversation: Current conversation history

    Returns:
        List[dict]: Enhanced conversation with search context
    """
    search = get_search_service()

    if not search:
        # RAG not configured, return original conversation
        return conversation

    try:
        # Perform semantic search
        results = await search.search(query, top_k=3)

        if results:
            # Build context from search results
            context_parts = ["Here is relevant information from the knowledge base:\n"]

            for i, result in enumerate(results, 1):
                context_parts.append(f"\n{i}. {result.content} (Relevance: {result.score:.2f})")

            context = "".join(context_parts)

            # Add context as system message
            enhanced_conversation = [
                {"role": "system", "content": context}
            ] + conversation

            return enhanced_conversation

    except Exception as e:
        print(f"RAG error: {str(e)}")

    # Return original conversation if RAG fails
    return conversation


@router.post("/", response_model=ChatResponse)
async def chat(
    message: str = Form(...),
    session_id: Optional[str] = Form(None),
    files: List[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Main chat endpoint for Deep Chat integration

    Handles:
    - Text messages
    - File uploads
    - Conversation history
    - RAG enhancement (if configured)
    - LLM response generation

    Example Deep Chat request:
    POST /api/chat
    Content-Type: multipart/form-data

    message: "Can you analyze this document?"
    files: [document.pdf]
    session_id: "abc-123"
    """
    # Check if LLM is configured
    llm = get_llm_service()
    if not llm:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="LLM not configured. Please configure an LLM provider in Settings."
        )

    # Get or create chat session
    session = get_or_create_session(session_id, current_user, db)

    # Process file uploads if any
    uploaded_files = []
    if files:
        uploaded_files = await process_file_uploads(files, current_user)

        # Add file context to message
        if uploaded_files:
            file_context = "\n\nAttached files:\n"
            for f in uploaded_files:
                file_context += f"- {f.get('filename', 'unknown')}\n"
            message += file_context

    # Save user message to database
    user_message = ChatMessage(
        session_id=session.id,
        role="user",
        content=message,
        attachments=uploaded_files
    )
    db.add(user_message)
    db.commit()

    # Build conversation history
    conversation = build_conversation_history(session, db)

    # Enhance with RAG if available
    conversation = await enhance_with_rag(message, conversation)

    try:
        # Generate LLM response
        response_text = await llm.generate_response(
            messages=conversation,
            temperature=0.7,
            max_tokens=None
        )

        # Save assistant response to database
        assistant_message = ChatMessage(
            session_id=session.id,
            role="assistant",
            content=response_text
        )
        db.add(assistant_message)

        # Update session title if it's the first message
        if session.title == "New Chat" and len(conversation) <= 2:
            # Use first few words of user message as title
            session.title = message[:50] + ("..." if len(message) > 50 else "")

        session.updated_at = datetime.utcnow()
        db.commit()

        # Return response
        return ChatResponse(
            role="assistant",
            content=response_text,
            session_id=session.session_id,
            attachments=[],
            metadata={
                "llm_provider": get_settings().llm.active_provider,
                "rag_enabled": get_search_service() is not None,
                "files_uploaded": len(uploaded_files)
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"LLM error: {str(e)}"
        )


@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Streaming chat endpoint for real-time responses

    Returns a Server-Sent Events (SSE) stream
    """
    # Check if LLM is configured
    llm = get_llm_service()
    if not llm:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="LLM not configured"
        )

    # Get or create session
    session = get_or_create_session(request.session_id, current_user, db)

    # Save user message
    user_message = ChatMessage(
        session_id=session.id,
        role="user",
        content=request.message
    )
    db.add(user_message)
    db.commit()

    # Build conversation
    conversation = build_conversation_history(session, db)
    conversation = await enhance_with_rag(request.message, conversation)

    async def event_generator():
        """Generate SSE events for streaming response"""
        full_response = ""

        try:
            async for chunk in llm.generate_response_stream(
                messages=conversation,
                temperature=request.temperature,
                max_tokens=request.max_tokens
            ):
                full_response += chunk
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"

            # Save complete response
            assistant_message = ChatMessage(
                session_id=session.id,
                role="assistant",
                content=full_response
            )
            db.add(assistant_message)
            db.commit()

            # Send completion event
            yield f"data: {json.dumps({'done': True, 'session_id': session.session_id})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )


@router.get("/sessions")
async def get_chat_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all chat sessions for current user"""
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).order_by(ChatSession.updated_at.desc()).all()

    return {
        "status": "success",
        "sessions": [session.to_dict() for session in sessions]
    }


@router.get("/sessions/{session_id}")
async def get_session_history(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get full conversation history for a session"""
    session = db.query(ChatSession).filter(
        ChatSession.session_id == session_id,
        ChatSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session.id
    ).order_by(ChatMessage.timestamp.asc()).all()

    return {
        "status": "success",
        "session": session.to_dict(),
        "messages": [msg.to_dict() for msg in messages]
    }


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a chat session and all its messages"""
    session = db.query(ChatSession).filter(
        ChatSession.session_id == session_id,
        ChatSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    db.delete(session)
    db.commit()

    return {
        "status": "success",
        "message": f"Session {session_id} deleted successfully"
    }
