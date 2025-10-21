# NAS Active Directory Integration for Kolibri

## Overview
This integration allows Kolibri to automatically generate student credentials through a NAS API when creating learner accounts. The NAS generates both username (numerical format) and a 4-digit password, which are then used to create the Kolibri account.

## Files Modified/Created

### Backend (Python)

1. **`/kolibri/utils/nas_api.py`** (NEW)
   - Helper module for NAS API communication
   - Functions:
     - `create_ad_student()` - Calls `http://localhost:5000/api/student/create` to generate credentials
     - `delete_ad_student(username)` - Calls `http://localhost:5000/api/student/delete?username=<username>`
     - `update_ad_student_password(username, new_password)` - Calls `http://localhost:5000/api/student/update-password?username=<username>&new_password=<password>`
   - All functions use GET requests as requested
   - Returns generated credentials or handles errors appropriately

2. **`/kolibri/core/auth/api.py`** (MODIFIED)
   - Added import: `from kolibri.utils.nas_api import create_ad_student`
   - Modified `FacilityUserViewSet` class:
     - Added `create()` method to override default user creation
     - Detects when creating a learner with placeholder credentials (`GENERATE_CREDENTIALS`)
     - Calls NAS API to generate credentials before saving the user
     - Returns generated credentials in the response under `generated_credentials` key

### Frontend (Vue.js)

3. **`/kolibri/plugins/facility/assets/src/views/users/sidePanels/UserCreate/index.vue`** (MODIFIED)
   - Added computed properties:
     - `learnerIsSelected` - Determines if user type is learner
     - `showUsernameInput` - Hides username field for learners
     - Updated `showPasswordInput` - Hides password field for learners
   - Added reactive variable:
     - `generatedCredentials` - Stores credentials returned from NAS
   - Modified form validation:
     - For learners, only validates full name (username/password auto-generated)
   - Modified `createFacilityUser()`:
     - Sets `GENERATE_CREDENTIALS` placeholder for learners
     - Captures returned credentials from API response
   - Updated template:
     - Username field only shows for non-learners
     - Password field only shows for non-learners
     - Info message shown for learners explaining auto-generation
     - Credentials display box shows generated username/password after creation
   - Added translation strings for new UI elements
   - Added CSS styling for info box and credentials display

## How It Works

### Creating a Learner Account

1. **Teacher selects "Learner" as user type**
   - Username and password fields are automatically hidden
   - Info message appears: "Username and password will be automatically generated from Active Directory when you save."

2. **Teacher fills in other fields**
   - Full name (required)
   - Optional: ID number, gender, birth year, classes, demographics

3. **Teacher clicks "Save and close" or "Save and add another"**
   - Frontend sets `username = 'GENERATE_CREDENTIALS'` and `password = 'GENERATE_CREDENTIALS'`
   - Request sent to Kolibri backend

4. **Backend processes the request**
   - `FacilityUserViewSet.create()` detects placeholder values
   - Calls `create_ad_student()` which makes GET request to NAS API
   - NAS generates numerical username (e.g., "125-00001") and 4-digit password
   - NAS returns credentials in JSON: `{"username": "125-00001", "password": "1234"}`
   - Backend replaces placeholders with actual credentials
   - User is created in database with generated credentials
   - Response includes `generated_credentials` object

5. **Frontend displays credentials**
   - Green box appears showing:
     - **Username**: 125-00001
     - **Password**: 1234
     - **Warning**: "Please save these credentials! They will not be shown again."

### Creating Non-Learner Accounts (Coach/Admin)

- Works exactly as before
- Username and password fields are shown and required
- No NAS API integration

## API Endpoints

Your Django stub should implement these endpoints:

### Create Student
```
GET http://localhost:5000/api/student/create
Response: {"username": "125-00001", "password": "1234"}
```

### Delete Student
```
GET http://localhost:5000/api/student/delete?username=125-00001
Response: {"status": "success"}
```

### Update Password
```
GET http://localhost:5000/api/student/update-password?username=125-00001&new_password=5678
Response: {"status": "success"}
```

## Configuration

To change the NAS API endpoint, edit `/kolibri/utils/nas_api.py`:

```python
# Change this line to point to your NAS
NAS_API_BASE_URL = "http://your-nas-ip:port/api/student"
```

## Error Handling

- If NAS API is unreachable or returns an error:
  - Backend returns HTTP 500 with error message
  - User creation fails
  - Frontend shows error message
  
- Network timeout is set to 10 seconds for each API call

## Testing

1. Start your Django stub API on port 5000
2. Start Kolibri development server
3. Navigate to Facility > Users
4. Click "New user"
5. Select "Learner" type
6. Fill in full name
7. Click "Save and close"
8. Verify credentials are displayed
9. Check that user appears in user list with generated username

## Future Enhancements

The `delete_ad_student()` and `update_ad_student_password()` functions are implemented but not yet integrated into the Kolibri delete/update workflows. These can be connected later if needed.
