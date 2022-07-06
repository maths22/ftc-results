CREATE TABLE preferences (id VARCHAR PRIMARY KEY, value VARCHAR);
CREATE TABLE teams (number INTEGER PRIMARY KEY, advancement INTEGER, division INTEGER, inspireEligible BOOLEAN, competing TEXT DEFAULT 'FULL');
CREATE TABLE teamInfo (number INTEGER PRIMARY KEY, name VARCHAR, school VARCHAR, city VARCHAR, state VARCHAR, country VARCHAR, rookie INTEGER);

CREATE TABLE formRows (formID VARCHAR, row INTEGER, type VARCHAR, columnCount INTEGER, description VARCHAR, rule VARCHAR, PRIMARY KEY(formID, row));
CREATE TABLE formItems (formID VARCHAR, row INTEGER, itemIndex INTEGER, label VARCHAR, type VARCHAR, PRIMARY KEY (formID, row, itemIndex), FOREIGN KEY (formID, row) REFERENCES formRows(formID,row));
CREATE TABLE formStatus (team INTEGER REFERENCES teams(number), formID VARCHAR, row INTEGER, itemIndex INTEGER, value BOOLEAN, PRIMARY KEY (team, formID, row, itemIndex), FOREIGN KEY (formID, row, itemIndex) REFERENCES formItems(formID, row, itemIndex));
CREATE TABLE formComments (team INTEGER REFERENCES teams(number), formID VARCHAR, comment VARCHAR, PRIMARY KEY (team, formID));
CREATE TABLE formSigs (team INTEGER REFERENCES teams(number), formID VARCHAR, sigIndex INTEGER, sig VARCHAR, PRIMARY KEY (team, formID, sigIndex));
CREATE TABLE formTypes (code VARCHAR PRIMARY KEY, name VARCHAR, abbrev VARCHAR, statusType VARCHAR);

CREATE TABLE status (team INTEGER REFERENCES teams(number), stage VARCHAR, status INTEGER, PRIMARY KEY (team, stage));

CREATE TABLE station (type VARCHAR PRIMARY KEY, count INTEGER);
CREATE TABLE slots (start DATETIME, end DATETIME, type VARCHAR REFERENCES station(type), stationIndex INTEGER, team INTEGER, PRIMARY KEY(type, stationIndex, start));

CREATE TABLE matchSchedule (start DATETIME PRIMARY KEY, end DATETIME, type INTEGER, label VARCHAR);
CREATE TABLE blocks (start INTEGER PRIMARY KEY, type INTEGER, duration INTEGER, count INTEGER, label VARCHAR);
CREATE TABLE selections (id INTEGER PRIMARY KEY, op INTEGER, alliance INTEGER, team INTEGER REFERENCES teams(number));
CREATE TABLE alliances (rank INTEGER PRIMARY KEY, team1 INTEGER REFERENCES teams(number), team2 INTEGER REFERENCES teams(number), team3 INTEGER REFERENCES teams(number), backupTeam INTEGER REFERENCES teams(number), backupReplaces INTEGER REFERENCES teams(number));

