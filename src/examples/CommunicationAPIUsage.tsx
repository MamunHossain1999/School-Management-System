/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  // Notice hooks
  useCreateNoticeMutation,
  useGetNoticesQuery,
  useGetNoticeByIdQuery,
  useUpdateNoticeMutation,
  useDeleteNoticeMutation,
  useMarkNoticeAsViewedMutation,
  useGetNoticeStatsQuery,
  useSearchNoticesQuery,

  // Message hooks
  useSendMessageMutation,
  useGetInboxMessagesQuery,
  useGetSentMessagesQuery,
  useGetMessageByIdQuery,
  useMarkMessageAsReadMutation,
  useDeleteMessageMutation,
  useReplyToMessageMutation,
  useGetUnreadMessageCountQuery,
  useGetMessageStatsQuery,
  useMarkMultipleMessagesAsReadMutation,
  useDeleteMultipleMessagesMutation,
  useSearchMessagesQuery,

  // Types
  type CreateNoticeRequest,
  type SendMessageRequest,
  type ReplyMessageRequest,
} from '../store/api/communicationApi';
import toast from 'react-hot-toast';

/**
 * Comprehensive example component demonstrating all Communication API endpoints
 * 
 * NOTICE ENDPOINTS:
 * - POST /api/communication/notices - Create notice
 * - GET /api/communication/notices - Get notices
 * - GET /api/communication/notices/:id - Get notice by ID
 * - PUT /api/communication/notices/:id - Update notice
 * - DELETE /api/communication/notices/:id - Delete notice
 * - POST /api/communication/notices/:id/view - Mark notice as viewed
 * 
 * MESSAGE ENDPOINTS:
 * - POST /api/communication/messages - Send message
 * - GET /api/communication/messages/inbox - Get inbox messages
 * - GET /api/communication/messages/sent - Get sent messages
 * - GET /api/communication/messages/:id - Get message by ID
 * - PUT /api/communication/messages/:id/read - Mark message as read
 * - DELETE /api/communication/messages/:id - Delete message
 * - POST /api/communication/messages/:id/reply - Reply to message
 */
