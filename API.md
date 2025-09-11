# Customer Returns Chatbot API Documentation

## Overview

The Customer Returns Chatbot API provides a conversational interface for customers to initiate and manage product returns. The API is built on a serverless architecture using AWS Lambda, DynamoDB, and S3.

**Base URL**: `https://x8jxgxag72.execute-api.us-east-1.amazonaws.com/dev-test/api`  
**Local Development**: `http://localhost:3000/api`

## Authentication

The API uses session-based authentication with cryptographically secure session IDs. Sessions are identified by unique session IDs with the format `crs_[43-character-base64url-string]`.

## Core API Endpoints

### 1. Create New Return Session
```http
POST /customer-returns/sessions
```

**Description**: Creates a new customer return session and initializes the chat with an AI-generated greeting message.

**Request Body**:
```json
{
  "order_id": "ORDER_12345",
  "merchant_id": "greenvine",
  "customer_info": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123"
  },
  "initial_message": "I want to return my order"
}
```

**Required Fields**:
- `order_id`: Customer's order identifier
- `customer_info.name`: Customer's full name

**Optional Fields**:
- `merchant_id`: Defaults to "greenvine"
- `customer_info.email`: Customer email (validated if provided)
- `customer_info.phone`: Customer phone number
- `initial_message`: Customer's initial message

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "session_id": "crs_abc123...",
    "merchant_id": "greenvine",
    "order_id": "ORDER_12345",
    "customer_info": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-555-0123"
    },
    "status": "active",
    "current_step": "order_verification",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "messages": [],
    "photos": []
  },
  "initial_message": {
    "type": "bot",
    "message": "Hello! I'm here to help you with your return. Could you please provide the UPC or barcode of the item you're returning? This will help us get started!",
    "metadata": { 
      "step": "order_verification",
      "ai_generated": true,
      "intent": "welcome"
    }
  }
}
```

**Error Responses**:
- `400`: Missing required fields or invalid data
- `500`: Server error

---

### 2. Send Customer Message
```http
POST /customer-returns/sessions/{sessionId}/messages
```

**Description**: Sends a customer message and receives an AI-powered bot response. This is the core conversational endpoint used throughout the chat.

**Path Parameters**:
- `sessionId`: The session ID

**Request Body**:
```json
{
  "message": "098098724618"
}
```

**Required Fields**:
- `message`: The message content (1-2000 characters)

**Response** (200 OK):
```json
{
  "success": true,
  "customer_message": {
    "id": "msg_1705312380000_jkl012mno",
    "timestamp": "2024-01-15T10:33:00.000Z",
    "type": "customer",
    "message": "098098724618",
    "metadata": {
      "step": "order_verification"
    }
  },
  "bot_response": {
    "id": "msg_1705312381000_mno345pqr",
    "timestamp": "2024-01-15T10:33:01.000Z",
    "type": "bot",
    "message": "I found: \"adidas Originals Men's Samoa Jogger Sneaker\" - is this the correct item you want to return? Please reply with 'yes' to confirm or 'no' if this isn't the right item.",
    "metadata": {
      "step": "product_confirmation",
      "ai_generated": true,
      "intent": "product_found"
    }
  },
  "session_updated": true
}
```

**AI-Powered Response Features**:
- All bot responses are generated using OpenAI for natural, contextual conversations
- Responses consider conversation history and current session state
- `ai_generated: true` flag indicates AI-powered responses
- `validation_error: true` flag indicates when customer input needs correction

**Validation Error Response Example**:
```json
{
  "success": true,
  "customer_message": {
    "id": "msg_1705312400000_xyz789abc",
    "timestamp": "2024-01-15T10:35:00.000Z",
    "type": "customer",
    "message": "purple elephant dancing",
    "metadata": { "step": "questions" }
  },
  "bot_response": {
    "id": "msg_1705312401000_abc123xyz",
    "timestamp": "2024-01-15T10:35:01.000Z",
    "type": "bot",
    "message": "I couldn't quite understand that response! 😊 For this question, I need you to choose from the available options. Could you please select either 'y' for yes or 'n' for no?",
    "metadata": {
      "step": "questions",
      "validation_error": true,
      "ai_generated": true,
      "intent": "validation_error"
    }
  },
  "session_updated": true
}
```

**Error Responses**:
- `400`: Missing message content or invalid data
- `404`: Session not found or expired
- `500`: Server error

---

### 3. Upload Photo
```http
POST /customer-returns/sessions/{sessionId}/photos
```

**Description**: Uploads a photo for the return session. Photos are stored in S3 and linked to the session. After uploading 2 photos, the workflow automatically progresses.

**Path Parameters**:
- `sessionId`: The session ID

**Request**: Multipart form data
- `photo`: Image file (max 10MB, JPEG/PNG/GIF)
- `description`: Optional photo description

**Example using FormData**:
```javascript
const formData = new FormData();
formData.append('photo', fileInput.files[0]);
formData.append('description', 'Front view of the item');

