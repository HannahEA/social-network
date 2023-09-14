-- Values for the 'status' field can be 'pending', 'approved' or 'declined'.
CREATE TABLE IF NOT EXISTS "GroupMembers" ( 
            "membershipID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            "groupID" INTEGER,
            "memberID" INTEGER,
            "status" TEXT,
           FOREIGN KEY(groupID)REFERENCES Groups(groupID),
           FOREIGN KEY(memberID)REFERENCES Users(id)
);
