#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log('📁 Created backup directory:', BACKUP_DIR);
}

// Generate backup filename with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const backupFile = path.join(BACKUP_DIR, `cardeals-backup-${timestamp}.sql`);

console.log('🚀 Starting database backup...');
console.log('📅 Timestamp:', new Date().toISOString());
console.log('📁 Backup file:', backupFile);

// Use pg_dump to create backup
const pgDumpCommand = `pg_dump "${DATABASE_URL}" > "${backupFile}"`;

exec(pgDumpCommand, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Backup failed:', error.message);
    return;
  }
  
  if (stderr) {
    console.error('⚠️ Warning:', stderr);
  }

  // Check if backup file was created and has content
  if (fs.existsSync(backupFile)) {
    const stats = fs.statSync(backupFile);
    if (stats.size > 0) {
      console.log('✅ Backup completed successfully!');
      console.log('📊 Backup size:', (stats.size / 1024).toFixed(2), 'KB');
      console.log('📁 Backup location:', backupFile);
      
      // Clean up old backups (keep last 7 days)
      cleanupOldBackups();
    } else {
      console.error('❌ Backup file is empty');
    }
  } else {
    console.error('❌ Backup file was not created');
  }
});

function cleanupOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const backupFiles = files
      .filter(file => file.startsWith('cardeals-backup-') && file.endsWith('.sql'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        mtime: fs.statSync(path.join(BACKUP_DIR, file)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime);

    // Keep latest 7 backups, delete older ones
    const backupsToDelete = backupFiles.slice(7);
    
    backupsToDelete.forEach(backup => {
      fs.unlinkSync(backup.path);
      console.log('🗑️ Deleted old backup:', backup.name);
    });

    if (backupsToDelete.length > 0) {
      console.log(`🧹 Cleaned up ${backupsToDelete.length} old backup(s)`);
    }
  } catch (error) {
    console.error('⚠️ Failed to cleanup old backups:', error.message);
  }
}
