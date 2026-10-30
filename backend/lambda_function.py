import json
import boto3
import uuid
import base64
from datetime import datetime, timezone
from decimal import Decimal
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("EchoBox")
cognito_client = boto3.client("cognito-idp", region_name="ap-south-1")

USER_POOL_ID = "ap-south-1_NfCww8cVp"       # Owner User Pool (Email-based)
IDENTITY_POOL_ID = "ap-south-1_vRfOd670T"   # EchoBox ID User Pool (Username-based, anonymous)

VALID_ISSUERS = {
    f"https://cognito-idp.ap-south-1.amazonaws.com/{USER_POOL_ID}",
    f"https://cognito-idp.ap-south-1.amazonaws.com/{IDENTITY_POOL_ID}"
}


def lambda_handler(event, context):
    try:
        raw_body = event.get("body") or "{}"
        if isinstance(raw_body, str) and len(raw_body) > 65536:
            return response(413, {"error": "Request body exceeds maximum allowed size (64KB)"})

        if isinstance(raw_body, dict):
            body = raw_body
        else:
            body = json.loads(raw_body)

        action = body.get("action")
        headers = event.get("headers") or {}

        # 1. Public Actions (Anonymous-first, no credentials mandatory)
        if action == "get_room":
            return get_room(body)
        elif action in ("discover_rooms", "search_rooms"):
            return discover_rooms(body)
        elif action == "submit_feedback":
            user = authenticate_request(headers, body)
            return submit_feedback(body, user)
        elif action == "get_feedback":
            user = authenticate_request(headers, body)
            return get_feedback(body, user)
        elif action == "create_room":
            owner = authenticate_request(headers, body)
            return create_room(body, owner)

        # 2. Authenticated Actions (EchoBox ID / Owner)
        caller = authenticate_request(headers, body)
        if not caller:
            return response(401, {"error": "Unauthorized: Valid EchoBox credentials or session token required"})

        if action == "get_my_posts":
            return get_my_posts(body, caller)
        elif action == "delete_my_post":
            return delete_my_post(body, caller)
        elif action == "get_owner_rooms":
            return get_owner_rooms(body, caller)
        elif action == "delete_feedback":
            return delete_feedback(body, caller)
        elif action == "close_room":
            return close_room(body, caller)
        elif action == "reopen_room":
            return reopen_room(body, caller)
        elif action == "claim_legacy_room":
            return claim_legacy_room(body, caller)
        else:
            return response(400, {"error": f"Invalid action: {action}"})

    except json.JSONDecodeError:
        return response(400, {"error": "Invalid JSON request body"})
    except Exception as e:
        print(f"Unhandled Lambda Error: {str(e)}")
        return response(500, {"error": "Internal server error"})


def authenticate_request(headers, body):
    """
    Extracts and verifies JWT token from Authorization header or body.
    Supports both Owner User Pool and EchoBox ID User Pool.
    Returns caller dict: {'sub': ..., 'username': ..., 'email': ..., 'name': ...} or None.
    """
    auth_header = None
    for k, v in headers.items():
        if k.lower() == "authorization":
            auth_header = v
            break

    token = None
    if auth_header and auth_header.strip():
        parts = auth_header.strip().split(" ")
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1]
        elif len(parts) == 1:
            token = parts[0]

    if not token:
        token = body.get("auth_token") or body.get("token")

    if not token:
        return None

    # First attempt: Cognito get_user (if access token)
    try:
        res = cognito_client.get_user(AccessToken=token)
        attrs = {a["Name"]: a["Value"] for a in res.get("UserAttributes", [])}
        username = res.get("Username", "")
        return {
            "sub": attrs.get("sub") or username,
            "username": username,
            "email": attrs.get("email", ""),
            "name": attrs.get("name") or username
        }
    except Exception:
        pass

    # Second attempt: ID Token decoding & verification
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        payload_b64 = parts[1]
        padded = payload_b64 + "=" * ((4 - len(payload_b64) % 4) % 4)
        claims = json.loads(base64.urlsafe_b64decode(padded).decode("utf-8"))

        now_ts = int(datetime.now(timezone.utc).timestamp())
        if claims.get("exp", 0) < now_ts:
            return None

        # Verify issuer matches one of our active user pools
        if claims.get("iss") not in VALID_ISSUERS:
            return None

        username = claims.get("cognito:username") or claims.get("username") or claims.get("sub")
        return {
            "sub": claims.get("sub"),
            "username": username,
            "email": claims.get("email", ""),
            "name": claims.get("name") or username
        }
    except Exception as e:
        print(f"Token decoding error: {e}")
        return None