const CommunicationAPIUsage: React.FC = () => {
  const [selectedNoticeId, setSelectedNoticeId] = useState<string>('');
  const [selectedMessageId, setSelectedMessageId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // ===================
  // NOTICE API EXAMPLES
  // ===================

  // 1. Create Notice
  const [createNotice] = useCreateNoticeMutation();
  
  const handleCreateNotice = async () => {
    const noticeData: CreateNoticeRequest = {
      title: 'Important School Update',
      content: 'This is an important notice for all students and parents.',
      type: 'general',
      targetAudience: 'all',
      publishDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    };

    try {
      const result = await createNotice(noticeData).unwrap();
      toast.success('Notice created successfully!');
      console.log('Created notice:', result);
    } catch (error) {
      toast.error('Failed to create notice');
      console.error('Create notice error:', error);
    }
  };

  // 2. Get All Notices
  const { 
    data: notices = [], 
    isLoading: noticesLoading, 
    error: noticesError 
  } = useGetNoticesQuery({
    targetAudience: 'all',
    isActive: true
  });

  // 3. Get Notice by ID
  const { 
    data: selectedNotice, 
    isLoading: noticeLoading 
  } = useGetNoticeByIdQuery(selectedNoticeId, {
    skip: !selectedNoticeId
  });

  // 4. Update Notice
  const [updateNotice] = useUpdateNoticeMutation();
  
  const handleUpdateNotice = async (noticeId: string) => {
    try {
      const result = await updateNotice({
        id: noticeId,
        data: {
          title: 'Updated Notice Title',
          isActive: true
        }
      }).unwrap();
      toast.success('Notice updated successfully!');
      console.log('Updated notice:', result);
    } catch (error) {
      toast.error('Failed to update notice');
      console.error('Update notice error:', error);
    }
  };

  // 5. Delete Notice
  const [deleteNotice] = useDeleteNoticeMutation();
  
  const handleDeleteNotice = async (noticeId: string) => {
    try {
      await deleteNotice(noticeId).unwrap();
      toast.success('Notice deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete notice');
      console.error('Delete notice error:', error);
    }
  };

  // 6. Mark Notice as Viewed
  const [markNoticeAsViewed] = useMarkNoticeAsViewedMutation();
  
  const handleMarkNoticeViewed = async (noticeId: string) => {
    try {
      await markNoticeAsViewed(noticeId).unwrap();
      toast.success('Notice marked as viewed!');
    } catch (error) {
      toast.error('Failed to mark notice as viewed');
      console.error('Mark notice viewed error:', error);
    }
  };

  // 7. Get Notice Statistics
  const { data: noticeStats } = useGetNoticeStatsQuery();

  // 8. Search Notices
  const { data: searchedNotices = [] } = useSearchNoticesQuery({
    query: searchQuery,
    limit: 10
  }, {
    skip: !searchQuery
  });

  // ====================
  // MESSAGE API EXAMPLES
  // ====================

  // 1. Send Message
  const [sendMessage] = useSendMessageMutation();
  
  const handleSendMessage = async () => {
    const messageData: SendMessageRequest = {
      receiverId: 'user123', // Replace with actual user ID
      subject: 'Test Message',
      content: 'This is a test message content.',
      attachments: [] // Optional file attachments
    };

    try {
      const result = await sendMessage(messageData).unwrap();
      toast.success('Message sent successfully!');
      console.log('Sent message:', result);
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Send message error:', error);
    }
  };

  // 2. Get Inbox Messages
  const { 
    data: inboxMessages = [], 
    isLoading: inboxLoading 
  } = useGetInboxMessagesQuery({
    isRead: false // Get only unread messages
  });

  // 3. Get Sent Messages
  const { 
    data: sentMessages = [], 
    isLoading: sentLoading 
  } = useGetSentMessagesQuery({});

  // 4. Get Message by ID
  const { 
    data: selectedMessage, 
    isLoading: messageLoading 
  } = useGetMessageByIdQuery(selectedMessageId, {
    skip: !selectedMessageId
  });

  // 5. Mark Message as Read
  const [markMessageAsRead] = useMarkMessageAsReadMutation();
  
  const handleMarkMessageRead = async (messageId: string) => {
    try {
      const result = await markMessageAsRead(messageId).unwrap();
      toast.success('Message marked as read!');
      console.log('Marked as read:', result);
    } catch (error) {
      toast.error('Failed to mark message as read');
      console.error('Mark message read error:', error);
    }
  };

  // 6. Delete Message
  const [deleteMessage] = useDeleteMessageMutation();
  
  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId).unwrap();
      toast.success('Message deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete message');
      console.error('Delete message error:', error);
    }
  };

  // 7. Reply to Message
  const [replyToMessage] = useReplyToMessageMutation();
  
  const handleReplyToMessage = async (messageId: string) => {
    const replyData: ReplyMessageRequest = {
      content: 'This is a reply to your message.',
      attachments: []
    };

    try {
      const result = await replyToMessage({
        id: messageId,
        data: replyData
      }).unwrap();
      toast.success('Reply sent successfully!');
      console.log('Reply sent:', result);
    } catch (error) {
      toast.error('Failed to send reply');
      console.error('Reply error:', error);
    }
  };

  // 8. Get Unread Message Count
  const { data: unreadCount } = useGetUnreadMessageCountQuery();

  // 9. Get Message Statistics
  const { data: messageStats } = useGetMessageStatsQuery();

  // 10. Bulk Operations - Mark Multiple Messages as Read
  const [markMultipleAsRead] = useMarkMultipleMessagesAsReadMutation();
  
  const handleBulkMarkAsRead = async (messageIds: string[]) => {
    try {
      await markMultipleAsRead(messageIds).unwrap();
      toast.success('Messages marked as read!');
    } catch (error) {
      toast.error('Failed to mark messages as read');
      console.error('Bulk mark read error:', error);
    }
  };

  // 11. Bulk Operations - Delete Multiple Messages
  const [deleteMultipleMessages] = useDeleteMultipleMessagesMutation();
  
  const handleBulkDelete = async (messageIds: string[]) => {
    try {
      await deleteMultipleMessages(messageIds).unwrap();
      toast.success('Messages deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete messages');
      console.error('Bulk delete error:', error);
    }
  };

  // 12. Search Messages
  const { data: searchedMessages = [] } = useSearchMessagesQuery({
    query: searchQuery,
    type: 'inbox',
    limit: 10
  }, {
    skip: !searchQuery
  });

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Communication API Usage Examples</h1>
      
      {/* Notice Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Notice Management</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={handleCreateNotice}
            className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Create Notice
          </button>
          
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="font-medium">Total Notices: {notices.length}</p>
            <p className="text-sm text-gray-600">
              {noticesLoading ? 'Loading...' : `${notices.filter(n => n.isActive).length} active`}
            </p>
            {noticesError && (
              <p className="text-sm text-red-600 mt-1">
                Error loading notices
              </p>
            )}
          </div>

          {noticeStats && (
            <div className="p-4 bg-green-100 rounded-lg">
              <p className="font-medium">Notice Stats</p>
              <p className="text-sm">Total: {noticeStats.total}</p>
              <p className="text-sm">Active: {noticeStats.active}</p>
            </div>
          )}
        </div>

        {/* Notice List */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Recent Notices</h3>
          {notices.slice(0, 3).map((notice) => (
            <div key={notice._id} className="p-3 border rounded-lg flex justify-between items-center">
              <div>
                <h4 className="font-medium">{notice.title}</h4>
                <p className="text-sm text-gray-600">{notice.type} • {notice.targetAudience}</p>
              </div>
              <div className="space-x-2">
                <button 
                  onClick={() => setSelectedNoticeId(notice._id)}
                  className={`px-3 py-1 text-white text-sm rounded ${
                    selectedNoticeId === notice._id ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {selectedNoticeId === notice._id ? 'Selected' : 'Select'}
                </button>
                <button 
                  onClick={() => handleMarkNoticeViewed(notice._id)}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded"
                >
                  Mark Viewed
                </button>
                <button 
                  onClick={() => handleUpdateNotice(notice._id)}
                  className="px-3 py-1 bg-yellow-500 text-white text-sm rounded"
                >
                  Update
                </button>
                <button 
                  onClick={() => handleDeleteNotice(notice._id)}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Notice Details */}
        {selectedNoticeId && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800">Selected Notice Details</h3>
            {noticeLoading ? (
              <p className="text-sm text-gray-600">Loading notice details...</p>
            ) : selectedNotice ? (
              <div className="mt-2 space-y-2">
                <p><span className="font-medium">Title:</span> {selectedNotice.title}</p>
                <p><span className="font-medium">Content:</span> {selectedNotice.content}</p>
                <p><span className="font-medium">Type:</span> {selectedNotice.type}</p>
                <p><span className="font-medium">Target Audience:</span> {selectedNotice.targetAudience}</p>
                <p><span className="font-medium">Status:</span> {selectedNotice.isActive ? 'Active' : 'Inactive'}</p>
                <p><span className="font-medium">Published:</span> {new Date(selectedNotice.publishDate).toLocaleDateString()}</p>
                {selectedNotice.expiryDate && (
                  <p><span className="font-medium">Expires:</span> {new Date(selectedNotice.expiryDate).toLocaleDateString()}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-red-600">Notice not found</p>
            )}
            <button 
              onClick={() => setSelectedNoticeId('')}
              className="mt-3 px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Message Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Message Management</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={handleSendMessage}
            className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Send Message
          </button>
          
          <div className="p-4 bg-blue-100 rounded-lg">
            <p className="font-medium">Inbox</p>
            <p className="text-sm">{inboxMessages.length} messages</p>
            <p className="text-sm text-blue-600">
              {unreadCount?.count || 0} unread
            </p>
          </div>

          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="font-medium">Sent</p>
            <p className="text-sm">{sentMessages.length} messages</p>
          </div>

          {messageStats && (
            <div className="p-4 bg-orange-100 rounded-lg">
              <p className="font-medium">Stats</p>
              <p className="text-sm">Today: {messageStats.todayCount}</p>
              <p className="text-sm">Unread: {messageStats.unreadCount}</p>
            </div>
          )}
        </div>

        {/* Message Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inbox Messages */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Inbox Messages</h3>
            {inboxLoading ? (
              <p>Loading inbox...</p>
            ) : (
              inboxMessages.slice(0, 3).map((message) => (
                <div key={message._id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{message.subject}</h4>
                      <p className="text-sm text-gray-600">
                        From: {message.sender.firstName} {message.sender.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(message.sentAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="space-x-1">
                      <button 
                        onClick={() => setSelectedMessageId(message._id)}
                        className={`px-2 py-1 text-white text-xs rounded ${
                          selectedMessageId === message._id ? 'bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'
                        }`}
                      >
                        {selectedMessageId === message._id ? 'Selected' : 'Select'}
                      </button>
                      {!message.isRead && (
                        <button 
                          onClick={() => handleMarkMessageRead(message._id)}
                          className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
                        >
                          Mark Read
                        </button>
                      )}
                      <button 
                        onClick={() => handleReplyToMessage(message._id)}
                        className="px-2 py-1 bg-green-500 text-white text-xs rounded"
                      >
                        Reply
                      </button>
                      <button 
                        onClick={() => handleDeleteMessage(message._id)}
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sent Messages */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Sent Messages</h3>
            {sentLoading ? (
              <p>Loading sent messages...</p>
            ) : (
              sentMessages.slice(0, 3).map((message) => (
                <div key={message._id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{message.subject}</h4>
                      <p className="text-sm text-gray-600">
                        To: {message.receiver.firstName} {message.receiver.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(message.sentAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDeleteMessage(message._id)}
                      className="px-2 py-1 bg-red-500 text-white text-xs rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Message Details */}
        {selectedMessage && (
          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="text-lg font-medium text-purple-800">Selected Message Details</h3>
            {messageLoading ? (
              <p className="text-sm text-gray-600">Loading message details...</p>
            ) : (
              <div className="mt-2 space-y-2">
                <p><span className="font-medium">Subject:</span> {selectedMessage.subject}</p>
                <p><span className="font-medium">Content:</span> {selectedMessage.content}</p>
                <p><span className="font-medium">From:</span> {selectedMessage.sender.firstName} {selectedMessage.sender.lastName}</p>
                <p><span className="font-medium">To:</span> {selectedMessage.receiver.firstName} {selectedMessage.receiver.lastName}</p>
                <p><span className="font-medium">Status:</span> {selectedMessage.isRead ? 'Read' : 'Unread'}</p>
                <p><span className="font-medium">Sent:</span> {new Date(selectedMessage.sentAt).toLocaleString()}</p>
                {selectedMessage.readAt && (
                  <p><span className="font-medium">Read At:</span> {new Date(selectedMessage.readAt).toLocaleString()}</p>
                )}
                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                  <p><span className="font-medium">Attachments:</span> {selectedMessage.attachments.length} file(s)</p>
                )}
              </div>
            )}
            <button 
              onClick={() => setSelectedMessageId('')}
              className="mt-3 px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* Search Section */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Search</h3>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notices and messages..."
            className="w-full p-2 border rounded-lg"
          />
          
          {searchQuery && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium">Notices ({searchedNotices.length})</h4>
                {searchedNotices.map((notice) => (
                  <div key={notice._id} className="p-2 border rounded mt-2">
                    <p className="font-medium">{notice.title}</p>
                    <p className="text-sm text-gray-600">{notice.type}</p>
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="font-medium">Messages ({searchedMessages.length})</h4>
                {searchedMessages.map((message) => (
                  <div key={message._id} className="p-2 border rounded mt-2">
                    <p className="font-medium">{message.subject}</p>
                    <p className="text-sm text-gray-600">
                      {message.sender.firstName} {message.sender.lastName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bulk Operations */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Bulk Operations</h3>
          <div className="space-x-2">
            <button 
              onClick={() => handleBulkMarkAsRead(['msg1', 'msg2', 'msg3'])}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Mark Selected as Read
            </button>
            <button 
              onClick={() => handleBulkDelete(['msg1', 'msg2', 'msg3'])}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Delete Selected
            </button>
          </div>
        </div>
      </div>

      {/* API Endpoint Documentation */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">API Endpoints Reference</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-blue-600">Notice Endpoints</h3>
            <div className="text-sm space-y-1 font-mono bg-gray-100 p-4 rounded">
              <p><span className="text-green-600">POST</span> /api/communication/notices</p>
              <p><span className="text-blue-600">GET</span> /api/communication/notices</p>
              <p><span className="text-blue-600">GET</span> /api/communication/notices/:id</p>
              <p><span className="text-yellow-600">PUT</span> /api/communication/notices/:id</p>
              <p><span className="text-red-600">DELETE</span> /api/communication/notices/:id</p>
              <p><span className="text-green-600">POST</span> /api/communication/notices/:id/view</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-purple-600">Message Endpoints</h3>
            <div className="text-sm space-y-1 font-mono bg-gray-100 p-4 rounded">
              <p><span className="text-green-600">POST</span> /api/communication/messages</p>
              <p><span className="text-blue-600">GET</span> /api/communication/messages/inbox</p>
              <p><span className="text-blue-600">GET</span> /api/communication/messages/sent</p>
              <p><span className="text-yellow-600">PUT</span> /api/communication/messages/:id/read</p>
              <p><span className="text-red-600">DELETE</span> /api/communication/messages/:id</p>
              <p><span className="text-green-600">POST</span> /api/communication/messages/:id/reply</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationAPIUsage;
