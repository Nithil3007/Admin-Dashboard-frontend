import sys
sys.path.insert(1,'/Users/mackbookair/Downloads/GREENINFO TECH/admin_portal_using_database_schema/src')
import pytest
import psycopg2 # or psycopg
from fastapi.testclient import TestClient
from admin_api import app

# test database connection
@pytest.fixture(scope="session")
def db_connection():
    """Provides a PostgreSQL database connection for tests."""
    try:
        conn = psycopg2.connect("postgresql://postgres:password@localhost/admin_portal")
        yield conn
    except psycopg2.Error as e:
        pytest.fail(f"Failed to connect to the database: {e}")
    finally:
        if 'conn' in locals() and conn:
            conn.close()

def test_database_connection(db_connection):
    "Tests if the database connection is active and functional."
    try:
        cursor = db_connection.cursor()
        cursor.execute("SELECT 1") # A simple query to check connectivity
        result = cursor.fetchone()
        assert result == (1,)
        cursor.close()
    except psycopg2.Error as e:
        pytest.fail(f"Database query failed: {e}")

# test api endpoints

## get endpoint testing
def test_get_user_stats_endpoint():
    
    client = TestClient(app)

    response = client.get("/admin/users/stats")
    
    # Verify status code
    assert response.status_code == 200
    
    # Verify content-type
    assert "application/json" in response.headers["Content-Type"]

    # Verify response structure (Assuming a book object with 'id', 'title', and 'author')
    data = response.json()  
    assert isinstance(data, list)
    assert len(data) > 0
    assert "user_id" in data[0]
    assert "full_name" in data[0]
    assert "email" in data[0]
    assert "patient_count" in data[0]
    assert "successful_recordings" in data[0]
    assert "failed_recordings" in data[0]
    assert "total_hours" in data[0]
    assert "avg_length_seconds" in data[0]
    assert "avg_file_size_bytes" in data[0]
    assert "tier_name" in data[0]

## post endpoint testing
def test_post_user_stats_endpoint():
    
    client = TestClient(app)

    user_id = 'user-001'
    tier_name = 'Basic'

    response = client.post(
        f"/admin/users/{user_id}/upgrade",
        json={"tier_name": tier_name}
    )

    # Verify status code
    assert response.status_code == 200

    # Verify content-type
    assert "application/json" in response.headers["Content-Type"]

    # Verify response body
    data = response.json()
    assert data["status"] == "success"
    assert data["message"] == f"User {user_id}'s tier set to {tier_name}"