# EchoBox AWS Backend Security Audit & Production Hardening Guide

**Audit Date:** October 2026  
**Audited Target:** AWS API Gateway + Lambda + DynamoDB Single-Table Microservice  
**API Endpoint:** `https://bnbpmiljw9.execute-api.ap-south-1.amazonaws.com` (POST `/`)  
**Auditor:** EchoBox Security & Architecture Engineering  

---

## 1. Executive Summary

EchoBox currently features a functional serverless backend provisioned in AWS region `ap-south-1`. All interactions are routed through a single Amazon API Gateway REST/HTTP API triggering an AWS Lambda function with an Amazon DynamoDB database.

While the backend currently supports core functional actions (`create_room`, `get_room`, `submit_feedback`, `get_feedback`, `delete_feedback`, and `close_room`), **it currently lacks authentication, authorization, and rate-limiting boundaries**. 

This document provides a comprehensive security assessment of the backend, documents its current limitations, and outlines the required hardening steps prior to production deployment.

---

## 2. Action-by-Action Security Analysis

| Action | Intended Role | Current Security State | Risk Level |
| :--- | :--- | :--- | :--- |
| `create_room` | Space Owner | **Unauthenticated**. Any caller can create an arbitrary number of rooms. | **High** |
| `get_room` | Public Visitor / Owner | Public read. Returns room metadata (`room_name`, `created_at`, `status`). | **Low** |
| `submit_feedback` | Public Anonymous Visitor | **Unmetered**. No IP rate-limiting, CAPTCHA, or server token validation. Vulnerable to spam flooding. | **High** |
| `get_feedback` | Space Owner | **Unauthenticated**. Anyone possessing a `room_id` can read all feedback items. | **Critical** |
| `delete_feedback` | Space Owner | **Unauthenticated**. Anyone with `room_id` and `feedback_id` can delete messages. | **Critical** |
| `close_room` | Space Owner | **Unauthenticated**. Anyone knowing a `room_id` can close the room. | **Critical** |

---

## 3. Key Vulnerabilities & Infrastructure Limitations

### 3.1 Lack of AWS Cognito Authorization on Private Operations
- **Observation:** The API Gateway does not attach a Cognito User Pool authorizer or custom Lambda authorizer to `POST /`. 
- **Impact:** `get_feedback`, `delete_feedback`, and `close_room` can be executed by anyone using a standard HTTP client if they know or guess the `room_id`.
- **Remediation:** Configure an AWS Cognito User Pool. Associate an API Gateway JWT Authorizer to restrict private actions to authenticated callers. Store an `owner_id` attribute on the DynamoDB `METADATA` record and verify that `requestContext.authorizer.jwt.claims.sub === room.owner_id`.

### 3.2 Unthrottled Anonymous Submissions (`submit_feedback`)
- **Observation:** The backend does not enforce request quotas, WAF rules, or rate limits per IP address.
- **Impact:** An automated script can flood a room with tens of thousands of messages, exhausting DynamoDB Write Capacity Units (WCUs) and bloating storage costs.
- **Remediation:** 
  1. Attach **AWS WAF** to API Gateway with rate-based rules (e.g., maximum 60 requests per 5 minutes per IP).
  2. Implement backend proof-of-work (or Cloudflare Turnstile / reCAPTCHA v3) on submission endpoints.
  3. Enforce payload size validation at the API Gateway Request Validator level (max 4 KB).

### 3.3 Client-Reported Anonymous Session Identity
- **Observation:** The client stores a session ID (`sessionStorage`) and sends an optional `display_name` and `anonymous_session_id`.
- **Limitation:** In the browser, session identity is a **UX-level persona**, not a cryptographic credential. A determined visitor can clear storage or alter their headers to impersonate other pseudonyms.
- **Remediation:** When strict sender identity is needed in the future, the backend should issue an HMAC-signed, server-minted session cookie or ephemeral JWT with an expiration timestamp (`exp: 24h`).

### 3.4 Data Privacy & Network Assertions
- **Reality Check:**
  - Communications in transit are encrypted via **TLS 1.3** using Amazon CloudFront / API Gateway edge certificates.
  - However, **end-to-end encryption (E2EE)** where only the room owner holds the decryption key is **NOT** currently implemented; DynamoDB stores message strings in plaintext.
  - AWS CloudWatch access logs and API Gateway execution logs naturally process incoming IP addresses and request headers for routing and monitoring. Marketing claims stating that "IP addresses are never logged or processed" are inaccurate at the infrastructure level.

---

## 4. Production Hardening Roadmap

### Phase 1: Authentication & Authorization (Mandatory before general availability)
1. Provision **AWS Cognito User Pool** (`echobox-owners-pool`) and App Client.
2. Separate API Gateway routes:
   - `POST /public` (Anonymous actions: `get_room`, `submit_feedback`)
   - `POST /owner` (Secured with Cognito Authorizer: `create_room`, `get_feedback`, `delete_feedback`, `close_room`)
3. Update Lambda handler to check `claims['sub']` against `room['owner_id']`.

### Phase 2: DynamoDB Schema Hardening
```
PK: USER#<CognitoSub>      SK: ROOM#<RoomId>           (Owner room indexing)
PK: ROOM#<RoomId>          SK: METADATA                (Room details + owner_id)
PK: ROOM#<RoomId>          SK: MESSAGE#<Timestamp>#<Id> (Message sorting & pagination)
```

### Phase 3: Abuse Prevention & Rate Limiting
1. Enable **AWS WAF** on the API Gateway stage.
2. Enable API Gateway Request Validation using JSON Schema to reject payloads without valid actions or message length > 2000 chars before invoking Lambda.
3. Configure DynamoDB Auto-Scaling or On-Demand billing with spending alarms.

---

## 5. Frontend Architectural Readiness

The EchoBox frontend has been architected to isolate private functionality behind service interfaces:
- `AuthService` abstraction in `src/context/AuthContext.tsx` can be switched from `DemoAuthServiceImpl` to `CognitoAuthServiceImpl` (using `@aws-amplify/auth` or Amazon Cognito SDK) without changing UI components.
- The Public Room Chat (`/room/:roomId`) requires **zero authentication** and communicates cleanly through the public actions.
- The Owner Dashboard clearly highlights prototype mode so users understand that authorization is not yet enforced on the remote AWS backend.
