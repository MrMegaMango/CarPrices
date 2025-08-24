package main

import (
	"archive/zip"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	_ "github.com/lib/pq"
)

type BackupConfig struct {
	DatabaseURL    string
	BackupDir      string
	RetentionDays  int
	CloudStorage   CloudConfig
}

type CloudConfig struct {
	Provider   string // "aws", "gcp", "azure"
	BucketName string
	Region     string
}

type BackupMetadata struct {
	Timestamp     time.Time `json:"timestamp"`
	DatabaseName  string    `json:"database_name"`
	BackupType    string    `json:"backup_type"`
	FileSize      int64     `json:"file_size"`
	RecordCounts  map[string]int `json:"record_counts"`
	SchemaVersion string    `json:"schema_version"`
	Checksum      string    `json:"checksum"`
}

func main() {
	config := BackupConfig{
		DatabaseURL:   os.Getenv("DATABASE_URL"),
		BackupDir:     "./backups",
		RetentionDays: 30 * 365, // 30 years in days
		CloudStorage: CloudConfig{
			Provider:   os.Getenv("CLOUD_PROVIDER"),   // aws, gcp, azure
			BucketName: os.Getenv("BACKUP_BUCKET"),
			Region:     os.Getenv("CLOUD_REGION"),
		},
	}

	if config.DatabaseURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	if err := ensureBackupDir(config.BackupDir); err != nil {
		log.Fatalf("Failed to create backup directory: %v", err)
	}

	// Create timestamp for backup
	timestamp := time.Now().UTC()
	backupID := timestamp.Format("2006-01-02T15-04-05Z")

	fmt.Printf("🚀 Starting CarDeals backup: %s\n", backupID)

	// Create both SQL and JSON backups
	sqlBackupPath, err := createSQLBackup(config, backupID)
	if err != nil {
		log.Fatalf("SQL backup failed: %v", err)
	}

	jsonBackupPath, err := createJSONBackup(config, backupID)
	if err != nil {
		log.Fatalf("JSON backup failed: %v", err)
	}

	// Create compressed archive
	archivePath, err := createArchive(config.BackupDir, backupID, []string{sqlBackupPath, jsonBackupPath})
	if err != nil {
		log.Fatalf("Archive creation failed: %v", err)
	}

	// Upload to cloud storage if configured
	if config.CloudStorage.Provider != "" && config.CloudStorage.BucketName != "" {
		if err := uploadToCloud(config, archivePath); err != nil {
			log.Printf("⚠️ Cloud upload failed: %v", err)
		} else {
			fmt.Printf("☁️ Backup uploaded to %s://%s\n", config.CloudStorage.Provider, config.CloudStorage.BucketName)
		}
	}

	// Clean up old backups
	cleanupOldBackups(config)

	fmt.Printf("✅ Backup completed successfully: %s\n", archivePath)
}

func ensureBackupDir(dir string) error {
	return os.MkdirAll(dir, 0755)
}

func createSQLBackup(config BackupConfig, backupID string) (string, error) {
	sqlFile := filepath.Join(config.BackupDir, fmt.Sprintf("cardeals-sql-%s.sql", backupID))
	
	fmt.Printf("📊 Creating SQL backup: %s\n", sqlFile)
	
	cmd := exec.Command("pg_dump", config.DatabaseURL)
	
	outFile, err := os.Create(sqlFile)
	if err != nil {
		return "", fmt.Errorf("failed to create SQL backup file: %w", err)
	}
	defer outFile.Close()
	
	cmd.Stdout = outFile
	cmd.Stderr = os.Stderr
	
	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("pg_dump failed: %w", err)
	}
	
	// Verify backup file
	if stat, err := os.Stat(sqlFile); err != nil || stat.Size() == 0 {
		return "", fmt.Errorf("SQL backup file is empty or doesn't exist")
	}
	
	return sqlFile, nil
}

func createJSONBackup(config BackupConfig, backupID string) (string, error) {
	jsonFile := filepath.Join(config.BackupDir, fmt.Sprintf("cardeals-json-%s.json", backupID))
	
	fmt.Printf("📄 Creating JSON backup: %s\n", jsonFile)
	
	db, err := sql.Open("postgres", config.DatabaseURL)
	if err != nil {
		return "", fmt.Errorf("failed to connect to database: %w", err)
	}
	defer db.Close()
	
	// Export data from all tables
	exportData := make(map[string]interface{})
	metadata := BackupMetadata{
		Timestamp:    time.Now().UTC(),
		BackupType:   "JSON",
		RecordCounts: make(map[string]int),
	}
	
	tables := []string{"CarMake", "CarModel", "CarDeal", "User", "Account", "Session"}
	
	for _, table := range tables {
		data, count, err := exportTable(db, table)
		if err != nil {
			log.Printf("⚠️ Failed to export table %s: %v", table, err)
			continue
		}
		exportData[table] = data
		metadata.RecordCounts[table] = count
	}
	
	// Add metadata
	exportData["_metadata"] = metadata
	
	// Write JSON file
	file, err := os.Create(jsonFile)
	if err != nil {
		return "", fmt.Errorf("failed to create JSON backup file: %w", err)
	}
	defer file.Close()
	
	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")
	
	if err := encoder.Encode(exportData); err != nil {
		return "", fmt.Errorf("failed to encode JSON: %w", err)
	}
	
	return jsonFile, nil
}

