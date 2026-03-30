import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { AvatarInfo } from '@ptcg/common';

import { useFeedback } from '@/components/feedback-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiClient } from '@/lib/api-client';
import type { UserInfo } from '@/lib/api-types';
import { readApiErrorCode, useAuth } from '@/lib/auth-context';
import { showToast } from '@/lib/toast';

type MatchInfo = {
  matchId: number;
  player1Id: number;
  player2Id: number;
  ranking1: number;
  ranking2: number;
  rankingStake1: number;
  rankingStake2: number;
  winner: number;
  created: number;
  formatName: string;
};

type ProfileResponse = {
  user: UserInfo;
};

type MatchHistoryResponse = {
  matches: MatchInfo[];
  users: UserInfo[];
  total: number;
};

type AvatarListResponse = {
  avatars: AvatarInfo[];
};

type AvatarResponse = {
  avatar: AvatarInfo;
};

function toAvatarUrl(apiUrl: string, avatarsUrl: string, fileName: string): string {
  return `${apiUrl}${avatarsUrl}`.replace('{name}', fileName);
}

async function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const encoded = result.includes(',') ? result.split(',')[1] : result;
      resolve(encoded);
    };
    reader.onerror = () => reject(reader.error || new Error('Unable to read file.'));
    reader.readAsDataURL(file);
  });
}

