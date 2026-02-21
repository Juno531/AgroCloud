import requests

BASE_URL = "http://localhost:5173"
LOGIN_URL = f"{BASE_URL}/api/v1/auth/login"
REFRESH_URL = f"{BASE_URL}/api/v1/auth/refresh"
LOGOUT_URL = f"{BASE_URL}/api/v1/auth/logout"
PROFILE_URL = f"{BASE_URL}/api/v1/profile"

VALID_USERNAME = "sp@sp.sp"
VALID_PASSWORD = "1234"
INVALID_USERNAME = "invalid@user.com"
INVALID_PASSWORD = "wrongpass"

HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30


def test_user_authentication_login_and_token_management():
    # 1. Test login with valid credentials
    login_payload = {"username": VALID_USERNAME, "password": VALID_PASSWORD}

    response = requests.post(
        LOGIN_URL,
        json=login_payload,
        headers=HEADERS,
        timeout=TIMEOUT,
    )
    assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"
    json_data = response.json()
    assert "accessToken" in json_data and "refreshToken" in json_data, "Tokens missing in response"
    access_token = json_data["accessToken"]
    refresh_token = json_data["refreshToken"]

    auth_headers = {"Authorization": f"Bearer {access_token}"}

    # 2. Verify GET /api/v1/profile with access token
    profile_response = requests.get(
        PROFILE_URL, headers=auth_headers, timeout=TIMEOUT
    )
    assert profile_response.status_code == 200, f"Expected 200 OK on profile, got {profile_response.status_code}"
    profile_json = profile_response.json()
    assert isinstance(profile_json, dict), "Profile response is not a JSON object"
    assert "email" in profile_json, "Profile data missing email"

    # 3. Test login with invalid credentials
    invalid_login_payload = {"username": INVALID_USERNAME, "password": INVALID_PASSWORD}

    invalid_response = requests.post(
        LOGIN_URL,
        json=invalid_login_payload,
        headers=HEADERS,
        timeout=TIMEOUT,
    )
    assert invalid_response.status_code == 401, f"Expected 401 Unauthorized for invalid login, got {invalid_response.status_code}"
    invalid_json = invalid_response.json()
    assert "error" in invalid_json or "message" in invalid_json, "No error message in invalid login response"

    # 4. Test token refresh with valid refresh token
    refresh_payload = {"refreshToken": refresh_token}
    refresh_response = requests.post(
        REFRESH_URL,
        json=refresh_payload,
        headers=HEADERS,
        timeout=TIMEOUT,
    )
    assert refresh_response.status_code == 200, f"Expected 200 OK on refresh, got {refresh_response.status_code}"
    refresh_json = refresh_response.json()
    assert "accessToken" in refresh_json and "refreshToken" in refresh_json, "Tokens missing in refresh response"
    new_access_token = refresh_json["accessToken"]
    new_refresh_token = refresh_json["refreshToken"]
    new_auth_headers = {"Authorization": f"Bearer {new_access_token}"}

    # 5. Test logout with new access token
    logout_response = requests.post(
        LOGOUT_URL,
        headers=new_auth_headers,
        timeout=TIMEOUT,
    )
    assert logout_response.status_code == 204, f"Expected 204 No Content on logout, got {logout_response.status_code}"

    # 6. Test refresh with revoked/invalid refresh token (should return 401)
    revoked_refresh_payload = {"refreshToken": new_refresh_token}
    revoked_refresh_response = requests.post(
        REFRESH_URL,
        json=revoked_refresh_payload,
        headers=HEADERS,
        timeout=TIMEOUT,
    )
    # The expected behavior: Since we've logged out, the refresh token is revoked, so 401 expected
    assert revoked_refresh_response.status_code == 401, f"Expected 401 Unauthorized on revoked refresh token, got {revoked_refresh_response.status_code}"
    revoked_refresh_json = revoked_refresh_response.json()
    assert (
        "error" in revoked_refresh_json or "message" in revoked_refresh_json
    ), "No error message on revoked refresh token"


test_user_authentication_login_and_token_management()
