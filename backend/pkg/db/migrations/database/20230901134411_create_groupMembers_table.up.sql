-- Values for the 'status' field can be 'Yes' 'memberPending', or 'creatorPending' .
CREATE TABLE IF NOT EXISTS "GroupMembers" ( 
            "membershipID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            "grpID" INTEGER,
            "creator"  TEXT,
            "member" TEXT,
            "status" TEXT,
           FOREIGN KEY(grpID)REFERENCES Groups(groupID),
           FOREIGN KEY(creator)REFERENCES Users(nickName),
           FOREIGN KEY(member)REFERENCES Users(nickName)
);
