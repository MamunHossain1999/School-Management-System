// Export all API endpoints
export * from './baseApi';
export * from './authApi';
export * from './academicApi';
export * from './attendanceApi';
export * from './examApi';
export * from './feeApi';
export * from './assignmentApi';
export * from './noticeApi';
export * from './libraryApi';
export * from './transportApi';
export * from './studentApi';
export * from './teacherApi';
export * from './settingsApi';
export * from './rolesApi';

// Export communicationApi separately to avoid conflicts
export { 
  communicationApi,
  useGetUnreadMessageCountQuery as useGetUnreadMessageCountQueryFromComm,
  useGetMessageStatsQuery as useGetMessageStatsQueryFromComm,
  useSendMessageMutation as useSendMessageMutationFromComm,
  useGetInboxMessagesQuery,
  useGetSentMessagesQuery,
  useGetMessageByIdQuery,
  useMarkMessageAsReadMutation as useMarkMessageAsReadMutationFromComm,
  useDeleteMessageMutation as useDeleteMessageMutationFromComm,
  useReplyToMessageMutation,
  useMarkMultipleMessagesAsReadMutation,
  useDeleteMultipleMessagesMutation,
  useSearchMessagesQuery,
  useSearchNoticesQuery
} from './communicationApi';
