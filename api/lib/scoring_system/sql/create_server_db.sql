CREATE TABLE events (code VARCHAR PRIMARY KEY, name VARCHAR, type INTEGER, status INTEGER, finals BOOLEAN, divisions INTEGER, start DATE, end DATE, region TEXT);
CREATE TABLE users (username VARCHAR PRIMARY KEY, hashedPassword VARCHAR, salt VARCHAR, type INTEGER, realName VARCHAR, used BOOLEAN, generic BOOLEAN);
CREATE TABLE roles (username VARCHAR REFERENCES users(username), role VARCHAR, event VARCHAR REFERENCES events(code), PRIMARY KEY(username, role, event));
CREATE TABLE config (key VARCHAR PRIMARY KEY, value VARCHAR);
CREATE TABLE sponsors (name VARCHAR, level INTEGER, logoPath VARCHAR);
CREATE TABLE apikeys (name VARCHAR, key VARCHAR, active BOOLEAN, start DATE);
CREATE TABLE leagueData (team INTEGER, eventCode VARCHAR, match INTEGER, qp INTEGER, rp INTEGER, PRIMARY KEY(team, eventCode, match));