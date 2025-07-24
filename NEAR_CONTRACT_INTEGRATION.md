# NEAR Contract Integration Guide

## Overview
The frontend is now set up to consume real allocation data from NEAR contracts without requiring users to connect a NEAR wallet. This is achieved through view-only RPC calls to the NEAR blockchain.

## Required Contract Methods

Your NEAR contract needs to implement the following **view methods** (read-only, no gas required):

### 1. `get_global_allocation()`
Returns the current global portfolio allocation across all protocols.

**Expected Return Format:**
```json
[
  {
    "protocol": "ethereum",
    "apy": 4.7,
    "allocation": 44,
    "totalValue": 540800
  },
  {
    "protocol": "avalanche", 
    "apy": 4.0,
    "allocation": 27,
    "totalValue": 332100
  },
  {
    "protocol": "base",
    "apy": 3.3,
    "allocation": 14,
    "totalValue": 172200
  }
  // ... more protocols
]
```

### 2. `get_total_value_locked()`
Returns the total value locked across all protocols.

**Expected Return Format:**
```json
1230000
```

### 3. `get_protocol_apys()`
Returns current APY rates for each protocol.

**Expected Return Format:**
```json
{
  "ethereum": 4.7,
  "avalanche": 4.0,
  "base": 3.3,
  "bnb_chain": 2.8,
  "polygon": 2.4
}
```

### 4. `get_rebalancing_stats()` (Optional)
Returns statistics about rebalancing operations.

### 5. `get_protocol_metrics()` (Optional)
Returns performance metrics for each protocol.

## Contract Configuration

Update the contract ID in `src/utils/nearContract.ts`:

```typescript
const CONTRACT_ID = 'your-actual-contract.testnet'; // Replace with your contract ID
```

## Protocol Name Mapping

The frontend expects protocol names in lowercase. Supported protocols:
- `ethereum` → Displays as "Ethereum" with Ξ icon
- `avalanche` → Displays as "Avalanche" with A icon  
- `base` → Displays as "Base" with B icon
- `bnb_chain` or `bnb` → Displays as "BNB Chain" with B icon
- `polygon` → Displays as "Polygon" with P icon
- `arbitrum` → Displays as "Arbitrum" with A icon
- `optimism` → Displays as "Optimism" with O icon
- `solana` → Displays as "Solana" with S icon
- `near` → Displays as "NEAR" with N icon

## Testing

Once your contract is deployed:

1. Update `CONTRACT_ID` in `src/utils/nearContract.ts`
2. The frontend will automatically start fetching real data
3. Check browser console for any RPC errors
4. Fallback data will be used if contract calls fail

## Network Configuration

Currently configured for NEAR testnet. To switch to mainnet:

```typescript
const NETWORK_ID = 'mainnet' as const;
const RPC_URL = 'https://rpc.mainnet.near.org';
```

## Error Handling

The frontend gracefully handles:
- Contract method not found
- Network connectivity issues  
- Invalid response formats
- Falls back to mock data if NEAR calls fail

## Example Contract Implementation (Rust)

```rust
#[near_bindgen]
impl Contract {
    pub fn get_global_allocation(&self) -> Vec<AllocationData> {
        // Return current allocation data
        self.allocations.clone()
    }
    
    pub fn get_total_value_locked(&self) -> u128 {
        // Return total value across all protocols
        self.total_value
    }
    
    pub fn get_protocol_apys(&self) -> HashMap<String, f64> {
        // Return current APY rates
        self.protocol_apys.clone()
    }
}

#[derive(Serialize, Deserialize)]
pub struct AllocationData {
    pub protocol: String,
    pub apy: f64,
    pub allocation: u32,
    pub total_value: u128,
} 