def get_current_epoch():
    return int(datetime.now(timezone.utc).timestamp())


def create_room(body, owner=None):
    room_name = (body.get("room_name") or "").strip()
    if not room_name:
        return response(400, {"error": "Room name is required"})

    room_desc = (body.get("room_description") or "").strip()
    if not room_desc:
        return response(400, {"error": "Room description or discussion prompt is required"})

    visibility = (body.get("visibility") or "public").strip().lower()
    if visibility not in ("public", "private"):
        visibility = "public"

    clean_name = room_name[:100]
    clean_desc = room_desc[:1000]
    room_id = uuid.uuid4().hex[:8]
    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()
    now_epoch = int(now.timestamp())
    expires_at = now_epoch + 86400  # Exactly 24-hour lifetime

    owner_id = owner["sub"] if owner else f"anon_{uuid.uuid4().hex[:8]}"
    owner_email = owner.get("email", "") if owner else ""
    owner_username = owner.get("username", "") if owner else ""

    # 1. Main Room Metadata Record
    room_item = {
        "PK": f"ROOM#{room_id}",
        "SK": "METADATA",
        "room_id": room_id,
        "room_name": clean_name,
        "room_description": clean_desc,
        "visibility": visibility,
        "owner_id": owner_id,
        "owner_email": owner_email,
        "owner_username": owner_username,
        "created_at": now_iso,
        "expires_at": expires_at,
        "status": "active"
    }
    table.put_item(Item=room_item)

    # 2. Owner Index Record (if authenticated)
    if owner:
        owner_item = {
            "PK": f"OWNER#{owner_id}",
            "SK": f"ROOM#{room_id}",
            "room_id": room_id,
            "owner_id": owner_id,
            "room_name": clean_name,
            "room_description": clean_desc,
            "visibility": visibility,
            "created_at": now_iso,
            "expires_at": expires_at,
            "status": "active"
        }
        table.put_item(Item=owner_item)

    # 3. Discovery Index Record (if public)
    if visibility == "public":
        discovery_item = {
            "PK": "DISCOVERY#PUBLIC",
            "SK": f"ROOM#{room_id}",
            "room_id": room_id,
            "room_name": clean_name,
            "room_description": clean_desc,
            "visibility": "public",
            "created_at": now_iso,
            "expires_at": expires_at,
            "status": "active"
        }
        table.put_item(Item=discovery_item)

    return response(201, {
        "message": "Room created successfully",
        "room_id": room_id,
        "room_name": clean_name,
        "room_description": clean_desc,
        "visibility": visibility,
        "created_at": now_iso,
        "expires_at": expires_at,
        "status": "active"
    })


def discover_rooms(body):
    search_query = (body.get("search") or body.get("q") or "").strip().lower()
    now_epoch = get_current_epoch()

    res = table.query(
        KeyConditionExpression=Key("PK").eq("DISCOVERY#PUBLIC"),
        ScanIndexForward=False
    )
    items = res.get("Items", [])
    while "LastEvaluatedKey" in res:
        res = table.query(
            KeyConditionExpression=Key("PK").eq("DISCOVERY#PUBLIC"),
            ScanIndexForward=False,
            ExclusiveStartKey=res["LastEvaluatedKey"]
        )
        items.extend(res.get("Items", []))

    public_rooms = []
    for item in items:
        exp = int(item.get("expires_at", 0))
        status = item.get("status", "active")
        if (exp and now_epoch >= exp) or status in ("expired", "closed"):
            continue

        name = item.get("room_name", "")
        desc = item.get("room_description", "")
        if search_query and (search_query not in name.lower() and search_query not in desc.lower()):
            continue

        room_id = item.get("room_id")
        # Count messages
        count_res = table.query(
            KeyConditionExpression=Key("PK").eq(f"ROOM#{room_id}") & Key("SK").begins_with("FEEDBACK#"),
            Select="COUNT"
        )
        msg_count = count_res.get("Count", 0)

        public_rooms.append({
            "room_id": room_id,
            "room_name": name,
            "room_description": desc,
            "visibility": "public",
            "status": status,
            "created_at": item.get("created_at"),
            "expires_at": exp,
            "message_count": msg_count,
            "feedback_count": msg_count
        })

    return response(200, {
        "rooms": public_rooms,
        "count": len(public_rooms)
    })