CREATE TABLE quals (match INTEGER PRIMARY KEY, red1 INTEGER REFERENCES teams(number), red1S BOOLEAN, red2 INTEGER REFERENCES teams(number), red2S BOOLEAN, red3 INTEGER REFERENCES teams(number), red3S BOOLEAN, blue1 INTEGER REFERENCES teams(number), blue1S BOOLEAN, blue2 INTEGER REFERENCES teams(number), blue2S BOOLEAN, blue3 INTEGER REFERENCES teams(number), blue3S BOOLEAN);
CREATE TABLE qualsData (match INTEGER PRIMARY KEY REFERENCES quals(match), status INTEGER, randomization INTEGER, start DATETIME, scheduleStart DATETIME, postedTime DATETIME, FMSMatchId BLOB, FMSScheduleDetailId BLOB);
CREATE TABLE qualsResults (match INTEGER PRIMARY KEY REFERENCES quals(match), redScore INTEGER, blueScore INTEGER, redPenaltyCommitted INTEGER, bluePenaltyCommitted INTEGER);
CREATE TABLE qualsScores (match INTEGER REFERENCES quals(match), alliance INTEGER, card1 INTEGER, card2 INTEGER, card3 INTEGER, dq1 INTEGER, dq2 INTEGER, dq3 INTEGER, noshow1 INTEGER, noshow2 INTEGER, noshow3 INTEGER, frontMajor INTEGER, backMajor INTEGER, frontMinor INTEGER, backMinor INTEGER, adjust INTEGER, PRIMARY KEY (match, alliance));
CREATE TABLE qualsGameSpecific (match INTEGER REFERENCES quals(match), alliance INTEGER, initTSE1 INTEGER, initTSE2 INTEGER, initTSE3 INTEGER, navigated1 INTEGER, navigated2 INTEGER, navigated3 INTEGER, carousel INTEGER, preload1 INTEGER, preload2 INTEGER, preload3 INTEGER, autoFreight1 INTEGER, autoFreight2 INTEGER, autoFreight3 INTEGER, autoCoopFreight INTEGER, dcFreight1 INTEGER, dcFreight2 INTEGER, dcFreight3 INTEGER, sharedFreight INTEGER, dcCoopFreight INTEGER, egDelivered INTEGER, balanced INTEGER, sharedTipped INTEGER, parked1 INTEGER, parked2 INTEGER, parked3 INTEGER, capped INTEGER, coopBalanced INTEGER, PRIMARY KEY (match, alliance));

CREATE TABLE elims (match INTEGER PRIMARY KEY, red INTEGER REFERENCES alliances(rank), blue INTEGER REFERENCES alliances(rank));
CREATE TABLE elimsData (match INTEGER PRIMARY KEY REFERENCES elims(match), status INTEGER, randomization INTEGER, start DATETIME, postedTime DATETIME, FMSMatchId BLOB, FMSScheduleDetailId BLOB);
CREATE TABLE elimsResults (match INTEGER PRIMARY KEY REFERENCES elims(match), redScore INTEGER, blueScore INTEGER, redPenaltyCommitted INTEGER, bluePenaltyCommitted INTEGER);
CREATE TABLE elimsScores (match INTEGER REFERENCES elims(match), alliance INTEGER, card INTEGER, dq INTEGER, backupPlayed BOOLEAN, noshow1 INTEGER, noshow2 INTEGER, noshow3 INTEGER, frontMajor INTEGER, backMajor INTEGER, frontMinor INTEGER, backMinor INTEGER, adjust INTEGER, PRIMARY KEY (match, alliance));
CREATE TABLE elimsGameSpecific (match INTEGER REFERENCES elims(match), alliance INTEGER, initTSE1 INTEGER, initTSE2 INTEGER, initTSE3 INTEGER, navigated1 INTEGER, navigated2 INTEGER, navigated3 INTEGER, carousel INTEGER, preload1 INTEGER, preload2 INTEGER, preload3 INTEGER, autoFreight1 INTEGER, autoFreight2 INTEGER, autoFreight3 INTEGER, autoCoopFreight INTEGER, dcFreight1 INTEGER, dcFreight2 INTEGER, dcFreight3 INTEGER, sharedFreight INTEGER, dcCoopFreight INTEGER, egDelivered INTEGER, balanced INTEGER, sharedTipped INTEGER, parked1 INTEGER, parked2 INTEGER, parked3 INTEGER, capped INTEGER, coopBalanced INTEGER, PRIMARY KEY (match, alliance));

