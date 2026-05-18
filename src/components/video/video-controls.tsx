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
    <button
        onClick={onSelect}
        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all duration-200 ${
            isSelected 
                ? 'bg-primary-500 border-primary-400 text-white shadow-lg shadow-primary-500/20' 
                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10 hover:text-gray-200'
        }`}
    >
        {source.name}
    </button>
));

SourceButton.displayName = 'SourceButton';

const VideoControls = memo(({
    sources,
    selectedSource,
    onSourceSelect,
}: Omit<VideoControlsProps, 'showSources' | 'hasInteracted' | 'onToggleSources'>) => {
    return (
        <div className="flex flex-wrap gap-2 py-4 border-t border-white/5 mt-4" role="region" aria-label="Video source selection">
            <div className="w-full mb-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select Server</span>
            </div>
            {sources.map((source) => (
                <SourceButton
                    key={source.url}
                    source={source}
                    isSelected={selectedSource === source.url}
                    onSelect={() => onSourceSelect(source.url)}
                />
            ))}
        </div>
    );
});

VideoControls.displayName = 'VideoControls';

export default VideoControls; 