fetch('https://x8jxgxag72.execute-api.us-east-1.amazonaws.com/dev-test/api/customer-returns/sessions/crs_abc123.../photos', {
  method: 'POST',
  body: formData
});
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "photo_url": "https://greenvine-returns-customer-photos.s3.us-east-1.amazonaws.com/sessions/crs_abc123.../photo_1705312440000_abc123def.jpg",
    "photo_key": "sessions/crs_abc123.../photo_1705312440000_abc123def.jpg",
    "description": "Front view of the item",
    "uploaded_at": "2024-01-15T10:34:00.000Z"
  },
  "message": "Photo uploaded successfully",
  "workflow_response": {
    "type": "bot",
    "message": "Great! I've received your second photo. Now I'll ask you a few questions about the item's condition to help determine the best return option for you.",
    "metadata": {
      "step": "questions",
      "ai_generated": true,
      "intent": "photo_progress"
    }
  }
}
```

**Error Responses**:
- `400`: No file provided, invalid session ID, or invalid file type
- `404`: Session not found or expired
- `413`: File too large (>10MB)
- `500`: Server error

---

## Additional Endpoints

### 4. Get Session Details
```http
GET /customer-returns/sessions/{sessionId}
```

**Description**: Retrieves current session state, complete chat history, and any current questions.

**Path Parameters**:
- `sessionId`: The session ID (format: `crs_...`)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "session_id": "crs_abc123...",
    "order_id": "ORDER_12345",
    "merchant_id": "greenvine",
    "customer_info": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-555-0123"
    },
    "status": "active",
    "current_step": "questions",
    "messages": [
      {
        "id": "msg_1705312200000_abc123def",
        "timestamp": "2024-01-15T10:30:00.000Z",
        "type": "bot",
        "message": "Hi! I found your order...",
        "metadata": { "step": "greeting" }
      },
      {
        "id": "msg_1705312260000_def456ghi",
        "timestamp": "2024-01-15T10:31:00.000Z",
        "type": "customer",
        "message": "I want to return this item",
        "metadata": { "step": "initial_complaint" }
      }
    ],
    "answers": {},
    "photos": [
      {
        "id": "photo_1705312320000_ghi789jkl",
        "url": "https://s3.amazonaws.com/bucket/photo.jpg",
        "key": "sessions/crs_abc123.../photo.jpg",
        "filename": "item_photo.jpg",
        "description": "Item photo",
        "uploaded_at": "2024-01-15T10:32:00.000Z"
      }
    ],
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:32:00.000Z",
    "completed_at": null,
    "current_question": {
      "id": "item_condition",
      "type": "multiple_choice",
      "message": "How would you describe the condition of the item?",
      "options": [
        { "id": "like_new", "text": "✨ Like new - no visible wear" },
        { "id": "minor_wear", "text": "👍 Minor wear - barely noticeable" },
        { "id": "moderate_wear", "text": "⚠️ Moderate wear - clearly used" },
        { "id": "significant_damage", "text": "❌ Significant damage" }
      ]
    }
  }
}
```

**Error Responses**:
- `400`: Invalid session ID format
- `404`: Session not found or expired
- `500`: Server error

---

### 5. Complete Return Session
```http
POST /customer-returns/sessions/{sessionId}/complete
```

**Description**: Finalizes the customer return session and marks it as completed.

**Path Parameters**:
- `sessionId`: The session ID (format: `crs_...`)

**Request Body**:
```json
{
  "final_disposition": "approved",
  "customer_notes": "Customer satisfied with return process"
}
```

**Optional Fields**:
- `final_disposition`: Final return decision (e.g., "approved", "rejected", "partial")
- `customer_notes`: Additional notes from the customer

**Response** (200 OK):
```json
{
  "success": true,
  "session": {
    "session_id": "crs_abc123...",
    "status": "completed",
    "completed_at": "2024-01-15T10:45:00.000Z",
    "final_disposition": "approved"
  },
  "message": "Return session completed successfully"
}
```

**Error Responses**:
- `404`: Session not found or expired
- `500`: Server error

---

### 6. Get Session Status
```http
GET /customer-returns/sessions/{sessionId}/status
```

**Description**: Gets a summary of session status and progress metrics without full chat history.

**Path Parameters**:
- `sessionId`: The session ID (format: `crs_...`)

