import os
import json
import hashlib
import time
import uuid
from typing import Dict, Optional

import boto3
from botocore.exceptions import ClientError

# Environment configuration: set ENV to 'DEV', 'HOM' or 'MAIN'
ENV = os.getenv("APP_ENV", "DEV").upper()

# Resource name patterns (customize conforme sua convenção)
S3_BUCKET = os.getenv("S3_BUCKET", f"memories-{ENV.lower()}-media")
DDB_TABLE = os.getenv("DDB_TABLE", f"memories-{ENV.lower()}-metadata")
SQS_UPLOAD_QUEUE = os.getenv("SQS_UPLOAD_QUEUE", f"memories-{ENV.lower()}-upload-queue")
SQS_REQUEST_QUEUE = os.getenv("SQS_REQUEST_QUEUE", f"memories-{ENV.lower()}-request-queue")
SQS_STORAGE_QUEUE = os.getenv("SQS_STORAGE_QUEUE", f"memories-{ENV.lower()}-storage-queue")  # se precisar

# boto3 clients (assume role/permissions no ambiente Lambda)
s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")
sqs = boto3.client("sqs")

# Helper to resolve queue URL by name
def get_queue_url_by_name(queue_name: str) -> Optional[str]:
    try:
        resp = sqs.get_queue_url(QueueName=queue_name)
        return resp["QueueUrl"]
    except ClientError:
        return None

# Generate a deterministic memory ID
def generate_memory_id(user_id: str, media_type: str, theme: str, location: Optional[str], timestamp: Optional[float] = None) -> str:
    ts = timestamp or time.time()
    base = f"{user_id}|{ts}|{media_type}|{theme}|{location or ''}"
    h = hashlib.sha1(base.encode("utf-8")).hexdigest()[:12]
    return f"{user_id}-{int(ts)}-{media_type[:3]}-{h}"

# Upload file bytes to S3 and return object key
def upload_to_s3(file_bytes: bytes, key: str, content_type: str = "application/octet-stream") -> Dict:
    try:
        s3.put_object(Bucket=S3_BUCKET, Key=key, Body=file_bytes, ContentType=content_type)
        return {"bucket": S3_BUCKET, "key": key, "url": f"s3://{S3_BUCKET}/{key}"}
    except ClientError as e:
        raise

# Store metadata in DynamoDB
def put_metadata(metadata: Dict):
    table = dynamodb.Table(DDB_TABLE)
    table.put_item(Item=metadata)

# Send message to SQS queue
def send_sqs_message(queue_name: str, message_body: Dict):
    url = get_queue_url_by_name(queue_name)
    if not url:
        raise RuntimeError(f"Queue {queue_name} not found")
    sqs.send_message(QueueUrl=url, MessageBody=json.dumps(message_body))

# API / Lambda handler for upload (simulado)
def handler_upload(event, context=None):
    """
    Expected event (from API Gateway):
    {
      "user_id": "user123",
      "media_type": "image"|"video"|"text",
      "theme": "beach",
      "location": "Rio de Janeiro",
      "description": "My trip",
      "file_name": "photo.jpg",          # optional for text-only
      "file_bytes_base64": "...",        # base64-encoded bytes for media
      "content_type": "image/jpeg"
    }
    """
    body = event if isinstance(event, dict) else json.loads(event.get("body", "{}"))
    user_id = body["user_id"]
    media_type = body.get("media_type", "text")
    theme = body.get("theme", "general")
    location = body.get("location")
    description = body.get("description", "")
    timestamp = time.time()
    memory_id = generate_memory_id(user_id, media_type, theme, location, timestamp)

    # If media present, upload to S3
    file_key = None
    if "file_bytes_base64" in body:
        import base64
        data = base64.b64decode(body["file_bytes_base64"])
        ext = os.path.splitext(body.get("file_name", "upload"))[1] or ""
        file_key = f"{user_id}/{memory_id}{ext}"
        upload_to_s3(data, file_key, content_type=body.get("content_type", "application/octet-stream"))

    # Prepare metadata item
    metadata = {
        "memory_id": memory_id,
        "user_id": user_id,
        "created_at": int(timestamp),
        "media_type": media_type,
        "theme": theme,
        "location": location or "",
        "description": description,
        "s3_key": file_key or "",
        "likes": 0,
        "comments": [],
        "status": "UPLOADED"
    }

    # Write metadata to DynamoDB (quick write)
    put_metadata(metadata)

    # Enfileira para processamento assíncrono (categorização, Rekognition, indexing)
    queue_msg = {
        "action": "PROCESS_MEMORY",
        "env": ENV,
        "memory_id": memory_id,
        "user_id": user_id
    }
    send_sqs_message(SQS_UPLOAD_QUEUE, queue_msg)

    return {"statusCode": 200, "body": {"memory_id": memory_id}}

