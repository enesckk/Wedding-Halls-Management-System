-- SQL Server: nikahsalon veritabanını oluştur (yoksa)
-- LocalDB için: sqlcmd -S "(localdb)\mssqllocaldb" -i create-database-sqlserver.sql
-- Veya SSMS / Azure Data Studio'da bu dosyayı çalıştırın.

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = N'nikahsalon')
BEGIN
    CREATE DATABASE [nikahsalon];
END
GO