def get_room(body):
    room_id = body.get("room_id")
    if not room_id:
        return response(400, {"error": "room_id is required"})

    clean_id = room_id.strip()
    result = table.get_item(Key={"PK": f"ROOM#{clean_id}", "SK": "METADATA"})
    room = result.get("Item")
    if not room:
        return response(404, {"error": "Room not found"})

    now_epoch = get_current_epoch()
    expires_at = int(room.get("expires_at", 0))

    if not expires_at and room.get("created_at"):
        try:
            created_dt = datetime.fromisoformat(room["created_at"])
            expires_at = int(created_dt.timestamp()) + 86400
            room["expires_at"] = expires_at
        except Exception:
            expires_at = now_epoch + 86400

    # Ensure backward-compatible defaults for legacy rooms
    if "room_description" not in room or not room["room_description"]:
        room["room_description"] = "Open discussion & anonymous feedback."
    if "visibility" not in room:
        room["visibility"] = "public"

    # Expiry evaluation
    if expires_at and now_epoch >= expires_at:
        room["status"] = "expired"
        room["is_expired"] = True
    else:
        room["is_expired"] = False

    # Fetch message count
    count_res = table.query(
        KeyConditionExpression=Key("PK").eq(f"ROOM#{clean_id}") & Key("SK").begins_with("FEEDBACK#"),
        Select="COUNT"
    )
    room["message_count"] = count_res.get("Count", 0)

    return response(200, {"room": room})


def submit_feedback(body, user=None):
    room_id = body.get("room_id")
    message = body.get("message")
    display_name = body.get("display_name")
    anonymous_session_id = body.get("anonymous_session_id")

    if not room_id or not isinstance(message, str) or not message.strip():
        return response(400, {"error": "room_id and message are required"})

    clean_id = room_id.strip()
    clean_msg = message.strip()
    if len(clean_msg) > 2000:
        return response(400, {"error": "Message must be under 2000 characters"})

    result = table.get_item(Key={"PK": f"ROOM#{clean_id}", "SK": "METADATA"})
    room = result.get("Item")
    if not room:
        return response(404, {"error": "Room not found"})

    now_epoch = get_current_epoch()
    expires_at = int(room.get("expires_at", 0))
    if not expires_at and room.get("created_at"):
        try:
            created_dt = datetime.fromisoformat(room["created_at"])
            expires_at = int(created_dt.timestamp()) + 86400
        except Exception:
            expires_at = now_epoch + 86400

    if expires_at and now_epoch >= expires_at:
        return response(410, {"error": "This room has expired (24-hour limit reached) and is no longer accepting messages."})

    if room.get("status") == "closed":
        return response(403, {"error": "This room has been closed by its owner."})

    clean_name = (display_name or "Anonymous").strip()[:50]
    clean_sess = (anonymous_session_id or f"sess_{uuid.uuid4().hex[:12]}").strip()[:64]
    feedback_id = uuid.uuid4().hex[:12]
    now_iso = datetime.now(timezone.utc).isoformat()

    author_id = user["sub"] if user else None
    echobox_id = user.get("username") if user else None

    feedback_item = {
        "PK": f"ROOM#{clean_id}",
        "SK": f"FEEDBACK#{feedback_id}",
        "feedback_id": feedback_id,
        "message": clean_msg,
        "created_at": now_iso,
        "display_name": clean_name,
        "anonymous_session_id": clean_sess,
        "expires_at": expires_at,
        "author_id": author_id,
        "echobox_id": echobox_id
    }
    table.put_item(Item=feedback_item)

    # Optional: If author has EchoBox ID credentials, index under their profile for Manage My Posts
    if author_id:
        post_index_item = {
            "PK": f"USERPOSTS#{author_id}",
            "SK": f"MSG#{clean_id}#{feedback_id}",
            "feedback_id": feedback_id,
            "room_id": clean_id,
            "room_name": room.get("room_name", "Untitled Space"),
            "message": clean_msg,
            "display_name": clean_name,
            "created_at": now_iso,
            "expires_at": expires_at,
            "status": "active"
        }
        table.put_item(Item=post_index_item)

    return response(201, {
        "message": "Feedback submitted successfully",
        "feedback_id": feedback_id,
        "display_name": clean_name,
        "anonymous_session_id": clean_sess,
        "created_at": now_iso,
        "echobox_id": echobox_id
    })