CREATE TABLE qualsCommitHistory (match INTEGER, ts INTEGER, start INTEGER, random INTEGER, type INTEGER, PRIMARY KEY(match, ts));
CREATE TABLE elimsCommitHistory (match INTEGER, ts INTEGER, start INTEGER, random INTEGER, type INTEGER, PRIMARY KEY(match, ts));
CREATE TABLE qualsScoresHistory (match INTEGER, ts INTEGER , alliance INTEGER, card1 INTEGER, card2 INTEGER, card3 INTEGER, dq1 INTEGER, dq2 INTEGER, dq3 INTEGER, noshow1 INTEGER, noshow2 INTEGER, noshow3 INTEGER, frontMajor INTEGER, backMajor INTEGER, frontMinor INTEGER, backMinor INTEGER, adjust INTEGER, PRIMARY KEY (match,ts, alliance), FOREIGN KEY(match, ts) REFERENCES qualsCommitHistory(match, ts));
CREATE TABLE qualsGameSpecificHistory (match INTEGER, ts INTEGER, alliance INTEGER, initTSE1 INTEGER, initTSE2 INTEGER, initTSE3 INTEGER, navigated1 INTEGER, navigated2 INTEGER, navigated3 INTEGER, carousel INTEGER, preload1 INTEGER, preload2 INTEGER, preload3 INTEGER, autoFreight1 INTEGER, autoFreight2 INTEGER, autoFreight3 INTEGER, autoCoopFreight INTEGER, dcFreight1 INTEGER, dcFreight2 INTEGER, dcFreight3 INTEGER, sharedFreight INTEGER, dcCoopFreight INTEGER, egDelivered INTEGER, balanced INTEGER, sharedTipped INTEGER, parked1 INTEGER, parked2 INTEGER, parked3 INTEGER, capped INTEGER, coopBalanced INTEGER, PRIMARY KEY (match, ts, alliance), FOREIGN KEY(match, ts) REFERENCES qualsCommitHistory(match, ts));
CREATE TABLE elimsScoresHistory (match INTEGER, ts INTEGER, alliance INTEGER, card INTEGER, dq INTEGER, backupPlayed BOOLEAN, noshow1 INTEGER, noshow2 INTEGER, noshow3 INTEGER, frontMajor INTEGER, backMajor INTEGER, frontMinor INTEGER, backMinor INTEGER, adjust INTEGER, PRIMARY KEY (match, ts, alliance), FOREIGN KEY(match, ts) REFERENCES elimsCommitHistory(match, ts));
CREATE TABLE elimsGameSpecificHistory (match INTEGER, ts INTEGER, alliance INTEGER, initTSE1 INTEGER, initTSE2 INTEGER, initTSE3 INTEGER, navigated1 INTEGER, navigated2 INTEGER, navigated3 INTEGER, carousel INTEGER, preload1 INTEGER, preload2 INTEGER, preload3 INTEGER, autoFreight1 INTEGER, autoFreight2 INTEGER, autoFreight3 INTEGER, autoCoopFreight INTEGER, dcFreight1 INTEGER, dcFreight2 INTEGER, dcFreight3 INTEGER, sharedFreight INTEGER, dcCoopFreight INTEGER, egDelivered INTEGER, balanced INTEGER, sharedTipped INTEGER, parked1 INTEGER, parked2 INTEGER, parked3 INTEGER, capped INTEGER, coopBalanced INTEGER, PRIMARY KEY (match, ts, alliance), FOREIGN KEY(match, ts) REFERENCES elimsCommitHistory(match, ts));

CREATE TABLE inspectionScheduleForm(id INTEGER PRIMARY KEY, str VARCHAR);
CREATE TABLE inspectionScheduleItems(id INTEGER PRIMARY KEY, team INTEGER REFERENCES teams(number), name VARCHAR, stationNumber INTEGER, startTime INTEGER, totalTime INTEGER, month INTEGER, day INTEGER, year INTEGER );

CREATE TABLE sponsors (id INTEGER PRIMARY KEY, name VARCHAR, level INTEGER, logoPath VARCHAR, orderingCriteria INTEGER);

CREATE TABLE config (key VARCHAR PRIMARY KEY, value VARCHAR);

