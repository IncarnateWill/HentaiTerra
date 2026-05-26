interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface DiscordEmbed {
  title?: string;
  url?: string;
  description?: string;
  color?: number;
  image?: {
    url: string;
  };
  fields?: EmbedField[];
  footer?: {
    text: string;
    icon_url?: string;
  };
}

interface WebhookPayload {
  content?: string;
  embeds?: DiscordEmbed[];
}

// Convert color name to hex number
function getColorValue(color: string): number {
  const colors: Record<string, number> = {
    'Green': 0x00ff00,
    'Blue': 0x0000ff,
    'Red': 0xff0000,
    'Purple': 0x800080,
    'Orange': 0xffa500,
    'Yellow': 0xffff00,
  };
  return colors[color] || 0x00ff00; // Default to green
}

export async function sendDiscordWebhook(
  webhookUrl: string,
  payload: WebhookPayload
): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Discord webhook failed:', response.status, response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Discord webhook:', error);
    return false;
  }
}

export function createAnimeEmbed(
  anime: {
    title: string;
    synopsis?: string;
    poster: string;
    studio?: string;
    studios?: { name: string }[];
    genres: { name: string }[];
    alternativeTitles?: string[];
    animeId?: string;
  },
  addedBy?: string
): DiscordEmbed {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hentaiterra.ro';
  const animeUrl = anime.animeId ? `${siteUrl}/hentai/${anime.animeId}` : undefined;
  const genreNames = anime.genres.map(g => g.name).join(', ') || 'Nici un gen';
  // Handle both studio (string) and studios (array) formats
  const studioNames = anime.studio || anime.studios?.map(s => s.name).join(', ') || 'unknown';
  const alternativeTitles = anime.alternativeTitles?.join(', ') || 'N/A';
  
  return {
    title: anime.title,
    url: animeUrl,
    color: getColorValue('Green'),
    image: {
      url: anime.poster,
    },
    fields: [
      {
        name: 'Studio',
        value: studioNames,
        inline: true,
      },
      {
        name: 'Genuri',
        value: genreNames,
        inline: true,
      },
      {
        name: 'Tip',
        value: 'Anime',
        inline: true,
      },
      {
        name: 'Alternative Titles',
        value: alternativeTitles,
        inline: true,
      },
    ],
    description: anime.synopsis ? anime.synopsis.slice(0, 500) : `Nou anime adăugat: ${anime.title}`,
    footer: {
      text: addedBy ? `Adaugat de ${addedBy}` : 'Adaugat automat',
    },
  };
}

export function createEpisodeEmbed(
  episode: {
    name: string;
    episodeNumber: number;
    thumbnail?: string;
    animeId?: string;
    episodeId?: string;
    anime?: {
      title: string;
      poster?: string;
    };
  },
  addedBy?: string
): DiscordEmbed {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hentaiterra.ro';
  const episodeUrl = episode.episodeId ? `${siteUrl}/watch/${episode.episodeId}` : undefined;
  return {
    title: `${episode.anime?.title || 'Unknown Anime'} - Episodul ${episode.episodeNumber}`,
    url: episodeUrl,
    color: getColorValue('Blue'),
    image: {
      url: episode.thumbnail || episode.anime?.poster || '',
    },
    fields: [
      {
        name: 'Nume Episod',
        value: episode.name,
        inline: true,
      },
      {
        name: 'Numărul Episodului',
        value: episode.episodeNumber.toString(),
        inline: true,
      },
      {
        name: 'Tip',
        value: 'Episod',
        inline: true,
      },
    ],
    description: `Un nou episod a fost adăugat pentru ${episode.anime?.title || 'Unknown Anime'}!`,
    footer: {
      text: addedBy ? `Adaugat de ${addedBy}` : 'Adaugat automat',
    },
  };
}

export async function notifyNewAnime(
  anime: {
    title: string;
    synopsis?: string;
    poster: string;
    studio?: string;
    studios?: { name: string }[];
    genres: { name: string }[];
    alternativeTitles?: string[];
    animeId?: string;
  },
  addedBy?: string
): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_ANIME || '';
  const embed = createAnimeEmbed(anime, addedBy);
  
  const payload: WebhookPayload = {
    content: `<@&1435714488191160370> A fost adaugat un nou hentai${addedBy ? ` de catre ${addedBy}` : ''}`,
    embeds: [embed],
  };

  return await sendDiscordWebhook(webhookUrl, payload);
}

export async function notifyNewEpisode(
  episode: {
    name: string;
    episodeNumber: number;
    thumbnail?: string;
    animeId?: string;
    episodeId?: string;
    anime?: {
      title: string;
      poster?: string;
    };
  },
  addedBy?: string
): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_EPISODE || '';
  const embed = createEpisodeEmbed(episode, addedBy);
  
  const payload: WebhookPayload = {
    content: `<@&1295034622328967228> A fost adaugat un nou episod${addedBy ? ` de catre ${addedBy}` : ''}`,
    embeds: [embed],
  };

  return await sendDiscordWebhook(webhookUrl, payload);
}

export async function logToDiscordWebhook(message: string): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_LOG || '';
  const payload: WebhookPayload = {
    content: message,
  };
  return await sendDiscordWebhook(webhookUrl, payload);
}
