package database

import (
	"database/sql"
	"errors"
	"log"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

var Database *sql.DB

func CreateDatabase() {
	if _, err := os.Stat("database.db"); os.IsNotExist(err) {
		file, err := os.Create("database.db")
		if err != nil {
			log.Fatal(err.Error())
		}
		file.Close()
	}

	sqliteDatabase, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		log.Fatal(err.Error())
	}

	_, err = sqliteDatabase.Exec(`
		CREATE TABLE IF NOT EXISTS Users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			email TEXT UNIQUE,
			password TEXT
		)
	`)
	if err != nil {
		log.Fatal(err.Error())
	}

	Database = sqliteDatabase
}

func IsEmailTaken(email string) bool {
	var count int
	err := Database.QueryRow("SELECT COUNT(*) FROM Users WHERE email = ?", email).Scan(&count)
	if err != nil {
		log.Println(err)
		return false
	}
	return count > 0
}

func RegisterUser(email, password string) error {
	if IsEmailTaken(email) {
		return errors.New("Email already taken")
	}

	_, err := Database.Exec("INSERT INTO Users (email, password) VALUES (?, ?)", email, password)
	if err != nil {
		log.Println(err)
		return errors.New("Failed to register user")
	}

	return nil
}
