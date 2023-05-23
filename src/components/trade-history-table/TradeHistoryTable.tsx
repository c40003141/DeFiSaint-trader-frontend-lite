import { useAtom } from 'jotai';
import { ChangeEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';

import {
  Box,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { ReactComponent as RefreshIcon } from 'assets/icons/refreshIcon.svg';
import { EmptyTableRow } from 'components/empty-table-row/EmptyTableRow';
import { getTradesHistory } from 'network/history';
import { openOrdersAtom, perpetualsAtom, tradesHistoryAtom } from 'store/pools.store';
import { AlignE } from 'types/enums';
import type { TableHeaderI } from 'types/types';

import { TradeHistoryBlock } from './elements/trade-history-block/TradeHistoryBlock';
import { TradeHistoryRow } from './elements/TradeHistoryRow';

import styles from './TradeHistoryTable.module.scss';

export const TradeHistoryTable = memo(() => {
  const [tradesHistory, setTradesHistory] = useAtom(tradesHistoryAtom);
  const [perpetuals] = useAtom(perpetualsAtom);
  const [openOrders] = useAtom(openOrdersAtom);

  const updateTradesHistoryRef = useRef(false);

  const theme = useTheme();
  const isFluidScreen = useMediaQuery(theme.breakpoints.down('md'));

  const chainId = useChainId();
  const { address, isConnected } = useAccount();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const refreshTradesHistory = useCallback(() => {
    if (updateTradesHistoryRef.current || !address || !isConnected) {
      return;
    }

    updateTradesHistoryRef.current = true;
    getTradesHistory(chainId, address)
      .then((data) => {
        setTradesHistory(data);
      })
      .finally(() => {
        updateTradesHistoryRef.current = false;
      });
  }, [chainId, address, isConnected, setTradesHistory]);

  useEffect(() => {
    refreshTradesHistory();
  }, [openOrders, refreshTradesHistory]);

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  }, []);

  const tradeHistoryHeaders: TableHeaderI[] = useMemo(
    () => [
      { label: 'Time', align: AlignE.Left },
      { label: 'Perpetual', align: AlignE.Left },
      { label: 'Side', align: AlignE.Left },
      // { label: 'Type', align: AlignE.Left },
      { label: 'Price', align: AlignE.Right },
      { label: 'Quantity', align: AlignE.Right },
      { label: 'Fee', align: AlignE.Right },
      { label: 'Realized Profit', align: AlignE.Right },
      { label: <RefreshIcon onClick={refreshTradesHistory} className={styles.actionIcon} />, align: AlignE.Center },
    ],
    [refreshTradesHistory]
  );

  return (
    <>
      {!isFluidScreen && (
        <TableContainer className={styles.root}>
          <MuiTable>
            <TableHead className={styles.tableHead}>
              <TableRow>
                {tradeHistoryHeaders.map((header) => (
                  <TableCell key={header.label.toString()} align={header.align}>
                    <Typography variant="bodySmall">{header.label}</Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody className={styles.tableBody}>
              {tradesHistory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((tradeHistory) => (
                <TradeHistoryRow
                  key={tradeHistory.orderId}
                  headers={tradeHistoryHeaders}
                  perpetuals={perpetuals}
                  tradeHistory={tradeHistory}
                />
              ))}
              {tradesHistory.length === 0 && (
                <EmptyTableRow colSpan={tradeHistoryHeaders.length} text="No trade history" />
              )}
            </TableBody>
          </MuiTable>
        </TableContainer>
      )}
      {isFluidScreen && (
        <Box>
          <Box className={styles.refreshHolder}>
            <RefreshIcon onClick={refreshTradesHistory} className={styles.actionIcon} />
          </Box>
          <Box>
            {tradesHistory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((tradeHistory) => (
              <TradeHistoryBlock
                key={tradeHistory.orderId}
                headers={tradeHistoryHeaders}
                perpetuals={perpetuals}
                tradeHistory={tradeHistory}
              />
            ))}
            {tradesHistory.length === 0 && <Box className={styles.noData}>No trade history</Box>}
          </Box>
        </Box>
      )}
      {tradesHistory.length > 5 && (
        <Box className={styles.paginationHolder}>
          <TablePagination
            align="center"
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={tradesHistory.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      )}
    </>
  );
});