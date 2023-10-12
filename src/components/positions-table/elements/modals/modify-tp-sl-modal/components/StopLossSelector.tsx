import {
  type ChangeEvent,
  type Dispatch,
  memo,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import { Typography } from '@mui/material';

import { CustomPriceSelector } from 'components/custom-price-selector/CustomPriceSelector';
import { InfoBlock } from 'components/info-block/InfoBlock';
import { calculateStepSize } from 'helpers/calculateStepSize';
import { parseSymbol } from 'helpers/parseSymbol';
import { OrderSideE, OrderValueTypeE, StopLossE } from 'types/enums';
import { MarginAccountWithAdditionalDataI } from 'types/types';
import { getFractionDigits } from 'utils/formatToCurrency';
import { mapStopLossToNumber } from 'utils/mapStopLossToNumber';

import styles from './CommonSelector.module.scss';

interface StopLossSelectorPropsI {
  setStopLossPrice: Dispatch<SetStateAction<number | null | undefined>>;
  position: MarginAccountWithAdditionalDataI;
}

export const StopLossSelector = memo(({ setStopLossPrice, position }: StopLossSelectorPropsI) => {
  const { t } = useTranslation();

  const [stopLoss, setStopLoss] = useState<StopLossE | null>(null);
  const [stopLossInputPrice, setStopLossInputPrice] = useState<number | null | undefined>(undefined);

  const parsedSymbol = parseSymbol(position.symbol);

  const handleStopLossPriceChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const stopLossPriceValue = event.target.value;
    if (stopLossPriceValue !== '') {
      setStopLossInputPrice(+stopLossPriceValue);
    } else {
      setStopLossInputPrice(undefined);
    }
    setStopLoss(null);
  };

  const handleStopLossChange = (stopLossValue: StopLossE) => {
    setStopLossPrice(null);
    setStopLossInputPrice(null);
    setStopLoss(stopLossValue);
  };

  const minStopLossPrice = useMemo(() => {
    if (position.entryPrice && position.side === OrderSideE.Sell) {
      return position.entryPrice;
    } else if (position.leverage) {
      return Math.max(0, position.entryPrice - position.entryPrice / position.leverage);
    }
    return 0;
  }, [position]);

  const maxStopLossPrice = useMemo(() => {
    if (position.entryPrice && position.side === OrderSideE.Buy) {
      return position.entryPrice;
    } else if (position.leverage) {
      return position.entryPrice + position.entryPrice / position.leverage;
    }
  }, [position]);

  const fractionDigits = useMemo(() => getFractionDigits(parsedSymbol?.quoteCurrency), [parsedSymbol?.quoteCurrency]);

  const stepSize = useMemo(() => calculateStepSize(position.entryPrice), [position.entryPrice]);

  const validateStopLossPrice = useCallback(() => {
    if (stopLossInputPrice == null) {
      setStopLossPrice(stopLossInputPrice);
      return;
    }

    if (maxStopLossPrice && stopLossInputPrice > maxStopLossPrice) {
      const maxStopLossPriceRounded = +maxStopLossPrice.toFixed(fractionDigits);
      setStopLossPrice(maxStopLossPriceRounded);
      setStopLossInputPrice(maxStopLossPriceRounded);
      return;
    }
    if (stopLossInputPrice < minStopLossPrice) {
      const minStopLossPriceRounded = +minStopLossPrice.toFixed(fractionDigits);
      setStopLossPrice(minStopLossPriceRounded);
      setStopLossInputPrice(minStopLossPriceRounded);
      return;
    }

    setStopLossPrice(stopLossInputPrice);
  }, [minStopLossPrice, maxStopLossPrice, stopLossInputPrice, setStopLossPrice, fractionDigits]);

  useEffect(() => {
    if (stopLoss && stopLoss !== StopLossE.None) {
      let stopPrice;
      if (position.side === OrderSideE.Buy) {
        stopPrice = position.entryPrice * (1 - Math.abs(mapStopLossToNumber(stopLoss) / position.leverage));
      } else {
        stopPrice = position.entryPrice * (1 + Math.abs(mapStopLossToNumber(stopLoss) / position.leverage));
      }
      setStopLossInputPrice(Math.max(0, +stopPrice.toFixed(fractionDigits)));
    }
  }, [stopLoss, position, fractionDigits]);

  useEffect(() => {
    setStopLossPrice(stopLossInputPrice);
  }, [stopLossInputPrice, setStopLossPrice]);

  useEffect(() => {
    if (position.stopLoss.valueType === OrderValueTypeE.Full && position.stopLoss.fullValue) {
      setStopLossInputPrice(position.stopLoss.fullValue);
    }
  }, [position]);

  const translationMap: Record<StopLossE, string> = {
    [StopLossE.None]: t('pages.trade.order-block.stop-loss.none'),
    [StopLossE['10%']]: '10%',
    [StopLossE['25%']]: '25%',
    [StopLossE['50%']]: '50%',
    [StopLossE['75%']]: '75%',
  };

  return (
    <CustomPriceSelector<StopLossE>
      id="custom-stop-loss-price"
      label={
        <InfoBlock
          title={t('pages.trade.order-block.stop-loss.title')}
          content={
            <>
              <Typography>{t('pages.trade.order-block.stop-loss.body1')}</Typography>
              <Typography>{t('pages.trade.order-block.stop-loss.body2')}</Typography>
              <Typography>{t('pages.trade.order-block.stop-loss.body3')}</Typography>
            </>
          }
          classname={styles.actionIcon}
        />
      }
      options={Object.values(StopLossE)}
      translationMap={translationMap}
      handlePriceChange={handleStopLossChange}
      handleInputPriceChange={handleStopLossPriceChange}
      validateInputPrice={validateStopLossPrice}
      selectedInputPrice={stopLossInputPrice}
      selectedPrice={stopLoss}
      currency={parsedSymbol?.quoteCurrency}
      stepSize={stepSize}
    />
  );
});