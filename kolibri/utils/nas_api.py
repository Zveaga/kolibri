"""
Helper module for NAS Active Directory API integration.
"""
import logging
import requests
from requests.exceptions import RequestException

logger = logging.getLogger(__name__)

# NAS API Configuration
NAS_API_BASE_URL = "http://localhost:5000/api/student"


def create_ad_student():
    """
    Call NAS API to create a new AD student account.
    
    Returns:
        dict: Dictionary with 'username' and 'password' keys
        None: If the API call fails
    """
    try:
        url = f"{NAS_API_BASE_URL}/create"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        if 'username' in data and 'password' in data:
            logger.info(f"Successfully created AD account: {data['username']}")
            return {
                'username': data['username'],
                'password': data['password']
            }
        else:
            logger.error(f"Invalid response from NAS API: {data}")
            return None
            
    except RequestException as e:
        logger.error(f"Failed to create AD student account: {str(e)}")
        return None


def delete_ad_student(username):
    """
    Call NAS API to delete an AD student account.
    
    Args:
        username: The username to delete
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        url = f"{NAS_API_BASE_URL}/delete"
        params = {'username': username}
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        logger.info(f"Successfully deleted AD account: {username}")
        return True
        
    except RequestException as e:
        logger.error(f"Failed to delete AD student account {username}: {str(e)}")
        return False


def update_ad_student_password(username, new_password):
    """
    Call NAS API to update an AD student's password.
    
    Args:
        username: The username to update
        new_password: The new password
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        url = f"{NAS_API_BASE_URL}/update-password"
        params = {
            'username': username,
            'new_password': new_password
        }
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        logger.info(f"Successfully updated password for AD account: {username}")
        return True
        
    except RequestException as e:
        logger.error(f"Failed to update password for AD student {username}: {str(e)}")
        return False
