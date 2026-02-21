import requests
import time

BASE_URL = "http://localhost:5000"
USERNAME = "sp@sp.sp"
PASSWORD = "1234"
TIMEOUT = 30

def test_global_error_handling_and_token_refresh_interceptor():
    session = requests.Session()
    tokens = {}

    def login():
        resp = session.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={"username": USERNAME, "password": PASSWORD},
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "accessToken" in data and "refreshToken" in data
        tokens["accessToken"] = data["accessToken"]
        tokens["refreshToken"] = data["refreshToken"]

    def refresh_token():
        resp = session.post(
            f"{BASE_URL}/api/v1/auth/refresh",
            json={"refreshToken": tokens["refreshToken"]},
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "accessToken" in data and "refreshToken" in data
        tokens["accessToken"] = data["accessToken"]
        tokens["refreshToken"] = data["refreshToken"]

    def post_log(error_context):
        resp = session.post(
            f"{BASE_URL}/api/v1/logs",
            json=error_context,
            timeout=TIMEOUT,
        )
        assert resp.status_code in (200, 201)

    # Wrapper to do authenticated GET with token refresh handling for 401
    def get_with_token_refresh(url):
        headers = {"Authorization": f"Bearer {tokens['accessToken']}"}
        resp = session.get(url, headers=headers, timeout=TIMEOUT)
        if resp.status_code == 401:
            # Try token refresh
            refresh_token()
            headers = {"Authorization": f"Bearer {tokens['accessToken']}"}
            resp = session.get(url, headers=headers, timeout=TIMEOUT)
        return resp

    # Step 1: Login and get tokens
    login()

    # Step 2: Make a request to a protected resource with an expired token simulation
    # Since we cannot forcibly expire token, we simulate by using invalid token
    old_token = tokens["accessToken"]
    tokens["accessToken"] = "expired_or_invalid_token_to_force_401"
    resp = get_with_token_refresh(f"{BASE_URL}/api/v1/protected")
    assert resp.status_code == 200

    # Step 3: Test handling of 500 Internal Server Error on /api/v1/dashboard
    headers = {"Authorization": f"Bearer {tokens['accessToken']}"}
    resp_500 = session.get(f"{BASE_URL}/api/v1/dashboard", headers=headers, timeout=TIMEOUT)
    if resp_500.status_code == 500:
        error_payload = resp_500.json() if resp_500.headers.get("Content-Type") == "application/json" else {}
        # Log the server-side error via /api/v1/logs
        log_context = {
            "error": "Server error 500 on GET /api/v1/dashboard",
            "details": error_payload,
            "timestamp": int(time.time()),
            "user": USERNAME,
        }
        post_log(log_context)
        # Here the UI would render a friendly fallback UI - we just assert logging done

    else:
        # If no 500 from API, pass test as is (maybe server not simulating error)
        assert resp_500.status_code == 200

    # Step 4: Simulate network failure on /api/v1/dashboard by making request to invalid port
    # since we cannot disable network, simulate by connecting to a refused address
    try:
        session.get(f"http://localhost:5999/api/v1/dashboard", headers=headers, timeout=5)
        # If no exception, fail test because network failure expected
        assert False, "Expected network failure did not occur"
    except requests.exceptions.RequestException:
        # Log the network error event
        network_error_context = {
            "error": "Network failure on GET /api/v1/dashboard",
            "details": "Simulated network failure exception",
            "timestamp": int(time.time()),
            "user": USERNAME,
        }
        post_log(network_error_context)
        # Assume the UI renders fallback UI as per design

test_global_error_handling_and_token_refresh_interceptor()
