import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@17.3.0';

const STRIPE_KEY = Deno.env.get('STRIPE_SECRET_KEY');
if (!STRIPE_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(STRIPE_KEY);
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, email, walletType, amount, currency, description } = await req.json();

    if (action === 'createWallet') {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: email || user.email,
        metadata: {
          userId: user.id,
          walletType: walletType || 'email',
        },
      });

      // Store wallet in database
      const wallet = await base44.entities.Wallet.create({
        email: email || user.email,
        userId: user.id,
        stripeCustomerId: customer.id,
        walletType: walletType || 'email',
        balance: 0,
        currency: currency || 'usd',
      });

      return Response.json({
        success: true,
        wallet: {
          id: wallet.id,
          email: wallet.email,
          stripeCustomerId: wallet.stripeCustomerId,
          walletType: wallet.walletType,
          balance: wallet.balance,
          currency: wallet.currency,
        },
      });
    }

    if (action === 'getWallet') {
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

      // Fetch customer balance from Stripe
      const customer = await stripe.customers.retrieve(wallet.stripeCustomerId);

      return Response.json({
        success: true,
        wallet: {
          id: wallet.id,
          email: wallet.email,
          stripeCustomerId: wallet.stripeCustomerId,
          walletType: wallet.walletType,
          balance: customer.balance || 0,
          currency: wallet.currency,
        },
      });
    }

    if (action === 'charge') {
      if (!amount || !currency || !description) {
        return Response.json(
          { error: 'Missing fields: amount, currency, description' },
          { status: 400 }
        );
      }

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

      // Create charge via Stripe
      const charge = await stripe.charges.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency,
        customer: wallet.stripeCustomerId,
        description: description,
        metadata: {
          walletId: wallet.id,
          userId: user.id,
        },
      });

      // Log transaction
      const transaction = await base44.entities.WalletTransaction.create({
        walletId: wallet.id,
        stripeTransactionId: charge.id,
        type: 'charge',
        amount: charge.amount,
        currency: charge.currency,
        description: charge.description,
        status: charge.status === 'succeeded' ? 'succeeded' : 'failed',
        metadata: JSON.stringify(charge),
      });

      return Response.json({
        success: true,
        transaction: {
          id: transaction.id,
          chargeId: transaction.stripeTransactionId,
          amount: transaction.amount / 100,
          currency: transaction.currency,
          status: transaction.status,
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
          chargeId: tx.stripeTransactionId,
          type: tx.type,
          amount: tx.amount / 100,
          currency: tx.currency,
          description: tx.description,
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