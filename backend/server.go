package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"mime"
	"net/http"
	"path/filepath"
	"strconv"
	"text/template"
	"time"

	"social-network-backend/pkg/db/database"
	"social-network-backend/pkg/handlers"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	db := database.CreateDatabase()

	newRepo := handlers.NewRepository(db)
	newService := handlers.NewService(newRepo)
	defer database.Database.Close()

	http.HandleFunc("/", reactHandler)
	http.HandleFunc("/register", newService.HandleRegistration)
	http.HandleFunc("/login", newService.HandleLogin)
	http.HandleFunc("/logout", newService.HandleLogout)
	http.HandleFunc("/checkCookie", checkCookieHandler)
	http.HandleFunc("/deleteCookie", deleteCookie)
	http.HandleFunc("/uploadAvatar", handleProfilePictureUpload)
	http.HandleFunc("/image", handleImage)
	// http.HandleFunc("/feed", handleFeed) // Add the /feed route

	fmt.Println("Server started on http://localhost:8000")
	log.Fatal(http.ListenAndServe(":8000", nil))
}

func handleImage(w http.ResponseWriter, r *http.Request) {
	// Get the image ID from the URL parameter
	imageID := r.URL.Query().Get("id")
	if imageID == "" {
		http.Error(w, "Image ID is required", http.StatusBadRequest)
		return
	}

	// Convert the image ID to an integer
	id, err := strconv.Atoi(imageID)
	if err != nil {
		http.Error(w, "Invalid image ID", http.StatusBadRequest)
		return
	}

	// Query the database to retrieve the image data
	var filename string
	var imageData []byte

	// Open the SQLite database connection
	db, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	err = db.QueryRow("SELECT filename, data FROM Images WHERE id = ?", id).Scan(&filename, &imageData)
	if err != nil {
		http.Error(w, "Failed to retrieve image data", http.StatusInternalServerError)
		return
	}

	// Set the Content-Type header based on the file extension
	contentType := mime.TypeByExtension(filepath.Ext(filename))
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	// Set the Content-Disposition header to force the browser to download the image
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
	w.Header().Set("Content-Type", contentType)

	// Write the image data to the response
	_, err = w.Write(imageData)
	if err != nil {
		http.Error(w, "Failed to write image data", http.StatusInternalServerError)
		return
	}
}


func insertImageIntoDB(filename string, imageData []byte) error {
	// Open the SQLite database connection
	db, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		return err
	}
	defer db.Close()

	// Prepare the SQL statement to insert the image into the table
	stmt, err := db.Prepare("INSERT INTO Images (filename, data) VALUES (?, ?)")
	if err != nil {
		return err
	}
	defer stmt.Close()

	// Execute the SQL statement with the filename and image data
	_, err = stmt.Exec(filename, imageData)
	if err != nil {
		return err
	}

	return nil
}