**Response** (200 OK):
```json
{
  "success": true,
  "status": {
    "session_id": "crs_abc123...",
    "status": "active",
    "current_step": "questions",
    "next_action": "Answer questions about your item",
    "progress": {
      "total_messages": 12,
      "customer_messages": 6,
      "photos_uploaded": 2,
      "answers_provided": 3
    },
    "timestamps": {
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:42:00.000Z",
      "completed_at": null
    }
  }
}
```

**Error Responses**:
- `400`: Invalid session ID format
- `404`: Session not found or expired
- `500`: Server error

---

## Message Types and Schema

### Chat Message Structure
```json
{
  "id": "msg_[timestamp]_[random]",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "type": "bot|customer|system|photo",
  "message": "Message content",
  "metadata": {
    "step": "current_conversation_step",
    "category": "message_category",
    "question_id": "associated_question_id",
    "ai_generated": true,
    "validation_error": true,
    "intent": "welcome|product_found|validation_error|ask_question|completion",
    "custom_data": {},
    "photo": {
      "url": "https://...",
      "key": "s3-key",
      "filename": "original.jpg",
      "description": "Photo description"
    }
  }
}
```

### AI-Powered Response Metadata
- `ai_generated`: Boolean indicating if the message was generated by OpenAI
- `validation_error`: Boolean indicating if the message is correcting invalid customer input
- `intent`: The purpose of the AI-generated response (welcome, product_found, validation_error, etc.)
- AI responses consider conversation history and provide contextual, empathetic communication

### Session Status Values
- `active`: Session is active and accepting messages
- `completed`: Return process completed
- `expired`: Session has expired
- `cancelled`: Session was cancelled

### Current Step Values
- `order_verification`: Verifying order details
- `product_confirmation`: Confirming found product
- `photo_upload`: Customer uploading photos
- `questions`: Asking return-related questions
- `grading`: Processing/grading the return
- `resolution`: Providing return resolution
- `completed`: Process finished

## AI-Powered Conversational Features

### Natural Language Processing
The chatbot uses OpenAI to:
- **Interpret Customer Answers**: Converts natural language responses ("absolutely", "definitely not") to valid option IDs
- **Generate Contextual Responses**: Creates empathetic, conversation-aware bot messages
- **Handle Validation Errors**: Provides friendly re-prompting when customer input is unclear
- **Maintain Conversation Flow**: Considers chat history for coherent, progressive dialogue

### Response Generation Process
1. **Context Building**: Gathers last 10 messages, session state, and current step
2. **Intent Classification**: Determines response purpose (welcome, validation, question, etc.)
3. **AI Generation**: OpenAI creates natural, customer-friendly response
4. **Fallback Handling**: Uses pre-programmed messages if AI fails
5. **Metadata Enrichment**: Adds `ai_generated`, `intent`, and other flags

### Supported Intents
- `welcome`: Initial greeting and session start
- `product_found`: Product confirmation after UPC lookup
- `product_not_found`: Handling when UPC lookup fails
- `product_confirmed`: Acknowledgment of customer product confirmation
- `photo_progress`: Encouraging photo upload progress
- `ask_question`: Presenting grading questions conversationally
- `validation_error`: Friendly re-prompting for invalid answers
- `completion`: Celebrating successful return completion

## Chatbot Workflow Progression

### Step-by-Step Process
1. **Session Creation**: Customer provides order info, receives AI-generated welcome message
2. **Order Verification**: Customer provides UPC, system looks up product via Keepa API
3. **Product Confirmation**: AI asks customer to confirm the found product
4. **Photo Collection**: AI prompts for 2 photos, tracks progress until both uploaded
5. **Category Determination**: System determines product category (currently defaults to "Everything else")
6. **Grading Questions**: AI presents questions from rules engine one at a time
7. **Answer Validation**: OpenAI interprets natural language answers and maps to valid options
8. **Completion**: AI celebrates successful completion and provides next steps

### Workflow State Management
- **current_step**: Tracks where customer is in the process
- **answers**: Stores validated responses to grading questions
- **photos**: Tracks uploaded images with metadata
- **messages**: Complete conversation log for context

### Natural Language Answer Processing
The system handles customer responses intelligently:
```javascript
// Customer says: "absolutely" or "definitely" → Maps to: "y"
// Customer says: "no way" or "not at all" → Maps to: "n"  
// Customer says: "purple elephant" → Validation error with friendly re-prompt
```

## Frontend Integration Examples

