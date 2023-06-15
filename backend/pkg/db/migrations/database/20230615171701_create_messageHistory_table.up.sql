CREATE TABLE IF NOT EXISTS "MessageHistory" ( 
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
					);