export type ReportChatRole = 'user' | 'system';

export interface ReportChatMessage {
  id: number;
  role: ReportChatRole;
  text: string;
  createdAt: Date;
  error?: boolean;
}
