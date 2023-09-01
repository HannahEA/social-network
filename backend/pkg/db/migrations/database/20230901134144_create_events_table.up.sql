CREATE TABLE IF NOT EXISTS "Events" ( 
            "eventID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            "groupID" INTEGER,
            "organizer"  TEXT,
            "title" TEXT,
            "description" TEXT,
            "day_time" TEXT,
           FOREIGN KEY(groupID)REFERENCES Groups(groupID),
           FOREIGN KEY(organizer)REFERENCES Users(nickName)
           );