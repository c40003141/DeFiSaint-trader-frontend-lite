import { useAtom } from 'jotai';
import { memo, useEffect, useRef } from 'react';

import { Box, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';

import { getExchangeInfo } from 'network/network';
import { oracleFactoryAddrAtom, poolsAtom, proxyAddrAtom } from 'store/pools.store';

import { Container } from '../container/Container';
import { InteractiveLogo } from '../interactive-logo/InteractiveLogo';
import { WalletConnectButton } from '../wallet-connect-button/WalletConnectButton';

import { CollateralsSelect } from './elements/collaterals-select/CollateralsSelect';
import { PerpetualsSelect } from './elements/perpetuals-select/PerpetualsSelect';

import { PageAppBar } from './Header.styles';
import styles from './Header.module.scss';

// Might be used later
// interface HeaderPropsI {
//   /**
//    * Injected by the documentation to work in an iframe.
//    * You won't need it on your project.
//    */
//   window?: () => Window;
// }

// Might be used later
// const drawerWidth = 240;

export const Header = memo(() => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));

  const [, setPools] = useAtom(poolsAtom);
  const [, setOracleFactoryAddr] = useAtom(oracleFactoryAddrAtom);
  const [, setProxyAddr] = useAtom(proxyAddrAtom);

  // Might be used later
  // const [mobileOpen, setMobileOpen] = useState(false);

  const requestRef = useRef(false);

  useEffect(() => {
    if (!requestRef.current) {
      requestRef.current = true;
      getExchangeInfo().then(({ data }) => {
        setPools(data.pools);
        setOracleFactoryAddr(data.oracleFactoryAddr);
        setProxyAddr(data.proxyAddr);
      });
    }
  }, [setPools, setOracleFactoryAddr, setProxyAddr]);

  /*
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        <InteractiveLogo />
      </Typography>
      <Divider />
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;
  */

  console.log({ isSmallScreen });

  return (
    <Container className={styles.root}>
      <Box sx={{ display: 'flex' }}>
        <PageAppBar position="static">
          <Toolbar className={styles.toolbar}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <a href="/" className={styles.logoLink}>
                <InteractiveLogo />
              </a>
            </Typography>
            {!isSmallScreen && (
              <Typography variant="h6" component="div" sx={{ flexGrow: 2 }} className={styles.selectBoxes}>
                <CollateralsSelect />
                <PerpetualsSelect />
              </Typography>
            )}
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} className={styles.walletConnect}>
              <WalletConnectButton />
            </Typography>
            {/*}
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: { sm: 'none' } }} />
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ ml: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            {*/}
          </Toolbar>
          {isSmallScreen && (
            <Box className={styles.mobileSelectBoxes}>
              <CollateralsSelect />
              <PerpetualsSelect />
            </Box>
          )}
        </PageAppBar>
        {/*}
        <Box component="nav">
          <Drawer
            anchor="right"
            container={container}
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
        </Box>
        {*/}
      </Box>
    </Container>
  );
});
