CREATE TABLE events (code VARCHAR PRIMARY KEY, name VARCHAR, type INTEGER, status INTEGER, finals BOOLEAN, divisions INTEGER, start DATE, end DATE);
CREATE TABLE users (username VARCHAR PRIMARY KEY, hashedPassword VARCHAR, salt VARCHAR, type INTEGER, realName VARCHAR, used BOOLEAN, generic BOOLEAN);
CREATE TABLE roles (username VARCHAR REFERENCES users(username), role VARCHAR, PRIMARY KEY(username, role));
CREATE TABLE config (key VARCHAR PRIMARY KEY, value VARCHAR);
CREATE TABLE sponsors (name VARCHAR, level INTEGER, logoPath VARCHAR);
CREATE TABLE leagueData (team INTEGER, eventCode VARCHAR, match INTEGER, qp INTEGER, rp INTEGER, PRIMARY KEY(team, eventCode, match));