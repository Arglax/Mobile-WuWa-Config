#!/usr/bin/env python3
import json
import os
import sys

import requests
from google.auth.transport.requests import Request
from google.oauth2 import service_account

TOPIC = "release-updates"


def main() -> int:
    sa_raw = os.environ.get("FCM_SERVICE_ACCOUNT_JSON")
    if not sa_raw:
        print("ERROR: FCM_SERVICE_ACCOUNT_JSON is not set", file=sys.stderr)
        return 1

    sa_info = json.loads(sa_raw)
    project_id = sa_info["project_id"]

    credentials = service_account.Credentials.from_service_account_info(
        sa_info, scopes=["https://www.googleapis.com/auth/firebase.messaging"]
    )
    credentials.refresh(Request())

    tag = sys.argv[1] if len(sys.argv) > 1 else "latest"

    message = {
        "message": {
            "topic": TOPIC,
            "notification": {
                "title": "Configs Updated for C#",
#                "body": f"Arglax released a new patch ({tag}) - tap to check it out!",
                 "body": f"Patch: All Configs for C# - v ({tag}) - tap to check it out!",
            },
            "data": {
                "release_tag": tag,
            },
            "android": {
                "priority": "high",
                "notification": {
                    "channel_id": "release_updates",
                },
            },
        }
    }

    resp = requests.post(
        f"https://fcm.googleapis.com/v1/projects/{project_id}/messages:send",
        headers={
            "Authorization": f"Bearer {credentials.token}",
            "Content-Type": "application/json",
        },
        json=message,
        timeout=30,
    )

    print(resp.status_code, resp.text)
    resp.raise_for_status()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
