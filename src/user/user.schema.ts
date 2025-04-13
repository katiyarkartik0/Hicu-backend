import * as dynamoose from 'dynamoose';
import { v4 as uuid } from 'uuid';

const UserSchema = new dynamoose.Schema(
  {
    email: {
      type: String,
      required: true,
      hashKey: true,
    },
    password: {
      type: String,
      required: true,
    },
    scope: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel = dynamoose.model('User', UserSchema);
