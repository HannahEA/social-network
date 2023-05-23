package database

import (
	"database/sql"
	"fmt"
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

	// Create the Users table if it doesn't exist
	//"passwordhash" BLOB NOT NULL
	_, err0 := sqliteDatabase.Exec(`
	CREATE TABLE IF NOT EXISTS Users (
		"id" INTEGER PRIMARY KEY AUTOINCREMENT,
		"firstName" TEXT ,
		"lastName" TEXT,				
		"nickName" TEXT,
		"age" INTEGER,
		"gender" TEXT ,
		"email" TEXT NOT NULL UNIQUE, 
			"password" BLOB NOT NULL,
			"Avatar" BLOB,
			"Image" BLOB,
			"abouitMe" BLOB 
			);
			`)

	if err0 != nil {
		fmt.Print("Users table not built")
		log.Fatal(err0.Error())

	}

	// sessions table
	_, err1 := sqliteDatabase.Exec(`
			CREATE TABLE IF NOT EXISTS "Sessions" ( 
				"userID" INTEGER NOT NULL,
				"cookieName" TEXT NOT NULL,
				"cookieValue" STRING NOT NULL PRIMARY KEY, 
				FOREIGN KEY(userID)REFERENCES Users(id)
				);`)

	if err1 != nil {
		fmt.Print("Sessions table not built")
		log.Fatal(err1.Error())
	}

	// category table
	_, err2 := sqliteDatabase.Exec(`
				CREATE TABLE IF NOT EXISTS "Category" (
					"postID" INTEGER REFERENCES Post(postID), 
					"category" TEXT NOT NULL
					);`)

	if err2 != nil {
		fmt.Print("Category table not built")
		log.Fatal(err2.Error())
	}

	// Create Post table if none exists
	_, err3 := sqliteDatabase.Exec(`
	CREATE TABLE IF NOT EXISTS "Posts" ( 
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

	if err3 != nil {
		fmt.Print("Posts table not built")
		log.Fatal(err3.Error())
	}

	// comments table
	_, err4 := sqliteDatabase.Exec(`CREATE TABLE IF NOT EXISTS "Comments" ( 
			"commentID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
			"postID" INTEGER NOT NULL,
			"authorID" INTEGER NOT NULL,
			"author" TEXT NOT NULL,
			"content" TEXT NOT NULL, 
			"creationDate" TIMESTAMP,
		FOREIGN KEY(postID)REFERENCES Posts(postID),
		FOREIGN KEY(authorID)REFERENCES Users(id)
		);`)

	if err4 != nil {
		fmt.Print("Comments table not built")
		log.Fatal(err4.Error())
	}

	// Notifications table
	_, err5 := sqliteDatabase.Exec(`CREATE TABLE IF NOT EXISTS "Notifications" ( 
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

	if err5 != nil {
		fmt.Print("Notifications table not built")
		log.Fatal(err5.Error())
	}

	// Chats table
	_, err6 := sqliteDatabase.Exec(`CREATE TABLE IF NOT EXISTS "Chats" ( 
				"chatID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
				"userID" TEXT NOT NULL,
				"user" TEXT NOT NULL,
				"toPublic" TEXT NOT NULL,
				"toInfluencer" TEXT NOT NULL,
				"toFollower" TEXT NOT NULL,
				"creationDate" TIMESTAMP, 
				FOREIGN KEY(user)REFERENCES Users(nickName),
				FOREIGN KEY(userID)REFERENCES Users(id)
				);`)

	if err6 != nil {
		fmt.Print("Chats table not built")
		log.Fatal(err6.Error())
	}

	// MessageHistory table
	_, err7 := sqliteDatabase.Exec(`CREATE TABLE IF NOT EXISTS "MessageHistory" ( 
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

	if err7 != nil {
		fmt.Print("MessageHistory table not built")
		log.Fatal(err7.Error())
	}

	_, err8 := sqliteDatabase.Exec(`CREATE TABLE IF NOT EXISTS "Followers" (
						"userID" INTEGER, 
						"followerID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
						"followerFName" TEXT NOT NULL,
						"followerLName" TEXT NOT NULL,
						"influencerFName" TEXT NOT NULL,
						"influencerLName" TEXT NOT NULL,
						"accepted" TEXT,
						"unfollow" TEXT,
						FOREIGN KEY(userID)REFERENCES Users(id),
						FOREIGN KEY(followerID)REFERENCES Users(id)
						);`)

	if err8 != nil {
		fmt.Print("Followers table not built")
		log.Fatal(err8.Error())
	}

	_, err9 := sqliteDatabase.Exec(`CREATE TABLE IF NOT EXISTS Profile (
							"userID" INTEGER,
							"postID" INTEGER,
							"followerID" INTEGER,
							"influencerID" INTEGER,
							FOREIGN KEY(followerID)REFERENCES Followers(followerID),
							FOREIGN KEY(postID)REFERENCES Posts(postID),
							FOREIGN KEY(userID)REFERENCES Users(id)
							);
							`)

	if err9 != nil {
		fmt.Print("Profile table not built")
		log.Fatal(err9.Error())
	}
	Database = sqliteDatabase

	// if err != nil {
	// 	log.Fatal(err.Error())
	// }
}
