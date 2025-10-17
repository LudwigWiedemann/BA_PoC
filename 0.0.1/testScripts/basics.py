import unittest

import requests
import json
import datetime
import requests

# --- Konfiguration ---
BASE_URL = "http://localhost:4000"
USERNAME = "automated_user_python"
LOG_FILE = f"api_test_py_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
// hello

# ---------------------

def log_output(message):
    """Schreibt Nachrichten sowohl in die Konsole als auch in die Log-Datei."""
    print(message)
    with open(LOG_FILE, 'a') as f:
        f.write(message + '\n')


def log_response(name, response, token_id=None):
    """Loggt die Details der HTTP-Antwort."""
    log_output(f"\n--- {name} RESPONSE ---")
    log_output(f"Status Code: {response.status_code}")

    try:
        # Versucht, den Body als JSON zu parsen
        data = response.json()
        log_output(f"Body (JSON):\n{json.dumps(data, indent=4)}")
        return data
    except requests.exceptions.JSONDecodeError:
        # Wenn der Body kein JSON ist (z.B. bei HTML-Fehlerseite)
        log_output(f"Body (Text): {response.text}")
        return None


def login_and_get_token():
    """Sendet die /login Anfrage und extrahiert das Token."""
    log_output("--- Sending LOGIN Request ---")

    login_url = f"{BASE_URL}/login"
    payload = {"username": "python_test_user"}
    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(login_url, headers=headers, json=payload)
        response_data = log_response("LOGIN", response)

        if response.status_code == 200 and response_data and 'tokenId' in response_data:
            token_id = response_data['tokenId']
            log_output(f" Login successful. Token ID extracted: {token_id}")
            return token_id
        else:
            log_output(" LOGIN FAILED: Konnte TokenId nicht extrahieren oder Status war nicht 200.")
            return None

    except requests.exceptions.RequestException as e:
        log_output(f" LOGIN FAILED: Verbindungsproblem: {e}")
        return None


def validate_token(token_id):
    """Sendet die /validate Anfrage mit dem extrahierten Token."""
    log_output("\n--- Sending VALIDATE Request ---")

    validate_url = f"{BASE_URL}/validate"
    payload = {"tokenId": token_id}  # Nur die tokenId senden, wie vom Server erwartet
    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(validate_url, headers=headers, json=payload)
        response_data = log_response("VALIDATE", response, token_id)

        if response.status_code == 200 and response_data and response_data.get('valid') == True:
            log_output(" Validation successful: Token is valid.")
            return True
        elif response.status_code == 404:
            log_output(" VALIDATION FAILED: Token not found.")
        elif response.status_code == 401:
            log_output(" VALIDATION FAILED: Token expired.")

    except requests.exceptions.RequestException as e:
        log_output(f" VALIDATION FAILED: Verbindungsproblem: {e}")
    return False


def delete_token(token_id):
    log_output("\n--- Sending DELETE Request ---")
    delete_url = f"{BASE_URL}/delete"
    payload = {"tokenId": token_id}  # Nur die tokenId senden, wie vom Server erwartet
    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(delete_url, headers=headers, json=payload)
        response_data = log_response("DELETE", response, token_id)

        if response.status_code == 200 and response_data and response_data.get('valid') == False:
            log_output(" Deletion successful")
            return True
        elif response.status_code == 404:
            log_output(" Deletion FAILED: Token not found.")

    except requests.exceptions.RequestException as e:
        log_output(f" VALIDATION FAILED: Verbindungsproblem: {e}")
    return False


class BasicTests(unittest.TestCase):

    def test_login(self):
        auth_token = login_and_get_token()
        self.assertIsNotNone(auth_token)

    def test_login_and_validation(self):
        auth_token = login_and_get_token()
        self.assertIsNotNone(auth_token)
        self.assertTrue(validate_token(auth_token))

    def test_delete_token(self):
            auth_token = login_and_get_token()
            self.assertIsNotNone(auth_token)
            self.assertTrue(validate_token(auth_token))
            self.assertTrue(delete_token(auth_token))
            self.assertFalse(validate_token(auth_token))
            self.assertFalse(delete_token(auth_token))


# --- Haupt-Ausführung ---
if __name__ == "__main__":
    log_output(f"--- API Test Script Started ---")
    log_output(f"Target URL: {BASE_URL}")
    unittest.main()
    log_output("\n--- API Test Script Finished ---")
    log_output(f"Log-Datei erstellt: {LOG_FILE}")
