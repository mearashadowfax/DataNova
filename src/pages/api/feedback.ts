import { feedbackRoutes } from '@/feedback/endpoint';
import { docExists } from '@/support/load';

export const { GET, POST } = feedbackRoutes({ documentExists: docExists });
