/** @jsx jsx */

import React, { useState, useEffect } from 'react';
import useMaker from '../hooks/useMaker';
import useBalances from '../hooks/useBalances';
import {
  Heading,
  Text,
  jsx,
  Box,
  Button,
  Grid,
  Styled,
  Input,
  Flex
} from 'theme-ui';
import { AUCTION_DATA_FETCHER } from '../constants';
import BalanceFormVat from './BalanceFormVat';
import BalanceOf from './BalanceOf';
import AccountManagerLayout from '../components/AccountManagerLayout';

const REQUIRED_ALLOWANCE = 0;

export default () => {
  const { maker, web3Connected } = useMaker();
  const {
    vatDaiBalance,
    daiBalance,
    mkrBalance,
    joinDaiToAdapter,
    exitDaiFromAdapter
  } = useBalances();

  const [daiApprovePending, setDaiApprovePending] = useState(false);
  const [mkrApprovePending, setMkrApprovePending] = useState(false);
  const [hopeApprovePending, setHopeApprovePending] = useState(false);
  const [joinAddress, setJoinAddress] = useState('');
  // TODO keep track of allowances with object keys
  const [hasAllowance, setHasAllowance] = useState(false);
  const [hasMkrAllowance, setHasMkrAllowance] = useState(false);

  //Get adapter address & check allowances for DAI & MKR
  useEffect(() => {
    if (web3Connected) {
      (async () => {
        const joinDaiAdapterAddress = maker
          .service('smartContract')
          .getContractByName('MCD_JOIN_DAI').address;
        setJoinAddress(joinDaiAdapterAddress);

        const daiAllowance = await maker
          .getToken('MDAI')
          .allowance(maker.currentAddress(), joinDaiAdapterAddress);
        const mkrAllowance = await maker
          .getToken('MDAI')
          .allowance(maker.currentAddress(), joinDaiAdapterAddress);

        setHasAllowance(daiAllowance.gt(REQUIRED_ALLOWANCE) ? true : false);
        setHasMkrAllowance(mkrAllowance.gt(REQUIRED_ALLOWANCE) ? true : false);
      })();
    }
  }, [maker, web3Connected]);

  const giveDaiAllowance = async address => {
    setDaiApprovePending(true);
    try {
      await maker.getToken('MDAI').approveUnlimited(address);
      setHasAllowance(true);
    } catch (err) {
      const message = err.message ? err.message : err;
      const errMsg = `unlock dai tx failed ${message}`;
      console.error(errMsg);
    }
    setDaiApprovePending(false);
  };

  const giveMkrAllowance = async address => {
    setMkrApprovePending(true);
    try {
      await maker.getToken('MKR').approveUnlimited(address);
      hasMkrAllowance(true);
    } catch (err) {
      const message = err.message ? err.message : err;
      const errMsg = `unlock mkr tx failed ${message}`;
      console.error(errMsg);
    }
    setMkrApprovePending(false);
  };

  const giveHope = async address => {
    setHopePending(true);
    try {
      await maker
        .service('smartContract')
        .getContract('MCD_VAT')
        .hope(address);
    } catch (err) {
      const message = err.message ? err.message : err;
      const errMsg = `hope tx failed ${message}`;
      console.error(errMsg);
    }
    setHopeApprovePending(false);
  };

  return (
    <AccountManagerLayout
      topActions={
        <Box>
          <Text
            as="h2"
            variant="boldBody"
            sx={{
              mb: 5
            }}
          >
            To participate in auctions you need to sign these 3 approval
            transactions
          </Text>

          <Grid
            gap={4}
            columns={[1, 3]}
            sx={{
              // maxWidth: '200px',
              flexDirection: ['column', 'row'],

              width: 'auto',
              mx: 'auto'
            }}
          >
            <Button
              onClick={() => giveDaiAllowance(joinAddress)}
              disabled={!web3Connected || hasAllowance}
            >
              {hasAllowance ? 'Dai Unlocked' : 'Unlock Dai in your wallet'}
            </Button>
            <Button
              onClick={() => {
                const flipEthAddress = maker
                  .service('smartContract')
                  .getContractByName('MCD_FLIP_ETH_A').address;
                giveHope(flipEthAddress);
              }}
              disabled={!web3Connected}
            >
              Unlock Dai in the adapter
            </Button>
            <Button
              onClick={() => giveHope(joinAddress)}
              disabled={!web3Connected}
            >
              Unlock Dai in the VAT
            </Button>
          </Grid>
        </Box>
      }
      balances={
        <Box
          sx={
            {
              // bg: '#fff',
              // p: 6,
              // mb: 5,
              // borderRadius: 5,
              borderTop: '1px solid',
              borderBottom: '1px solid',
              borderColor: 'border'
            }
          }
        >
          {web3Connected ? (
            <Grid
              gap={0}
              columns={3}
              sx={{
                pt: 5
              }}
            >
              <BalanceOf type={'Dai in your Wallet'} balance={daiBalance}  />
              <BalanceOf
                type={'Dai in Adaptor'}
                balance={vatDaiBalance}
                vatActions={
                  <BalanceFormVat
                    joinDaiToAdapter={joinDaiToAdapter}
                    exitDaiFromAdapter={exitDaiFromAdapter}
                  />
                }
                sx={{
                  borderLeft: '1px solid',
                  borderRight: '1px solid',
                  borderColor: 'border'
      }}
              />
              <BalanceOf
                type={'MKR'}
                balance={mkrBalance}
                actions={
                  <Box>
                    <Button
                      disabled={!web3Connected || hasMkrAllowance}
                      onClick={() => giveMkrAllowance(joinAddress)}
                    >
                      Unlock to withdraw
                    </Button>
                  </Box>
                }
              />
            </Grid>
          ) : null}
        </Box>
      }
    />
  );
};
