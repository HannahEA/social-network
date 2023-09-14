--The 'option' field values can be: 'pending', 'going', 'not_going'.
CREATE TABLE IF NOT EXISTS "EventsParticipants" ( 
            "inviteID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            "eventID" INTEGER,
            "participantID" INTEGER,
            "option" TEXT,
           FOREIGN KEY(eventID)REFERENCES Events(eventID),
           FOREIGN KEY(participantID)REFERENCES Users(id)
           );