def get_feedback(body, user=None):
    room_id = body.get("room_id")
    if not room_id:
        return response(400, {"error": "room_id is required"})

    clean_id = room_id.strip()
    result = table.get_item(Key={"PK": f"ROOM#{clean_id}", "SK": "METADATA"})
    room = result.get("Item")
    if not room:
        return response(404, {"error": "Room not found"})

    # If owner token supplied and room has owner, enforce owner boundary
    if user and room.get("owner_id") and not room.get("owner_id").startswith("anon_") and room.get("owner_id") != user["sub"]:
        # Only block if caller is specifically accessing from private owner dashboard
        if body.get("owner_mode"):
            return response(403, {"error": "Forbidden: You do not have permission to view messages for this room."})

    now_epoch = get_current_epoch()
    expires_at = int(room.get("expires_at", 0))

    query_res = table.query(
        KeyConditionExpression=Key("PK").eq(f"ROOM#{clean_id}") & Key("SK").begins_with("FEEDBACK#"),
        ScanIndexForward=True
    )
    items = query_res.get("Items", [])
    while "LastEvaluatedKey" in query_res:
        query_res = table.query(
            KeyConditionExpression=Key("PK").eq(f"ROOM#{clean_id}") & Key("SK").begins_with("FEEDBACK#"),
            ScanIndexForward=True,
            ExclusiveStartKey=query_res["LastEvaluatedKey"]
        )
        items.extend(query_res.get("Items", []))

    valid_feedback = []
    for item in items:
        item_exp = int(item.get("expires_at", 0))
        if item_exp and now_epoch >= item_exp:
            continue
        valid_feedback.append(item)

    valid_feedback.sort(key=lambda x: x.get("created_at", ""))

    return response(200, {
        "room_id": clean_id,
        "count": len(valid_feedback),
        "feedback": valid_feedback,
        "expires_at": expires_at,
        "status": room.get("status")
    })


def get_my_posts(body, user):
    """
    Manage My Posts: Retrieves all messages submitted by the authenticated EchoBox ID.
    Strictly isolated to caller["sub"].
    """
    user_id = user["sub"]
    now_epoch = get_current_epoch()

    res = table.query(
        KeyConditionExpression=Key("PK").eq(f"USERPOSTS#{user_id}") & Key("SK").begins_with("MSG#"),
        ScanIndexForward=False
    )
    items = res.get("Items", [])
    while "LastEvaluatedKey" in res:
        res = table.query(
            KeyConditionExpression=Key("PK").eq(f"USERPOSTS#{user_id}") & Key("SK").begins_with("MSG#"),
            ScanIndexForward=False,
            ExclusiveStartKey=res["LastEvaluatedKey"]
        )
        items.extend(res.get("Items", []))

    valid_posts = []
    for item in items:
        exp = int(item.get("expires_at", 0))
        if exp and now_epoch >= exp:
            continue

        valid_posts.append({
            "feedback_id": item.get("feedback_id"),
            "room_id": item.get("room_id"),
            "room_name": item.get("room_name", "Untitled Space"),
            "message": item.get("message"),
            "display_name": item.get("display_name"),
            "created_at": item.get("created_at"),
            "expires_at": exp,
            "status": item.get("status", "active")
        })

    return response(200, {
        "posts": valid_posts,
        "count": len(valid_posts),
        "echobox_id": user.get("username") or user.get("name")
    })


