import * as dynamoose from 'dynamoose';

export const AuthSchema = new dynamoose.Schema(
  {
    id: String,
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const AuthModel = dynamoose.model('Auth', AuthSchema);
