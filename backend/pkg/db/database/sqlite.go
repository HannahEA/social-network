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
	sqliteDatabase, err1 := sql.Open("sqlite3", "database.db")
	if err1 != nil {
		log.Fatal(err1.Error())
	}
	//create User Table 
	_, errUserTbl := sqliteDatabase.Exec(`
		CREATE TABLE IF NOT EXISTS "Users" (
			"userID"	TEXT UNIQUE,
			"nickName" TEXT UNIQUE,
			"age" TEXT,
			"gender" TEXT,
			"firstName" TEXT,
			"lastName" TEXT,
			"email" 	TEXT UNIQUE,
			"passwordhash"	TEXT UNIQUE,
			"avatar" 	TEXT,
			"image" TEXT,
			"aboutMe" TEXT
			"visibility" TEXT
		);
	`)
	if errUserTbl != nil {
		fmt.Println("USER TABLE ERROR")
		log.Fatal(errUserTbl.Error())
	}
	// creat followers table
	_, errFollowersTbl := sqliteDatabase.Exec(`
		CREATE TABLE IF NOT EXISTS "Followers" (
			"followerId"	TEXT,
			"influencerId" TEXT
		);
	`)
	if errFollowersTbl != nil {
		fmt.Println("FOLLOWER TABLE ERROR")
		log.Fatal(errFollowersTbl.Error())
	}
	// create sessions table 
	_, errSessionsTbl := sqliteDatabase.Exec(`
		CREATE TABLE IF NOT EXISTS "Sessions" (
			"userId"	TEXT UNIQUE,
			"cookieName" TEXT UNIQUE,
			"cookieId" TEXT UNIQUE
		);
	`)
	if errSessionsTbl != nil {
		fmt.Println("SESSIONS TABLE ERROR")
		log.Fatal(errSessionsTbl.Error())
	}
	//create posts table
	_, errPostsTbl := sqliteDatabase.Exec(`
		CREATE TABLE IF NOT EXISTS "Posts" (
			"postId"	TEXT UNIQUE,
			"authorId" TEXT,
			"title" TEXT,
			"content" TEXT,
			"category" TEXT,
			"creationDate" TEXT,
			"postVisibility" TEXT
		);
	`)
	if errPostsTbl != nil {
		fmt.Println("POSTS TABLE ERROR")
		log.Fatal(errPostsTbl.Error())
	}
	//create category table 
	_, errCategoryTbl := sqliteDatabase.Exec(`
		CREATE TABLE IF NOT EXISTS "Comments" (
			"category"	TEXT UNIQUE,
			"postId" TEXT
		);
	`)
	if errCategoryTbl != nil {
		fmt.Println("CATEGORY TABLE ERROR")
		log.Fatal(errCategoryTbl.Error())
	}
	//create Comments Table 
	_, errCommentsTbl := sqliteDatabase.Exec(`
		CREATE TABLE IF NOT EXISTS "Comments" (
			"commentId"	TEXT UNIQUE,
			"postId" TEXT,
			"authorId" TEXT,
			"content" TEXT,
			"creationDate" TEXT
		);
	`)
	if errCommentsTbl != nil {
		fmt.Println("Comments TABLE ERROR")
		log.Fatal(errCommentsTbl.Error())
	}
	//create Groups Table 
	_, errGroupsTbl := sqliteDatabase.Exec(`
		CREATE TABLE IF NOT EXISTS "Groups" (
			"groupID"	TEXT UNIQUE,
			"groupTitle" TEXT,
			"Description" TEXT,
			"groupMember" TEXT
		);
	`)
	if errGroupsTbl != nil {
		fmt.Println("GROUP TABLE ERROR")
		log.Fatal(errGroupsTbl.Error())
	}
	//create group posts table 
	_, errGroupPostsTbl := sqliteDatabase.Exec(`
		CREATE TABLE IF NOT EXISTS "GroupPosts" (
			"groupID"	TEXT UNIQUE,
			"postId" TEXT,
			"authorId" TEXT,
			"title" TEXT,
			"content" TEXT,
			"category" TEXT,
			"creationDate" TEXT,
			"image" TEXT
		);
	`)
	if errGroupPostsTbl != nil {
		fmt.Println("GROUP POSTS TABLE ERROR")
		log.Fatal(errGroupPostsTbl.Error())
	}
	//create group comments table 
	_, errGroupCommentsTbl := sqliteDatabase.Exec(`
		CREATE TABLE IF NOT EXISTS "GroupComments" (
			"groupID"	TEXT UNIQUE,
			"postId" TEXT,
			"commentId" TEXT,
			"authorId" TEXT,
			"content" TEXT,
			"creationDate" TEXT
		);
	`)
	if errGroupCommentsTbl != nil {
		fmt.Println("GROUP COMMENTS TABLE ERROR")
		log.Fatal(errGroupCommentsTbl.Error())
	}
	//create group chat table
	_, errGroupChatsTbl := sqliteDatabase.Exec(`
		CREATE TABLE IF NOT EXISTS "GroupChats" (
			"groupID"	TEXT UNIQUE,
			"senderId" TEXT,
			"chatId" TEXT,
			"creationDate" TEXT
		);
	`)
	if errGroupChatsTbl != nil {
		fmt.Println("GROUP Chats TABLE ERROR")
		log.Fatal(errGroupChatsTbl.Error())
	}
	// create group events table 
	_, errGroupEventsTbl := sqliteDatabase.Exec(`
		CREATE TABLE IF NOT EXISTS "GroupEvents" (
			"groupID"	TEXT,
			"eventId" TEXT UNIQUE,
			"eventTitle" TEXT,
			"eventDescription" TEXT,
			"eventTime" TEXT,
			"going" TEXT,
			"notGoing" TEXT
		);
	`)
	if errGroupEventsTbl != nil {
		fmt.Println("GROUP EVENTS TABLE ERROR")
		log.Fatal(errGroupEventsTbl.Error())
	}
	// create notifications table 
	_, errNotificationsTbl := sqliteDatabase.Exec(`
		CREATE TABLE IF NOT EXISTS "Notifications" (
			"notificationId"	TEXT UNIQUE,
			"senderId" TEXT UNIQUE,
			"recieverId" TEXT,
			"count" TEXT,
			"followingRequest" TEXT,
			"joinGroupRequest" TEXT,
			"groupInvite" TEXT,
			"groupEvent" TEXT
		);
	`)
	if errNotificationsTbl != nil {
		fmt.Println("NOTIFICATIONS TABLE ERROR")
	}	
	//create chat table 
	_, errChatsTbl := sqliteDatabase.Exec(`
		CREATE TABLE IF NOT EXISTS "Chats" (
			"chatId"	TEXT UNIQUE,
			"senderId" TEXT,
			"creationDate" TEXT,
			"toFollower" TEXT,
			"toPublic" TEXT,
			"toInfluencer" TEXT
		);
	`)
	if errChatsTbl != nil {
		fmt.Println("Chats TABLE ERROR")
	}
	// create message history table 
	_, errMessageHistoryTbl := sqliteDatabase.Exec(`
		CREATE TABLE IF NOT EXISTS "MessageHistory" (
			"messageId"	TEXT UNIQUE,
			"chatId" TEXT,
			"senderId" TEXT,
			"recieverId" TEXT,
			"content" TEXT,
			"creationDate" TEXT
		);
	`)
	if errMessageHistoryTbl != nil {
		fmt.Println("MessageHistory TABLE ERROR")
	}

	Database = sqliteDatabase
}
