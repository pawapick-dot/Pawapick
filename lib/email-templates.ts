// lib/email-templates.ts

// Base wrapper to keep branding consistent across all emails
const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 0; }
    .container { max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background-color: #0f172a; padding: 24px; text-align: center; }
    .logo { color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
    .logo span { color: #2563eb; }
    .content { padding: 32px 24px; color: #334155; line-height: 1.6; }
    .title { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; }
    .button { display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 24px; }
    .footer { text-align: center; padding: 24px; font-size: 12px; color: #94a3b8; }
    .highlight { font-weight: 700; color: #0f172a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <p class="logo">Pawa<span>Pick</span></p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Pawa Pick. All rights reserved.<br>
      Kabale, Uganda | Secured by Escrow
    </div>
  </div>
</body>
</html>
`;

export const Templates = {
  Welcome: (name: string) => baseTemplate(`
    <h1 class="title">Welcome to the Arena, ${name}!</h1>
    <p>You are officially in. Pawa Pick is the provably fair prediction network where players compete directly.</p>
    <p>There is no house edge. Just your knowledge against the community.</p>
    <a href="https://pawapick.com" class="button">Go to Live Markets</a>
  `),

  DepositSuccess: (amount: string, newBalance: string) => baseTemplate(`
    <h1 class="title">Deposit Successful</h1>
    <p>Your wallet has been credited with <span class="highlight">UGX ${amount}</span>.</p>
    <p>Your new balance is <strong>UGX ${newBalance}</strong>.</p>
    <a href="https://pawapick.com/feed" class="button">Find a Match</a>
  `),

  GameWon: (gameType: string, payout: string, verifyLink: string) => baseTemplate(`
    <h1 class="title">You Won!</h1>
    <p>Your prediction for the <span class="highlight">${gameType}</span> match was correct.</p>
    <p><span class="highlight">UGX ${payout}</span> has been added to your wallet.</p>
    <a href="${verifyLink}" class="button">View Cryptographic Receipt</a>
  `),

  WithdrawalRequested: (amount: string, phone: string, provider: string) => baseTemplate(`
    <h1 class="title">Withdrawal Initiated</h1>
    <p>We are processing your request to withdraw <span class="highlight">UGX ${amount}</span>.</p>
    <p>Funds will be sent to your ${provider} account ending in <strong>${phone.slice(-4)}</strong> shortly.</p>
    <p>You will receive another email the moment it is approved.</p>
  `),

  WithdrawalApproved: (amount: string) => baseTemplate(`
    <h1 class="title">Funds Sent</h1>
    <p>Great news! Your withdrawal of <span class="highlight">UGX ${amount}</span> has been approved and dispatched to your mobile money account.</p>
    <p>Thank you for playing on Pawa Pick.</p>
  `),
};
