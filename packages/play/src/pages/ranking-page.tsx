import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { RankingRow } from '@/lib/api-types';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

type RankingResponse = {
  ranking: RankingRow[];
  total: number;
};

export function RankingPage(): JSX.Element {
  const { t } = useTranslation();
  const auth = useAuth();
  const [rows, setRows] = useState<RankingRow[]>([]);
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

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      setError('');
      try {
        const response = query
          ? await apiClient.post<RankingResponse>(`/v1/ranking/list/${page}`, { query })
          : await apiClient.get<RankingResponse>(`/v1/ranking/list/${page}`);
        setRows(response.ranking);
        setTotal(response.total);
      } catch (e) {
        setError((e as Error).message || 'Unable to load ranking.');
      } finally {
        setLoading(false);
      }
    };

    void fetchRanking();
  }, [page, query]);

  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [pageSize, total]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('RANKING_TITLE', { defaultValue: 'Ranking' })}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="app-toolbar">
          <Input
            className="app-search-input"
            placeholder={t('BUTTON_SEARCH', { defaultValue: 'Search player' })}
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <span className="app-toolbar-spacer" />
          <Button onClick={() => setPage(0)} variant="outline">
            {t('BUTTON_REFRESH', { defaultValue: 'Refresh' })}
          </Button>
        </div>

        {error && <p className="ptcg-u-padding text-sm text-destructive">{error}</p>}

        <div className="app-table-wrap">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('RANKING_POSITION', { defaultValue: 'Position' })}</TableHead>
                <TableHead>{t('LABEL_RANKING', { defaultValue: 'Ranking' })}</TableHead>
                <TableHead>{t('LABEL_PLAYER', { defaultValue: 'Player' })}</TableHead>
                <TableHead>{t('LABEL_ACTIONS', { defaultValue: 'Actions' })}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.user.userId}>
                  <TableCell>{row.position}</TableCell>
                  <TableCell>{row.user.ranking}</TableCell>
                  <TableCell>{row.user.name}</TableCell>
                  <TableCell>
                    <div className="app-inline-actions">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/profile/${row.user.userId}`}>{t('BUTTON_SHOW_PROFILE', { defaultValue: 'Profile' })}</Link>
                      </Button>
                      {auth.user?.userId !== row.user.userId && (
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/message/${row.user.userId}`}>{t('BUTTON_SEND_MESSAGE', { defaultValue: 'Message' })}</Link>
                        </Button>
                      )}
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
