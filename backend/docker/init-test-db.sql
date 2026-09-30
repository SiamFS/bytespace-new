-- Runs once, when the Postgres volume is first created (docker-entrypoint-initdb.d).
CREATE DATABASE bytespace_test OWNER bytespace;
