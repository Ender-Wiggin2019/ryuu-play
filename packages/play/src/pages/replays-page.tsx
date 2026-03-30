import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { FileInputButton } from '@/components/shared/file-input-button';
import { useFeedback } from '@/components/feedback-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiClient } from '@/lib/api-client';
import type { ReplayInfo } from '@/lib/api-types';
import { useAuth } from '@/lib/auth-context';
import { showToast } from '@/lib/toast';

type ReplayListResponse = {
  replays: ReplayInfo[];
  total: number;
};

type ReplayDataResponse = {
  replayData: string;
};

function base64ToBlob(base64: string, mimeType = 'application/octet-stream'): Blob {
  const byteString = window.atob(base64);
  const byteNumbers = new Array(byteString.length);
  for (let i = 0; i < byteString.length; i += 1) {
    byteNumbers[i] = byteString.charCodeAt(i);
  }
  return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
}

export function ReplaysPage(): JSX.Element {
  const { t } = useTranslation();
  const auth = useAuth();
  const navigate = useNavigate();
  const feedback = useFeedback();

  const [rows, setRows] = useState<ReplayInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [input, setInput] = useState('');
  const [page, setPage] = useState(0);

  const pageSize = auth.config?.defaultPageSize || 50;

  useEffect(() => {
    const id = window.setTimeout(() => {
      setQuery(input.trim());
      setPage(0);
    }, 300);
    return () => window.clearTimeout(id);
  }, [input]);

  const refreshList = async () => {
    setLoading(true);
    setError('');
    try {
      const response = query
        ? await apiClient.post<ReplayListResponse>(`/v1/replays/list/${page}`, { query })
        : await apiClient.get<ReplayListResponse>(`/v1/replays/list/${page}`);
      setRows(response.replays);
      setTotal(response.total);
    } catch (e) {
      setError((e as Error).message || 'Unable to load replays.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query]);

  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [pageSize, total]);

  const onDeleteReplay = async (replayId: number) => {
    const confirmed = await feedback.confirm('Delete selected replay?', {
      title: t('BUTTON_DELETE', { defaultValue: 'Delete' })
    });
    if (!confirmed) {
      return;
    }
    await apiClient.post('/v1/replays/delete', { id: replayId });
    showToast('success', 'Replay deleted');
    await refreshList();
  };

  const onRenameReplay = async (replayId: number, previousName: string) => {
    const name = await feedback.prompt(t('REPLAY_ENTER_NAME', { defaultValue: 'Enter replay name' }), {
      title: t('BUTTON_RENAME', { defaultValue: 'Rename' }),
      defaultValue: previousName
    });
    if (!name) {
      return;
    }
    await apiClient.post('/v1/replays/rename', { id: replayId, name });
    showToast('success', 'Replay renamed');
    await refreshList();
  };

  const onExportReplay = async (replayId: number, name: string) => {
    const response = await apiClient.get<ReplayDataResponse>(`/v1/replays/get/${replayId}`);
    const blob = base64ToBlob(response.replayData);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${name}.rep`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const onImportFile = async (file: File) => {
    if (!file) {
      return;
    }
    const replayData = await file.text();
    const name = await feedback.prompt(t('REPLAY_ENTER_NAME', { defaultValue: 'Enter replay name' }), {
      title: t('BUTTON_IMPORT_FROM_FILE', { defaultValue: 'Import from file' }),
      defaultValue: file.name.replace(/\.rep$/i, '')
    });
    if (!name) {
      return;
    }
    await apiClient.post('/v1/replays/import', { replayData, name });
    showToast('success', 'Replay imported');
    await refreshList();
  };

  const onShowReplay = async (replayId: number) => {
    try {
      const response = await apiClient.get<ReplayDataResponse>(`/v1/replays/get/${replayId}`);
      sessionStorage.setItem(`replay:${replayId}`, response.replayData);
      navigate(`/table/${replayId}?mode=replay`);
    } catch (e) {
      setError((e as Error).message || 'Unable to open replay.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('REPLAY_TITLE', { defaultValue: 'Replays' })}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="app-toolbar">
          <Input
            className="app-search-input"
            placeholder={t('BUTTON_SEARCH', { defaultValue: 'Search replay' })}
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <span className="app-toolbar-spacer" />
          <FileInputButton
            accept=".rep,text/plain"
            label={t('BUTTON_IMPORT_FROM_FILE', { defaultValue: 'Import from file' })}
            onSelect={onImportFile}
            variant="outline"
          />
        </div>

        {error && <p className="ptcg-u-padding text-sm text-destructive">{error}</p>}

        <div className="app-table-wrap">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('LABEL_NAME', { defaultValue: 'Name' })}</TableHead>
                <TableHead>{t('LABEL_PLAYER_1', { defaultValue: 'Player 1' })}</TableHead>
                <TableHead>{t('LABEL_PLAYER_2', { defaultValue: 'Player 2' })}</TableHead>
                <TableHead>{t('LABEL_DATE', { defaultValue: 'Date' })}</TableHead>
                <TableHead>{t('LABEL_ACTIONS', { defaultValue: 'Actions' })}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(replay => (
                <TableRow key={replay.replayId}>
                  <TableCell>{replay.name}</TableCell>
                  <TableCell>{replay.player1?.name}</TableCell>
                  <TableCell>{replay.player2?.name}</TableCell>
                  <TableCell>{new Date(replay.created).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="app-inline-actions">
                      <Button size="sm" variant="outline" onClick={() => void onShowReplay(replay.replayId)}>
                        {t('BUTTON_SHOW', { defaultValue: 'Show' })}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => void onRenameReplay(replay.replayId, replay.name)}>
                        {t('BUTTON_RENAME', { defaultValue: 'Rename' })}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => void onExportReplay(replay.replayId, replay.name)}>
                        {t('BUTTON_EXPORT', { defaultValue: 'Export' })}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => void onDeleteReplay(replay.replayId)}>
                        {t('BUTTON_DELETE', { defaultValue: 'Delete' })}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="app-pagination">
          <Button disabled={loading || page <= 0} onClick={() => setPage(p => Math.max(0, p - 1))} variant="outline">
            Prev
          </Button>
          <span className="text-sm">Page {page + 1} / {pageCount}</span>
          <Button disabled={loading || page + 1 >= pageCount} onClick={() => setPage(p => p + 1)} variant="outline">
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
