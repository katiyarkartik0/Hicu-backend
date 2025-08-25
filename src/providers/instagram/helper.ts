import {  IgUserProfile } from './instagram.types';

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
  ].join(','),
  transformToUserProfile: function (webhookProfileResponse: any): IgUserProfile {
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
    } = webhookProfileResponse;

    return {
      igUserId:id,
      igName:name,
      igUsername:username,
      igBiography:biography,
      igProfilePictureUrl: profile_picture_url,
      igFollowersCount: followers_count,
      igFollowingCount: follows_count,
      igMediaCount: media_count,
      igAccountType: account_type,
    };
  },
};
