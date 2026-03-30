import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useFeedback } from '@/components/feedback-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import { SocketClient } from '@/lib/socket-client';
import { useAuth } from '@/lib/auth-context';
import type { UserInfo } from '@/lib/api-types';

type MessageInfo = {
  messageId: number;
  senderId: number;
  created: number;
  text: string;
  isRead: boolean;
};

type ConversationInfo = {
  user1Id: number;
  user2Id: number;
  lastMessage: MessageInfo;
};

type ConversationsResponse = {
  conversations: ConversationInfo[];
  users: UserInfo[];
  total: number;
};

type MessagesResponse = {
  messages: MessageInfo[];
  users: UserInfo[];
  total: number;
};

type MessageResponse = {
  message: MessageInfo;
  user: UserInfo;
};

function buildConversationUserId(conversation: ConversationInfo, loggedUserId: number): number {
  return conversation.user1Id === loggedUserId ? conversation.user2Id : conversation.user1Id;
}

export function MessagesPage(): JSX.Element {
  const { t } = useTranslation();
  const feedback = useFeedback();
  const auth = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const requestedUserId = Number(params.userId || 0);

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [conversations, setConversations] = useState<ConversationInfo[]>([]);
  const [usersById, setUsersById] = useState<Record<number, UserInfo>>({});
  const [messages, setMessages] = useState<MessageInfo[]>([]);
  const [text, setText] = useState('');

  const selectedUserId = requestedUserId > 0 ? requestedUserId : 0;

  const upsertUsers = useCallback((users: UserInfo[]) => {
    setUsersById(previous => {
      const next = { ...previous };
      users.forEach(user => {
        next[user.userId] = user;
      });
      return next;
    });
  }, []);

  const withSocket = useCallback(async <T,>(event: string, payload?: unknown): Promise<T> => {
    if (!auth.token) {
      throw new Error('Missing auth token.');
    }

    const socket = new SocketClient();
    try {
      socket.connect(auth.apiUrl, auth.token);
      return await socket.emit<unknown, T>(event, payload);
    } finally {
      socket.disconnect();
    }
  }, [auth.apiUrl, auth.token]);

  const loadConversations = useCallback(async () => {
    setLoadingConversations(true);
    setError('');

    try {
      const response = await apiClient.get<ConversationsResponse>('/v1/messages/list');
      setConversations(response.conversations);
      upsertUsers(response.users);
    } catch (e) {
      setError((e as Error).message || 'Unable to load conversations.');
    } finally {
      setLoadingConversations(false);
    }
  }, [upsertUsers]);

  const loadMessages = useCallback(async (userId: number) => {
    if (!userId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    setError('');

    try {
      const response = await apiClient.get<MessagesResponse>(`/v1/messages/get/${userId}`);
      const sorted = response.messages.slice().sort((a, b) => a.created - b.created);
      setMessages(sorted);
      upsertUsers(response.users);
    } catch (e) {
      setError((e as Error).message || 'Unable to load messages.');
    } finally {
      setLoadingMessages(false);
    }
  }, [upsertUsers]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (loadingConversations) {
      return;
    }

    if (selectedUserId) {
      void loadMessages(selectedUserId);
      return;
    }

    if (conversations.length > 0 && auth.user) {
      const firstUserId = buildConversationUserId(conversations[0], auth.user.userId);
      navigate(`/message/${firstUserId}`, { replace: true });
    }
  }, [auth.user, conversations, loadMessages, loadingConversations, navigate, selectedUserId]);

  const conversationRows = useMemo(() => {
    if (!auth.user) {
      return [];
    }

    return conversations
      .map(conversation => {
        const userId = buildConversationUserId(conversation, auth.user!.userId);
        const user = usersById[userId];
        return {
          conversation,
          userId,
          userName: user?.name || `#${userId}`,
          unread: conversation.lastMessage.senderId === userId && conversation.lastMessage.isRead === false
        };
      })
      .sort((a, b) => b.conversation.lastMessage.created - a.conversation.lastMessage.created);
  }, [auth.user, conversations, usersById]);

  const markRead = async (userId: number) => {
    if (!userId || !auth.user) {
      return;
    }

    const hasUnread = messages.some(message => message.senderId === userId && message.isRead === false);
    if (!hasUnread) {
      return;
    }

    setMessages(previous => previous.map(message => {
      if (message.senderId !== userId) {
        return message;
      }
      return { ...message, isRead: true };
    }));

    setConversations(previous => previous.map(conversation => {
      const otherId = buildConversationUserId(conversation, auth.user!.userId);
      if (otherId !== userId) {
        return conversation;
      }
      return {
        ...conversation,
        lastMessage: {
          ...conversation.lastMessage,
          isRead: true
        }
      };
    }));

    try {
      await withSocket('message:read', { userId });
    } catch {
      // Keep optimistic status to avoid flicker.
    }
  };

  useEffect(() => {
    void markRead(selectedUserId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId, messages.length]);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();

    const body = text.trim();
    if (!body || !selectedUserId || submitting) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await withSocket<MessageResponse>('message:send', {
        userId: selectedUserId,
        text: body
      });

      setText('');
      setMessages(previous => [...previous, response.message]);
      upsertUsers([response.user]);

      if (auth.user) {
        const fallbackConversation: ConversationInfo = {
          user1Id: auth.user.userId,
          user2Id: selectedUserId,
          lastMessage: response.message
        };

        setConversations(previous => {
          const index = previous.findIndex(conversation => {
            const otherId = buildConversationUserId(conversation, auth.user!.userId);
            return otherId === selectedUserId;
          });

          if (index === -1) {
            return [fallbackConversation, ...previous];
          }

          const updated = previous.slice();
          const merged = {
            ...updated[index],
            lastMessage: response.message
          };
          updated.splice(index, 1);
          updated.unshift(merged);
          return updated;
        });
      }
    } catch (e) {
      setError((e as Error).message || 'Unable to send message.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteConversation = async () => {
    if (!selectedUserId) {
      return;
    }

    const confirmed = await feedback.confirm(
      t('MESSAGES_DELETE_CONVERSATION_CONFIRM', { defaultValue: 'Delete this conversation?' }),
      { title: t('BUTTON_DELETE', { defaultValue: 'Delete' }) }
    );
    if (!confirmed) {
      return;
    }

    try {
      await apiClient.post('/v1/messages/deleteMessages', { id: selectedUserId });
      setConversations(previous => previous.filter(conversation => {
        if (!auth.user) {
          return true;
        }
        return buildConversationUserId(conversation, auth.user.userId) !== selectedUserId;
      }));
      setMessages([]);
      navigate('/message', { replace: true });
    } catch (e) {
      setError((e as Error).message || 'Unable to delete conversation.');
    }
  };

  const selectedUser = selectedUserId ? usersById[selectedUserId] : undefined;

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>{t('MESSAGES_TITLE', { defaultValue: 'Messages' })}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {loadingConversations && <p className="text-sm text-muted-foreground">Loading conversations...</p>}
          {!loadingConversations && conversationRows.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t('MESSAGES_NO_CONVERSATION_SELECTED', { defaultValue: 'No conversation yet.' })}
            </p>
          )}
          {conversationRows.map(row => (
            <Button
              key={`${row.conversation.user1Id}-${row.conversation.user2Id}`}
              variant={selectedUserId === row.userId ? 'secondary' : 'outline'}
              className="justify-between"
              onClick={() => navigate(`/message/${row.userId}`)}
            >
              <span className="truncate">{row.userName}</span>
              {row.unread && <span className="inline-block h-2 w-2 rounded-full bg-accent" />}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedUser ? selectedUser.name : t('MESSAGES_NO_CONVERSATION_SELECTED', { defaultValue: 'Select a conversation' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="app-inline-actions">
            {selectedUserId > 0 && (
              <>
                <Button asChild size="sm" variant="outline">
                  <Link to={`/profile/${selectedUserId}`}>{t('BUTTON_SHOW_PROFILE', { defaultValue: 'Profile' })}</Link>
                </Button>
                <Button size="sm" variant="destructive" onClick={() => void deleteConversation()}>
                  {t('MESSAGES_DELETE_CONVERSATION', { defaultValue: 'Delete conversation' })}
                </Button>
              </>
            )}
          </div>

          <div className="messages-pane">
            {loadingMessages && <p className="text-sm text-muted-foreground">Loading messages...</p>}
            {!loadingMessages && selectedUserId === 0 && (
              <p className="text-sm text-muted-foreground">
                {t('MESSAGES_NO_CONVERSATION_SELECTED', { defaultValue: 'Select a conversation.' })}
              </p>
            )}
            {!loadingMessages && selectedUserId > 0 && messages.length === 0 && (
              <p className="text-sm text-muted-foreground">No messages yet.</p>
            )}
            {messages.map(message => {
              const isMine = message.senderId === auth.user?.userId;
              return (
                <div key={message.messageId} className={isMine ? 'messages-row is-mine' : 'messages-row'}>
                  <div className="messages-bubble">
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{new Date(message.created).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <form className="grid gap-2" onSubmit={event => void sendMessage(event)}>
            <Input
              value={text}
              onChange={event => setText(event.target.value)}
              placeholder={t('MESSAGES_ENTER_MESSAGE', { defaultValue: 'Enter message' })}
              disabled={selectedUserId === 0 || submitting}
            />
            <div className="app-inline-actions">
              <Button type="submit" disabled={selectedUserId === 0 || submitting || text.trim().length === 0}>
                {t('BUTTON_SEND_MESSAGE', { defaultValue: 'Send message' })}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
