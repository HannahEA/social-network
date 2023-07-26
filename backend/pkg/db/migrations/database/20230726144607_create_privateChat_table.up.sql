CREATE TABLE IF NOT EXISTS "PrivateChat" (
						"conversationID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
						"participant1" TEXT NOT NULL,
						"participant2" TEXT NOT NULL,
						FOREIGN KEY(participant1)REFERENCES Users(nickName)
						);