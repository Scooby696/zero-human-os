import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CIRCLE_API_BASE = 'https://api.circle.com/v1';
const CIRCLE_API_KEY = Deno.env.get('CIRCLE_API_KEY');

async function callCircleAPI(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CIRCLE_API_KEY}`,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${CIRCLE_API_BASE}${endpoint}`, options);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Circle API error: ${error.message || response.statusText}`);
  }

  return await response.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, email, walletType, token, amount, toAddress, network } = await req.json();

    if (action === 'createWallet') {
      // Create wallet via Circle WaaS
      const walletEmail = email || user.email;
      
      const circleResponse = await callCircleAPI('/wallets', 'POST', {
        idempotencyKey: `${walletEmail}-${Date.now()}`,
        metadata: {
          email: walletEmail,
          userId: user.id,
          type: walletType || 'email',
        },
      });

      // Store wallet in database
      const wallet = await base44.entities.Wallet.create({
        email: walletEmail,
        userId: user.id,
        circleWalletId: circleResponse.data.walletId,
        walletAddress: circleResponse.data.address,
        walletType: walletType || 'email',
        balances: JSON.stringify({ USDC: 0, EURC: 0 }),
        supportedNetworks: JSON.stringify(['polygon', 'ethereum', 'solana']),
      });

      return Response.json({
        success: true,
        wallet: {
          id: wallet.id,
          email: wallet.email,
          circleWalletId: wallet.circleWalletId,
          walletAddress: wallet.walletAddress,
          walletType: wallet.walletType,
        },
      });
    }

    if (action === 'getWallet') {
      // Fetch wallet by email
      const wallets = await base44.entities.Wallet.filter({
        email: email || user.email,
      });

      if (wallets.length === 0) {
        return Response.json(
          { error: 'Wallet not found' },
          { status: 404 }
        );
      }

      const wallet = wallets[0];
      
      // Fetch balance from Circle
      const balanceResponse = await callCircleAPI(`/wallets/${wallet.circleWalletId}/balances`);

      return Response.json({
        success: true,
        wallet: {
          id: wallet.id,
          email: wallet.email,
          walletAddress: wallet.walletAddress,
          walletType: wallet.walletType,
          balances: balanceResponse.data.balances || [],
          networks: JSON.parse(wallet.supportedNetworks),
        },
      });
    }

    if (action === 'transfer') {
      // Validate required fields
      if (!token || !amount || !toAddress || !network) {
        return Response.json(
          { error: 'Missing fields: token, amount, toAddress, network' },
          { status: 400 }
        );
      }

      // Get wallet
      const wallets = await base44.entities.Wallet.filter({
        email: user.email,
      });

      if (wallets.length === 0) {
        return Response.json(
          { error: 'Wallet not found' },
          { status: 404 }
        );
      }

      const wallet = wallets[0];

      // Create transfer via Circle
      const transferResponse = await callCircleAPI('/transfers', 'POST', {
        idempotencyKey: `${wallet.id}-${Date.now()}`,
        source: {
          type: 'wallet',
          id: wallet.circleWalletId,
        },
        destination: {
          type: 'blockchain',
          address: toAddress,
          chain: network.toUpperCase(),
        },
        amount: {
          amount: amount.toString(),
          currency: token,
        },
      });

      // Log transaction
      const transaction = await base44.entities.WalletTransaction.create({
        walletId: wallet.id,
        transactionHash: transferResponse.data.id,
        type: 'transfer',
        token,
        amount,
        fromAddress: wallet.walletAddress,
        toAddress,
        network,
        status: transferResponse.data.status === 'completed' ? 'completed' : 'pending',
        metadata: JSON.stringify(transferResponse.data),
      });

      return Response.json({
        success: true,
        transaction: {
          id: transaction.id,
          hash: transaction.transactionHash,
          status: transaction.status,
          amount: transaction.amount,
          token: transaction.token,
          network: transaction.network,
        },
      });
    }

    if (action === 'getTransactions') {
      const wallets = await base44.entities.Wallet.filter({
        email: user.email,
      });

      if (wallets.length === 0) {
        return Response.json(
          { error: 'Wallet not found' },
          { status: 404 }
        );
      }

      const transactions = await base44.entities.WalletTransaction.filter(
        { walletId: wallets[0].id },
        '-created_date',
        50
      );

      return Response.json({
        success: true,
        transactions: transactions.map((tx) => ({
          id: tx.id,
          hash: tx.transactionHash,
          type: tx.type,
          token: tx.token,
          amount: tx.amount,
          toAddress: tx.toAddress,
          network: tx.network,
          status: tx.status,
          createdDate: tx.created_date,
        })),
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Wallet error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});