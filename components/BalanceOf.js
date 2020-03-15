/** @jsx jsx */

import React, { useState, useEffect } from 'react';
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

const BalanceOf = ({ type, balance, vatBalance, actions }) => {
  return (
    <Box
      sx={{
        bg: '#fff',
        p: 4,
        borderRadius: 5,
        border: '1px solid',
        borderColor: 'border'
      }}
    >
      <Grid
        gap={2}
        columns={[1]}
        sx={{
          flexDirection: ['column', 'row'],
          justifyItems: 'start'
          // alignItems: 'flex-start'
        }}
      >
        <Flex
          sx={{
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Text variant="boldBody">
            {balance} {type}
          </Text>
          <Box ml="auto">{actions}</Box>
        </Flex>

        {vatBalance ? (
          <Box>
            <Text variant="boldBody">{vatBalance} Dai in the VAT</Text>
          </Box>
        ) : null}
      </Grid>
    </Box>
  );
};


export default BalanceOf;
