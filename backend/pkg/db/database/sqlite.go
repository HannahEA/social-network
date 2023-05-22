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

	Database = sqliteDatabase

	// Create the Users table if it doesn't exist
	//"passwordhash" BLOB NOT NULL
	_, err = Database.Exec(`
		CREATE TABLE IF NOT EXISTS Users (
			"id" INTEGER PRIMARY KEY AUTOINCREMENT,
			"firstName" TEXT NOT NULL,
			"lastName" TEXT NOT NULL,				
			"nickName" TEXT,
			"age" INTEGER NOT NULL,
			"gender" TEXT NOT NULL,
			"email" TEXT NOT NULL UNIQUE, 
			"password" TEXT NOT NULL,
			"Avatar" BLOB NOT NULL,
			"Image" BLOB,
			"abouitMe" BLOB 
		);
	`)

	// sessions table
	Database.Exec(`CREATE TABLE IF NOT EXISTS "Sessions" ( 
			"userID" INTEGER NOT NULL,
			"cookieName" TEXT NOT NULL,
			"cookieValue" STRING NOT NULL PRIMARY KEY, 
			FOREIGN KEY(userID)REFERENCES Users(id)
			);`)

	// category table
	Database.Exec(`CREATE TABLE IF NOT EXISTS "Category" (
			"postID" INTEGER REFERENCES Post(postID), 
			"category" TEXT NOT NULL
			);`)

	// Create Post table if none exists
	Database.Exec(`CREATE TABLE IF NOT EXISTS "Posts" ( 
		"postID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
		"authorID" INTEGER NOT NULL,
		"Author" TEXT NOT NULL,
		"title" TEXT NOT NULL, 
		"content" TEXT NOT NULL, 
		"category" TEXT NOT NULL,
		"creationDate" TIMESTAMP,
		"cookieID" TEXT NOT NULL,
		"postVisibility" TEXT NOT NULL,
		FOREIGN KEY(authorID)REFERENCES Users(id)
		);`)

	// comments table
	Database.Exec(`CREATE TABLE IF NOT EXISTS "Comments" ( 
		"commentID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
		"postID" INTEGER NOT NULL,
		"authorID" INTEGER NOT NULL,
		"author" TEXT NOT NULL,
		"content" TEXT NOT NULL, 
		"creationDate" TIMESTAMP,
		FOREIGN KEY(postID)REFERENCES Posts(postID),
		FOREIGN KEY(authorID)REFERENCES Users(id)
		);`)

	// Notifications table
	Database.Exec(`CREATE TABLE IF NOT EXISTS "Notifications" ( 
		"notificationID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		"sender" TEXT,
		"recipient" TEXT,
		"count" INTEGER,
		"followingRequest" TEXT,
		"joinGroupRequest" TEXT,
		"groupInvite" TEXT,
		"groupEvent" TEXT,
		FOREIGN KEY(sender)REFERENCES MessageHistory(sender),
		FOREIGN KEY(recipient)REFERENCES MessageHistory(recipient)
		);`)

	// Chats table
	Database.Exec(`CREATE TABLE IF NOT EXISTS "Chats" ( 
		"chatID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		"chatSender" TEXT NOT NULL,
		"toPublic" TEXT NOT NULL,
		"toInfluencer" TEXT NOT NULL,
		"toFollower" TEXT NOT NULL,
		"creationDate" TIMESTAMP, 
		FOREIGN KEY(user1)REFERENCES Users(nickName),
		FOREIGN KEY(user2)REFERENCES Users(nickName)
		);`)

	// MessageHistory table
	Database.Exec(`CREATE TABLE IF NOT EXISTS "MessageHistory" ( 
		"messageID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		"chatID" INTEGER,
		"chatMessage" STRING NOT NULL,
		"sender" TEXT,
		"recipient" TEXT,
		"creationDate" TIMESTAMP, 
		"emoji" BLOB,
		FOREIGN KEY(chatID)REFERENCES Chats(chatID),
		FOREIGN KEY(sender)REFERENCES Users(nickName),
		FOREIGN KEY(recipient)REFERENCES Users(nickName)
		);`)

	Database.Exec(`CREATE TABLE IF NOT EXISTS "Followers" (
		"followerID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
		"followerFName" TEXT NOT NULL,
		"followerLName" TEXT NOT NULL,
		"influencerID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
		"influencerFName" TEXT NOT NULL,
		"influencerLName" TEXT NOT NULL,
		"accepted" TEXT,
		"unfollow" TEXT			
		);`)

	Database.Exec(`CREATE TABLE IF NOT EXISTS Profile (
		"userID" INTEGER,
		"postID" INTEGER,
		"followerID" INTEGER,
		"influencerID" INTEGER,
		FOREIGN KEY(followerID)REFERENCES Followers(followerID),
		FOREIGN KEY(postID)REFERENCES Posts(postID),
		FOREIGN KEY(userID)REFERENCES Users(id)
		);
		`)

	if err != nil {
		log.Fatal(err.Error())
	}
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
		return errors.New("email already taken")
	}

	_, err := Database.Exec("INSERT INTO Users (email, password) VALUES (?, ?)", email, password)
	if err != nil {
		log.Println(err)
		return errors.New("failed to register user")
	}

	return nil
}
