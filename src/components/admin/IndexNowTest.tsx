'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface TestResult {
  success: boolean;
  message: string;
  testType: string;
  timestamp: string;
}

export default function IndexNowTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<TestResult | null>(null);

  const runTest = async (testType: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-indexnow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testType }),
      });

      const result = await response.json();
      setLastResult(result);

      if (result.success) {
        toast.success(`✅ ${result.message}`);
      } else {
        toast.error(`❌ ${result.message || 'Test failed'}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`❌ Test failed: ${errorMessage}`);
      setLastResult({
        success: false,
        message: `Error: ${errorMessage}`,
        testType,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testButtons = [
    { type: 'single-url', label: 'Test Homepage', description: 'Submit homepage URL' },
    { type: 'main-pages', label: 'Test Main Pages', description: 'Submit all main pages' },
    { type: 'anime', label: 'Test Hentai URL', description: 'Submit test hentai URL' },
    { type: 'episode', label: 'Test Episode URL', description: 'Submit test episode URL' },
    { type: 'all', label: 'Test All Functions', description: 'Run all tests' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          IndexNow Test Panel
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Test IndexNow functionality to ensure URLs are properly submitted to search engines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {testButtons.map((test) => (
          <button
            key={test.type}
            onClick={() => runTest(test.type)}
            disabled={isLoading}
            className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {test.label}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {test.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-300">Running test...</span>
        </div>
      )}

      {lastResult && (
        <div className="mt-6 p-4 rounded-lg border">
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
            Last Test Result
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300 w-20">Status:</span>
              <span className={lastResult.success ? 'text-green-600' : 'text-red-600'}>
                {lastResult.success ? '✅ Success' : '❌ Failed'}
              </span>
            </div>
            <div className="flex items-start">
              <span className="font-medium text-gray-700 dark:text-gray-300 w-20">Message:</span>
              <span className="text-gray-600 dark:text-gray-300">{lastResult.message}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300 w-20">Test:</span>
              <span className="text-gray-600 dark:text-gray-300">{lastResult.testType}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300 w-20">Time:</span>
              <span className="text-gray-600 dark:text-gray-300">
                {new Date(lastResult.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          IndexNow Information
        </h3>
        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <p>• Key File: <code>5adf88428cd24eb58d0f9f2cd23246df.txt</code></p>
          <p>• Supported Engines: Bing, Microsoft</p>
          <p>• Automatic submission occurs when hentai/episodes are created or updated</p>
          <p>• Manual testing helps verify the integration is working correctly</p>
        </div>
      </div>
    </div>
  );
}
