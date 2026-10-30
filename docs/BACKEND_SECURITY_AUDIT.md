# EchoBox AWS Backend Security Audit & Implementation Summary

**Audit Date:** October 2026  
**Audited Target:** AWS API Gateway + Lambda (`echobox-backend`) + DynamoDB (`EchoBox`) + AWS Cognito (Dual User Pools)  
**API Endpoint:** `https://<api-id>.execute-api.ap-south-1.amazonaws.com` (POST `/`)  
**Region:** `ap-south-1` (Mumbai)  

---

## 1. Security & Architecture Implementation Summary

EchoBox has been refactored into an **anonymous-first architecture** with dual-tiered authentication:
1. **Public Anonymous Participation**: Zero mandatory credentials, stable browser-session pseudonyms, client-side IP-free guarantees.
2. **Optional "Manage My Posts" Credentials**: Username-only Cognito User Pool (`<identity-user-pool-id>`) allowing users to claim an ID like `echo_7K29XQ` and password without email or personal data collection.
3. **Workspace Owner Authentication**: Email-based Cognito User Pool (`<workspace-user-pool-id>`) protecting workspace rooms and administrative operations.

---

## 2. Action-by-Action Security Matrix

| Action | Intended Role | Authentication | Security Enforcement & Data Boundary |
| :--- | :--- | :--- | :--- |
| `discover_rooms` | Public Visitor | None | Queries `PK: DISCOVERY#PUBLIC`. Only unexpired, active, public rooms returned. Filters private rooms. |
| `search_rooms` | Public Visitor | None | Case-insensitive substring match on `room_name` and `room_description`. Only active, unexpired, public rooms returned. |
| `get_room` | Public Visitor | None | Retrieves room metadata, prompt, status, and message count. |
| `submit_feedback` | Public / Author | Optional JWT | Validates message length (≤ 2000 chars), verifies room exists and is active/unexpired (HTTP 410 if expired). If JWT is passed (from either user pool), indexes post under `PK: USERPOSTS#<sub>` for author management. |
| `get_my_posts` | Post Author | **EchoBox ID JWT** | Validates JWT against issuer `<identity-user-pool-id>`. Queries `PK: USERPOSTS#<sub>`. Returns only caller's submitted posts. |
| `delete_my_post` | Post Author | **EchoBox ID JWT** | Validates `item.author_id == caller["sub"]`. Deletes post from both `ROOM#<room_id>` and `USERPOSTS#<sub>`. Rejects unauthorized deletes with HTTP 403 Forbidden. |
| `create_room` | Public / Owner | Optional JWT | Validates `room_name` (≤ 100 chars), `room_description` (≤ 500 chars), and `visibility` (`public` \| `private`). Public rooms are written to `PK: DISCOVERY#PUBLIC`. If owner JWT present, indexed under `PK: OWNER#<sub>`. |
| `get_owner_rooms` | Room Owner | **Owner JWT** | Queries only `PK: OWNER#<sub>`. Strict isolation between owner accounts. |
| `get_feedback` | Public / Owner | Mixed | If owner token provided, checks `room.owner_id == owner.sub`. If unauthenticated, returns active room conversation. Real-time expiry filtering. |
| `delete_feedback` | Room Owner | **Owner JWT** | Validates `room.owner_id == owner.sub` before deleting item from room. |
| `close_room` | Room Owner | **Owner JWT** | Validates `room.owner_id == owner.sub` before updating status to `closed`. |
| `reopen_room` | Room Owner | **Owner JWT** | Validates `room.owner_id == owner.sub` and checks `now < expires_at` before restoring status to `active`. |

---

## 3. Infrastructure Resources Configured

1. **Amazon Cognito User Pools**:
   - **Workspace Pool (Owners)**: `<workspace-user-pool-id>` (App Client: `<workspace-client-id>`, Email sign-in).
   - **Identity Pool (Manage Posts)**: `<identity-user-pool-id>` (App Client: `<identity-client-id>`, Username sign-in, No email).
   - **PreSignUp Lambda**: `echobox-cognito-pre-signup` auto-confirms signups without verification codes.
2. **Amazon DynamoDB**:
   - Table: `EchoBox`
   - Primary Key: `PK` (String), Sort Key: `SK` (String)
   - TTL Status: `ENABLED` on attribute `expires_at`.
   - Access Patterns:
     - `DISCOVERY#PUBLIC` -> Single-query public room discovery without full table scans.
     - `USERPOSTS#<sub>` -> Strict author-isolated post tracking and deletion.
     - `OWNER#<sub>` -> Strict owner-isolated workspace management.
3. **AWS Lambda**:
   - Function: `echobox-backend` (Python 3.14)
   - IAM Execution Role: `echobox-backend-role-rr2lw8k8` with permissions for DynamoDB and Cognito IDP.
4. **AWS API Gateway**:
   - HTTP API: `<api-id>` (Region: `ap-south-1`)
   - Route: `POST /` with Lambda proxy integration.
