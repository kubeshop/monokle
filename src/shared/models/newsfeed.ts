type NewsFeedItem = {
  title: string;
  type: string;
  url: string;
  description: string;
  date: string;
  tags: string[];
  imageUrl: string;
};

type NewsFeedState = {
  items: NewsFeedItem[];
};

export type {NewsFeedItem, NewsFeedState};
