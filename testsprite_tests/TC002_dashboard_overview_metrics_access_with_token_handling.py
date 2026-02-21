import requests
from requests.exceptions import RequestException, Timeout

BASE_URL = "http://localhost:5173"
USERNAME = "sp@sp.sp"
PASSWORD = "1234"

def login(username, password, timeout=30):
    url = f"{BASE_URL}/api/v1/auth/login"
    payload = {"username": username, "password": password}
    try:
        resp = requests.post(url, json=payload, timeout=timeout)
        resp.raise_for_status()
        data = resp.json()
        assert "accessToken" in data and "refreshToken" in data, "Tokens not in login response"
        return data["accessToken"], data["refreshToken"]
    except (RequestException, AssertionError) as e:
        raise RuntimeError(f"Login failed: {e}")

def refresh_token(refresh_token, timeout=30):
    url = f"{BASE_URL}/api/v1/auth/refresh"
    payload = {"refreshToken": refresh_token}
    try:
        resp = requests.post(url, json=payload, timeout=timeout)
        resp.raise_for_status()
        data = resp.json()
        assert "accessToken" in data and "refreshToken" in data, "Tokens not in refresh response"
        return data["accessToken"], data["refreshToken"]
    except (RequestException, AssertionError) as e:
        raise RuntimeError(f"Token refresh failed: {e}")

def test_dashboard_overview_metrics_access_with_token_handling():
    # Step 1: Login with valid credentials to get tokens
    access_token, refresh_token = login(USERNAME, PASSWORD)

    headers = {"Authorization": f"Bearer {access_token}"}
    dashboard_url = f"{BASE_URL}/api/v1/dashboard"

    try:
        # Attempt GET /api/v1/dashboard with valid access token
        resp = requests.get(dashboard_url, headers=headers, timeout=30)
    except Timeout:
        raise AssertionError("Request to /api/v1/dashboard timed out.")
    except RequestException as e:
        raise AssertionError(f"Request to /api/v1/dashboard failed: {e}")

    if resp.status_code == 200:
        # Success case: verify farm overview metrics response structure
        try:
            data = resp.json()
        except Exception:
            raise AssertionError("Response is not valid JSON")

        # Basic expected keys check, e.g. overview metrics and stat cards (based on PRD)
        assert isinstance(data, dict), "Dashboard response is not a JSON object"
        # We don't have exact schema but expect some keys like 'overviewMetrics' or similar
        # We'll just check presence of keys as per dashboard description
        assert any(key in data for key in ["overviewMetrics", "statCards", "metrics"]), "Expected dashboard metrics keys missing"
        return  # Test passed for valid token case

    elif resp.status_code == 401:
        # Access token expired: refresh tokens and retry
        try:
            new_access_token, new_refresh_token = refresh_token(refresh_token)
        except RuntimeError as e:
            raise AssertionError(f"Failed to refresh token after 401 Unauthorized: {e}")

        headers = {"Authorization": f"Bearer {new_access_token}"}
        try:
            retry_resp = requests.get(dashboard_url, headers=headers, timeout=30)
        except Timeout:
            raise AssertionError("Retry request to /api/v1/dashboard timed out.")
        except RequestException as e:
            raise AssertionError(f"Retry request to /api/v1/dashboard failed: {e}")

        assert retry_resp.status_code == 200, f"Retry with refreshed token failed with status {retry_resp.status_code}"
        try:
            retry_data = retry_resp.json()
        except Exception:
            raise AssertionError("Retry dashboard response is not valid JSON")

        assert isinstance(retry_data, dict), "Retry dashboard response is not a JSON object"
        assert any(
            key in retry_data for key in ["overviewMetrics", "statCards", "metrics"]
        ), "Expected dashboard metrics keys missing on retry"

    elif resp.status_code == 500:
        # Server error case: verify error details are present in response payload
        try:
            error_data = resp.json()
        except Exception:
            raise AssertionError("500 response is not valid JSON")

        assert isinstance(error_data, dict), "500 error response is not a JSON object"
        # Expect error details like stack trace or exception details
        expected_keys = ["error", "message", "stackTrace", "exception"]
        assert any(k in error_data for k in expected_keys), "Error details missing in 500 response"

    else:
        raise AssertionError(f"Unexpected status code {resp.status_code} from /api/v1/dashboard")

test_dashboard_overview_metrics_access_with_token_handling()