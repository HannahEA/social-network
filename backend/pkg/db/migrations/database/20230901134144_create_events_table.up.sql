CREATE TABLE IF NOT EXISTS "Events" ( 
            "eventID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            "groupID" INTEGER,
            "groupName" TEXT,
            "organizer"  TEXT,
            "title" TEXT,
            "description" TEXT,
            "day_time" TEXT,
           FOREIGN KEY(groupID)REFERENCES EventsParticipants(groupID),
           FOREIGN KEY(eventID)REFERENCES EventsParticipants(eventID)
           FOREIGN KEY(organizer)REFERENCES Users(nickName)
           );