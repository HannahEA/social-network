-- notifications types: followingRequest, joinGroup, groupInvite, groupEvent
CREATE TABLE IF NOT EXISTS "Notifications" ( 
			"notificationID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
			"sender" TEXT,
			"recipient" TEXT,
			"count" INTEGER,
			"type"	TEXT,
			"request" TEXT,
			FOREIGN KEY(sender)REFERENCES MessageHistory(sender),
			FOREIGN KEY(recipient)REFERENCES MessageHistory(recipient)
			);