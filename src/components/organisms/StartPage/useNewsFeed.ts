import {useState} from 'react';
import {useAsync} from 'react-use';

import log from 'loglevel';

import {NewsFeedItem} from '@shared/models/newsfeed';

let cachedNewsFeed: NewsFeedItem[] | undefined;

export function useNewsFeed() {
  const [newsFeed, setNewsFeed] = useState<NewsFeedItem[]>(cachedNewsFeed || []);

  useAsync(async () => {
    if (cachedNewsFeed) {
      setNewsFeed(cachedNewsFeed);
      return;
    }
    const newsFeedUrl = process.env.REACT_APP_NEWS_FEED_URL;
    if (!newsFeedUrl) {
      return;
    }

    try {
      const response = await fetch(newsFeedUrl);
      const data: NewsFeedItem[] = await response.json();
      const sortedFeed = data.sort((item1, item2) => Date.parse(item2.date) - Date.parse(item1.date));
      setNewsFeed(sortedFeed);
      cachedNewsFeed = sortedFeed;
    } catch (e: any) {
      log.warn('Error retrieving news feed', e.toString());
    }
  });

  return newsFeed;
}
