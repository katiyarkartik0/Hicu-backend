import * as dynamoose from 'dynamoose';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

const InvitationSchema = new dynamoose.Schema(
  {
    email: {
      type: String,
      hashKey: true,
      required: true,
    },
    id: {
      type: String,
      rangeKey: true,
      required: true,
    },
    recipientEmail: {
      type: String,
      required: true,
    },
    senderEmail: {
      type: String,
      required: true,
    },
    scope: {
      type: Array,
      schema: [String],
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(InvitationStatus),
      default: InvitationStatus.PENDING,
    },
  },
  {
    timestamps: true,
  },
);

export const InvitationModel = dynamoose.model('Invitation', InvitationSchema);
