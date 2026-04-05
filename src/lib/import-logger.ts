import { writeFile, appendFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

interface ImportLogEntry {
  timestamp: string;
  operation: 'mal_import' | 'manual_add' | 'bulk_import';
  status: 'success' | 'failure' | 'warning';
  malId?: string;
  animeTitle?: string;
  userId?: string;
  errorMessage?: string;
  warningMessage?: string;
  validationErrors?: string[];
  retryAttempt?: number;
  duration?: number;
  dataQuality?: {
    hasAlternativeTitles: boolean;
    hasSynopsis: boolean;
    hasPoster: boolean;
    hasGenres: boolean;
    emptyFieldsCount: number;
  };
}

interface ImportStats {
  totalImports: number;
  successfulImports: number;
  failedImports: number;
  warningImports: number;
  averageDuration: number;
  commonErrors: { [key: string]: number };
  dataQualityIssues: {
    missingAlternativeTitles: number;
    missingSynopsis: number;
    missingPoster: number;
    missingGenres: number;
  };
  lastUpdated: string;
}

class ImportLogger {
  private logDir: string;
  private logFile: string;
  private statsFile: string;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs', 'imports');
    this.logFile = path.join(this.logDir, 'import-log.jsonl');
    this.statsFile = path.join(this.logDir, 'import-stats.json');
  }

  private async ensureLogDirectory(): Promise<void> {
    if (!existsSync(this.logDir)) {
      await mkdir(this.logDir, { recursive: true });
    }
  }

  private async appendToLog(entry: ImportLogEntry): Promise<void> {
    await this.ensureLogDirectory();
    const logLine = JSON.stringify(entry) + '\n';
    await appendFile(this.logFile, logLine, 'utf8');
  }

  private async updateStats(entry: ImportLogEntry): Promise<void> {
    let stats: ImportStats;
    
    try {
      if (existsSync(this.statsFile)) {
        const statsContent = await import('fs').then(fs => 
          fs.promises.readFile(this.statsFile, 'utf8')
        );
        stats = JSON.parse(statsContent);
      } else {
        stats = {
          totalImports: 0,
          successfulImports: 0,
          failedImports: 0,
          warningImports: 0,
          averageDuration: 0,
          commonErrors: {},
          dataQualityIssues: {
            missingAlternativeTitles: 0,
            missingSynopsis: 0,
            missingPoster: 0,
            missingGenres: 0
          },
          lastUpdated: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error reading stats file, creating new stats:', error);
      stats = {
        totalImports: 0,
        successfulImports: 0,
        failedImports: 0,
        warningImports: 0,
        averageDuration: 0,
        commonErrors: {},
        dataQualityIssues: {
          missingAlternativeTitles: 0,
          missingSynopsis: 0,
          missingPoster: 0,
          missingGenres: 0
        },
        lastUpdated: new Date().toISOString()
      };
    }

    // Update counters
    stats.totalImports++;
    
    switch (entry.status) {
      case 'success':
        stats.successfulImports++;
        break;
      case 'failure':
        stats.failedImports++;
        break;
      case 'warning':
        stats.warningImports++;
        break;
    }

    // Update average duration
    if (entry.duration) {
      const totalDuration = stats.averageDuration * (stats.totalImports - 1) + entry.duration;
      stats.averageDuration = totalDuration / stats.totalImports;
    }

    // Track common errors
    if (entry.errorMessage) {
      const errorKey = entry.errorMessage.substring(0, 100); // Truncate for grouping
      stats.commonErrors[errorKey] = (stats.commonErrors[errorKey] || 0) + 1;
    }

    // Track data quality issues
    if (entry.dataQuality) {
      if (!entry.dataQuality.hasAlternativeTitles) {
        stats.dataQualityIssues.missingAlternativeTitles++;
      }
      if (!entry.dataQuality.hasSynopsis) {
        stats.dataQualityIssues.missingSynopsis++;
      }
      if (!entry.dataQuality.hasPoster) {
        stats.dataQualityIssues.missingPoster++;
      }
      if (!entry.dataQuality.hasGenres) {
        stats.dataQualityIssues.missingGenres++;
      }
    }

    stats.lastUpdated = new Date().toISOString();

    await writeFile(this.statsFile, JSON.stringify(stats, null, 2), 'utf8');
  }

  async logImportSuccess(data: {
    malId?: string;
    animeTitle: string;
    userId?: string;
    duration?: number;
    dataQuality?: ImportLogEntry['dataQuality'];
    operation?: ImportLogEntry['operation'];
  }): Promise<void> {
    const entry: ImportLogEntry = {
      timestamp: new Date().toISOString(),
      operation: data.operation || 'mal_import',
      status: 'success',
      malId: data.malId,
      animeTitle: data.animeTitle,
      userId: data.userId,
      duration: data.duration,
      dataQuality: data.dataQuality
    };

    await this.appendToLog(entry);
    await this.updateStats(entry);
  }

  async logImportFailure(data: {
    malId?: string;
    animeTitle?: string;
    userId?: string;
    errorMessage: string;
    validationErrors?: string[];
    retryAttempt?: number;
    duration?: number;
    operation?: ImportLogEntry['operation'];
  }): Promise<void> {
    const entry: ImportLogEntry = {
      timestamp: new Date().toISOString(),
      operation: data.operation || 'mal_import',
      status: 'failure',
      malId: data.malId,
      animeTitle: data.animeTitle,
      userId: data.userId,
      errorMessage: data.errorMessage,
      validationErrors: data.validationErrors,
      retryAttempt: data.retryAttempt,
      duration: data.duration
    };

    await this.appendToLog(entry);
    await this.updateStats(entry);
  }

  async logImportWarning(data: {
    malId?: string;
    animeTitle: string;
    userId?: string;
    warningMessage: string;
    dataQuality?: ImportLogEntry['dataQuality'];
    duration?: number;
    operation?: ImportLogEntry['operation'];
  }): Promise<void> {
    const entry: ImportLogEntry = {
      timestamp: new Date().toISOString(),
      operation: data.operation || 'mal_import',
      status: 'warning',
      malId: data.malId,
      animeTitle: data.animeTitle,
      userId: data.userId,
      warningMessage: data.warningMessage,
      dataQuality: data.dataQuality,
      duration: data.duration
    };

    await this.appendToLog(entry);
    await this.updateStats(entry);
  }

  async getImportStats(): Promise<ImportStats | null> {
    try {
      if (!existsSync(this.statsFile)) {
        return null;
      }
      
      const statsContent = await import('fs').then(fs => 
        fs.promises.readFile(this.statsFile, 'utf8')
      );
      return JSON.parse(statsContent);
    } catch (error) {
      console.error('Error reading import stats:', error);
      return null;
    }
  }

  async getRecentLogs(limit: number = 100): Promise<ImportLogEntry[]> {
    try {
      if (!existsSync(this.logFile)) {
        return [];
      }
      
      const logContent = await import('fs').then(fs => 
        fs.promises.readFile(this.logFile, 'utf8')
      );
      
      const lines = logContent.trim().split('\n');
      const recentLines = lines.slice(-limit);
      
      return recentLines
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(Boolean)
        .reverse(); // Most recent first
    } catch (error) {
      console.error('Error reading recent logs:', error);
      return [];
    }
  }

  // Helper method to assess data quality
  static assessDataQuality(data: any): ImportLogEntry['dataQuality'] {
    const hasAlternativeTitles = Array.isArray(data.alternativeTitles) && 
      data.alternativeTitles.length > 0 && 
      data.alternativeTitles.some((title: string) => title && title.trim().length > 0);
    
    const hasSynopsis = typeof data.description === 'string' && data.description.trim().length > 0;
    const hasPoster = typeof data.poster === 'string' && data.poster.trim().length > 0;
    const hasGenres = Array.isArray(data.genres) && data.genres.length > 0;
    
    let emptyFieldsCount = 0;
    if (!hasAlternativeTitles) emptyFieldsCount++;
    if (!hasSynopsis) emptyFieldsCount++;
    if (!hasPoster) emptyFieldsCount++;
    if (!hasGenres) emptyFieldsCount++;
    
    return {
      hasAlternativeTitles,
      hasSynopsis,
      hasPoster,
      hasGenres,
      emptyFieldsCount
    };
  }
}

// Export singleton instance and class
export const importLogger = new ImportLogger();
export { ImportLogger };
export type { ImportLogEntry, ImportStats };