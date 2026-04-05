"use client";

import React, { useMemo, useEffect, useState } from "react";
import { DiscussionEmbed } from "disqus-react";

interface DisqusProps {
  identifier: string;
  title: string;
  language?: string;
  onLoad?: () => void;
}

export default function DisqusDiscussionEmbed({ 
  identifier, 
  title, 
  language = "ro",
  onLoad 
}: DisqusProps) {
  const [currentUrl, setCurrentUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    if (currentUrl) {
      onLoad?.();
    }
  }, [currentUrl, identifier, title, onLoad]);

  const disqusConfig = useMemo(
    () => ({
      url: currentUrl,
      identifier,
      title,
      language,
    }),
    [currentUrl, identifier, title, language]
  );

  if (!currentUrl) {
    return <div>Loading comments...</div>;
  }

  return (
    <div className="disqus-container">
      <DiscussionEmbed 
        shortname="hentaiterra" 
        config={{
          ...disqusConfig,
        }}
      />
    </div>
  );
}
