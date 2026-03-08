const fetchBoards = async () => {
    try {
        const token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzcEBzcC5zcCIsImlhdCI6MTc3Mjc4NTI4NSwiZXhwIjoxNzcyODcxNjg1fQ.2oZjQ-s3XbmcjPJhJIsVn-2iAD7z2Ku3APvHA-1fJ7SBNyHwFLkPnSeK1TWCFYzPNorsMGbtfA9o9ZM29OQz0A";
        const response = await fetch("http://localhost:8080/api/v1/boards?page=0&size=10", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        console.log("STATUS:", response.status);
        console.log("DATA:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("FAIL TO PARSE JSON:", e);
    }
};

fetchBoards();
