import * as dynamoose from 'dynamoose';

const ReplySchema = new dynamoose.Schema({
  id: {
    type: String,
    hashKey: true,
    required: true,
  },
  parentId: {
    type: String,
  },
  media: {
    type: Object,
    schema: {
      id: {
        type: String,
        required: true,
      },
    },
  },
  text: {
    type: String,
    required: true,
  },
  from: {
    type: Object,
    schema: {
      id: {
        type: String,
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
    },
  },
});

export const ReplyModel = dynamoose.model('Reply', ReplySchema);
