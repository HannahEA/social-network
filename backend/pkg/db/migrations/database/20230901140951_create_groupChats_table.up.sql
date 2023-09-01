CREATE TABLE IF NOT EXISTS "GroupChats" (
						"conversationID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
                        "groupID" INTEGER NOT NULL,
						"participant1" TEXT NOT NULL,
						"participant2" TEXT NOT NULL,
                        FOREIGN KEY(groupID)REFERENCES Groups(groupID),
						FOREIGN KEY(participant1)REFERENCES Users(nickName)
						);