func exportTable(db *sql.DB, tableName string) ([]map[string]interface{}, int, error) {
	query := fmt.Sprintf(`SELECT to_jsonb(t) FROM "%s" t`, tableName)
	
	rows, err := db.Query(query)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	
	var records []map[string]interface{}
	
	for rows.Next() {
		var jsonData string
		if err := rows.Scan(&jsonData); err != nil {
			continue
		}
		
		var record map[string]interface{}
		if err := json.Unmarshal([]byte(jsonData), &record); err != nil {
			continue
		}
		
		records = append(records, record)
	}
	
	return records, len(records), nil
}

func createArchive(baseDir, backupID string, files []string) (string, error) {
	archivePath := filepath.Join(baseDir, fmt.Sprintf("cardeals-backup-%s.zip", backupID))
	
	fmt.Printf("📦 Creating archive: %s\n", archivePath)
	
	archive, err := os.Create(archivePath)
	if err != nil {
		return "", err
	}
	defer archive.Close()
	
	zipWriter := zip.NewWriter(archive)
	defer zipWriter.Close()
	
	for _, filePath := range files {
		if err := addFileToZip(zipWriter, filePath); err != nil {
			return "", err
		}
	}
	
	return archivePath, nil
}

func addFileToZip(zipWriter *zip.Writer, filename string) error {
	file, err := os.Open(filename)
	if err != nil {
		return err
	}
	defer file.Close()
	
	info, err := file.Stat()
	if err != nil {
		return err
	}
	
	header, err := zip.FileInfoHeader(info)
	if err != nil {
		return err
	}
	
	header.Name = filepath.Base(filename)
	header.Method = zip.Deflate
	
	writer, err := zipWriter.CreateHeader(header)
	if err != nil {
		return err
	}
	
	_, err = io.Copy(writer, file)
	return err
}

func uploadToCloud(config BackupConfig, filePath string) error {
	switch config.CloudStorage.Provider {
	case "aws":
		return uploadToAWS(config, filePath)
	case "gcp":
		return uploadToGCP(config, filePath)
	case "azure":
		return uploadToAzure(config, filePath)
	default:
		return fmt.Errorf("unsupported cloud provider: %s", config.CloudStorage.Provider)
	}
}

func uploadToAWS(config BackupConfig, filePath string) error {
	// AWS S3 upload using AWS CLI
	filename := filepath.Base(filePath)
	s3Path := fmt.Sprintf("s3://%s/cardeals-backups/%s", config.CloudStorage.BucketName, filename)
	
	cmd := exec.Command("aws", "s3", "cp", filePath, s3Path, "--region", config.CloudStorage.Region)
	return cmd.Run()
}

func uploadToGCP(config BackupConfig, filePath string) error {
	// Google Cloud Storage upload using gsutil
	filename := filepath.Base(filePath)
	gcsPath := fmt.Sprintf("gs://%s/cardeals-backups/%s", config.CloudStorage.BucketName, filename)
	
	cmd := exec.Command("gsutil", "cp", filePath, gcsPath)
	return cmd.Run()
}

func uploadToAzure(config BackupConfig, filePath string) error {
	// Azure Blob Storage upload using az CLI
	filename := filepath.Base(filePath)
	
	cmd := exec.Command("az", "storage", "blob", "upload",
		"--file", filePath,
		"--name", fmt.Sprintf("cardeals-backups/%s", filename),
		"--container-name", config.CloudStorage.BucketName)
	return cmd.Run()
}

func cleanupOldBackups(config BackupConfig) {
	fmt.Printf("🧹 Cleaning up backups older than %d days\n", config.RetentionDays)
	
	cutoffTime := time.Now().AddDate(0, 0, -config.RetentionDays)
	
	filepath.Walk(config.BackupDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		
		if strings.Contains(info.Name(), "cardeals-backup-") && info.ModTime().Before(cutoffTime) {
			fmt.Printf("🗑️ Deleting old backup: %s\n", info.Name())
			os.Remove(path)
		}
		
		return nil
	})
}
