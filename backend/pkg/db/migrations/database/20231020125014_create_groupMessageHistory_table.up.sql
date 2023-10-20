CREATE TABLE IF NOT EXISTS "GroupMessageHistory" ( 
					"messageID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
					"chatID" INTEGER,
					"chatMessage" STRING NOT NULL,
					"sender" TEXT,
					"groupID" INTEGER NOT NULL,
					"creationDate" TIMESTAMP, 
					"emoji" BLOB,
					FOREIGN KEY(chatID)REFERENCES GroupChats(conversationID),
					FOREIGN KEY(sender)REFERENCES Users(nickName),
					FOREIGN KEY(groupID)REFERENCES Groups(groupID)
					);