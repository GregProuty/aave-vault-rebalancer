/**
 * Oracle Client - Frontend utility to get signed balance snapshots
 * for depositWithExtraInfoViaSignature
 */

export interface SignedBalanceSnapshot {
  balance: string;
  nonce: string;
  deadline: string;
  assets: string;
  receiver: string;
  signature: string;
  agentAddress: string;
}

/**
 * Get a signed balance snapshot from the oracle
 * Required for depositWithExtraInfoViaSignature on the vault
 */
export async function getDepositSignature(
  assets: string,
  receiver: string,
  vaultChainId: number
): Promise<SignedBalanceSnapshot> {
  const oracleUrl = process.env.NEXT_PUBLIC_ORACLE_URL || 'http://localhost:3001';
  const apiKey = process.env.NEXT_PUBLIC_ORACLE_API_KEY;

  if (!apiKey) {
    throw new Error('Oracle API key not configured');
  }

  try {
    const response = await fetch(`${oracleUrl}/api/oracle/balance-snapshot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        assets,
        receiver,
        vaultChainId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Oracle request failed: ${response.status}`
      );
    }

    const snapshot: SignedBalanceSnapshot = await response.json();
    return snapshot;
  } catch (error) {
    console.error('Failed to get deposit signature from oracle:', error);
    throw error;
  }
}

/**
 * Check oracle health status
 */
export async function checkOracleHealth(): Promise<boolean> {
  const oracleUrl = process.env.NEXT_PUBLIC_ORACLE_URL || 'http://localhost:3001';

  try {
    const response = await fetch(`${oracleUrl}/health`);
    return response.ok;
  } catch {
    return false;
  }
}



