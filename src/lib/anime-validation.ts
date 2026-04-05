import { NextRequest, NextResponse } from 'next/server';

export interface AnimeValidationResult {
  sanitizedData: any;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface AnimeData {
  name: string;
  alternativeTitles: string[];
  description: string;
  studio: string;
  poster: string;
  genres: string[];
  mediaType: string;
  status?: string;
  censorship?: 'censored' | 'uncensored';
  malId?: number;
}

/**
 * Validates anime data before saving to database
 * @param data - The anime data to validate
 * @returns Validation result with errors and warnings
 */
export function validateAnimeData(data: Partial<AnimeData>, isPartialUpdate: boolean = false): AnimeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required field validations (skip for partial updates)
  if (!isPartialUpdate) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Name is required and must be a non-empty string');
    }

    if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
      errors.push('Description is required and must be a non-empty string');
    } else if (data.description.trim().length < 50) {
      warnings.push('Description is quite short (less than 50 characters)');
    }

    if (!data.poster || typeof data.poster !== 'string' || data.poster.trim().length === 0) {
      errors.push('Poster URL is required');
    } else if (!isValidUrl(data.poster)) {
      errors.push('Poster must be a valid URL');
    }

    if (!data.studio || typeof data.studio !== 'string' || data.studio.trim().length === 0) {
      warnings.push('Studio information is missing');
    }
  } else {
    // For partial updates, only validate fields that are present
    if (data.name !== undefined && (typeof data.name !== 'string' || data.name.trim().length === 0)) {
      errors.push('Name must be a non-empty string');
    }

    if (data.description !== undefined) {
      if (typeof data.description !== 'string' || data.description.trim().length === 0) {
        errors.push('Description must be a non-empty string');
      } else if (data.description.trim().length < 50) {
        warnings.push('Description is quite short (less than 50 characters)');
      }
    }

    if (data.poster !== undefined) {
      if (typeof data.poster !== 'string' || data.poster.trim().length === 0) {
        errors.push('Poster URL is required');
      } else if (!isValidUrl(data.poster)) {
        errors.push('Poster must be a valid URL');
      }
    }

    if (data.studio !== undefined && (typeof data.studio !== 'string' || data.studio.trim().length === 0)) {
      warnings.push('Studio information is missing');
    }
  }

  // Alternative titles validation
  if (!data.alternativeTitles || !Array.isArray(data.alternativeTitles)) {
    warnings.push('Alternative titles should be an array');
  } else {
    // Check for empty strings in alternative titles
    const emptyTitles = data.alternativeTitles.filter(title => 
      typeof title !== 'string' || title.trim().length === 0
    );
    
    if (emptyTitles.length > 0) {
      errors.push(`Alternative titles contain ${emptyTitles.length} empty or invalid entries`);
    }

    // Check for duplicates
    const uniqueTitles = new Set(data.alternativeTitles.map(t => t.trim().toLowerCase()));
    if (uniqueTitles.size !== data.alternativeTitles.length) {
      warnings.push('Alternative titles contain duplicates');
    }

    // Check if main title is in alternatives
    if (data.name && data.alternativeTitles.some(title => 
      title.trim().toLowerCase() === data.name!.trim().toLowerCase()
    )) {
      warnings.push('Main title appears in alternative titles');
    }

    if (data.alternativeTitles.length === 0) {
      warnings.push('No alternative titles provided - consider adding English/Japanese titles');
    }
  }

  // Genres validation
  if (!isPartialUpdate) {
    if (!data.genres || !Array.isArray(data.genres) || data.genres.length === 0) {
      errors.push('At least one genre is required');
    } else {
      const invalidGenres = data.genres.filter(genre => 
        typeof genre !== 'string' || genre.trim().length === 0
      );
      
      if (invalidGenres.length > 0) {
        errors.push(`Genres contain ${invalidGenres.length} empty or invalid entries`);
      }
    }
  } else {
    if (data.genres !== undefined) {
      if (!Array.isArray(data.genres) || data.genres.length === 0) {
        errors.push('Genres must be a non-empty array');
      } else {
        const invalidGenres = data.genres.filter(genre => 
          typeof genre !== 'string' || genre.trim().length === 0
        );
        
        if (invalidGenres.length > 0) {
          errors.push(`Genres contain ${invalidGenres.length} empty or invalid entries`);
        }
      }
    }
  }

  // Media type validation
  const validMediaTypes = ['anime', 'movie', 'ova', 'special'];
  if (!isPartialUpdate) {
    if (!data.mediaType || !validMediaTypes.includes(data.mediaType)) {
      errors.push(`Media type must be one of: ${validMediaTypes.join(', ')}`);
    }
  } else {
    if (data.mediaType !== undefined && !validMediaTypes.includes(data.mediaType)) {
      errors.push(`Media type must be one of: ${validMediaTypes.join(', ')}`);
    }
  }

  // Status validation (optional on create, validated if present)
  const validStatuses = ['ongoing', 'finished', 'upcoming', 'dropped', 'cancelled', 'in-traducere'];
  if (data.status !== undefined) {
    if (typeof data.status !== 'string' || !validStatuses.includes(data.status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }
  }

  // Censorship validation (optional on create, validated if present)
  const validCensorship = ['censored', 'uncensored'];
  if (data.censorship !== undefined) {
    if (typeof data.censorship !== 'string' || !validCensorship.includes(data.censorship.toLowerCase())) {
      errors.push(`Censorship must be one of: ${validCensorship.join(', ')}`);
    }
  } else if (!isPartialUpdate) {
    // default censorship on create when not provided
    (data as any).censorship = 'censored';
  }

  // MAL ID validation (if provided)
  if (data.malId !== undefined) {
    if (typeof data.malId !== 'number' || data.malId <= 0 || !Number.isInteger(data.malId)) {
      errors.push('MAL ID must be a positive integer');
    }
  }

  return {
    sanitizedData: sanitizeAnimeData(data),
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Sanitizes anime data by cleaning up common issues
 * @param data - The anime data to sanitize
 * @returns Sanitized anime data
 */
export function sanitizeAnimeData(data: Partial<AnimeData>): Partial<AnimeData> {
  const sanitized = { ...data };

  // Trim string fields
  if (sanitized.name) {
    sanitized.name = sanitized.name.trim();
  }
  if (sanitized.description) {
    sanitized.description = sanitized.description.trim();
  }
  if (sanitized.studio) {
    sanitized.studio = sanitized.studio.trim();
  }
  if (sanitized.poster) {
    sanitized.poster = sanitized.poster.trim();
  }

  // Clean alternative titles
  if (sanitized.alternativeTitles && Array.isArray(sanitized.alternativeTitles)) {
    sanitized.alternativeTitles = sanitized.alternativeTitles
      .map(title => typeof title === 'string' ? title.trim() : '')
      .filter(title => title.length > 0)
      .filter((title, index, arr) => arr.indexOf(title) === index); // Remove duplicates
  }

  // Clean genres
  if (sanitized.genres && Array.isArray(sanitized.genres)) {
    sanitized.genres = sanitized.genres
      .map(genre => typeof genre === 'string' ? genre.trim() : '')
      .filter(genre => genre.length > 0)
      .filter((genre, index, arr) => arr.indexOf(genre) === index); // Remove duplicates
  }

  // Normalize status to lowercase trimmed (if provided)
  if (sanitized.status && typeof sanitized.status === 'string') {
    sanitized.status = sanitized.status.trim().toLowerCase();
  }

  // Normalize censorship to lowercase trimmed (if provided)
  if ((sanitized as any).censorship && typeof (sanitized as any).censorship === 'string') {
    (sanitized as any).censorship = (sanitized as any).censorship.trim().toLowerCase();
  }

  return sanitized;
}

/**
 * Middleware function to validate anime data in API routes
 * @param data - The anime data to validate
 * @returns NextResponse with validation errors or null if valid
 */
export function validateAnimeMiddleware(data: any): NextResponse | null {
  const sanitizedData = sanitizeAnimeData(data);
  const validation = validateAnimeData(sanitizedData);

  if (!validation.isValid) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: validation.errors,
        warnings: validation.warnings
      },
      { status: 400 }
    );
  }

  if (validation.warnings.length > 0) {
    console.warn('Anime validation warnings:', validation.warnings);
  }

  return null; // No validation errors
}

/**
 * Helper function to validate URLs
 * @param url - The URL to validate
 * @returns True if valid URL, false otherwise
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Logs anime validation and import statistics
 * @param operation - The operation being performed (import, create, update)
 * @param success - Whether the operation was successful
 * @param data - The anime data
 * @param errors - Any validation errors
 */
export function logAnimeOperation(
  operation: 'import' | 'create' | 'update',
  success: boolean,
  data: Partial<AnimeData>,
  errors?: string[]
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    operation,
    success,
    animeName: data.name || 'Unknown',
    malId: data.malId,
    hasAlternativeTitles: data.alternativeTitles && data.alternativeTitles.length > 0,
    alternativeTitlesCount: data.alternativeTitles?.length || 0,
    hasEmptyTitles: data.alternativeTitles?.some(t => !t || t.trim().length === 0) || false,
    errors: errors || []
  };

  if (success) {
    console.log('Anime operation successful:', logData);
  } else {
    console.error('Anime operation failed:', logData);
  }
}