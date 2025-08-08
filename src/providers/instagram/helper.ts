import { MediaItem, UserProfile } from './instagram.types';

export const accountDetailsHelper = {
  instagramFields: [
    'id',
    'name',
    'username',
    'biography',
    'profile_picture_url',
    'followers_count',
    'follows_count',
    'media_count',
    'account_type',
    'media{id,caption,media_type,media_url,thumbnail_url,timestamp}',
  ].join(','),
  transformToUserProfile: function (webhookProfileResponse: any): UserProfile {
    const {
      id,
      name,
      username,
      biography = '',
      profile_picture_url = '',
      followers_count,
      follows_count,
      media_count,
      account_type,
      media,
    } = webhookProfileResponse;

    const mediaItems: MediaItem[] = (media?.data || []).map(
      ({
        id,
        media_type,
        media_url,
        caption,
        thumbnail,
        timestamp,
      }: any): MediaItem => ({
        id,
        mediaType: media_type,
        mediaUrl: media_url,
        caption,
        timestamp,
        thumbnail,
      }),
    );

    return {
      id,
      name,
      username,
      biography,
      profilePictureUrl: profile_picture_url,
      followersCount: followers_count,
      followsCount: follows_count,
      mediaCount: media_count,
      accountType: account_type,
      media: {
        data: mediaItems,
      },
    };
  },
};
