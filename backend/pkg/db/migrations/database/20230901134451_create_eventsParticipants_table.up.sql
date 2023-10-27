--The 'option' field values can be: 'pending', 'going', 'not_going'.
CREATE TABLE IF NOT EXISTS "EventsParticipants" ( 
            "inviteID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            "eventID" INTEGER,
            "groupID" INTEGER,
            "organizer" TEXT,
            "participant" TEXT,
            "option" TEXT,
           FOREIGN KEY(eventID)REFERENCES Events(eventID),
           FOREIGN KEY(organizer)REFERENCES Users(nickName),
           FOREIGN KEY(participant)REFERENCES Users(nickName),
           FOREIGN KEY(groupID)REFERENCES Groups(groupID)
           );