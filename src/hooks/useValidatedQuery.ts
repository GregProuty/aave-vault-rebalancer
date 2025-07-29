import { useQuery, QueryHookOptions, OperationVariables } from '@apollo/client';
import { z } from 'zod';
import { DocumentNode } from 'graphql';
import { safeValidate } from '@/lib/validation';

export interface UseValidatedQueryOptions<TData, TVariables extends OperationVariables = OperationVariables> 
  extends Omit<QueryHookOptions<TData, TVariables>, 'query'> {
  schema: z.ZodSchema<TData>;
}

export function useValidatedQuery<TData, TVariables extends OperationVariables = OperationVariables>(
  query: DocumentNode,
  options: UseValidatedQueryOptions<TData, TVariables>
) {
  const { schema, ...apolloOptions } = options;
  
  const queryResult = useQuery<TData, TVariables>(query, apolloOptions);
  
  // Validate the response data if available
  if (queryResult.data) {
    const validation = safeValidate(schema, queryResult.data);
    
    if (!validation.success) {
      console.error('GraphQL response validation failed:', validation.error);
      
      return {
        ...queryResult,
        error: queryResult.error || new Error(`Response validation failed: ${validation.error}`),
        data: undefined,
        validationError: validation.error
      };
    }
    
    // Return validated data
    return {
      ...queryResult,
      data: validation.data,
      validationError: null
    };
  }
  
  return {
    ...queryResult,
    validationError: null
  };
}

// Example validated query hooks - these would be implemented with actual GraphQL queries
// The response schemas would be imported when implementing the actual hooks
/*
export function useValidatedAavePoolData(chainName: string) {
  return useValidatedQuery(AAVE_POOL_QUERY, {
    schema: AavePoolDataResponseSchema,
    variables: { chainName },
    skip: !chainName
  });
}

export function useValidatedVaultData(chainName: string) {
  return useValidatedQuery(VAULT_DATA_QUERY, {
    schema: VaultDataResponseSchema,
    variables: { chainName },
    skip: !chainName
  });
}

export function useValidatedPerformanceData(startDate: string, endDate: string) {
  return useValidatedQuery(PERFORMANCE_DATA_QUERY, {
    schema: PerformanceDataResponseSchema,
    variables: { startDate, endDate },
    skip: !startDate || !endDate
  });
}
*/

// Utility function for manual response validation
export function validateResponse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    throw new Error(`Response validation failed: ${result.error.message}`);
  }
  
  return result.data;
}

// Type exports
export type ValidatedQueryResult<TData> = {
  data?: TData;
  loading: boolean;
  error?: Error;
  validationError: string | null;
  refetch: () => void;
}; 