# SQS worker / Lambda handler to process messages (categorização, updates)
def handler_sqs_processor(event, context=None):
    """
    Lambda triggered by SQS. Receives event with Records.
    Each record body is JSON with action and memory_id.
    """
    # event structure when Lambda triggered by SQS contains event["Records"]
    records = event.get("Records", [])
    for rec in records:
        try:
            body = json.loads(rec["body"])
        except Exception:
            body = rec.get("body")
        action = body.get("action")
        if action == "PROCESS_MEMORY":
            process_memory(body["memory_id"])
        elif action == "SEND_REQUEST":
            # process friend/request message
            process_request_message(body)
        # ... handle other actions ...
    return {"status": "ok", "processed": len(records)}

def process_memory(memory_id: str):
    # Fetch metadata
    table = dynamodb.Table(DDB_TABLE)
    resp = table.get_item(Key={"memory_id": memory_id})
    item = resp.get("Item")
    if not item:
        return

    # Placeholder: call image/video analysis (Rekognition) or text NLP to extract tags
    # Aqui você chamaria AWS Rekognition / Comprehend etc.
    # Exemplo de tags gerados fictícios:
    tags = ["travel", "beach"] if item.get("theme") else ["misc"]
    # Update DynamoDB with tags and status
    table.update_item(
        Key={"memory_id": memory_id},
        UpdateExpression="SET #s = :s, tags = :t",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={":s": "PROCESSED", ":t": tags}
    )
    # (Opcional) enviar para index de memórias / search / elastic / opensearch
    # send_sqs_message(SQS_STORAGE_QUEUE, {"action": "INDEX_MEMORY", "memory_id": memory_id})

def process_request_message(body: Dict):
    # Example: store request in a DynamoDB requests table or notify target user
    # Placeholder implementation
    request_id = str(uuid.uuid4())
    table = dynamodb.Table(DDB_TABLE)
    table.put_item(Item={
        "memory_id": f"request-{request_id}",
        "type": "friend_request",
        "payload": body,
        "created_at": int(time.time())
    })

# Handler to create a "send request to another profile" message
def handler_send_request(event, context=None):
    """
    Expected event:
    {
        "from_user": "userA",
        "to_user": "userB",
        "request_type": "follow"|"share_request",
        "message": "Hi, can I see your memories?"
    }
    """
    body = event if isinstance(event, dict) else json.loads(event.get("body", "{}"))
    msg = {
        "action": "SEND_REQUEST",
        "from_user": body["from_user"],
        "to_user": body["to_user"],
        "request_type": body.get("request_type", "follow"),
        "message": body.get("message", ""),
        "timestamp": int(time.time())
    }
    send_sqs_message(SQS_REQUEST_QUEUE, msg)
    return {"statusCode": 200, "body": {"result": "queued"}}

# Example local testing entrypoint
if __name__ == "__main__":
    # Simulate upload (local)
    sample_event = {
        "user_id": "user123",
        "media_type": "image",
        "theme": "festival",
        "location": "São Paulo",
        "description": "Foto do festival",
        # "file_bytes_base64": "...",  # add base64 bytes to actually upload
        "file_name": "festival.jpg",
        "content_type": "image/jpeg"
    }
    print("Simulating upload handler (no file bytes provided)...")
    print(handler_upload(sample_event))