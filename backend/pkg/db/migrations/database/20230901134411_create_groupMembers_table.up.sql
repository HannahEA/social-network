-- Values for the 'status' field can be 'pending', 'approved' or 'declined'.
CREATE TABLE IF NOT EXISTS "GroupMembers" ( 
            "membershipID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            "groupID" INTEGER,
            "creator"  TEXT,
            "member" TEXT,
            "status" TEXT,
           FOREIGN KEY(groupID)REFERENCES Groups(groupID),
           FOREIGN KEY(creator)REFERENCES Users(nickName),
           FOREIGN KEY(member)REFERENCES Users(nickName)
);
