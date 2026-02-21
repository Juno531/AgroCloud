import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:5173"
USERNAME = "sp@sp.sp"
PASSWORD = "1234"
TIMEOUT = 30

def test_user_profile_update_and_validation():
    session = requests.Session()
    auth = HTTPBasicAuth(USERNAME, PASSWORD)
    login_url = f"{BASE_URL}/api/v1/auth/login"
    profile_url = f"{BASE_URL}/api/v1/profile"
    headers = {"Content-Type": "application/json"}

    # Login to get access token
    try:
        login_resp = session.post(login_url, auth=auth, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed: {login_resp.status_code}, {login_resp.text}"
        tokens = login_resp.json()
        assert "accessToken" in tokens and "refreshToken" in tokens, "Tokens missing in login response"
        access_token = tokens["accessToken"]

        auth_headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        # 1. Update profile with valid data
        valid_payload = {
            "displayName": "Updated User",
            "email": "updateduser@example.com",
            "preferences": {
                "notifications": True,
                "theme": "dark"
            }
        }
        put_valid_resp = session.put(profile_url, json=valid_payload, headers=auth_headers, timeout=TIMEOUT)
        assert put_valid_resp.status_code == 200, f"Valid profile update failed: {put_valid_resp.status_code}, {put_valid_resp.text}"
        updated_profile = put_valid_resp.json()
        assert updated_profile.get("displayName") == valid_payload["displayName"], "Display name not updated correctly"
        assert updated_profile.get("email") == valid_payload["email"], "Email not updated correctly"
        prefs = updated_profile.get("preferences", {})
        assert prefs.get("notifications") == valid_payload["preferences"]["notifications"], "Preferences.notifications not updated correctly"
        assert prefs.get("theme") == valid_payload["preferences"]["theme"], "Preferences.theme not updated correctly"

        # Verify GET returns updated profile
        get_profile_resp = session.get(profile_url, headers=auth_headers, timeout=TIMEOUT)
        assert get_profile_resp.status_code == 200, f"Get profile failed: {get_profile_resp.status_code}, {get_profile_resp.text}"
        profile_data = get_profile_resp.json()
        assert profile_data.get("displayName") == valid_payload["displayName"], "GET profile displayName mismatch"
        assert profile_data.get("email") == valid_payload["email"], "GET profile email mismatch"
        pref_get = profile_data.get("preferences", {})
        assert pref_get.get("notifications") == valid_payload["preferences"]["notifications"], "GET profile preferences.notifications mismatch"
        assert pref_get.get("theme") == valid_payload["preferences"]["theme"], "GET profile preferences.theme mismatch"

        # 2. Update profile with invalid email format
        invalid_payload = {
            "displayName": "Another Name",
            "email": "invalid-email-format",
            "preferences": {
                "notifications": False,
                "theme": "light"
            }
        }
        put_invalid_resp = session.put(profile_url, json=invalid_payload, headers=auth_headers, timeout=TIMEOUT)

        # Expecting 400 Bad Request for invalid email format with validation error message
        assert put_invalid_resp.status_code == 400, f"Invalid email format update did not return 400: {put_invalid_resp.status_code}, {put_invalid_resp.text}"
        error_resp = put_invalid_resp.json()
        # Check error details presence and email field mention
        assert isinstance(error_resp, dict), "Error response is not a JSON object"
        # Usually error details might be like {"errors": {"email": "invalid format"}} or similar
        email_error_found = False
        if "errors" in error_resp and isinstance(error_resp["errors"], dict):
            email_error_found = "email" in error_resp["errors"]
        elif "message" in error_resp and "email" in error_resp["message"].lower():
            email_error_found = True
        assert email_error_found, "Validation error for email field not found in response"

    finally:
        session.close()

test_user_profile_update_and_validation()