CREATE TABLE leagueHistory (team INTEGER, eventCode VARCHAR, match INTEGER, sortOrder1 VARCHAR, sortOrder2 VARCHAR, sortOrder3 VARCHAR, sortOrder4 VARCHAR, sortOrder5 VARCHAR, sortOrder6 VARCHAR, matchOutcome VARCHAR, PRIMARY KEY(team, eventCode, match));
CREATE TABLE leagueMeets (eventCode VARCHAR PRIMARY KEY, name VARCHAR, start DATETIME, end DATETIME);
CREATE TABLE leagueMembers (code VARCHAR, team INTEGER, PRIMARY KEY(code, team));
CREATE TABLE leagueInfo (code VARCHAR PRIMARY KEY, name VARCHAR, country VARCHAR, state VARCHAR, city VARCHAR);
CREATE TABLE leagueConfig (league VARCHAR, key VARCHAR, value VARCHAR, PRIMARY KEY (league, key));
CREATE TABLE divisions (id INTEGER PRIMARY KEY, name VARCHAR, abbrev VARCHAR);

CREATE TABLE syncLog (id INTEGER, type TEXT, param INTEGER, status TEXT, ts INTEGER, PRIMARY KEY (id));

CREATE TABLE Award (FMSAwardId BLOB PRIMARY KEY, FMSSeasonId BLOB, AwardId INTEGER, AwardSubtypeId INTEGER, TournamentType INTEGER, Type INTEGER, CultureType INTEGER, Description TEXT, DefaultQuantity INTEGER, SponsorDetails BLOB, DisplayOrderUi INTEGER, DisplayOrderOnline INTEGER, CMPQualifying INTEGER, AllowManualEntry INTEGER, CreatedOn TEXT, CreatedBy TEXT, ModifiedOn TEXT, ModifiedBy TEXT, Script TEXT, CanEdit INTEGER);
CREATE TABLE AwardAssignment (FMSAwardId BLOB REFERENCES Award(FMSAwardId) ON DELETE CASCADE, FMSEventId BLOB, Series INTEGER, FMSTeamId BLOB, FirstName TEXT, LastName TEXT, IsPublic INTEGER, CreatedOn TEXT, CreatedBy TEXT, ModifiedOn TEXT, ModifiedBy TEXT, Comment TEXT, PRIMARY KEY(FMSAwardId, FMSEventId, Series) );
CREATE TABLE TeamRanking (FMSEventId BLOB, FMSTeamId BLOB, Ranking INTEGER, RankChange INTEGER, Wins INTEGER, Losses INTEGER, Ties INTEGER, QualifyingScore TEXT, PointsScoredTotal INTEGER, PointsScoredAverage TEXT, PointsScoredAverageChange INTEGER, MatchesPlayed INTEGER, Disqualified INTEGER, SortOrder1 TEXT, SortOrder2 TEXT, SortOrder3 TEXT, SortOrder4 TEXT, SortOrder5 TEXT, SortOrder6 TEXT, ModifiedOn TEXT, PRIMARY KEY (FMSEventId, FMSTeamId));
CREATE TABLE Team (FMSTeamId BLOB PRIMARY KEY, FMSSeasonId BLOB, FMSRegionId BLOB, TeamId INTEGER, TeamNumber INTEGER, TeamNameLong TEXT, TeamNameShort TEXT, RobotName TEXT, City TEXT, StateProv TEXT, Country TEXT, Website TEXT, RookieYear INTEGER, WasAddedFromUI INTEGER, CMPPrequalified INTEGER, SchoolName TEXT, DemoTeam INTEGER, FMSHomeCMPId BLOB, GameSpecifics BLOB, CreatedOn TEXT, CreatedBy TEXT, ModifiedOn TEXT, ModifiedBy TEXT);
CREATE TABLE ScheduleDetail (FMSScheduleDetailId BLOB PRIMARY KEY, FMSEventId BLOB, TournamentLevel INTEGER, MatchNumber INTEGER, FieldType INTEGER, Description TEXT, StartTime TEXT, FieldConfigurationDetails BLOB, CreatedOn TEXT, CreatedBy TEXT, ModifiedOn TEXT, ModifiedBy TEXT, RowVersion BLOB);
CREATE TABLE ScheduleStation (FMSScheduleDetailId BLOB REFERENCES ScheduleDetail(FMSScheduleDetailId) ON DELETE CASCADE, Alliance INTEGER, Station INTEGER, FMSEventId BLOB, FMSTeamId BLOB, IsSurrogate INTEGER, CreatedOn TEXT, CreatedBy TEXT, ModifiedOn TEXT, ModifiedBy TEXT, PRIMARY KEY (FMSSCheduleDetailId, Alliance, Station));
CREATE TABLE Match ( FMSMatchId BLOB PRIMARY KEY, FMSScheduleDetailId BLOB REFERENCES ScheduleDetail(FMSScheduleDetailId) ON DELETE CASCADE, PlayNumber INTEGER, FieldType INTEGER, InitialPreStartTime TEXT, FinalPreStartTime TEXT, PreStartCount INTEGER, AutoStartTime TEXT, AutoEndTime TEXT, TeleopStartTime TEXT, TeleopEndTime TEXT, RefCommitTime TEXT, ScoreKeeperCommitTime TEXT, PostMatchTime TEXT, CancelMatchTime TEXT, CycleTime TEXT, RedScore INTEGER, BlueScore INTEGER, RedPenalty INTEGER, BluePenalty INTEGER, RedAutoScore INTEGER, BlueAutoScore INTEGER, ScoreDetails BLOB, HeadRefReview INTEGER, VideoUrl TEXT, CreatedOn TEXT, CreatedBy TEXT, ModifiedOn TEXT, ModifiedBy TEXT, FMSEventId BLOB, RowVersion BLOB );