def delete_my_post(body, user):
    """
    Manage My Posts: Allows a user to delete their own submitted message.
    Strictly verifies item.author_id == caller["sub"].
    """
    user_id = user["sub"]
    room_id = (body.get("room_id") or "").strip()
    feedback_id = (body.get("feedback_id") or "").strip()

    if not room_id or not feedback_id:
        return response(400, {"error": "room_id and feedback_id are required"})

    res = table.get_item(Key={"PK": f"ROOM#{room_id}", "SK": f"FEEDBACK#{feedback_id}"})
    item = res.get("Item")
    if not item:
        # Also clean up from user index if orphaned
        table.delete_item(Key={"PK": f"USERPOSTS#{user_id}", "SK": f"MSG#{room_id}#{feedback_id}"})
        return response(404, {"error": "Post not found or already deleted"})

    if item.get("author_id") != user_id:
        return response(403, {"error": "Forbidden: You can only delete your own submitted messages."})

    # Delete from room
    table.delete_item(Key={"PK": f"ROOM#{room_id}", "SK": f"FEEDBACK#{feedback_id}"})
    # Delete from user index
    table.delete_item(Key={"PK": f"USERPOSTS#{user_id}", "SK": f"MSG#{room_id}#{feedback_id}"})

    return response(200, {
        "message": "Message deleted successfully",
        "feedback_id": feedback_id
    })


def get_owner_rooms(body, owner):
    owner_id = owner["sub"]
    now_epoch = get_current_epoch()

    result = table.query(
        KeyConditionExpression=Key("PK").eq(f"OWNER#{owner_id}") & Key("SK").begins_with("ROOM#"),
        ScanIndexForward=False
    )
    items = result.get("Items", [])

    rooms = []
    for item in items:
        room_id = item.get("room_id")
        expires_at = int(item.get("expires_at", 0))

        status = item.get("status", "active")
        is_expired = False
        if expires_at and now_epoch >= expires_at:
            status = "expired"
            is_expired = True

        count_res = table.query(
            KeyConditionExpression=Key("PK").eq(f"ROOM#{room_id}") & Key("SK").begins_with("FEEDBACK#"),
            Select="COUNT"
        )
        msg_count = count_res.get("Count", 0)

        rooms.append({
            "room_id": room_id,
            "room_name": item.get("room_name", "Untitled Room"),
            "room_description": item.get("room_description", ""),
            "visibility": item.get("visibility", "public"),
            "created_at": item.get("created_at"),
            "expires_at": expires_at,
            "status": status,
            "is_expired": is_expired,
            "message_count": msg_count,
            "feedback_count": msg_count
        })

    return response(200, {
        "rooms": rooms,
        "count": len(rooms)
    })


def delete_feedback(body, owner):
    room_id = body.get("room_id")
    feedback_id = body.get("feedback_id")
    if not room_id or not feedback_id:
        return response(400, {"error": "room_id and feedback_id are required"})

    clean_id = room_id.strip()
    clean_fb_id = feedback_id.strip()

    result = table.get_item(Key={"PK": f"ROOM#{clean_id}", "SK": "METADATA"})
    room = result.get("Item")
    if not room:
        return response(404, {"error": "Room not found"})

    if room.get("owner_id") and room.get("owner_id") != owner["sub"]:
        return response(403, {"error": "Forbidden: You do not own this room."})

    delete_res = table.delete_item(
        Key={"PK": f"ROOM#{clean_id}", "SK": f"FEEDBACK#{clean_fb_id}"},
        ReturnValues="ALL_OLD"
    )
    if not delete_res.get("Attributes"):
        return response(404, {"error": "Feedback message not found"})

    return response(200, {"message": "Feedback deleted successfully"})


def close_room(body, owner):
    room_id = body.get("room_id")
    if not room_id:
        return response(400, {"error": "room_id is required"})

    clean_id = room_id.strip()
    result = table.get_item(Key={"PK": f"ROOM#{clean_id}", "SK": "METADATA"})
    room = result.get("Item")
    if not room:
        return response(404, {"error": "Room not found"})

    owner_id = owner["sub"]
    if room.get("owner_id") and room.get("owner_id") != owner_id:
        return response(403, {"error": "Forbidden: You do not own this room."})

    up_res = table.update_item(
        Key={"PK": f"ROOM#{clean_id}", "SK": "METADATA"},
        UpdateExpression="SET #status = :status",
        ExpressionAttributeNames={"#status": "status"},
        ExpressionAttributeValues={":status": "closed"},
        ReturnValues="ALL_NEW"
    )

    try:
        table.update_item(
            Key={"PK": f"OWNER#{owner_id}", "SK": f"ROOM#{clean_id}"},
            UpdateExpression="SET #status = :status",
            ExpressionAttributeNames={"#status": "status"},
            ExpressionAttributeValues={":status": "closed"}
        )
    except Exception:
        pass

    try:
        table.update_item(
            Key={"PK": "DISCOVERY#PUBLIC", "SK": f"ROOM#{clean_id}"},
            UpdateExpression="SET #status = :status",
            ExpressionAttributeNames={"#status": "status"},
            ExpressionAttributeValues={":status": "closed"}
        )
    except Exception:
        pass

    return response(200, {
        "message": "Room closed successfully",
        "room": up_res.get("Attributes")
    })


