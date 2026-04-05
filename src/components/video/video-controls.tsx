'use client';

import { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoSource {
    name: string;
    url: string;
    label: string;
}

interface VideoControlsProps {
    sources: VideoSource[];
    selectedSource: string;
    showSources: boolean;
    hasInteracted: boolean;
    onSourceSelect: (url: string) => void;
    onToggleSources: () => void;
}

// Memoize the source button component to prevent unnecessary re-renders
const SourceButton = memo(({ 
    source, 
    isSelected, 
    onSelect 
}: { 
    source: VideoSource; 
    isSelected: boolean; 
    onSelect: () => void;
}) => (
    <motion.button
        whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.6)' }}
        onClick={onSelect}
        className={`w-full px-4 py-2.5 text-sm text-left transition-colors flex items-center justify-between ${
            isSelected 
                ? 'text-blue-400 font-medium bg-gray-700/40' 
                : 'text-gray-200'
        }`}
        role="option"
        aria-selected={isSelected}
        aria-label={source.label}
    >
        <span className="truncate">{source.name}</span>
        {isSelected && (
            <motion.svg 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-4 h-4 flex-shrink-0 ml-2" 
                fill="currentColor" 
                viewBox="0 0 20 20"
            >
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </motion.svg>
        )}
    </motion.button>
));

SourceButton.displayName = 'SourceButton';

// Memoize the VideoControls component to prevent unnecessary re-renders
const VideoControls = memo(({
    sources,
    selectedSource,
    showSources,
    hasInteracted,
    onSourceSelect,
    onToggleSources
}: VideoControlsProps) => {
    // Memoize the source selection handler
    const handleSourceSelect = useCallback((url: string) => {
        onSourceSelect(url);
    }, [onSourceSelect]);

    // Memoize the toggle handler
    const handleToggle = useCallback(() => {
        onToggleSources();
    }, [onToggleSources]);

    return (
        <div className="absolute top-3 right-3 z-20 w-full max-w-[calc(100%-24px)] sm:w-auto" role="region" aria-label="Video source selection">
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleToggle}
                className="w-full sm:w-auto bg-gray-800/90 backdrop-blur-sm text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base hover:bg-gray-700/90 transition-all duration-200 flex items-center gap-2 sm:min-w-[220px] justify-center"
                aria-expanded={showSources}
                aria-controls="source-selector"
            >
                <span className="truncate">
                    {hasInteracted 
                        ? sources.find(s => s.url === selectedSource)?.name
                        : 'Change source'}
                </span>
                <motion.svg 
                    animate={{ rotate: showSources ? 180 : 0 }}
                    className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
            </motion.button>

            <AnimatePresence>
                {showSources && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        id="source-selector" 
                        className="mt-2 bg-gray-800/90 backdrop-blur-sm rounded-lg overflow-hidden w-full sm:min-w-[220px] shadow-xl max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800" 
                        role="listbox"
                    >
                        {sources.map((source) => (
                            <SourceButton
                                key={source.url}
                                source={source}
                                isSelected={selectedSource === source.url}
                                onSelect={() => handleSourceSelect(source.url)}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

VideoControls.displayName = 'VideoControls';

export default VideoControls; 