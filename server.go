package main

import (
	"fmt"
	"log"
	"net/http"
	"text/template"

	"social-network/backend/pkg/db/database"
)


func main() {
	database.CreateDatabase()

	http.HandleFunc("/", reactHandler)
	http.HandleFunc("/register", registerHandler)
	http.HandleFunc("/api/checkEmail", checkEmailHandler)

	fmt.Println("Server started on http://localhost:8000")
	log.Fatal(http.ListenAndServe(":8000", nil))
}

func reactHandler(w http.ResponseWriter, r *http.Request) {
	http.FileServer(http.Dir("build")).ServeHTTP(w, r)
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	tmpl := template.Must(template.ParseFiles("build/index.html"))
	tmpl.Execute(w, nil)
}

func checkEmailHandler(w http.ResponseWriter, r *http.Request) {
	email := r.URL.Query().Get("email")

	if database.IsEmailTaken(email) {
		w.WriteHeader(http.StatusConflict)
		fmt.Fprint(w, "Email already taken")
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, "Email available")
}

func registerHandler(w http.ResponseWriter, r *http.Request) {
	email := r.FormValue("email")
	password := r.FormValue("password")

	err := database.RegisterUser(email, password)
	if err != nil {
		log.Println(err)
		http.Error(w, "Failed to register user", http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, "User registered successfully")
}
