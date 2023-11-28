CREATE TABLE IF NOT EXISTS "GroupChats" (
						"conversationID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
                        "groupID" INTEGER NOT NULL,
						"groupName" TEXT NOT NULL,
						"participant" TEXT NOT NULL,
                        FOREIGN KEY(groupID)REFERENCES Groups(groupID),
						FOREIGN KEY(participant)REFERENCES Users(nickName)
						);