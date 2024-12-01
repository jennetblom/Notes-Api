
The is an API for saving notes in a dynamoDB-db. 

Here is the endpoints:

Function Details in serverless.yml

signUp
Trigger: POST /api/user/signup

Purpose: Handles user registration by accepting user details and saving them in a database.


login
Trigger: POST /api/user/login

Purpose: Authenticates a user based on provided credentials and returns an authentication token (e.g., JWT).


getAllNotes
Trigger: GET /api/notes

Purpose: Fetches all notes associated with the authenticated user, returning them in a list format.


getNoteById
Trigger: GET /api/notes/{id}

Purpose: Fetches a specific note based on its unique ID.


postNote
Trigger: POST /api/notes

Purpose: Creates a new note based on the provided title and content.


updateNote
Trigger: PUT /api/notes/{id}

Purpose: Updates an existing note with the given ID using the new data in the request body.


deleteNote
Trigger: DELETE /api/notes/{id}

Purpose: Soft deletes a note by its ID, marking it as deleted but not permanently removing it.


getDeletedNotes
Trigger: GET /api/notes/deleted

Purpose: Retrieves all notes that have been marked as deleted (soft deleted).


restoreNote
Trigger: PUT /api/notes/restore/{id}

Purpose: Restores a note that was previously deleted, making it active again.
