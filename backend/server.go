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

// http://localhost:8000/image?id=1
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
	var username string
	var imageData []byte

	// Open the SQLite database connection
	db, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	err = db.QueryRow("SELECT username, data FROM Images WHERE id = ?", id).Scan(&username, &imageData)
	if err != nil {
		http.Error(w, "Failed to retrieve image data", http.StatusInternalServerError)
		return
	}

	// Set the Content-Type header based on the file extension
	contentType := mime.TypeByExtension(filepath.Ext(username))
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	// Set the Content-Disposition header to force the browser to download the image
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; username="%s"`, username))
	w.Header().Set("Content-Type", contentType)

	// Write the image data to the response
	_, err = w.Write(imageData)
	if err != nil {
		http.Error(w, "Failed to write image data", http.StatusInternalServerError)
		return
	}
}


func insertImageIntoDB(username string, imageData []byte) error {
	// Open the SQLite database connection
	db, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		return err
	}
	defer db.Close()

	// Prepare the SQL statement to insert the image into the table
	stmt, err := db.Prepare("INSERT INTO Images (username, data) VALUES (?, ?)")
	if err != nil {
		return err
	}
	defer stmt.Close()

	// Execute the SQL statement with the username and image data
	_, err = stmt.Exec(username, imageData)
	if err != nil {
		return err
	}

	return nil
}


func handleProfilePictureUpload(w http.ResponseWriter, r *http.Request) {
	// Retrieve the uploaded file from the form data
	file, _, err := r.FormFile("profilePicture")
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

	// Get the username from the query parameter
	username := r.URL.Query().Get("username")
	if username == "" {
		http.Error(w, "username is required", http.StatusBadRequest)
		return
	}

	// Insert the image into the database
	err = insertImageIntoDB(username, fileData)
	if err != nil {
		http.Error(w, "Failed to insert image into database", http.StatusInternalServerError)
		return
	}

	// Return a success response
	response := map[string]interface{}{
		"message":  "Image uploaded successfully",
		"username": username,
	}
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}



func generateUniqueusername(originalusername string) string {
	// Generate a unique username using a combination of original username and current timestamp
	timestamp := time.Now().UnixNano()
	ext := filepath.Ext(originalusername)
	username := fmt.Sprintf("%d%s", timestamp, ext)
	return username
}



func deleteCookie(w http.ResponseWriter, r *http.Request) {
	// Retrieve the cookie value from the request
	cookie, err := r.Cookie("user_session")
	if err != nil {
		fmt.Fprint(w, "No cookie provided by the client")
		return
	}

	// Get the cookie value
	cookieValue := cookie.Value

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

	// Retrieve the cookie value from the request
	cookie, err := r.Cookie("user_session")
	if err != nil {
		// Cookie is not found
		fmt.Fprint(w, "Cookie is not found")
		return
	}

	// Get the cookie value
	cookieValue := cookie.Value

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

func reactHandler(w http.ResponseWriter, r *http.Request) {
	http.FileServer(http.Dir("build")).ServeHTTP(w, r)
}

// Where is this being used??
func indexHandler(w http.ResponseWriter, r *http.Request) {
	tmpl := template.Must(template.ParseFiles("build/index.html"))
	tmpl.Execute(w, nil)
}