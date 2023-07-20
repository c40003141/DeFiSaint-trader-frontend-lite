import classNames from 'classnames';
import { useAtom } from 'jotai';
import { memo } from 'react';

import { Box, Button, Typography } from '@mui/material';

import { InfoBlock } from 'components/info-block/InfoBlock';
import { takeProfitAtom } from 'store/order-block.store';
import { TakeProfitE } from 'types/enums';

import styles from './TakeProfitSelector.module.scss';

export const TakeProfitSelector = memo(() => {
  const [takeProfit, setTakeProfit] = useAtom(takeProfitAtom);

  return (
    <Box className={styles.root}>
      <Box className={styles.label}>
        <InfoBlock
          title="Take profit"
          content={
            <>
              <Typography>You can specify a take profit order to go along with your main order.</Typography>
              <Typography>
                If you select e.g., 100%, you create a second order, that will be triggered if your profit on your main
                order reaches 100%.
              </Typography>
              <Typography>
                Technically, you are specifying a limit order of the opposing side (if your main order is a BUY order,
                you are specifying a limit SELL order). The limit price is automatically calculated such that your
                overall profit is as per your selection, assuming you entered at the worst price your slippage settings
                allow.
              </Typography>
            </>
          }
        />
      </Box>
      <Box className={styles.takeProfitOptions}>
        {Object.values(TakeProfitE).map((key) => (
          <Button
            key={key}
            variant="outlined"
            className={classNames({ [styles.selected]: key === takeProfit })}
            onClick={() => setTakeProfit(key)}
          >
            {key}
          </Button>
        ))}
      </Box>
    </Box>
  );
});
