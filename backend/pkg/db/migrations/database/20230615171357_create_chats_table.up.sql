CREATE TABLE IF NOT EXISTS "GroupChats" ( 
				"groupChatID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
				"userID" TEXT NOT NULL,
				"user" TEXT NOT NULL,
				"toPublic" TEXT NOT NULL,
				"toInfluencer" TEXT NOT NULL,
				"toFollower" TEXT NOT NULL,
				"creationDate" TIMESTAMP, 
				FOREIGN KEY(user)REFERENCES Users(nickName),
				FOREIGN KEY(userID)REFERENCES Users(id)
				);