def reopen_room(body, owner):
    room_id = body.get("room_id")
    if not room_id:
        return response(400, {"error": "room_id is required"})

    clean_id = room_id.strip()
    result = table.get_item(Key={"PK": f"ROOM#{clean_id}", "SK": "METADATA"})
    room = result.get("Item")
    if not room:
        return response(404, {"error": "Room not found"})

    owner_id = owner["sub"]
    if room.get("owner_id") and room.get("owner_id") != owner_id:
        return response(403, {"error": "Forbidden: You do not own this room."})

    now_epoch = get_current_epoch()
    expires_at = int(room.get("expires_at", 0))
    if expires_at and now_epoch >= expires_at:
        return response(410, {"error": "This room has exceeded its 24-hour lifetime and cannot be reopened."})

    up_res = table.update_item(
        Key={"PK": f"ROOM#{clean_id}", "SK": "METADATA"},
        UpdateExpression="SET #status = :status",
        ExpressionAttributeNames={"#status": "status"},
        ExpressionAttributeValues={":status": "active"},
        ReturnValues="ALL_NEW"
    )

    try:
        table.update_item(
            Key={"PK": f"OWNER#{owner_id}", "SK": f"ROOM#{clean_id}"},
            UpdateExpression="SET #status = :status",
            ExpressionAttributeNames={"#status": "status"},
            ExpressionAttributeValues={":status": "active"}
        )
    except Exception:
        pass

    if room.get("visibility") == "public":
        try:
            table.update_item(
                Key={"PK": "DISCOVERY#PUBLIC", "SK": f"ROOM#{clean_id}"},
                UpdateExpression="SET #status = :status",
                ExpressionAttributeNames={"#status": "status"},
                ExpressionAttributeValues={":status": "active"}
            )
        except Exception:
            pass

    return response(200, {
        "message": "Room reopened successfully",
        "room": up_res.get("Attributes")
    })


def claim_legacy_room(body, owner):
    room_id = body.get("room_id")
    if not room_id:
        return response(400, {"error": "room_id is required"})

    clean_id = room_id.strip()
    result = table.get_item(Key={"PK": f"ROOM#{clean_id}", "SK": "METADATA"})
    room = result.get("Item")
    if not room:
        return response(404, {"error": "Room not found"})

    owner_id = owner["sub"]
    existing_owner = room.get("owner_id")
    if existing_owner and not existing_owner.startswith("anon_") and existing_owner != owner_id:
        return response(403, {"error": "This room is already owned by another account."})

    now_epoch = get_current_epoch()
    expires_at = int(room.get("expires_at", 0)) or (now_epoch + 86400)

    table.update_item(
        Key={"PK": f"ROOM#{clean_id}", "SK": "METADATA"},
        UpdateExpression="SET owner_id = :oid, owner_email = :oem, expires_at = :exp",
        ExpressionAttributeValues={
            ":oid": owner_id,
            ":oem": owner.get("email", ""),
            ":exp": expires_at
        }
    )

    table.put_item(Item={
        "PK": f"OWNER#{owner_id}",
        "SK": f"ROOM#{clean_id}",
        "room_id": clean_id,
        "owner_id": owner_id,
        "room_name": room.get("room_name", "Untitled Room"),
        "room_description": room.get("room_description", ""),
        "created_at": room.get("created_at", datetime.now(timezone.utc).isoformat()),
        "expires_at": expires_at,
        "status": room.get("status", "active")
    })

    return response(200, {
        "message": "Room successfully claimed into your workspace",
        "room_id": clean_id
    })


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super(DecimalEncoder, self).default(obj)


def response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
        },
        "body": json.dumps(body, cls=DecimalEncoder)
    }
