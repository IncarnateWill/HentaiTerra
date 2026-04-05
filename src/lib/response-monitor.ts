import { NextResponse } from 'next/server';

// Response size monitoring utility
export class ResponseMonitor {
  private static readonly MAX_CACHE_SIZE = 14 * 1024; // 14KB limit for Cloudflare cache
  private static readonly WARNING_SIZE = 12 * 1024; // 12KB warning threshold

  /**
   * Monitor response size and add appropriate headers
   */
  static monitorResponse(data: any, headers?: Record<string, string>): NextResponse {
    const jsonString = JSON.stringify(data);
    const responseSize = Buffer.byteLength(jsonString, 'utf8');
    
    // Create response with data
    const response = NextResponse.json(data);
    
    // Add size monitoring headers
    response.headers.set('X-Response-Size', responseSize.toString());
    response.headers.set('X-Cache-Size-Limit', this.MAX_CACHE_SIZE.toString());
    
    // Add warning if approaching limit
    if (responseSize > this.WARNING_SIZE) {
      response.headers.set('X-Cache-Warning', 'Response size approaching cache limit');
      console.warn(`Large response detected: ${responseSize} bytes (${(responseSize / 1024).toFixed(2)}KB)`);
    }
    
    // Add error if exceeding limit
    if (responseSize > this.MAX_CACHE_SIZE) {
      response.headers.set('X-Cache-Error', 'Response size exceeds cache limit');
      console.error(`Response size exceeds cache limit: ${responseSize} bytes (${(responseSize / 1024).toFixed(2)}KB)`);
    }
    
    // Add custom headers if provided
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }
    
    return response;
  }

  /**
   * Check if response size is within cache limits
   */
  static isWithinCacheLimit(data: any): boolean {
    const jsonString = JSON.stringify(data);
    const responseSize = Buffer.byteLength(jsonString, 'utf8');
    return responseSize <= this.MAX_CACHE_SIZE;
  }

  /**
   * Get response size in bytes
   */
  static getResponseSize(data: any): number {
    const jsonString = JSON.stringify(data);
    return Buffer.byteLength(jsonString, 'utf8');
  }

  /**
   * Truncate response data if it exceeds size limits
   */
  static truncateIfNeeded(data: any, maxSize: number = this.MAX_CACHE_SIZE): any {
    const responseSize = this.getResponseSize(data);
    
    if (responseSize <= maxSize) {
      return data;
    }
    
    // If data is an array, truncate it
    if (Array.isArray(data)) {
      let truncatedData = [...data];
      while (this.getResponseSize(truncatedData) > maxSize && truncatedData.length > 1) {
        truncatedData = truncatedData.slice(0, Math.floor(truncatedData.length * 0.8));
      }
      return {
        ...truncatedData,
        _truncated: true,
        _originalLength: data.length,
        _truncatedLength: truncatedData.length
      };
    }
    
    // If data is an object with arrays, truncate the arrays
    if (typeof data === 'object' && data !== null) {
      const truncatedData = { ...data };
      
      Object.keys(truncatedData).forEach(key => {
        if (Array.isArray(truncatedData[key])) {
          const originalLength = truncatedData[key].length;
          while (this.getResponseSize(truncatedData) > maxSize && truncatedData[key].length > 1) {
            truncatedData[key] = truncatedData[key].slice(0, Math.floor(truncatedData[key].length * 0.8));
          }
          if (truncatedData[key].length < originalLength) {
            truncatedData[`_${key}_truncated`] = true;
            truncatedData[`_${key}_originalLength`] = originalLength;
          }
        }
      });
      
      return truncatedData;
    }
    
    return data;
  }
}

// Export convenience functions
export const monitorResponse = ResponseMonitor.monitorResponse.bind(ResponseMonitor);
export const isWithinCacheLimit = ResponseMonitor.isWithinCacheLimit.bind(ResponseMonitor);
export const getResponseSize = ResponseMonitor.getResponseSize.bind(ResponseMonitor);
export const truncateIfNeeded = ResponseMonitor.truncateIfNeeded.bind(ResponseMonitor);