### Creating a New Session
```javascript
async function createReturnSession(orderData) {
  const response = await fetch('https://x8jxgxag72.execute-api.us-east-1.amazonaws.com/dev-test/api/customer-returns/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      order_id: orderData.orderId,
      customer_info: {
        name: orderData.customerName,
        email: orderData.customerEmail,
        phone: orderData.customerPhone
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
}
```

### Sending Messages
```javascript
async function sendMessage(sessionId, message) {
  const response = await fetch(`https://x8jxgxag72.execute-api.us-east-1.amazonaws.com/dev-test/api/customer-returns/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: message,
      metadata: {
        timestamp: new Date().toISOString()
      }
    })
  });

  return await response.json();
}
```

### Uploading Photos
```javascript
async function uploadPhoto(sessionId, file, description = '') {
  const formData = new FormData();
  formData.append('photo', file);
  if (description) {
    formData.append('description', description);
  }

  const response = await fetch(`https://x8jxgxag72.execute-api.us-east-1.amazonaws.com/dev-test/api/customer-returns/sessions/${sessionId}/photos`, {
    method: 'POST',
    body: formData
  });

  return await response.json();
}
```

### Real-time Chat Updates
```javascript
async function pollForUpdates(sessionId, lastMessageId) {
  const session = await fetch(`https://x8jxgxag72.execute-api.us-east-1.amazonaws.com/dev-test/api/customer-returns/sessions/${sessionId}`)
    .then(r => r.json());
  
  const newMessages = session.data.messages.filter(
    msg => msg.id !== lastMessageId && 
           new Date(msg.timestamp) > new Date(lastKnownTimestamp)
  );
  
  return newMessages;
}
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "details": "Additional technical details (in development)"
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created (for new sessions and photos)
- `400`: Bad Request (validation errors, missing fields)
- `404`: Not Found (session not found, invalid endpoints)
- `413`: Payload Too Large (file upload size exceeded)
- `500`: Internal Server Error

## Database Schema Reference

### DynamoDB Table: CustomerReturnSessions

**Table Name**: `customer-return-sessions-local` (local) / `customer-return-sessions` (prod)

**Primary Key**: 
- Partition Key: `session_id` (String)

**Global Secondary Indexes**:
- `merchant-created-index`: Partition Key: `merchant_id`, Sort Key: `created_at`

**Item Structure**:
```json
{
  "session_id": "crs_[base64url-43-chars]",
  "order_id": "ORDER_12345",
  "merchant_id": "greenvine",
  "customer_info": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123"
  },
  "status": "active|completed|expired|cancelled",
  "current_step": "order_verification|product_confirmation|photo_upload|questions|grading|resolution|completed",
  "messages": [
    {
      "id": "msg_[timestamp]_[random]",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "type": "bot|customer|system|photo",
      "message": "Message content",
      "metadata": {}
    }
  ],
  "answers": {},
  "category": "Everything else",
  "current_question_id": "match",
  "photos": [
    {
      "id": "photo_[timestamp]_[random]",
      "url": "https://s3-url",
      "key": "s3-object-key",
      "filename": "original-filename.jpg",
      "description": "Photo description",
      "message_id": "associated-message-id",
      "uploaded_at": "2024-01-15T10:32:00.000Z"
    }
  ],
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:32:00.000Z",
  "completed_at": null
}
```

### S3 Bucket: Customer Return Photos

**Bucket Name**: `greenvine-returns-customer-photos-local` (local) / `greenvine-returns-customer-photos` (prod)

**Object Key Structure**: `sessions/{session_id}/photo_{timestamp}_{random}.{ext}`

**Public Access**: Read-only public access for uploaded photos

**Metadata**:
- `session-id`: Associated session ID
- `upload-type`: "customer-return-photo"
- `original-filename`: Original file name

## Rate Limits and Constraints

- **File Upload**: Max 10MB per photo, 5 photos per request
- **Message Length**: 1-2000 characters
- **Session TTL**: No automatic expiration (managed by application logic)
- **Supported Image Types**: JPEG, PNG, GIF
- **Session ID Format**: `crs_` + 43 characters (base64url)

## Development Notes

- **Local Development**: Server runs on `http://localhost:3000`
- **CORS**: Configured for local development
- **Validation**: All inputs are validated using JSON Schema with AJV
- **AI Integration**: OpenAI GPT for natural language processing and response generation
- **Answer Interpretation**: Intelligent mapping of customer responses to valid option IDs
- **Error Logging**: Comprehensive server-side logging for debugging
- **Testing**: Integration tests available in `server/tests/integration/customerReturns.test.js`

## Support

For technical questions or issues:
1. Check the integration tests for usage examples
2. Review server logs for detailed error information
3. Validate request payloads against the schemas documented above