func handleProfilePictureUpload(w http.ResponseWriter, r *http.Request) {
	// Retrieve the uploaded file from the form data
	file, handler, err := r.FormFile("profilePicture")
	if err != nil {
		http.Error(w, "Failed to retrieve file from form data", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Read the file data
	fileData, err := ioutil.ReadAll(file)
	if err != nil {
		http.Error(w, "Failed to read file data", http.StatusInternalServerError)
		return
	}

	// Generate a unique filename for the uploaded file
	filename := generateUniqueFilename(handler.Filename)

	// Insert the image into the database
	err = insertImageIntoDB(filename, fileData)
	if err != nil {
		http.Error(w, "Failed to insert image into database", http.StatusInternalServerError)
		return
	}

	// Return a success response
	response := map[string]interface{}{
		"message":  "Image uploaded successfully",
		"filename": filename,
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

func generateUniqueFilename(originalFilename string) string {
	// Generate a unique filename using a combination of original filename and current timestamp
	timestamp := time.Now().UnixNano()
	ext := filepath.Ext(originalFilename)
	filename := fmt.Sprintf("%d%s", timestamp, ext)
	return filename
}



func deleteCookie(w http.ResponseWriter, r *http.Request) {
	fmt.Println("delete cookie function called")

	// Retrieve the cookie value from the request
	cookie, err := r.Cookie("user_session")
	if err != nil {
		fmt.Fprint(w, "No cookie provided by the client")
		return
	}

	// Get the cookie value
	cookieValue := cookie.Value

	fmt.Println("Cookie to be deleted:", cookieValue)

	// Open the SQLite3 database connection
	db, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Prepare the SQL statement to delete the cookie value from the Sessions table
	stmt, err := db.Prepare("DELETE FROM Sessions WHERE cookieValue = ?")
	if err != nil {
		log.Fatal(err)
	}

	// Execute the SQL statement to delete the cookie value
	result, err := stmt.Exec(cookieValue)
	if err != nil {
		log.Fatal(err)
	}

	// Check the affected rows count
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Fatal(err)
	}

	// Return the result based on the affected rows count
	if rowsAffected > 0 {
		// Cookie is deleted
		fmt.Fprint(w, "Cookie is deleted")
	} else {
		// Cookie is not found or not deleted
		fmt.Fprint(w, "Cookie is not found or not deleted")
	}
}


// checkCookieHandler handles the "/checkCookie" endpoint
func checkCookieHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("cookie function called")

	// Retrieve the cookie value from the request
	cookie, err := r.Cookie("user_session")
	if err != nil {
		// Cookie is not found
		fmt.Fprint(w, "Cookie is not found")
		return
	}

	// Get the cookie value
	cookieValue := cookie.Value

	fmt.Println("cookie received:", cookieValue)

	// Open the SQLite3 database connection
	db, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Prepare the SQL statement to check the cookie value in the Sessions table
	stmt, err := db.Prepare("SELECT COUNT(*) FROM Sessions WHERE cookieValue = ?")
	if err != nil {
		log.Fatal(err)
	}

	// Execute the SQL statement and check if the cookie value exists
	var count int
	err = stmt.QueryRow(cookieValue).Scan(&count)
	if err != nil {
		log.Fatal(err)
	}

	// Return the result based on the count value
	if count > 0 {
		// Cookie is found
		fmt.Fprint(w, "Cookie is found")
	} else {
		// Cookie is not found
		fmt.Fprint(w, "Cookie is not found")
	}
}

//==>moved to handlers/register.go
// func IsEmailTaken(email string) bool {
// 	var count int
// 	err := db.QueryRow("SELECT COUNT(*) FROM Users WHERE email = ?", email).Scan(&count)
// 	if err != nil {
// 		fmt.Println("IsEmailTaken: Failed to access user database")
// 		log.Println(err)
// 		return false
// 	}
// 	return count > 0
// }

// func RegisterUser(email, password string) error {
// 	if IsEmailTaken(email) {
// 		return fmt.Errorf("email already taken")
// 	}

// 	_, err := db.Exec("INSERT INTO Users (email, password) VALUES (?, ?)", email, password)
// 	if err != nil {
// 		log.Println(err)
// 		return fmt.Errorf("failed to register user")
// 	}

// 	return nil
// }

func reactHandler(w http.ResponseWriter, r *http.Request) {
	http.FileServer(http.Dir("build")).ServeHTTP(w, r)
}

// Where is this being used??
func indexHandler(w http.ResponseWriter, r *http.Request) {
	tmpl := template.Must(template.ParseFiles("build/index.html"))
	tmpl.Execute(w, nil)
}

//==>moved to handlers/register.go
// func checkEmailHandler(w http.ResponseWriter, r *http.Request) {
// 	email := r.URL.Query().Get("email")

// 	if IsEmailTaken(email) {
// 		w.WriteHeader(http.StatusConflict)
// 		fmt.Fprint(w, "Email already taken")
// 		return
// 	}

// 	w.WriteHeader(http.StatusOK)
// 	fmt.Fprint(w, "Email available")
// }
