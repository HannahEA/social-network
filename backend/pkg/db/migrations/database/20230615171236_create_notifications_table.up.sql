-- notifications types:  'private_chat', 'group_chat', 'follow', 'group', or 'event'
-- status can be: 'pending', 'approved' or 'declined'.
CREATE TABLE IF NOT EXISTS "Notifications" ( 
            "notificationID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            "sender" TEXT,
            "recipient" TEXT,
            "privateChatID" INTEGER,
            "groupChatID" INTEGER,
            "eventID" INTEGER,
            "message" TEXT,
            "type"    TEXT,
            "status" TEXT,
            "created_at" TEXT DEFAULT (datetime('now', 'localtime')),
            FOREIGN KEY(sender)REFERENCES Users(nickName),
            FOREIGN KEY(recipient)REFERENCES Users(nickName),
            FOREIGN KEY(privateChatID)REFERENCES PrivateChat(conversationID),
            FOREIGN KEY(groupChatID)REFERENCES GroupChats(conversationID),
            FOREIGN KEY(eventID)REFERENCES Events(eventID)
            );