CREATE TABLE IF NOT EXISTS _patches ( patchId VARCHAR PRIMARY KEY NOT NULL, dbVersion INTEGER NOT NULL, patch TEXT NOT NULL, applied BOOLEAN NOT NULL DEFAULT 0);

INSERT OR IGNORE INTO _patches (patchId, dbVersion, patch) VALUES ('01_revampSponsors', 1, '["ALTER TABLE sponsors RENAME TO legacySponsors","CREATE TABLE sponsors (sponsorId BLOB PRIMARY KEY, name VARCHAR, title VARCHAR, position INTEGER, logo TEXT, level INTEGER);"]');
INSERT OR IGNORE INTO _patches (patchId, dbVersion, patch) VALUES ('02_createChatMessages', 2, '["CREATE TABLE chatMessages (id INTEGER PRIMARY KEY, sender VARCHAR, body VARCHAR, cloudAttachments TEXT, localAttachments TEXT, metadata TEXT, sentAt DATETIME, state VARCHAR);"]');
INSERT OR IGNORE INTO _patches (patchId, dbVersion, patch) VALUES ('03_addFTANotes', 3, '["CREATE TABLE teamIssues (shortName VARCHAR, team INT, id INT, type VARCHAR, summary TEXT, details TEXT, resolved BOOLEAN, PRIMARY KEY (shortName, team, id))"]');
INSERT OR IGNORE INTO _patches (patchId, dbVersion, patch) VALUES ('04_addHrNotes', 4, '["CREATE TABLE hrMatchNotes (shortName VARCHAR PRIMARY KEY, summary TEXT)", "CREATE TABLE hrNoteItems (shortName VARCHAR, id INT, content VARCHAR, tags VARCHAR, PRIMARY KEY (shortName, id))", "CREATE TABLE hrMeetingNotes (type VARCHAR PRIMARY KEY, content TEXT)"]');

INSERT INTO config VALUES ('db.version', '2022cri_0');
INSERT INTO config VALUES ('db.version.initial', '2022cri_0');
