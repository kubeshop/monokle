import {useState} from 'react';
import {useAsync} from 'react-use';

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
    const response = await fetch(newsFeedUrl);
    const data = await response.json();
    setNewsFeed(data);
    cachedNewsFeed = data;
  });

  return newsFeed;
}
