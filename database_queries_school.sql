-- =============================================
-- SCHOOL DATABASE QUERIES
-- Learning Resources Inventory System (LRIS)
-- Department of Education - Tandag City Division
-- =============================================

-- =============================================
-- TABLE CREATION
-- =============================================

-- Create Schools table
CREATE TABLE Schools (
    SchoolID NVARCHAR(50) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    Enrollees INT DEFAULT 0,
    District NVARCHAR(100),
    Level NVARCHAR(50),
    Principal NVARCHAR(255),
    Contact NVARCHAR(50),
    Email NVARCHAR(255),
    DateAdded DATETIME DEFAULT GETDATE(),
    DateModified DATETIME DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1
);

-- Create DistributedResources table (related to schools)
CREATE TABLE DistributedResources (
    DistributionID INT IDENTITY(1,1) PRIMARY KEY,
    SchoolID NVARCHAR(50) NOT NULL,
    ResourceCategory NVARCHAR(100) NOT NULL,
    ResourceItemID NVARCHAR(50),
    ResourceName NVARCHAR(255) NOT NULL,
    Quantity INT DEFAULT 1,
    DateDistributed DATETIME DEFAULT GETDATE(),
    Notes NVARCHAR(500),
    Status NVARCHAR(50) DEFAULT 'active',
    LastUpdated DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (SchoolID) REFERENCES Schools(SchoolID)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Index on SchoolID for faster lookups
CREATE INDEX IX_Schools_SchoolID ON Schools(SchoolID);
CREATE INDEX IX_Schools_District ON Schools(District);
CREATE INDEX IX_Schools_Level ON Schools(Level);
CREATE INDEX IX_Schools_IsActive ON Schools(IsActive);

-- Index on DistributedResources for faster joins
CREATE INDEX IX_DistributedResources_SchoolID ON DistributedResources(SchoolID);
CREATE INDEX IX_DistributedResources_Category ON DistributedResources(ResourceCategory);
CREATE INDEX IX_DistributedResources_DateDistributed ON DistributedResources(DateDistributed);

-- =============================================
-- SAMPLE DATA INSERTION
-- =============================================

-- Insert sample schools
INSERT INTO Schools (SchoolID, Name, Enrollees, District, Level, Principal, Contact, Email) VALUES
('22-98711', 'Tandag National High School', 1250, 'Tandag City', 'Senior High', 'Dr. Maria Santos', '09123456789', 'tnhs@deped.gov.ph'),
('22-98712', 'Tandag Central Elementary School', 890, 'Tandag City', 'Elementary', 'Mrs. Juanita Cruz', '09123456790', 'tces@deped.gov.ph'),
('22-98713', 'Tandag Science High School', 650, 'Tandag City', 'Junior High', 'Dr. Roberto Garcia', '09123456791', 'tshs@deped.gov.ph'),
('22-98714', 'Tandag Integrated School', 750, 'Tandag City', 'Elementary', 'Mrs. Ana Reyes', '09123456792', 'tis@deped.gov.ph'),
('22-98715', 'Tandag Technical Vocational School', 450, 'Tandag City', 'Senior High', 'Mr. Carlos Mendoza', '09123456793', 'ttvs@deped.gov.ph');

-- Insert sample distributed resources
INSERT INTO DistributedResources (SchoolID, ResourceCategory, ResourceItemID, ResourceName, Quantity, Notes, Status) VALUES
('22-98711', 'SLM/SLAS', 'SLM001', 'Mathematics Module Grade 11', 50, 'First Quarter Modules', 'active'),
('22-98711', 'Equipment', 'EQ001', 'Scientific Calculator', 25, 'For Mathematics classes', 'active'),
('22-98712', 'SLM/SLAS', 'SLM002', 'English Module Grade 5', 40, 'Second Quarter Modules', 'active'),
('22-98713', 'TVL', 'TVL001', 'Computer Hardware Tools', 15, 'For ICT classes', 'active'),
('22-98714', 'Lesson Exemplar(Matatag)', 'LE001', 'Science Lesson Exemplar Grade 4', 30, 'Third Quarter', 'active');

-- =============================================
-- SELECT QUERIES
-- =============================================

-- Get all active schools
SELECT 
    SchoolID,
    Name,
    Enrollees,
    District,
    Level,
    Principal,
    Contact,
    Email,
    DateAdded,
    DateModified
FROM Schools 
WHERE IsActive = 1 
ORDER BY Name;

-- Get schools by district
SELECT 
    SchoolID,
    Name,
    Enrollees,
    Level,
    Principal,
    Contact,
    Email
FROM Schools 
WHERE District = 'Tandag City' AND IsActive = 1
ORDER BY Name;

-- Get schools by level (Elementary, Junior High, Senior High)
SELECT 
    SchoolID,
    Name,
    Enrollees,
    District,
    Principal,
    Contact,
    Email
FROM Schools 
WHERE Level = 'Elementary' AND IsActive = 1
ORDER BY Name;

-- Get schools with resource count
SELECT 
    s.SchoolID,
    s.Name,
    s.District,
    s.Level,
    s.Enrollees,
    COUNT(dr.DistributionID) as ResourceCount
FROM Schools s
LEFT JOIN DistributedResources dr ON s.SchoolID = dr.SchoolID
WHERE s.IsActive = 1
GROUP BY s.SchoolID, s.Name, s.District, s.Level, s.Enrollees
ORDER BY s.Name;

-- Get schools with no distributed resources
SELECT 
    s.SchoolID,
    s.Name,
    s.District,
    s.Level,
    s.Enrollees
FROM Schools s
LEFT JOIN DistributedResources dr ON s.SchoolID = dr.SchoolID
WHERE s.IsActive = 1 AND dr.DistributionID IS NULL
ORDER BY s.Name;

-- Get schools with most distributed resources
SELECT TOP 10
    s.SchoolID,
    s.Name,
    s.District,
    s.Level,
    COUNT(dr.DistributionID) as ResourceCount
FROM Schools s
LEFT JOIN DistributedResources dr ON s.SchoolID = dr.SchoolID
WHERE s.IsActive = 1
GROUP BY s.SchoolID, s.Name, s.District, s.Level
ORDER BY ResourceCount DESC;

-- Get school statistics by district
SELECT 
    District,
    COUNT(*) as SchoolCount,
    SUM(Enrollees) as TotalEnrollees,
    AVG(Enrollees) as AverageEnrollees
FROM Schools 
WHERE IsActive = 1
GROUP BY District
ORDER BY SchoolCount DESC;

-- Get school statistics by level
SELECT 
    Level,
    COUNT(*) as SchoolCount,
    SUM(Enrollees) as TotalEnrollees,
    AVG(Enrollees) as AverageEnrollees
FROM Schools 
WHERE IsActive = 1
GROUP BY Level
ORDER BY SchoolCount DESC;

-- Search schools by name, ID, or principal
SELECT 
    SchoolID,
    Name,
    Enrollees,
    District,
    Level,
    Principal,
    Contact,
    Email
FROM Schools 
WHERE IsActive = 1 
    AND (Name LIKE '%Tandag%' 
         OR SchoolID LIKE '%22%' 
         OR Principal LIKE '%Santos%')
ORDER BY Name;

-- Get schools added in the last 30 days
SELECT 
    SchoolID,
    Name,
    District,
    Level,
    DateAdded
FROM Schools 
WHERE IsActive = 1 
    AND DateAdded >= DATEADD(day, -30, GETDATE())
ORDER BY DateAdded DESC;

-- =============================================
-- UPDATE QUERIES
-- =============================================

-- Update school information
UPDATE Schools 
SET 
    Name = 'Updated School Name',
    Enrollees = 1000,
    District = 'Updated District',
    Level = 'Senior High',
    Principal = 'Updated Principal',
    Contact = '09123456789',
    Email = 'updated@deped.gov.ph',
    DateModified = GETDATE()
WHERE SchoolID = '22-98711';

-- Update enrollees for all schools in a district
UPDATE Schools 
SET 
    Enrollees = Enrollees + 50,
    DateModified = GETDATE()
WHERE District = 'Tandag City';

-- Update principal contact information
UPDATE Schools 
SET 
    Contact = '09123456799',
    Email = 'newemail@deped.gov.ph',
    DateModified = GETDATE()
WHERE Principal = 'Dr. Maria Santos';

-- =============================================
-- DELETE QUERIES
-- =============================================

-- Safe delete (only if no distributed resources exist)
-- This is the default behavior in the application
DELETE FROM Schools 
WHERE SchoolID = '22-98711' 
    AND NOT EXISTS (
        SELECT 1 FROM DistributedResources 
        WHERE SchoolID = '22-98711'
    );

-- Cascade delete (delete school and all its resources)
-- This is used when user confirms cascade deletion
BEGIN TRANSACTION;
    DELETE FROM DistributedResources WHERE SchoolID = '22-98711';
    DELETE FROM Schools WHERE SchoolID = '22-98711';
COMMIT TRANSACTION;

-- Soft delete (mark as inactive instead of hard delete)
UPDATE Schools 
SET IsActive = 0, DateModified = GETDATE()
WHERE SchoolID = '22-98711';

-- =============================================
-- ANALYTICS QUERIES
-- =============================================

-- Get total statistics
SELECT 
    COUNT(*) as TotalSchools,
    SUM(Enrollees) as TotalEnrollees,
    AVG(Enrollees) as AverageEnrollees,
    COUNT(DISTINCT District) as TotalDistricts,
    COUNT(DISTINCT Level) as TotalLevels
FROM Schools 
WHERE IsActive = 1;

-- Get resource distribution by school level
SELECT 
    s.Level,
    COUNT(dr.DistributionID) as TotalResources,
    COUNT(DISTINCT dr.ResourceCategory) as ResourceCategories,
    SUM(dr.Quantity) as TotalQuantity
FROM Schools s
LEFT JOIN DistributedResources dr ON s.SchoolID = dr.SchoolID
WHERE s.IsActive = 1
GROUP BY s.Level
ORDER BY TotalResources DESC;

-- Get resource distribution by district
SELECT 
    s.District,
    COUNT(dr.DistributionID) as TotalResources,
    COUNT(DISTINCT dr.ResourceCategory) as ResourceCategories,
    SUM(dr.Quantity) as TotalQuantity
FROM Schools s
LEFT JOIN DistributedResources dr ON s.SchoolID = dr.SchoolID
WHERE s.IsActive = 1
GROUP BY s.District
ORDER BY TotalResources DESC;

-- Get schools with resource distribution by category
SELECT 
    s.SchoolID,
    s.Name,
    s.District,
    s.Level,
    dr.ResourceCategory,
    COUNT(dr.DistributionID) as ResourceCount,
    SUM(dr.Quantity) as TotalQuantity
FROM Schools s
LEFT JOIN DistributedResources dr ON s.SchoolID = dr.SchoolID
WHERE s.IsActive = 1
GROUP BY s.SchoolID, s.Name, s.District, s.Level, dr.ResourceCategory
ORDER BY s.Name, dr.ResourceCategory;

-- =============================================
-- MAINTENANCE QUERIES
-- =============================================

-- Clean up inactive schools (optional - for maintenance)
DELETE FROM Schools WHERE IsActive = 0;

-- Update statistics for schools with no enrollees
UPDATE Schools 
SET Enrollees = 0 
WHERE Enrollees IS NULL OR Enrollees < 0;

-- Fix email format (example)
UPDATE Schools 
SET Email = LOWER(Email)
WHERE Email IS NOT NULL;

-- Archive old distributed resources (example)
UPDATE DistributedResources 
SET Status = 'archived'
WHERE DateDistributed < DATEADD(year, -2, GETDATE());

-- =============================================
-- BACKUP AND RESTORE QUERIES
-- =============================================

-- Create backup of schools table
SELECT * INTO Schools_Backup_2024 
FROM Schools 
WHERE IsActive = 1;

-- Create backup of distributed resources
SELECT * INTO DistributedResources_Backup_2024 
FROM DistributedResources;

-- Restore from backup (if needed)
-- INSERT INTO Schools SELECT * FROM Schools_Backup_2024;
-- INSERT INTO DistributedResources SELECT * FROM DistributedResources_Backup_2024;

-- =============================================
-- VALIDATION QUERIES
-- =============================================

-- Check for duplicate school IDs
SELECT SchoolID, COUNT(*) as DuplicateCount
FROM Schools
GROUP BY SchoolID
HAVING COUNT(*) > 1;

-- Check for schools with invalid email format
SELECT SchoolID, Name, Email
FROM Schools
WHERE Email IS NOT NULL 
    AND Email NOT LIKE '%@%.%';

-- Check for schools with missing required data
SELECT SchoolID, Name, Enrollees, District, Level
FROM Schools
WHERE IsActive = 1 
    AND (Name IS NULL OR Name = '' 
         OR Enrollees IS NULL 
         OR District IS NULL OR District = ''
         OR Level IS NULL OR Level = '');

-- Check for orphaned distributed resources
SELECT dr.*
FROM DistributedResources dr
LEFT JOIN Schools s ON dr.SchoolID = s.SchoolID
WHERE s.SchoolID IS NULL;

-- =============================================
-- END OF SCHOOL DATABASE QUERIES
-- ============================================= 