export function ProfilePage(): JSX.Element {
  const { t } = useTranslation();
  const auth = useAuth();
  const feedback = useFeedback();
  const params = useParams();
  const userId = Number(params.userId || 0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [avatarsLoading, setAvatarsLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<UserInfo | null>(null);
  const [matches, setMatches] = useState<MatchInfo[]>([]);
  const [usersById, setUsersById] = useState<Record<number, UserInfo>>({});
  const [avatars, setAvatars] = useState<AvatarInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);

  const pageSize = auth.config?.defaultPageSize || 50;
  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [pageSize, total]);
  const isOwner = auth.user?.userId === user?.userId;

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.get<ProfileResponse>(`/v1/profile/get/${userId}`);
      setUser(response.user);
    } catch (e) {
      setError((e as Error).message || 'Unable to load profile.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadMatches = useCallback(async () => {
    setMatchesLoading(true);
    try {
      const response = await apiClient.get<MatchHistoryResponse>(`/v1/profile/matchHistory/${userId}/${page}`);
      setMatches(response.matches);
      setTotal(response.total);
      setUsersById(previous => {
        const next = { ...previous };
        response.users.forEach(candidate => {
          next[candidate.userId] = candidate;
        });
        return next;
      });
    } catch (e) {
      setError((e as Error).message || 'Unable to load match history.');
    } finally {
      setMatchesLoading(false);
    }
  }, [page, userId]);

  const loadAvatars = useCallback(async () => {
    if (!isOwner) {
      setAvatars([]);
      return;
    }

    setAvatarsLoading(true);
    try {
      const response = await apiClient.get<AvatarListResponse>('/v1/avatars/list');
      setAvatars(response.avatars);
    } catch (e) {
      setError((e as Error).message || 'Unable to load avatars.');
    } finally {
      setAvatarsLoading(false);
    }
  }, [isOwner]);

  useEffect(() => {
    if (!userId) {
      setError('Invalid user id.');
      return;
    }
    void loadProfile();
  }, [loadProfile, userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }
    void loadMatches();
  }, [loadMatches, userId]);

  useEffect(() => {
    void loadAvatars();
  }, [loadAvatars]);

  const changeEmail = async () => {
    const initial = user?.email || '';
    const email = await feedback.prompt(t('PROFILE_CHANGE_EMAIL', { defaultValue: 'New email' }), {
      title: t('PROFILE_CHANGE_EMAIL', { defaultValue: 'Change email' }),
      defaultValue: initial
    });
    if (!email || email === initial) {
      return;
    }

    try {
      await apiClient.post('/v1/profile/changeEmail', { email });
      showToast('success', t('PROFILE_CHANGE_EMAIL_SUCCESS', { defaultValue: 'Email changed.' }));
      await loadProfile();
    } catch (e) {
      const code = readApiErrorCode(e);
      setError(code !== undefined ? `Change email failed (${String(code)}).` : ((e as Error).message || 'Change email failed.'));
    }
  };

  const changePassword = async () => {
    const currentPassword = await feedback.prompt(t('PROFILE_CURRENT_PASSWORD', { defaultValue: 'Current password' }), {
      title: t('SET_PASSWORD_BUTTON', { defaultValue: 'Change password' })
    });
    if (currentPassword === undefined) {
      return;
    }
    const newPassword = await feedback.prompt(t('PROFILE_NEW_PASSWORD', { defaultValue: 'New password' }), {
      title: t('SET_PASSWORD_NEW', { defaultValue: 'New password' })
    });
    if (!newPassword) {
      return;
    }

    try {
      await apiClient.post('/v1/profile/changePassword', { currentPassword, newPassword });
      showToast('success', t('SET_PASSWORD_SUCCESS', { defaultValue: 'Password changed.' }));
    } catch (e) {
      const code = readApiErrorCode(e);
      setError(code !== undefined ? `Change password failed (${String(code)}).` : ((e as Error).message || 'Change password failed.'));
    }
  };

  const requestAvatarName = async (defaultValue = '') => feedback.prompt(
    t('PROFILE_AVATAR_NAME', { defaultValue: 'Avatar name' }),
    {
      title: t('PROFILE_ENTER_AVATAR_NAME', { defaultValue: 'Enter avatar name' }),
      defaultValue
    }
  );

  const addAvatar = async () => {
    fileInputRef.current?.click();
  };

  const uploadAvatarFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    const name = await requestAvatarName(file.name.replace(/\.[^.]+$/, '').trim());
    if (!name) {
      return;
    }

    setUploadingAvatar(true);
    setError('');
    try {
      const imageBase64 = await readFileAsBase64(file);
      const response = await apiClient.post<AvatarResponse>('/v1/avatars/add', { name, imageBase64 });
      setAvatars(previous => [...previous, response.avatar]);
      showToast('success', t('PROFILE_ADD_AVATAR', { defaultValue: 'Avatar added' }));
      await loadProfile();
    } catch (e) {
      setError((e as Error).message || 'Unable to add avatar.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const renameAvatar = async (avatar: AvatarInfo) => {
    const name = await requestAvatarName(avatar.name);
    if (!name || name === avatar.name) {
      return;
    }

    try {
      const response = await apiClient.post<AvatarResponse>('/v1/avatars/rename', { id: avatar.id, name });
      setAvatars(previous => previous.map(item => item.id === avatar.id ? response.avatar : item));
    } catch (e) {
      setError((e as Error).message || 'Unable to rename avatar.');
    }
  };

  const deleteAvatar = async (avatar: AvatarInfo) => {
    const confirmed = await feedback.confirm(t('BUTTON_DELETE', { defaultValue: 'Delete' }) + ` "${avatar.name}"?`, {
      title: t('BUTTON_DELETE', { defaultValue: 'Delete' })
    });
    if (!confirmed) {
      return;
    }

    try {
      await apiClient.post('/v1/avatars/delete', { id: avatar.id });
      setAvatars(previous => previous.filter(item => item.id !== avatar.id));
      await loadProfile();
    } catch (e) {
      setError((e as Error).message || 'Unable to delete avatar.');
    }
  };

  const markAvatarAsDefault = async (avatar: AvatarInfo) => {
    try {
      await apiClient.post('/v1/avatars/markAsDefault', { id: avatar.id });
      await loadProfile();
    } catch (e) {
      setError((e as Error).message || 'Unable to set default avatar.');
    }
  };

  const avatarUrl = user?.avatarFile && auth.config
    ? toAvatarUrl(auth.apiUrl, auth.config.avatarsUrl, user.avatarFile)
    : '';

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('PROFILE_TITLE', { defaultValue: 'Profile' })}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {loading && <p className="text-sm text-muted-foreground">Loading profile...</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {user && (
            <>
              <div className="grid gap-3 md:grid-cols-[180px_1fr]">
                <div className="app-panel flex min-h-[180px] items-center justify-center p-4">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={user.name} className="max-h-40 rounded-lg object-contain" />
                  ) : (
                    <div className="text-sm text-muted-foreground">{t('PROFILE_AVATAR_IMAGE', { defaultValue: 'No avatar' })}</div>
                  )}
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  <div className="app-panel p-3">
                    <p className="text-xs text-muted-foreground">{t('LABEL_PLAYER', { defaultValue: 'Player' })}</p>
                    <p className="font-semibold">{user.name}</p>
                  </div>
                  <div className="app-panel p-3">
                    <p className="text-xs text-muted-foreground">{t('LABEL_RANKING', { defaultValue: 'Ranking' })}</p>
                    <p className="font-semibold">{user.ranking}</p>
                  </div>
                  <div className="app-panel p-3">
                    <p className="text-xs text-muted-foreground">{t('LABEL_EMAIL', { defaultValue: 'Email' })}</p>
                    <p className="font-semibold">{user.email || '-'}</p>
                  </div>
                  <div className="app-panel p-3">
                    <p className="text-xs text-muted-foreground">{t('LABEL_REGISTERED', { defaultValue: 'Registered' })}</p>
                    <p className="font-semibold">{user.registered ? new Date(user.registered).toLocaleDateString() : '-'}</p>
                  </div>
                </div>
              </div>

              <div className="app-inline-actions">
                {isOwner ? (
                  <>
                    <Button size="sm" variant="outline" onClick={() => void addAvatar()}>
                      {t('PROFILE_EDIT_AVATARS', { defaultValue: 'Edit avatars' })}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void changeEmail()}>
                      {t('PROFILE_CHANGE_EMAIL', { defaultValue: 'Change email' })}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void changePassword()}>
                      {t('SET_PASSWORD_BUTTON', { defaultValue: 'Change password' })}
                    </Button>
                  </>
                ) : (
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/message/${user.userId}`}>{t('BUTTON_SEND_MESSAGE', { defaultValue: 'Send message' })}</Link>
                  </Button>
                )}
              </div>

              {isOwner && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('PROFILE_EDIT_AVATARS', { defaultValue: 'Edit avatars' })}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={event => void uploadAvatarFile(event)}
                    />
                    <div className="app-inline-actions">
                      <Button size="sm" onClick={() => void addAvatar()} disabled={uploadingAvatar}>
                        {t('PROFILE_ADD_AVATAR', { defaultValue: 'Add avatar' })}
                      </Button>
                    </div>
                    {avatarsLoading && <p className="text-sm text-muted-foreground">Loading avatars...</p>}
                    {!avatarsLoading && avatars.length === 0 && (
                      <p className="text-sm text-muted-foreground">{t('PROFILE_NO_AVATARS', { defaultValue: 'No avatars defined.' })}</p>
                    )}
                    {avatars.length > 0 && (
                      <div className="app-table-wrap">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('LABEL_DEFAULT', { defaultValue: 'Default' })}</TableHead>
                              <TableHead>{t('PROFILE_AVATAR_IMAGE', { defaultValue: 'Image' })}</TableHead>
                              <TableHead>{t('PROFILE_AVATAR_NAME', { defaultValue: 'Name' })}</TableHead>
                              <TableHead>{t('LABEL_ACTIONS', { defaultValue: 'Actions' })}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {avatars.map(avatar => {
                              const currentAvatarUrl = auth.config
                                ? toAvatarUrl(auth.apiUrl, auth.config.avatarsUrl, avatar.fileName)
                                : '';
                              const isDefault = avatar.fileName === user.avatarFile;
                              return (
                                <TableRow key={avatar.id}>
                                  <TableCell>{isDefault ? 'Yes' : 'No'}</TableCell>
                                  <TableCell>
                                    {currentAvatarUrl ? (
                                      <img src={currentAvatarUrl} alt={avatar.name} className="h-16 w-16 rounded-md object-cover" />
                                    ) : '-'}
                                  </TableCell>
                                  <TableCell>{avatar.name}</TableCell>
                                  <TableCell>
                                    <div className="app-inline-actions">
                                      {!isDefault && (
                                        <Button size="sm" variant="outline" onClick={() => void markAvatarAsDefault(avatar)}>
                                          {t('LABEL_DEFAULT', { defaultValue: 'Default' })}
                                        </Button>
                                      )}
                                      <Button size="sm" variant="outline" onClick={() => void renameAvatar(avatar)}>
                                        {t('BUTTON_RENAME', { defaultValue: 'Rename' })}
                                      </Button>
                                      <Button size="sm" variant="destructive" onClick={() => void deleteAvatar(avatar)}>
                                        {t('BUTTON_DELETE', { defaultValue: 'Delete' })}
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('GAMES_RECENT_GAMES_TITLE', { defaultValue: 'Recent matches' })}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {matchesLoading && <p className="text-sm text-muted-foreground">Loading matches...</p>}

          <div className="app-table-wrap">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{t('LABEL_PLAYER_1', { defaultValue: 'Player 1' })}</TableHead>
                  <TableHead>{t('LABEL_PLAYER_2', { defaultValue: 'Player 2' })}</TableHead>
                  <TableHead>{t('LABEL_WINNER', { defaultValue: 'Winner' })}</TableHead>
                  <TableHead>{t('LABEL_FORMAT', { defaultValue: 'Format' })}</TableHead>
                  <TableHead>{t('LABEL_DATE', { defaultValue: 'Date' })}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map(match => {
                  const player1 = usersById[match.player1Id];
                  const player2 = usersById[match.player2Id];
                  const winnerId = match.winner === 1 ? match.player1Id : match.player2Id;
                  const winner = usersById[winnerId];
                  return (
                    <TableRow key={match.matchId}>
                      <TableCell>{match.matchId}</TableCell>
                      <TableCell>{player1?.name || `#${match.player1Id}`}</TableCell>
                      <TableCell>{player2?.name || `#${match.player2Id}`}</TableCell>
                      <TableCell>{winner?.name || '-'}</TableCell>
                      <TableCell>{match.formatName || t('GAMES_FORMAT_UNLIMITED', { defaultValue: 'Unlimited' })}</TableCell>
                      <TableCell>{new Date(match.created).toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="app-pagination">
            <Button disabled={matchesLoading || page <= 0} onClick={() => setPage(current => Math.max(0, current - 1))} variant="outline">
              Prev
            </Button>
            <Input className="w-36 text-center" readOnly value={`Page ${page + 1} / ${pageCount}`} />
            <Button disabled={matchesLoading || page + 1 >= pageCount} onClick={() => setPage(current => current + 1)} variant="outline">
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
