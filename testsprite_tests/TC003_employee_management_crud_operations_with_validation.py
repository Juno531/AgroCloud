import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:5173"
AUTH_CREDENTIALS = HTTPBasicAuth("sp@sp.sp", "1234")
TIMEOUT = 30

def test_employee_management_crud_operations_with_validation():
    session = requests.Session()
    session.auth = AUTH_CREDENTIALS
    headers = {"Content-Type": "application/json"}

    # 1. Login to get access token (simulate Basic Auth for simplicity)
    # Since instruction is using basic token auth, we assume Basic Auth used directly.
    # However, PRD suggests token-based auth, so let's do a login post first to get tokens.
    login_resp = session.post(
        f"{BASE_URL}/api/v1/auth/login",
        json={"username": "sp@sp.sp", "password": "1234"},
        timeout=TIMEOUT,
    )
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    tokens = login_resp.json()
    access_token = tokens.get("accessToken")
    assert access_token, "No accessToken received"
    refresh_token = tokens.get("refreshToken")
    assert refresh_token, "No refreshToken received"

    auth_headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    # Helper to create employee
    def create_employee(payload):
        return session.post(
            f"{BASE_URL}/api/v1/employees",
            headers=auth_headers,
            json=payload,
            timeout=TIMEOUT,
        )

    # Helper to get employee by id
    def get_employee(emp_id):
        return session.get(
            f"{BASE_URL}/api/v1/employees/{emp_id}",
            headers=auth_headers,
            timeout=TIMEOUT,
        )

    # Helper to update employee by id
    def update_employee(emp_id, payload):
        return session.put(
            f"{BASE_URL}/api/v1/employees/{emp_id}",
            headers=auth_headers,
            json=payload,
            timeout=TIMEOUT,
        )

    # Helper to delete employee by id
    def delete_employee(emp_id):
        return session.delete(
            f"{BASE_URL}/api/v1/employees/{emp_id}",
            headers=auth_headers,
            timeout=TIMEOUT,
        )

    # ---- Test creating employee with valid data ----
    valid_employee = {
        "name": "Test Employee",
        "employeeType": "full-time",
        "companyCode": "COMP123",
        "employeeNumber": "EMP001"
    }
    create_resp = create_employee(valid_employee)
    assert create_resp.status_code == 201, f"Valid create failed: {create_resp.text}"
    created_employee = create_resp.json()
    emp_id = created_employee.get("id")
    assert emp_id, "Created employee ID not returned"

    try:
        # ---- Test GET employee by ID ----
        get_resp = get_employee(emp_id)
        assert get_resp.status_code == 200, f"Get employee failed: {get_resp.text}"
        get_data = get_resp.json()
        assert get_data.get("id") == emp_id, "Mismatched employee ID on get"
        assert get_data.get("name") == valid_employee["name"], "Employee name mismatch"
        assert get_data.get("employeeNumber") == valid_employee["employeeNumber"], "Employee number mismatch"

        # ---- Test updating employee's role and phone ----
        update_payload = {"role": "Manager", "phone": "123-456-7890"}
        update_resp = update_employee(emp_id, update_payload)
        assert update_resp.status_code == 200, f"Update employee failed: {update_resp.text}"
        updated_emp = update_resp.json()
        assert updated_emp.get("role") == "Manager", "Role not updated correctly"
        assert updated_emp.get("phone") == "123-456-7890", "Phone not updated correctly"

        # ---- Test POST /api/v1/employees with missing required field companyCode ----
        invalid_employee_missing_field = {
            "name": "Invalid Employee",
            "employeeType": "part-time",
            # "companyCode" is missing deliberately
            "employeeNumber": "EMP002"
        }
        missing_field_resp = create_employee(invalid_employee_missing_field)
        assert missing_field_resp.status_code == 400, f"Missing field error expected: {missing_field_resp.text}"
        error_data = missing_field_resp.json()
        assert "companyCode" in error_data.get("errors", {}) or "companyCode" in error_data.get("message", ""), \
            "Validation error for companyCode expected"

        # ---- Test POST /api/v1/employees with duplicate unique employeeNumber ----
        duplicate_employee = {
            "name": "Duplicate EmployeeNumber",
            "employeeType": "full-time",
            "companyCode": "COMP123",
            "employeeNumber": valid_employee["employeeNumber"]  # Duplicate emp number
        }
        duplicate_resp = create_employee(duplicate_employee)
        assert duplicate_resp.status_code == 409, f"Duplicate constraint error expected: {duplicate_resp.text}"
        dup_error_data = duplicate_resp.json()
        err_message = dup_error_data.get("error") or dup_error_data.get("message") or ""
        assert "unique" in err_message.lower() or "constraint" in err_message.lower(), "Unique constraint violation expected"

        # ---- Test DELETE employee by ID ----
        delete_resp = delete_employee(emp_id)
        assert delete_resp.status_code == 204, f"Delete employee failed: {delete_resp.text}"

        # ---- Confirm employee deleted (GET should 404) ----
        get_after_delete_resp = get_employee(emp_id)
        assert get_after_delete_resp.status_code == 404, f"Deleted employee should not be found: {get_after_delete_resp.text}"

    finally:
        # Cleanup: try to delete employee if still exists
        try:
            delete_employee(emp_id)
        except Exception:
            pass


test_employee_management_crud_operations_with_validation()